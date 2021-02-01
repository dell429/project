//import Arc from 'chart.js';
//import Element from 'chart.js';
const helpers = Chart.helpers;

export default  class Segment {

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
    helpers.each(props,function(value,key){
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

    helpers.each(segment.slices, function(slice){
      if(slice.tooltipActive){
        this._drawTip(ctx,slice);
      }
    }, me);

  }


  // Extend to allow for two separate parts to the segment, inner & outer.
  draw (animationPercent) {

    var easingDecimal = animationPercent || 1;

    const ctx = this.ctx;

    helpers.each(this.slices, function(slice){

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
