const helpers = Chart.helpers;

export default  class RadialScale {
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
      radiusReductionLeft,
      maxWidthRadius;
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
            } else{
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
