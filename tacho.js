
var Tacho = function () {};
Tacho.MARGIN = {top: 10, right: 10, bottom: 10, left: 10};
Tacho.PADDING = [10, 35, 15];
Tacho.ROTATION = [130, 360];
Tacho.TICK_COUNT = 10;
Tacho.TICK = 10;

Tacho.BAR_VALUE=[40, 40, 20];
Tacho.BAR_COLOR=["red", "yellow", "green"];
Tacho.BAR_WIDTH=20;
Tacho.CHANGE_DURATION = 2000;
Tacho.OVERSHOOT_DURATION = 300;
Tacho.OVERSHOOT_VALUE = 0.06;
Tacho.OVERSHOOT_VALUE_MIN = 1;

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
      .attr("class", "tachoBorderOut")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this.radius + 4);

   tacho.append("circle")
      .attr("class", "tachoBorderIn")
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
   tacho.append("g").attr("id", "tachoScaleGroup");

   var valueText = tacho.append("g")
      .attr("transform", "translate(0, 80)");

   valueText.append("rect")
      .attr("class", "tachoValueRect")
      .attr("width", 80)
      .attr("height", 30);
      
   valueText.append("text")
      .attr("class", "tachoValue")
      .attr("text-anchor", "end")
      .attr("x", 70)
      .attr("y", 24)
      .text("0");

   tacho.append("g")
      .attr("class", "tachoNeedle")
      .attr("transform", "rotate( " + (Tacho.ROTATION[0]) + " )")
      .append("polygon")
      .attr("points", "0,-4 " + (this.radius - Tacho.PADDING[2]) + ",0 0,4" );
   
   this.tacho = tacho;
   this.oldValue = 0;
}

Tacho.prototype.update = function( value, maxValue ) {
   
   var tacho= this.tacho;
   var tachoGroup = tacho.select("#tachoScaleGroup");
   tachoGroup.selectAll(".tachoTick").remove();
   tachoGroup.selectAll(".tachoTickLabel").remove();

   var angle = ( Tacho.ROTATION[1] - Tacho.ROTATION[0] ) / Tacho.TICK_COUNT;
   var labelRadius = this.radius - Tacho.PADDING[1];

   var diffAngle = diffAngle =  ( Tacho.ROTATION[1] - Tacho.ROTATION[0] ) / maxValue;
   var diffLabel = maxValue / Tacho.TICK_COUNT;
   for( var i = 0; i <= Tacho.TICK_COUNT; i++ ) {
      tachoGroup.append("line")
         .attr("class", "tachoTick")
         .attr("x1", this.scaleRadius - Tacho.TICK)
         .attr("y1", 0)
         .attr("x2", this.scaleRadius)
         .attr("y2", 0)
         .attr("transform", "rotate( " + ( Tacho.ROTATION[0] + i * angle ) + " )");
      
      tachoGroup.append('text')
         .attr("class", "tachoTickLabel")
         .attr("text-anchor","middle")
         .attr("x", labelRadius * Math.sin( this.toRadiant( Tacho.ROTATION[0] + i * angle ) ) )
         .attr("y", -labelRadius * Math.cos(this.toRadiant( Tacho.ROTATION[0] + i * angle )) + 5 )
         .text( i * diffLabel );
         
   }

   var oldValue = this.oldValue;
   tacho.select(".tachoValue")
      .transition()
      .duration(Tacho.CHANGE_DURATION)
      .tween( "text", function() {
          var interpolator = d3.interpolateRound( oldValue, value );
          return function( t ) {
               this.textContent = interpolator( t );
          };
      } );
   
   var overshootDuration = Tacho.OVERSHOOT_DURATION;
   var overshootStart = Tacho.CHANGE_DURATION;

   var index = 1;
   var interpolate = this.createInterpolate(this.calculateOvershootValue(value, index-1), this.calculateOvershootValue(value, index), diffAngle, true);
   while (interpolate != null ) {
      setTimeout( this.updateNeedleValue, overshootStart, tacho, overshootDuration, interpolate); 
      index++;
      interpolate = this.createInterpolate(this.calculateOvershootValue(value, index-1), this.calculateOvershootValue(value, index), diffAngle, false);
      overshootStart += overshootDuration;
      overshootDuration /= 1.5;
   }
   setTimeout( this.updateNeedleValue, overshootStart, tacho, overshootDuration, this.createInterpolate(this.calculateOvershootValue(value, index-1), value, diffAngle, true)); 
   this.updateNeedleValue(tacho, Tacho.CHANGE_DURATION, this.createInterpolate(oldValue, this.calculateOvershootValue(value, 0), diffAngle, true ) );

   this.oldValue = value;
}

Tacho.prototype.calculateOvershootValue = function( value, index ) {
   
   var overshootValue = Tacho.OVERSHOOT_VALUE * (value - this.oldValue);
   return value + overshootValue / Math.pow(-1.5, index);
}

Tacho.prototype.createInterpolate = function( oldValue, value, diffAngle, noCheck ) {
   var oldAngle = diffAngle * oldValue;
   var newAngle = diffAngle * value;
   if ( noCheck || Math.abs(oldAngle - newAngle) > Tacho.OVERSHOOT_VALUE_MIN) {
      return d3.interpolateNumber(diffAngle * oldValue, diffAngle * value);
   }
   return null;
}

Tacho.prototype.updateNeedleValue = function( tacho, duration, interpolate ) {
   tacho.select(".tachoNeedle").transition().duration(duration).ease("in-out-bounce")
      .attrTween("transform", function() {
         return function(t) { return "rotate( " + (Tacho.ROTATION[0] + interpolate(t)) + " )";};
   });
}

Tacho.prototype.toRadiant = function( value ) {
   value += 90;   
   return value * 2 * Math.PI / 360 ;
}

