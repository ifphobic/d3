function Chart() {
}

Chart.prototype.initialize = function( id, config ) {
   
   this.config = config;
   var width = config.width;
   var height = config.height;

   var svg = d3.select( "#" + id )
      .attr("width", width )
      .attr("height", height );

   width -= config.margin.left + config.margin.right;
   height -= config.margin.top + config.margin.bottom;

   this.chart = svg.append("g")
      .attr("width", width )
      .attr("height", height )
      .attr("transform", "translate(" + config.margin.left + "," + config.margin.top +  ")");

   this.chart.append("g")
      .attr("class", "chartLayer");
    
   this.chart.append("g")
      .attr("class", "chartYAxis chartAxis");

   var y = d3.scale.linear()
      .domain([ 0, 1 ])
      .range([ height, 0 ]);

   var formatPercent = d3.format(".0%");
   var yAxis = d3.svg.axis()
      .scale(y)
      .tickFormat(formatPercent)
      .orient("right");

   this.chart.append("g")
      .attr("transform", "translate(" + width +  ", 0)")
      .attr("class", "chartYAxis2 chartAxis")
      .call(yAxis);


   this.chart.append("g")
      .attr("transform", "translate(0," + height +  ")")
      .attr("class", "chartXAxis chartAxis");

   this.chart.append("path")
      .attr("class", "chartLine");
 
   var legend = this.chart.append("g")
      .attr("transform", "translate( " + (width - config.legendWidth ) + ", -100 )")
      .attr("class", "chartLegend");

   legend.append("rect")
      .attr("class", "chartLegendRect");

   var title = this.chart.append("g")
   title.append("text")
      .attr("class", "chartTitle")
      .attr("transform", "translate( 0 , -60 )");
  
   title.append("text")
      .attr("class", "chartSubTitle")
      .attr("transform", "translate( 0 , -40 )");
}

Chart.prototype.update = function( data ) {
   
   var width = this.chart.attr( "width" );
   var height = this.chart.attr( "height" );
   var barWidth = width / data.dataArray.length;
  
   this.chart.select(".chartTitle").text( data.title[0] );
   this.chart.select(".chartSubTitle").text( data.title[1] );

   this.updateAxis( width, height, data );
   this.updateLegend( data);

   var y = d3.scale.linear()
      .domain([ 0, data.maxValue ])
      .range([0, height]);

   var dataJoin = this.chart.select(".chartLayer").selectAll(".chartBar").data(data.dataArray);
   var bar = dataJoin.enter().append("g")
      .attr("class", "chartBar");
   
   bar.append("rect").attr("class", "chartBar0")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });
   
   bar.append("rect").attr("class", "chartBar1")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });
   
   bar.append("rect").attr("class", "chartBar2")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });


   dataJoin.select(".chartBar0").transition().duration( this.config.changeDuration )
      .attr("height", function( d ) { return y( d[1] ) }  )
      .attr("y", function( d, i ) { return height - y( d[1] ) });

   dataJoin.select(".chartBar1").transition().duration(this.config.changeDuration)
      .attr("height", function( d ) { return y( d[2] ) }  )
      .attr("y", function( d, i ) { return height - y( d[1] + d[2]) });

   dataJoin.select(".chartBar2").transition().duration(this.config.changeDuration)
      .attr("height", function( d ) { return y( d[3] ) }  )
      .attr("y", function( d, i ) { return height - y( d[1] + d[2] + d[3]) });


   dataJoin.exit().remove();

   var line = d3.svg.line()
      .x(function(d, i) { return i * barWidth + barWidth / 2 ; })
      .y(function(d) { 
         var summe = d[1] + d[2] + d[3];
         if ( summe == 0 ) {
            return height; 
         }
         return height - y( d[1] / summe * data.maxValue );
      });

   this.chart.select(".chartLine")
      .datum(data.dataArray).transition().duration(this.config.changeDuration)
      .attr("d", line);

}

Chart.prototype.updateAxis = function( width, height, data ) {
   
   var x = d3.scale.ordinal()
               .domain( data.dataArray.map( function (d) { return d[0]; } ))
               .rangeRoundBands([0, width], 0);

   var xAxis = d3.svg.axis()
       .scale(x)
       .ticks( data.dataArray.length )
       .orient("bottom");

   this.chart.select("g.chartXAxis").call(xAxis)
      .selectAll("text")
         .attr("transform", "translate( 15, 12) rotate(45)" );

   var y = d3.scale.linear()
      .domain([ 0, data.maxValue ])
      .range([ height, 0 ]);

   var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left");
   
   this.chart.select("g.chartYAxis").call(yAxis);
}

Chart.prototype.updateLegend = function( data ) {

   var lineHeight = 20;

   var legend = this.chart.select(".chartLegend").selectAll(".chartLegendText").data( data.legend );

   var background = this.chart.select(".chartLegend").select(".chartLegendRect")
   .attr("width", 250)
   .attr("height", lineHeight * data.legend.length + 10 );

   legend.enter().append("text")
     .attr("class", "chartLegendText")
     .attr("x", 30)
     .attr("y", function(d, i) {return lineHeight * i + 20 }  )
     .text( function(d) {return d } );

   legend.enter().append("rect")
     .attr("class", function(d, i) {return "chartBar" + i }  )
     .attr("x", 10)
     .attr("y", function(d, i) {return lineHeight * i + 10 })
     .attr("width", 10)
     .attr("height", 10);
}



Chart.prototype.startLoading = function() {
   this.update( this.createRandomData(20, true) );

   var chartObject = this;
   var timer = setInterval(function(){
      chartObject.update( chartObject.createRandomData(20, false) ) ;
   }, 700);
   return timer;
}

Chart.prototype.stopLoading = function( timer, chartObject ) {
   window.clearInterval( timer );
   chartObject.update( chartObject.createRandomData(20, true) );
}

Chart.prototype.createRandomData = function(size, zero) {
   var dataArray = new Array();

   var maxValue = 0;  

   for( i = 0; i < size; i++) {
      var x = "Q" + i + " 2015";
      if ( !zero ) {
         var value0 = randomInt(25) + 25;
         var value1 = randomInt(25) + 25;
         var value2 = randomInt(25) + 25;
      } else {
         var value0 = 0; 
         var value1 = 0;
         var value2 = 0;
      }
      dataArray[i] = [ x, value0, value1, value2 ];
      maxValue = Math.max( maxValue, value0 + value1 + value2 );
   }

   var rest = 50 - (maxValue % 50);
   maxValue = 200;

   var legend = ["Erfolgreich beantwortet", "Apotheke unbekannt", "Daten nicht vorhanden", "Auflösequote"];

   if ( !zero ) {
      var title = ["", "Loading..."];
   } else {
      var title = ["", ""];
   }

   var data = { title: title,  dataArray: dataArray, maxValue: maxValue, legend: legend};
   return data;
}

Chart.prototype.randomInt = function(max) {
   return Math.floor((Math.random() * (max + 1)) ); 
}

