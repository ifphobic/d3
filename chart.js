
var margin = {top: 120, right: 60, bottom: 60, left: 40};
var legendWidth = 250;
var duration = 650;

function initializeChart( id, width, height ) {
   var svg = d3.select( "#" + id )
      .attr("width", width )
      .attr("height", height );

   width -= margin.left + margin.right;
   height -= margin.top + margin.bottom;



   var chart = svg.append("g")
      .attr("width", width )
      .attr("height", height )
      .attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

   chart.append("g")
      .attr("class", "chartLayer");
    
   chart.append("g")
      .attr("class", "yAxis axis");

   var y = d3.scale.linear()
      .domain([ 0, 1 ])
      .range([ height, 0 ]);

   var formatPercent = d3.format(".0%");
   var yAxis = d3.svg.axis()
      .scale(y)
      .tickFormat(formatPercent)
      .orient("right");

   chart.append("g")
      .attr("transform", "translate(" + width +  ", 0)")
      .attr("class", "yAxis2 axis")
      .call(yAxis);


   chart.append("g")
      .attr("transform", "translate(0," + height +  ")")
      .attr("class", "xAxis axis");

   chart.append("path")
      .attr("class", "line");
 
   var legend = chart.append("g")
      .attr("transform", "translate( " + (width - legendWidth ) + ", -100 )")
      .attr("class", "legend");

   legend.append("rect")
      .attr("class", "legend");

   var title = chart.append("g")
   title.append("text")
      .attr("class", "title")
      .attr("transform", "translate( 0 , -60 )");
  
   title.append("text")
      .attr("class", "subTitle")
      .attr("transform", "translate( 0 , -40 )");
  
   

   return chart;
}

function updateChart( chart, data ) {
   
   var width = chart.attr( "width" );
   var height = chart.attr( "height" );
   var barWidth = width / data.dataArray.length;
  
   chart.select(".title").text( data.title[0] );
   chart.select(".subTitle").text( data.title[1] );

   updateAxis(chart, width, height, data );
   updateLegend(chart, data);

   var y = d3.scale.linear()
      .domain([ 0, data.maxValue ])
      .range([0, height]);

   var dataJoin = chart.select(".chartLayer").selectAll(".bar").data(data.dataArray);
   var bar = dataJoin.enter().append("g")
      .attr("class", "bar");
   
   bar.append("rect").attr("class", "bar0")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });
   
   bar.append("rect").attr("class", "bar1")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });
   
   bar.append("rect").attr("class", "bar2")
   .attr("width", barWidth - 4 )
   .attr("x", function( d, i ) { return i * barWidth + 2; });


   dataJoin.select(".bar0").transition().duration(duration)
      .attr("height", function( d ) { return y( d[1] ) }  )
      .attr("y", function( d, i ) { return height - y( d[1] ) });

   dataJoin.select(".bar1").transition().duration(duration)
      .attr("height", function( d ) { return y( d[2] ) }  )
      .attr("y", function( d, i ) { return height - y( d[1] + d[2]) });

   dataJoin.select(".bar2").transition().duration(duration)
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

   chart.select(".line")
      .datum(data.dataArray).transition().duration(duration)
      .attr("d", line);

}

function updateAxis( chart, width, height, data ) {
   
   var x = d3.scale.ordinal()
               .domain( data.dataArray.map( function (d) { return d[0]; } ))
               .rangeRoundBands([0, width], 0);

   var xAxis = d3.svg.axis()
       .scale(x)
       .ticks( data.dataArray.length )
       .orient("bottom");

   chart.select("g.xAxis").call(xAxis)
      .selectAll("text")
         .attr("transform", "translate( 15, 12) rotate(45)" );

   var y = d3.scale.linear()
      .domain([ 0, data.maxValue ])
      .range([ height, 0 ]);

   var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left");
   
   chart.select("g.yAxis").call(yAxis);
}

function updateLegend( chart, data ) {

   var lineHeight = 20;

   var legend = chart.select(".legend").selectAll(".legendText").data( data.legend );

   var background = chart.select(".legend").select(".legend")
   .attr("width", 250)
   .attr("height", lineHeight * data.legend.length + 10 );

   legend.enter().append("text")
     .attr("class", "legendText")
     .attr("x", 30)
     .attr("y", function(d, i) {return lineHeight * i + 20 }  )
     .text( function(d) {return d } );

   legend.enter().append("rect")
     .attr("class", function(d, i) {return "bar" + i }  )
     .attr("x", 10)
     .attr("y", function(d, i) {return lineHeight * i + 10 })
     .attr("width", 10)
     .attr("height", 10);
}

function startLoading( chart ) {
   updateChart( chart, createRandomData(20, true) );
   var timer = setInterval(function(){
      updateChart( chart, createRandomData(20, false) ) ;
   }, 700);
   return timer;
}

function stopLoading( chart, timer ) {
   window.clearInterval( timer );
   updateChart( chart, createRandomData(20, true) );
}

function createRandomData(size, zero) {
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

function randomInt(max) {
   return Math.floor((Math.random() * (max + 1)) ); 
}

