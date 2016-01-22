
var Tacho = function () {};
Tacho.MARGIN = {top: 10, right: 10, bottom: 10, left: 10};
Tacho.PADDING = [10, 35, 15];
Tacho.ROTATION = [130, 360];
Tacho.TICK_COUNT = 10;
Tacho.TICK = 10;

Tacho.BAR_VALUE=[40, 40, 20];
Tacho.BAR_COLOR=["red", "yellow", "green"];
Tacho.BAR_WIDTH=20;
Tacho.CHANGE_DURATION = 1000;

Tacho.prototype.initialize = function( id, size ) {
   var svg = d3.select( "#" + id )
      .attr("width", size )
      .attr("height", size );

   var width = size - Tacho.MARGIN.right - Tacho.MARGIN.left;
   var height = size - Tacho.MARGIN.top - Tacho.MARGIN.bottom;
   this.radius = Math.min( width, height ) / 2;


   var tacho = svg.append("g")
      .attr("width", width )
      .attr("height", height )
      .attr("transform", "translate(" + (Tacho.MARGIN.left + this.radius) + "," + (Tacho.MARGIN.top + this.radius) + ")");

   tacho.append("circle")
      .attr("class", "tachoBorder")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this.radius);

   this.scaleRadius = this.radius - Tacho.PADDING[0];

   var startAngle = Tacho.ROTATION[0];
   var summe = Tacho.BAR_VALUE.reduce(function(a, b) { return a + b } );
   var diffAngle =  ( Tacho.ROTATION[1] - Tacho.ROTATION[0] ) / summe; 
   for( var i = 0; i < Tacho.BAR_VALUE.length; i++ ) {
      var endAngle = startAngle + (Tacho.BAR_VALUE[i] * diffAngle);
      var arc = d3.svg.arc()
         .innerRadius( this.scaleRadius - Tacho.BAR_WIDTH )
         .outerRadius( this.scaleRadius )
         .startAngle( this.toRadiant( startAngle ))
         .endAngle( this.toRadiant( endAngle ));
         tacho.append("path")
            .attr("class", "tachoBar")
            .attr("style", "fill: " + Tacho.BAR_COLOR[i])
            .attr("d", arc);
      startAngle = endAngle;
   }

   var arc = d3.svg.arc()
      .innerRadius( this.scaleRadius )
      .outerRadius( this.scaleRadius )
      .startAngle( this.toRadiant( Tacho.ROTATION[0] ))
      .endAngle( this.toRadiant( Tacho.ROTATION[1] ));

   tacho.append("path")
      .attr("class", "tachoScale")
       .attr("d", arc);

   tacho.append("line")
      .attr("class", "tachoNeedle")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", this.radius - Tacho.PADDING[2])
      .attr("y2", 0)
      .attr("transform", "rotate( " + (Tacho.ROTATION[0]) + " )");

   this.tacho = tacho;
}

Tacho.prototype.update = function( value, maxValue ) {
   
   var tacho = this.tacho;
   tacho.selectAll(".tachoTick").remove();
   tacho.selectAll(".tachoTickLabel").remove();

   var angle = ( Tacho.ROTATION[1] - Tacho.ROTATION[0] ) / Tacho.TICK_COUNT;
   var labelRadius = this.radius - Tacho.PADDING[1];

   var diffAngle = diffAngle =  ( Tacho.ROTATION[1] - Tacho.ROTATION[0] ) / maxValue;
   var diffLabel = maxValue / Tacho.TICK_COUNT;
   for( var i = 0; i <= Tacho.TICK_COUNT; i++ ) {
      tacho.append("line")
         .attr("class", "tachoTick")
         .attr("x1", this.scaleRadius - Tacho.TICK)
         .attr("y1", 0)
         .attr("x2", this.scaleRadius)
         .attr("y2", 0)
         .attr("transform", "rotate( " + ( Tacho.ROTATION[0] + i * angle ) + " )");
      
      tacho.append('text')
         .attr("class", "tachoTickLabel")
         .attr("text-anchor","middle")
         .attr("x", labelRadius * Math.sin( this.toRadiant( Tacho.ROTATION[0] + i * angle ) ) )
         .attr("y", -labelRadius * Math.cos(this.toRadiant( Tacho.ROTATION[0] + i * angle )) + 5 )
         .text( i * diffLabel );
         
   }

   tacho.select(".tachoNeedle").transition().duration(Tacho.CHANGE_DURATION)
      .attr("transform", "rotate( " + (Tacho.ROTATION[0] + (diffAngle * value)) + " )");

}

Tacho.prototype.toRadiant = function( value ) {
   value += 90;   
   return value * 2 * Math.PI / 360 ;
}

