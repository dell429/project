(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Chart));
}(this, (function (Chart$1) { 'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Chart__default = /*#__PURE__*/_interopDefaultLegacy(Chart$1);

const helpers = Chart.helpers;

class RadialScale {
  constructor(display, fontStyle,fontSize,fontFamily,fontColor,showLabels,
              showLabelBackdrop,backdropColor,backdropPaddingY,backdropPaddingX,
              lineWidth,lineColor,lineArc,width,height,xCenter,yCenter,ctx,templateString,valuesCount) {
    this.display = display;
    this.fontStyle = fontStyle;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.fontColor = fontColor;
    this.showLabels = showLabels;
    this.showLabelBackdrop = showLabelBackdrop;
    this.backdropColor = backdropColor;
    this.backdropPaddingY = backdropPaddingY;
    this.backdropPaddingX = backdropPaddingX;
    this.lineWidth = lineWidth;
    this.lineColor = lineColor;
    this.lineArc = lineArc;
    this.width = width;
    this.height = height;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.ctx = ctx;
    this.templateString = templateString;
    this.valuesCount = valuesCount;
    this.size = Math.min(this.height, this.width);
    this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
  }

  setScaleSizes(scaleSizes){
    this.max = scaleSizes.max;
    this.min = scaleSizes.min;
    this.stepValue = scaleSizes.stepValue;
    this.steps = scaleSizes.steps;
  }

  setPosition(position){
    this.size = position.size;
    this.xCenter = position.xCenter;
    this.yCenter = position.yCenter;
  }


  calculateCenterOffset(value) {
    // Take into account half font size + the yPadding of the top value
    var scalingFactor = this.drawingArea / (this.max - this.min);

    return (value - this.min) * scalingFactor;
  }

  update() {
    if (!this.lineArc){
      this.setScaleSize();
    } else {
      this.drawingArea = (this.display) ? (this.size/2) - (this.fontSize/2 + this.backdropPaddingY) : (this.size/2);
    }
    this.buildYLabels();
  }

  buildYLabels() {
    this.yLabels = [];

    var stepDecimalPlaces = this.getDecimalPlaces(this.stepValue);

  }

  getCircumference() {
    return ((Math.PI*2) / this.valuesCount);
  }

  setScaleSize() {
    /*
     * Right, this is really confusing and there is a lot of maths going on here
     * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
     *
     * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
     *
     * Solution:
     *
     * We assume the radius of the polygon is half the size of the canvas at first
     * at each index we check if the text overlaps.
     *
     * Where it does, we store that angle and that index.
     *
     * After finding the largest index and angle we calculate how much we need to remove
     * from the shape radius to move the point inwards by that x.
     *
     * We average the left and right distances to get the maximum shape radius that can fit in the box
     * along with labels.
     *
     * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
     * on each side, removing that from the size, halving it and adding the left x protrusion width.
     *
     * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
     * and position it in the most space efficient manner
     *
     * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
     */


    // Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
    // Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
    var largestPossibleRadius = Math.min([(this.height/2 - this.pointLabelFontSize - 5), this.width/2]),
      pointPosition,
      i,
      textWidth,
      halfTextWidth,
      furthestRight = this.width,
      furthestRightIndex,
      furthestRightAngle,
      furthestLeft = 0,
      furthestLeftIndex,
      furthestLeftAngle,
      xProtrusionLeft,
      xProtrusionRight,
      radiusReductionRight,
      radiusReductionLeft;
    //this.ctx.font = helpers.fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
    for (i=0;i<this.valuesCount;i++){
      // 5px to space the text slightly out - similar to what we do in the draw function.
      pointPosition = this.getPointPosition(i, largestPossibleRadius);
      textWidth = this.ctx.measureText(template(this.templateString, { value: this.labels[i] })).width + 5;
      if (i === 0 || i === this.valuesCount/2){
        // If we're at index zero, or exactly the middle, we're at exactly the top/bottom
        // of the radar chart, so text will be aligned centrally, so we'll half it and compare
        // w/left and right text sizes
        halfTextWidth = textWidth/2;
        if (pointPosition.x + halfTextWidth > furthestRight) {
          furthestRight = pointPosition.x + halfTextWidth;
          furthestRightIndex = i;
        }
        if (pointPosition.x - halfTextWidth < furthestLeft) {
          furthestLeft = pointPosition.x - halfTextWidth;
          furthestLeftIndex = i;
        }
      }
      else if (i < this.valuesCount/2) {
        // Less than half the values means we'll left align the text
        if (pointPosition.x + textWidth > furthestRight) {
          furthestRight = pointPosition.x + textWidth;
          furthestRightIndex = i;
        }
      }
      else if (i > this.valuesCount/2){
        // More than half the values means we'll right align the text
        if (pointPosition.x - textWidth < furthestLeft) {
          furthestLeft = pointPosition.x - textWidth;
          furthestLeftIndex = i;
        }
      }
    }

    xProtrusionLeft = furthestLeft;

    xProtrusionRight = Math.ceil(furthestRight - this.width);

    furthestRightAngle = this.getIndexAngle(furthestRightIndex);

    furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);

    radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI/2);

    radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI/2);

    // Ensure we actually need to reduce the size of the chart
    radiusReductionRight = (helpers.isNumber(radiusReductionRight)) ? radiusReductionRight : 0;
    radiusReductionLeft = (helpers.isNumber(radiusReductionLeft)) ? radiusReductionLeft : 0;

    this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight)/2;

    //this.drawingArea = min([maxWidthRadius, (this.height - (2 * (this.pointLabelFontSize + 5)))/2])
    this.setCenterPoint(radiusReductionLeft, radiusReductionRight);

  }

  setCenterPoint (leftMovement, rightMovement) {

    var maxRight = this.width - rightMovement - this.drawingArea,
      maxLeft = leftMovement + this.drawingArea;

    this.xCenter = (maxLeft + maxRight)/2;
    // Always vertically in the centre as the text height doesn't change
    this.yCenter = (this.height/2);
  }

  getIndexAngle (index) {
    var angleMultiplier = (Math.PI * 2) / this.valuesCount;
    // Start from the top instead of right, so remove a quarter of the circle

    return index * angleMultiplier - (Math.PI/2);
  }

  getPointPosition (index, distanceFromCenter){
    var thisAngle = this.getIndexAngle(index);
    return {
      x : (Math.cos(thisAngle) * distanceFromCenter) + this.xCenter,
      y : (Math.sin(thisAngle) * distanceFromCenter) + this.yCenter
    };
  }

  getDecimalPlaces (num){
    if (num%1!==0 && helpers.isNumber(num)){
      return num.toString().split(".")[1].length;
    }
    else {
      return 0;
    }
  }

  draw() {
    if (this.display){
      var ctx = this.ctx;
      each(this.yLabels, function(label, index){
        // Don't draw a centre value
        if (index > 0){
          var yCenterOffset = index * (this.drawingArea/this.steps),
            yHeight = this.yCenter - yCenterOffset,
            pointPosition;

          // Draw circular lines around the scale
          if (this.lineWidth > 0){
            ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineWidth;

            if(this.lineArc){
              ctx.beginPath();
              ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI*2);
              ctx.closePath();
              ctx.stroke();
            } else {
              ctx.beginPath();
              for (var i=0;i<this.valuesCount;i++)
              {
                pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + (index * this.stepValue)));
                if (i === 0){
                  ctx.moveTo(pointPosition.x, pointPosition.y);
                } else {
                  ctx.lineTo(pointPosition.x, pointPosition.y);
                }
              }
              ctx.closePath();
              ctx.stroke();
            }
          }
          if(this.showLabels){
            ctx.font = fontString(this.fontSize,this.fontStyle,this.fontFamily);
            if (this.showLabelBackdrop){
              var labelWidth = ctx.measureText(label).width;
              ctx.fillStyle = this.backdropColor;
              ctx.fillRect(
                this.xCenter - labelWidth/2 - this.backdropPaddingX,
                yHeight - this.fontSize/2 - this.backdropPaddingY,
                labelWidth + this.backdropPaddingX*2,
                this.fontSize + this.backdropPaddingY*2
              );
            }
            ctx.textAlign = 'center';
            ctx.textBaseline = "middle";
            ctx.fillStyle = this.fontColor;
            ctx.fillText(label, this.xCenter, yHeight);
          }
        }
      }, this);

      if (!this.lineArc){
        ctx.lineWidth = this.angleLineWidth;
        ctx.strokeStyle = this.angleLineColor;
        for (var i = this.valuesCount - 1; i >= 0; i--) {
          if (this.angleLineWidth > 0){
            var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
            ctx.beginPath();
            ctx.moveTo(this.xCenter, this.yCenter);
            ctx.lineTo(outerPosition.x, outerPosition.y);
            ctx.stroke();
            ctx.closePath();
          }
          // Extra 3px out for some label spacing
          var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
          ctx.font = fontString(this.pointLabelFontSize,this.pointLabelFontStyle,this.pointLabelFontFamily);
          ctx.fillStyle = this.pointLabelFontColor;

          var labelsCount = this.labels.length,
            halfLabelsCount = this.labels.length/2,
            quarterLabelsCount = halfLabelsCount/2,
            upperHalf = (i < quarterLabelsCount || i > labelsCount - quarterLabelsCount),
            exactQuarter = (i === quarterLabelsCount || i === labelsCount - quarterLabelsCount);
          if (i === 0){
            ctx.textAlign = 'center';
          } else if(i === halfLabelsCount){
            ctx.textAlign = 'center';
          } else if (i < halfLabelsCount){
            ctx.textAlign = 'left';
          } else {
            ctx.textAlign = 'right';
          }

          // Set the correct text baseline based on outer positioning
          if (exactQuarter){
            ctx.textBaseline = 'middle';
          } else if (upperHalf){
            ctx.textBaseline = 'bottom';
          } else {
            ctx.textBaseline = 'top';
          }

          ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
        }
      }
    }
  }
}

