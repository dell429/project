import Chart from 'chart.js';
const helpers = Chart.helpers;

var TooltipsPlugin = {
    id: 'spietools',

    afterEvent (chart,args) {
      const evt = args;
      const ch = chart;
      var segments = ch.chartSpieData;

      //righnow we tooltips only cares about move event
      if(evt.type == 'mousemove'){
        //console.log(" Mouse move : after event is trigger");
        var activeSlices = this.getSlicesAtEvent(ch,segments,evt);

        // helpers.each(this.segments,function(segment){
        //   segment.restore(["fillColor"]);
        //   helpers.each(segment.slices,function(slice){
        //     slice.restore(["fillColor"]);
        //   });
        // });
        if(activeSlices.length != 0)
          this.showTooltip(ch,activeSlices,args);
      }
    },

    getSlicesAtEvent(chart,segments,event) {
      var segmentsArray = [];
      var scale = chart.pieScale;

      //var location = helpers.getRelativePosition(e);
      var location = {x: event.x,
                      y: event.y};

      helpers.each(segments,function(segment){
        helpers.each(segment.slices, function(slice){
          slice.x = segment.x;
          slice.y = segment.y;
          slice.tooltipActive = false;

          if (slice.inRange(location.x,location.y,scale)) {
            //just set the active, will used in draw.
            //please see segment draw()
            slice.tooltipActive = true;
            // console.log(" active info : inner " + slice.innerRadius);
            // console.log(" active info : outter " + slice.outerRadius);
            // console.log(" active info : label " + slice.label);
            // console.log(" active info : S label " + slice.segmentLabel);
            segmentsArray.push(slice);
          }
        }, this);
      },this);
      return segmentsArray;
    },

    showTooltip(chart, slice,event){
      //at X,Y positon show tooltipPoint
      const location = {
                      x: event.x,
                      y: event.y
                     };
      const controller = chart.controller;

      //force a refresh draw

      controller.draw();


      // for(var i = 0; i < slice.length; ++i){
      //   var label =  slice[i].segmentLabel;
      //   var segment = slice[i].label;
      //
      //   //detect the change
      //
      //   //show the tooltip
      //
      //   ctx.beginPath();
      //   ctx.fillText(label, location.x, location.y);
      //   ctx.closePath();
      //
      // }



    }

}

Chart.plugins.register(TooltipsPlugin);
export default TooltipsPlugin;
