//import Chart from 'chart.js';
//import Element from 'chart.js';
const helpers = Chart.helpers;

export default  class Slice {

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