//import Arc from 'chart.js';
//import Element from 'chart.js';
const helpers$1 = Chart.helpers;

class Segment {

  constructor(fillColor,highlightColor,height,innerHeight,width,
              slices,label,outerRadius,circumference,startAngle,
              showStroke,strokeWidth,strokeColor,ctx,centerRadius,
              x,y){
    this.fillColor = fillColor;
    this.highlightColor = highlightColor;
    this.height = height;
    this.innerHeight = innerHeight;
    this.width = width;
    this.slices = slices;
    this.label = label;
    this.outerRadius = outerRadius;
    this.circumference = circumference;
    this.startAngle = startAngle;

    this.showStroke = showStroke ;
    this.strokeWidth = strokeWidth;
    this.strokeColor = strokeColor;
    this.ctx = ctx ;
    this.centerRadius = strokeColor ;
    this.x = x;
    this.y = y;
    this.hidden = null;
  }
  //is this segment visible, hidden true is not visible : Dong Chen
  setHidden(hidden){
    this.hidden = hidden;
  }

  transition (props,ease) {
    helpers$1.each(props,function(value,key){
      this[key] = ((value - this._saved[key]) * ease) + this._saved[key];
    },this);
    return this;
  }


  _drawTip(ctx,slice) {
    //show tips org in the middle point
    // can write into one line, leave there for simple
    var location = slice.tooltipPosition();
    var label =  slice.segmentLabel;
    var segment = slice.label;
    var infox = parseInt(location.x);
    var infoy = parseInt(location.y);
    var heigth = slice.height;

    var info = segment.concat(":",label,"Height: ",heigth);


    ctx.save();
    //for tooltips fonsize,color etc,
    // you can read it from comfiguration
    // add whatever u want , put it here
    ctx.fillStyle = "black";
    ctx.font = "15px Arial";

    ctx.fillText(info, location.x, location.y);

    ctx.restore();
  }

