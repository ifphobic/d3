function ChartConfig() {
   this.config = {
      width: 1200,
      height: 600,
      margin:  {top: 120, right: 60, bottom: 60, left: 40},
      legendWidth: 250,
      changeDuration: 650
   };
}

ChartConfig.prototype.getConfig = function( ) {
   return this.config;
}
