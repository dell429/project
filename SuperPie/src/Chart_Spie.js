import Chart from 'chart.js';
//import DatasetController from 'chart.js';
import RadialScale from './Chart_Spie_Scale.js';
import  Segment from './Chart_Segment.js';
import  Slice from './Chart_Slice.js';



const helpers = Chart.helpers;
const superClass = Chart.controllers.polarArea.prototype;


var defaultOptions = {
  //get back some global default options
  scaleFontStyle : "normal",
  // Number - Scale label font size in pixels
  scaleFontSize: 12,
  // Boolean - Whether the scale should stick to integers, and not show any floats even if drawing space is there
  scaleIntegersOnly: true,
  /*Spie section options*/
  showScale: false,

  //Boolean - Show a backdrop to the scale label
  scaleShowLabelBackdrop : true,

  //String - The colour of the label backdrop
  scaleBackdropColor : "rgba(255,255,255,0.75)",

  // Boolean - Whether the scale should begin at zero
  scaleBeginAtZero : true,

  //Number - The backdrop padding above & below the label in pixels
  scaleBackdropPaddingY : 2,

  //Number - The backdrop padding to the side of the label in pixels
  scaleBackdropPaddingX : 2,

  //Boolean - Show line for each value in the scale
  scaleShowLine : true,

  //Boolean - Stroke a line around each segment in the chart
  segmentShowStroke : true,

  //String - The colour of the stroke on each segement.
  segmentStrokeColor : "#fff",

  //Number - The width of the stroke value in pixels
  segmentStrokeWidth : 2,

  //Number - Amount of animation steps
  animationSteps : 100,

  //String - Animation easing effect.
  animationEasing : "easeOutBounce",

  //Boolean - Whether to animate the rotation of the chart
  animateRotate : false,

  //Boolean - Whether to animate scaling the chart from the centre
  animateScale : false,

  //String - A legend template
  legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%><ul><% for (var j=0; j<segments[i].slices.length; j++){%><li><span style=\"background-color:<%=segments[i].slices[j].fillColor%>\"></span><%if(segments[i].slices[j].label){%><%=segments[i].slices[j].segmentLabel%><%}%></li><%}%></ul><%}%></li></ul>",

  tooltipTemplate: "<%if (label){%><%=label%><%}%><%if (segmentLabel && label){%> - <%}%><%if (segmentLabel){%><%=segmentLabel%><%}%>"

};

class SpieController extends Chart.controllers.polarArea {



  initData(chart,datasetIndex){
    var me = this;
    const dataset = chart.data.datasets[datasetIndex];
    //Spie data contains th objects of Spie
    var  data = chart.chartSpieData;
    //init spie data
    var segments = me.segments = ( typeof me.segments != 'undefined' && me.segments instanceof Array ) ? me.segments : [];
    var data = chart.chartSpieData = ( typeof chart.chartSpieData != 'undefined' && chart.chartSpieData instanceof Array ) ? chart.chartSpieData : [];
    //for each slice generate
    var slices = [];
    var index;
    const defaults =  defaultOptions;

    // add more data info , please add here
    // please do not use forEach, some browser is not support
    for (index = 0; index < dataset.slices.length; ++index) {
      slices.push(
        new Slice(dataset.slices[index].height,
        					dataset.slices[index].color,
        					dataset.slices[index].highlight,
        					dataset.label,
        					dataset.slices[index].label,
        					Math.PI * 1.5,
                  chart.width/2,
                  chart.height/2
                )
      );
    };


    //gen a segment, if you want more config please add here
    data.push(
      new Segment(dataset.color,
      				    dataset.highlight || dataset.color,
      				    this.getSegmentHeight(dataset.slices),
      				    dataset.innerHeight,
      			      dataset.width,
      				    slices,
      				    dataset.label,
      			      (defaults.animateScale) ? 0 : chart.pieScale.calculateCenterOffset(this.getSegmentHeight(slices)),
      				    (defaults.animateRotate) ? 0 : this.calculateSegmentCircumference(dataset.width),
      				     Math.PI * 1.5,
                   defaults.segmentShowStroke,
                   defaults.segmentStrokeWidth,
                   defaults.segmentStrokeColor,
                   chart.ctx,
                   0,
                   chart.width/2,
                   chart.height/2
      )

    );

  }

initScale(chart,datasetIndex){
  var  scale = chart.pieScale;
  const defaults =  defaultOptions;

  //scale is per chart init once is good
  if(chart.pieScale == undefined ){
    //install our default options
    //TODO: install default if not configured
    chart.spieOptions = defaultOptions;
    chart.pieScale = new RadialScale(
                              defaults.showScale,
                              defaults.scaleFontStyle,
                              defaults.scaleFontSize,
                              chart.spieOptions.scaleFontFamily,
                              chart.spieOptions.scaleFontColor,
                              chart.spieOptions.scaleShowLabels,
                              defaults.scaleShowLabelBackdrop,
                              defaults.scaleBackdropColor,
                              defaults.scaleBackdropPaddingY,
                              defaults.scaleBackdropPaddingX,
                              (defaults.scaleShowLine) ? chart.spieOptions.scaleLineWidth : 0,
                              chart.spieOptions.scaleLineColor,
                              true,
                              chart.width,
                              chart.height,
                              chart.width/2,
                              chart.height/2,
                              chart.ctx,
                              chart.spieOptions.scaleLabel,
                              chart.data.datasets.length
                            );

  }

}

  getSegmentHeight (data){
    var segmentHeight = 0;

    helpers.each(data,function(slice){
      segmentHeight += slice.height;
    },this);

    return segmentHeight;
  }

  calculateTotalWidth (data){
    this.totalWidth = 0;
    for(var i = 0; i < data.length; i++){
      this.totalWidth += Math.abs(data[i].width);
    }
  }

  calculateSegmentCircumference (value){
    return (Math.PI*2)*(Math.abs(value) / this.totalWidth);
  }

  calculateSliceParameter(slice){
    for(var i = 0; i < slice.length; ++i ){

    }
  }

  //this used to be a helper function ,  rename it as a simple function
  calculateScaleRange (valuesArray, drawingSize, textSize, startFromZero, integersOnly){

    //Set a minimum step of two - a point at the top of the graph, and a point at the base
    var minSteps = 2,
      maxSteps = Math.floor(drawingSize/(textSize * 1.5)),
      skipFitting = (minSteps >= maxSteps);
      //ES6 has array max min with Math
    var maxValue = Math.max(...valuesArray),
      minValue = Math.min(...valuesArray);

    // We need some degree of seperation here to calculate the scales if all the values are the same
    // Adding/minusing 0.5 will give us a range of 1.
    if (maxValue === minValue){
      maxValue += 0.5;
      // So we don't end up with a graph with a negative start value if we've said always start from zero
      if (minValue >= 0.5 && !startFromZero){
        minValue -= 0.5;
      }
      else{
        // Make up a whole number above the values
        maxValue += 0.5;
      }
    }

    var	valueRange = Math.abs(maxValue - minValue),
      rangeOrderOfMagnitude = this.calculateOrderOfMagnitude(valueRange),
      graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
      graphMin = (startFromZero) ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude),
      graphRange = graphMax - graphMin,
      stepValue = Math.pow(10, rangeOrderOfMagnitude),
      numberOfSteps = Math.round(graphRange / stepValue);

    //If we have more space on the graph we'll use it to give more definition to the data
    while((numberOfSteps > maxSteps || (numberOfSteps * 2) < maxSteps) && !skipFitting) {
      if(numberOfSteps > maxSteps){
        stepValue *=2;
        numberOfSteps = Math.round(graphRange/stepValue);
        // Don't ever deal with a decimal number of steps - cancel fitting and just use the minimum number of steps.
        if (numberOfSteps % 1 !== 0){
          skipFitting = true;
        }
      }
      //We can fit in double the amount of scale points on the scale
      else{
        //If user has declared ints only, and the step value isn't a decimal
        if (integersOnly && rangeOrderOfMagnitude >= 0){
          //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
          if(stepValue/2 % 1 === 0){
            stepValue /=2;
            numberOfSteps = Math.round(graphRange/stepValue);
          }
          //If it would make it a float break out of the loop
          else{
            break;
          }
        }
        //If the scale doesn't have to be an int, make the scale more granular anyway.
        else{
          stepValue /=2;
          numberOfSteps = Math.round(graphRange/stepValue);
        }

      }
    }

    if (skipFitting){
      numberOfSteps = minSteps;
      stepValue = graphRange / numberOfSteps;
    }

    return {
      steps : numberOfSteps,
      stepValue : stepValue,
      min : graphMin,
      max	: graphMin + (numberOfSteps * stepValue)
    };

  }

  calculateOrderOfMagnitude (val){
    return Math.floor(Math.log(val) / Math.LN10);
  }

  updateScaleRange (datapoints){
			var valuesArray = [];
      const defaults =  defaultOptions;
			helpers.each(datapoints,function(segment){
				valuesArray.push(this.getSegmentHeight(segment.slices));
			}, this);

      var scaleSizes = this.calculateScaleRange(
        valuesArray,
        helpers.min([this.chart.width, this.chart.height])/2,
        defaults.scaleFontSize,
        defaults.scaleBeginAtZero,
        defaults.scaleIntegersOnly
      );

      this.chart.pieScale.setScaleSizes(scaleSizes);
      this.chart.pieScale.setPosition ({
        size: helpers.min([this.chart.width, this.chart.height]),
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2
        }
      )

		}

    calculateTotalWidth  (data){
			this.totalWidth = 0;
			helpers.each(data,function(segment){
				this.totalWidth += Math.abs(segment.width);
			},this);
		}

		calculateTotalHeight (data){
      const me = this.chart;

			this.totalHeight = 0;
			helpers.each(data,function(segment){
				this.totalHeight += segment.height;
			},this);
			me.pieScale.valuesCount = this.segments.length;
		}

    updateCenterXY(){
      var segments = this.chart.chartSpieData;
      for(var i = 0; i < segments.length; ++i ){
        segments[i].x = this.chart.width/2;
        segments[i].y = this.chart.height/2;
      }
    }

    reflow (){
			// helpers.extend(this.SegmentArc.prototype,{
			// 	x : this.chart.width/2,
			// 	y : this.chart.height/2
			// });
      var chartSpie = this.chart.chartSpieData;
      var scale = this.chart.pieScale;

      this.updateCenterXY();
			this.updateScaleRange(chartSpie);
			this.chart.pieScale.update();

			// helpers.extend(this.scale,{
			// 	xCenter: this.chart.width/2,
			// 	yCenter: this.chart.height/2
			// });
      scale.xCenter = this.chart.width/2;
      scale.yCenter = this.chart.height/2;

			helpers.each(this.segments, function(segment){
				segment.update({
					outerRadius : this.scale.calculateCenterOffset(segment.height)
				});
			}, this);

		}

    render (reflow){
      if (reflow){
        this.reflow();
      }
        this.draw();
      return this;
    }

    getSlicesAtEvent (e){
      var segmentsArray = [];

      var location = helpers.getRelativePosition(e);

      helpers.each(this.segments,function(segment){
        helpers.each(segment.slices, function(slice){
          slice.x = segment.x;
          slice.y = segment.y;
          if (slice.inRange(location.x,location.y)) segmentsArray.push(slice);
        }, this);
      },this);
      return segmentsArray;

    }


  // Initializes Spie data
  // Init change a lot since the first release, now
  // init one by one
   initialize(chart, datasetIndex) {
     const me = this;

     me.initScale(chart,datasetIndex);
     me.initData(chart,datasetIndex);

     //call parent initialize
     superClass.initialize.call(this, chart, datasetIndex);
   }

  // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
  addElements () {
    console.log("elment or update happens");

  }
  // Create a single element for the data at the given index and reset its state
  addElementAndReset (index) {

    console.log("reset or update happens");
  }
  // Update the elements in response to new data
  // @param reset : if true, put the elements into a reset state so they can animate to their final values
  update (reset) {
    console.log("update happens");
    this.calculateTotalHeight(this.segments);
    this.calculateTotalWidth(this.segments);

    helpers.each(this.segments,function(segment){
      segment.save();
    });

    this.reflow();
    this.render();
  }

  buildOrUpdateElements(){
    console.log("build or update happens");
    // Here we need retrive the Legend index clicked
    // but due to our desgin , Chart process this after
    // legend being clicked. It is loop through all the
    // dataset, please use the Chart js legend: onClick
    // and the process after update
    // Dong Chen: following code are refrecne
    // hidden already set in the metaData
    //var meta = ci.getDatasetMeta(index);

    // See controller.isDatasetVisible comment
    //meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
    var ch = this.chart;
    var dataSets =  ch.data.datasets;
    var segments = ch.chartSpieData;

    for(var index = 0; index < dataSets.length; ++ index){
      var meta = ch.getDatasetMeta(index);
      // loop through all the meta to set the hidden in segment
      //meta.hidden = meta.hidden === null ? !ch.data.datasets[index].hidden : null;
      ch.chartSpieData[index].hidden = meta.hidden;
    }

    // Sort the slice object here
    // function _compare( a, b ) {
    //   if ( a.height < b.height ){
    //     return -1;
    //   }
    //   if ( a.height > b.height ){
    //     return 1;
    //   }
    //   return 0;
    // }
    var sortSlices = [];

    for(var index = 0; index < segments.length; ++index){
      var slices = segments[index].slices;
      sortSlices = slices.sort((a,b) => (a.height > b.height) ? 1 : ((b.height > a.height) ? -1 : 0));
      //install the sorted slices
      segments[index].slices = sortSlices;
    }




  }
  //Override the main draw function
  draw(ease){
    const me = this;
    const scale = me.chart.pieScale;

    var easingDecimal = ease || 1;
    var pieParam = [];
    const chartSpie = me.chart.chartSpieData;
    const legend = me.chart.legend;
    //Clear & draw the canvas
    me.chart.clear();

    //draw lenged first
    legend.draw();

    me.calculateTotalWidth(chartSpie);

    me.updateScaleRange(chartSpie);
    //console.log("Draw Start");

    helpers.each(chartSpie,function(segment, index){
      //console.log("Draw segments");
      // segment.transition({
      //   circumference : me.calculateSegmentCircumference(segment.width),
      //   outerRadius : scale.calculateCenterOffset(segment.height)
      // },easingDecimal);

      // Add inner and outer radius + height to slices.
      var sliceHeight = 0;
      helpers.each(segment.slices, function(slice){

        slice.innerRadius = scale.calculateCenterOffset(sliceHeight);

        sliceHeight += slice.height;
        slice.heightInSegment = sliceHeight;

        slice.outerRadius = scale.calculateCenterOffset(slice.heightInSegment);
        //need recalculate the circumference: when init put 0
        segment.circumference = this.calculateSegmentCircumference(segment.width);
      }, me);

      segment.endAngle = segment.startAngle + segment.circumference;

      helpers.each(segment.slices, function(slice){
        slice.endAngle = segment.endAngle;
      }, me);

      // If we've removed the first segment we need to set the first one to
      // start at the top.
      if (index === 0){
        segment.startAngle = Math.PI * 1.5;
      }

      //Check to see if it's the last segment, if not get the next and update the start angle
      if (index < chartSpie.length - 1){
        chartSpie[index+1].startAngle = segment.endAngle;

        helpers.each(chartSpie[index+1].slices, function(slice){
          slice.startAngle = segment.endAngle;
        }, me);
      }
      if(!segment.hidden)
        segment.draw();

    }, me);

    //draw the tooltip , to prevent overlap
    //do this after draw
    helpers.each(chartSpie,function(segment, index){
      if(!segment.hidden){
        segment.drawTip();
      }

    }, me);
    //draw scale
    scale.draw();
  }


}

SpieController.id = 'Spie';
export default SpieController;
//export default TooltipsPlugin;