  drawTip(ctx){
    //draw the tooltips here
    const segment = this;
    const me = this;
    var ctx = this.ctx;

    helpers$1.each(segment.slices, function(slice){
      if(slice.tooltipActive){
        this._drawTip(ctx,slice);
      }
    }, me);

  }


  // Extend to allow for two separate parts to the segment, inner & outer.
  draw (animationPercent) {

    const ctx = this.ctx;

    helpers$1.each(this.slices, function(slice){

      ctx.beginPath();

      ctx.arc(this.x, this.y, slice.outerRadius, this.startAngle, this.endAngle);

      ctx.arc(this.x, this.y, slice.innerRadius, this.endAngle, this.startAngle, true);

      ctx.closePath();
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;

      ctx.fillStyle = slice.fillColor? slice.fillColor: this.fillColor;

      ctx.fill();
      ctx.lineJoin = 'bevel';

      if (this.showStroke){
        ctx.stroke();
      }

    }, this);
  }
}

//import Chart from 'chart.js';
//import Element from 'chart.js';
const helpers$2 = Chart.helpers;

class Slice {

    constructor(height,fillColor,highlightColor,label,segmentLabel,startAngle,x,y){
      this.height = height;
      this.fillColor = fillColor;
      this.highlightColor = highlightColor;
      this.label = label;
      this.segmentLabel = segmentLabel;
      this.startAngle = startAngle;
      this.x = x;
      this.y = y;
      //tooltips active,default false : Dong Chen
      this.tooltipActive = false;
    }
    _getAngleFromPoint (centrePoint, anglePoint){
			var distanceFromXCenter = anglePoint.x - centrePoint.x,
				distanceFromYCenter = anglePoint.y - centrePoint.y,
				radialDistanceFromCenter = Math.sqrt( distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);


			var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);

