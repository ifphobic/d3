
var Tacho = function () {};

Tacho.prototype.initialize = function( id, config ) {

   this.config = config;
   var size = config.size;
   var svg = d3.select( "#" + id )
      .attr("width", size )
      .attr("height", size );

   var width = size - this.config.margin.right - this.config.margin.left;
   var height = size - this.config.margin.top - this.config.margin.bottom;
   this.radius = Math.min( width, height ) / 2;


   var tacho = svg.append("g")
      .attr("width", width )
      .attr("height", height )
      .attr("transform", "translate(" + (this.config.margin.left + this.radius) + "," + (this.config.margin.top + this.radius) + ")");

   tacho.append("circle")
      .attr("class", "tachoBorderOut")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this.radius + this.config.borderWidth);

   tacho.append("circle")
      .attr("class", "tachoBorderIn")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", this.radius);

   this.scaleRadius = this.radius - this.config.padding[0];

   var startAngle = this.config.rotation[0];
   var summe = this.config.barValue.reduce(function(a, b) { return a + b } );
   var diffAngle =  ( this.config.rotation[1] - this.config.rotation[0] ) / summe; 
   for( var i = 0; i < this.config.barValue.length; i++ ) {
      var endAngle = startAngle + (this.config.barValue[i] * diffAngle);
      var arc = d3.svg.arc()
         .innerRadius( this.scaleRadius - this.config.barPadding - this.config.barWidth )
         .outerRadius( this.scaleRadius - this.config.barPadding )
         .startAngle( this.toRadiant( startAngle ))
         .endAngle( this.toRadiant( endAngle ));
         tacho.append("path")
            .attr("class", "tachoBar")
            .attr("style", "fill: " + this.config.barColor[i])
            .attr("d", arc);
      startAngle = endAngle;
   }

   var arc = d3.svg.arc()
      .innerRadius( this.scaleRadius )
      .outerRadius( this.scaleRadius )
      .startAngle( this.toRadiant( this.config.rotation[0] ))
      .endAngle( this.toRadiant( this.config.rotation[1] ));

   tacho.append("path")
      .attr("class", "tachoScale")
       .attr("d", arc);
   tacho.append("g").attr("id", "tachoScaleGroup");

   var valueText = tacho.append("g")
      .attr("transform", "translate(" + this.config.valueX + ", " + this.config.valueY + ")");

   valueText.append("rect")
      .attr("class", "tachoValueRect")
      .attr("width", this.config.valueWidth)
      .attr("height", this.config.valueHeight);
      
   valueText.append("text")
      .attr("class", "tachoValue")
      .attr("text-anchor", "end")
      .attr("x", this.config.valueWidth - this.config.valueMarginX )
      .attr("y", this.config.valueHeight - this.config.valueMarginY )
      .text("0" + (this.config.percentage ? "%":""));

   tacho.append("g")
      .attr("class", "tachoNeedle")
      .attr("transform", "rotate( " + (this.config.rotation[0]) + " )")
      .append("polygon")
      .attr("points", "0,-" + this.config.needleWidth + " " + (this.radius - this.config.needlePadding ) + ",0 0," + this.config.needleWidth );
   
   this.tacho = tacho;
   this.oldValue = 0;
}

Tacho.prototype.update = function( value, maxValue ) {
   
   var tacho= this.tacho;
   var tachoGroup = tacho.select("#tachoScaleGroup");
   tachoGroup.selectAll(".tachoTick").remove();
   tachoGroup.selectAll(".tachoTickLabel").remove();

   var angle = ( this.config.rotation[1] - this.config.rotation[0] ) / this.config.tickCount;
   var labelRadius = this.radius - this.config.padding[1];

   var diffAngle = diffAngle =  ( this.config.rotation[1] - this.config.rotation[0] ) / maxValue;
   var diffLabel = maxValue / this.config.tickCount;
   for( var i = 0; i <= this.config.tickCount; i++ ) {
      tachoGroup.append("line")
         .attr("class", "tachoTick")
         .attr("x1", this.scaleRadius - this.config.tick)
         .attr("y1", 0)
         .attr("x2", this.scaleRadius)
         .attr("y2", 0)
         .attr("transform", "rotate( " + ( this.config.rotation[0] + i * angle ) + " )");
      
      tachoGroup.append('text')
         .attr("class", "tachoTickLabel")
         .attr("text-anchor","middle")
         .attr("x", labelRadius * Math.sin( this.toRadiant( this.config.rotation[0] + i * angle ) ) )
         .attr("y", -labelRadius * Math.cos(this.toRadiant( this.config.rotation[0] + i * angle )) + 5 )
         .text( i * diffLabel + (this.config.percentage ? "%":"") );
         
   }

   var oldValue = this.oldValue;
   var percentage = this.config.percentage;
   tacho.select(".tachoValue")
      .transition()
      .duration(this.config.changeDuration)
      .tween( "text", function() {
          var interpolator = d3.interpolateRound( oldValue, value );
          return function( t ) {
               this.textContent = interpolator( t ) + (percentage ? "%":"");
          };
      } );
   
   var overshootDuration = this.config.overshootDuration;
   var overshootStart = this.config.changeDuration;

   var index = 1;
   var interpolate = this.createInterpolate(this.calculateOvershootValue(value, index-1), this.calculateOvershootValue(value, index), diffAngle, true);
   while (interpolate != null ) {
      setTimeout( this.updateNeedleValue, overshootStart, tacho, overshootDuration, interpolate, this.config.rotation[0], this.config.percentage); 
      index++;
      interpolate = this.createInterpolate(this.calculateOvershootValue(value, index-1), this.calculateOvershootValue(value, index), diffAngle, false);
      overshootStart += overshootDuration;
      overshootDuration /= 1.5;
   }
   setTimeout( this.updateNeedleValue, overshootStart, tacho, overshootDuration, this.createInterpolate(this.calculateOvershootValue(value, index-1), value, diffAngle, true), this.config.rotation[0], this.config.percentage); 
   this.updateNeedleValue(tacho, this.config.changeDuration, this.createInterpolate(oldValue, this.calculateOvershootValue(value, 0), diffAngle, true ), this.config.rotation[0], this.config.percentage);

   this.oldValue = value;
}

Tacho.prototype.calculateOvershootValue = function( value, index ) {
   
   var overshootValue = this.config.overshootValue * (value - this.oldValue);
   return value + overshootValue / Math.pow(-1.5, index);
}

Tacho.prototype.createInterpolate = function( oldValue, value, diffAngle, noCheck) {
   var oldAngle = diffAngle * oldValue;
   var newAngle = diffAngle * value;
   if ( noCheck || Math.abs(oldAngle - newAngle) > this.config.overshootValueMin) {
      return d3.interpolateNumber(diffAngle * oldValue, diffAngle * value);
   }
   return null;
}

Tacho.prototype.updateNeedleValue = function( tacho, duration, interpolate, rotation ) {
   tacho.select(".tachoNeedle").transition().duration(duration).ease("in-out-bounce")
      .attrTween("transform", function() {
         return function(t) { return "rotate( " + (rotation + interpolate(t)) + " )";};
   });
}

Tacho.prototype.toRadiant = function( value ) {
   value += 90;   
   return value * 2 * Math.PI / 360 ;
}

