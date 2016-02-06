function TachoConfig() {
   this.config = {
      size: 170, 
      margin:  {top: 10, right: 10, bottom: 10, left: 10},
      padding: [4, 22 ],
      borderWidth: 3,
      rotation: [110, 360],
      tickCount: 10,
      tick: 8,
      barValue: [40, 40, 20],
      barColor: ["#cc8888", "#ffcc88", "#88cc88"],
      barWidth: 7,
      barPadding: 0,
      changeDuration: 2000,
      overshootDuration: 300,
      overshootValue: 0.06,
      overshootValueMin: 1,
      valueX: 4,
      valueY: 24,
      valueWidth: 35,
      valueHeight: 16,
      valueMarginX: 3,
      valueMarginY: 3,
      needleWidth: 2,
      needlePadding: 7,
      percentage: false
   };
}

TachoConfig.prototype.getConfig = function( ) {
   return this.config;
}