			//If the segment is in the top left quadrant, we need to add another rotation to the angle
			if (distanceFromXCenter < 0 && distanceFromYCenter < 0){
				angle += Math.PI*2;
			}

			return {
				angle: angle,
				distance: radialDistanceFromCenter
			};
		}


    // Override to highlight correct part of segment
    inRange (chartX,chartY,scale) {
      // Take into account half font size + the yPadding of the top value
      var scalingFactor = scale.drawingArea / (scale.max - scale.min);

      var pointRelativePosition = this._getAngleFromPoint(this, {
        x: chartX,
        y: chartY
      });

      console.log(" active info : angel " + pointRelativePosition.angle);
      console.log(" active info : distance " + pointRelativePosition.distance);
      // console.log(" active info : label " + slice.label);
      // console.log(" active info : S label " + slice.segmentLabel);

      //pointRelativePosition.distance = (pointRelativePosition.distance - scale.min) / scalingFactor;

      //Check if within the range of the open/close angle
      var betweenAngles = (pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle);

      var withinSlice = (pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius);

      return (betweenAngles && withinSlice);
      //Ensure within the outside of the arc centre, but inside arc outer
    }

    tooltipPosition () {
      var centreAngle = this.startAngle + ((this.endAngle - this.startAngle) / 2),
        rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
      return {
        x : this.x + (Math.cos(centreAngle) * rangeFromCentre),
        y : this.y + (Math.sin(centreAngle) * rangeFromCentre)
      };
    }
 }

const helpers$3 = Chart__default['default'].helpers;
const superClass = Chart__default['default'].controllers.polarArea.prototype;


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

class SpieController extends Chart__default['default'].controllers.polarArea {



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
    }

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

    helpers$3.each(data,function(slice){
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
      else {
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
      else {
        //If user has declared ints only, and the step value isn't a decimal
        if (integersOnly && rangeOrderOfMagnitude >= 0){
          //If the user has said integers only, we need to check that making the scale more granular wouldn't make it a float
          if(stepValue/2 % 1 === 0){
            stepValue /=2;
            numberOfSteps = Math.round(graphRange/stepValue);
          }
          //If it would make it a float break out of the loop
          else {
            break;
          }
        }
        //If the scale doesn't have to be an int, make the scale more granular anyway.
        else {
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
			helpers$3.each(datapoints,function(segment){
				valuesArray.push(this.getSegmentHeight(segment.slices));
			}, this);

      var scaleSizes = this.calculateScaleRange(
        valuesArray,
        helpers$3.min([this.chart.width, this.chart.height])/2,
        defaults.scaleFontSize,
        defaults.scaleBeginAtZero,
        defaults.scaleIntegersOnly
      );

      this.chart.pieScale.setScaleSizes(scaleSizes);
      this.chart.pieScale.setPosition ({
        size: helpers$3.min([this.chart.width, this.chart.height]),
        xCenter: this.chart.width/2,
        yCenter: this.chart.height/2
        }
      );

		}

    calculateTotalWidth  (data){
			this.totalWidth = 0;
			helpers$3.each(data,function(segment){
				this.totalWidth += Math.abs(segment.width);
			},this);
		}

		calculateTotalHeight (data){
      const me = this.chart;

			this.totalHeight = 0;
			helpers$3.each(data,function(segment){
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

			helpers$3.each(this.segments, function(segment){
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

      var location = helpers$3.getRelativePosition(e);

      helpers$3.each(this.segments,function(segment){
        helpers$3.each(segment.slices, function(slice){
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

    helpers$3.each(this.segments,function(segment){
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
    const chartSpie = me.chart.chartSpieData;
    const legend = me.chart.legend;
    //Clear & draw the canvas
    me.chart.clear();

    //draw lenged first
    legend.draw();

    me.calculateTotalWidth(chartSpie);

    me.updateScaleRange(chartSpie);
    //console.log("Draw Start");

    helpers$3.each(chartSpie,function(segment, index){
      //console.log("Draw segments");
      // segment.transition({
      //   circumference : me.calculateSegmentCircumference(segment.width),
      //   outerRadius : scale.calculateCenterOffset(segment.height)
      // },easingDecimal);

      // Add inner and outer radius + height to slices.
      var sliceHeight = 0;
      helpers$3.each(segment.slices, function(slice){

        slice.innerRadius = scale.calculateCenterOffset(sliceHeight);

        sliceHeight += slice.height;
        slice.heightInSegment = sliceHeight;

        slice.outerRadius = scale.calculateCenterOffset(slice.heightInSegment);
        //need recalculate the circumference: when init put 0
        segment.circumference = this.calculateSegmentCircumference(segment.width);
      }, me);

      segment.endAngle = segment.startAngle + segment.circumference;

      helpers$3.each(segment.slices, function(slice){
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

        helpers$3.each(chartSpie[index+1].slices, function(slice){
          slice.startAngle = segment.endAngle;
        }, me);
      }
      if(!segment.hidden)
        segment.draw();

    }, me);

    //draw the tooltip , to prevent overlap
    //do this after draw
    helpers$3.each(chartSpie,function(segment, index){
      if(!segment.hidden){
        segment.drawTip();
      }

    }, me);
    //draw scale
    scale.draw();
  }


}

SpieController.id = 'Spie';
//export default TooltipsPlugin;

const helpers$4 = Chart__default['default'].helpers;

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

      helpers$4.each(segments,function(segment){
        helpers$4.each(segment.slices, function(slice){
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

};

Chart__default['default'].plugins.register(TooltipsPlugin);

/**
Index from where the lib will start.

Author: Dong Chen
Version : 1.0

*/
Chart__default['default'].controllers.Spie = SpieController;

//export default TooltipsPlugin;
// //Chart.register(Spie);

})));
