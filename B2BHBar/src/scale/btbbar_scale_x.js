/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Dong Chen
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/



import { scaleService, Scale } from 'chart.js';
import * as Chart from 'chart.js';
import * as Utils from '../util/HBUtil';
const helpers = Chart.helpers;


/**
Use this for debug on-off
*/
const DEBUG = "true";
/**
* @ Description : Scale X used for the Back to Back HBar
*   this is the implementation of X Axes
*/
const BtBHbarScale_X = Scale.extend({

  _getTickLimit: function() {
    var me = this;
    var tickOpts = me.options.ticks;
    var stepSize = tickOpts.stepSize;
    var maxTicksLimit = tickOpts.maxTicksLimit;
    var maxTicks;

    if (stepSize) {
      maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
    } else {
      maxTicks = Utils._computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }

    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }

    return maxTicks;
  },

_handleDirectionalChanges: function() {
  if (!this.isHorizontal()) {
    // We are in a vertical orientation. The top value is the highest. So reverse the array
    this.ticks.reverse();
  }
},
/**
* function buildTicks()
* priate function
*/
handleTickRangeOptions: function() {
  var me = this;
  var tickOpts = me.options.ticks;
  var DEFAULT_MIN = 1;
  var DEFAULT_MAX = 10;

  me.min = Utils._nonNegativeOrDefault(tickOpts.min, me.min);
  me.max = Utils._nonNegativeOrDefault(tickOpts.max, me.max);

  if (me.min === me.max) {
    if (me.min !== 0 && me.min !== null) {
      me.min = Math.pow(10, Math.floor(log10(me.min)) - 1);
      me.max = Math.pow(10, Math.floor(log10(me.max)) + 1);
    } else {
      me.min = DEFAULT_MIN;
      me.max = DEFAULT_MAX;
    }
  }
  if (me.min === null) {
    me.min = Math.pow(10, Math.floor(log10(me.max)) - 1);
  }
  if (me.max === null) {
    me.max = me.min !== 0
      ? Math.pow(10, Math.floor(log10(me.min)) + 1)
      : DEFAULT_MAX;
  }
  if (me.minNotZero === null) {
    if (me.min > 0) {
      me.minNotZero = me.min;
    } else if (me.max < 1) {
      me.minNotZero = Math.pow(10, Math.floor(log10(me.max)));
    } else {
      me.minNotZero = DEFAULT_MIN;
    }
  }
},


_updateDatasetFlag(me,datasetLength){

  if(me.datasetCounter >= datasetLength){
    //need switch dataset
    me.datasetCounter = 0;
    me.datasetIndex0 = !me.datasetIndex0;
  }
},


/**
* function buildTicks()
* @param {no } param NO
* @return {ticks }    me.ticks
*/
//@override
 buildTicks() {
   var me = this;
   var opts = me.options;
   var tickOpts = opts.ticks;

   // Figure out what the max number of ticks we can support it is based on the size of
   // the axis area. For now, we say that the minimum tick spacing in pixels must be 40
   // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
   // the graph. Make sure we always have at least 2 ticks
   var maxTicks = me._getTickLimit();
   maxTicks = Math.max(2, maxTicks);

   var numericGeneratorOptions = {
     maxTicks: maxTicks,
     min: tickOpts.min,
     max: tickOpts.max,
     precision: tickOpts.precision,
     stepSize: helpers.valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
   };
   var ticks = me.ticks = Utils._generateTicks(numericGeneratorOptions, me);
   //check the values
   if ( Utils._checkValue(ticks) == false){
       for (var i = 0; i < ticks.length; ++i) {
          ticks[i] = 0;
      }

   }

   /**
   * function _handleDirectionalChanges()
   *
   */
   me._handleDirectionalChanges();

   // At this point, we need to update our max and min given the tick values since we have expanded the
   // range of the scale
   me.max = helpers.max(ticks);
   me.min = helpers.min(ticks);

   if (tickOpts.reverse) {
     ticks.reverse();

     me.start = me.max;
     me.end = me.min;
   } else {
     me.start = me.min;
     me.end = me.max;
   }



  var orgTicks = me.ticks.concat();
  //here we check the negitve or positive values
  //please Note , we only need check one value,
  //since the input validation already done(Not done yet)
  me.ticks.reverse();
  if(me.ticks[0] >= 0){
      me.ticks.push(...orgTicks);
  }else {
      me.ticks.unshift(...orgTicks);
  }


},

/**
* function determineDataLimits()
*  Look stupid, some function are not export . there
*  must be good solution , but for now we copy most of their
*  code, and add small parameter we need
* @param {No }
*/
//@override
determineDataLimits() {
  // const hor = this.isHorizontal();
  // Scale.prototype.determineDataLimits();
  //.determineDataLimits();
  var me = this;
  var opts = me.options;
  var chart = me.chart;
  var datasets = chart.data.datasets;
  var metasets = me._getMatchingVisibleMetas();
  var hasStacks = opts.stacked;
  var stacks = {};
  var ilen = metasets.length;
  var i, meta, data, values;
  var DEFAULT_MIN = 0;
  var DEFAULT_MAX = 1;
  me.min = Number.POSITIVE_INFINITY;
  me.max = Number.NEGATIVE_INFINITY;
  me.chart.scales.datasetCounts = chart.data.datasets[0].data.length;

  if (hasStacks === undefined) {
    for (i = 0; !hasStacks && i < ilen; ++i) {
      meta = metasets[i];
      hasStacks = meta.stack !== undefined;
    }
  }

  for (i = 0; i < ilen; ++i) {
    meta = metasets[i];
    data = datasets[meta.index].data;
    if (hasStacks) {
      stackData(me, stacks, meta, data);
    } else {
      Utils._updateMinMax(me, meta, data);
    }
  }

  helpers.each(stacks, function(stackValues) {
    values = stackValues.pos.concat(stackValues.neg);
    me.min = Math.min(me.min, helpers.min(values));
    me.max = Math.max(me.max, helpers.max(values));
  });

  me.min = helpers.isFinite(me.min) && !isNaN(me.min) ? me.min : DEFAULT_MIN;
  me.max = helpers.isFinite(me.max) && !isNaN(me.max) ? me.max : DEFAULT_MAX;

  // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
  me.handleTickRangeOptions();
},

/**
* function getLabelForIndex()
* Here we need built the updated ticks related dataset
8 the the given dataset, ie this.chart.data.datasets[datasetIndex].data[index]
* @param {index } param Interger : data index
* @param {datasetIndex } param Interger : datasetIndex
*/

getLabelForIndex(index, datasetIndex){
  const data = this.chart.data;
  return this.getRightValue(data.datasets[datasetIndex].data[index]);
},

// /* we do'not have to overider this*/
// getPixelForTick(index) {
//
//
// },


/**
* function getPixelForValue()
* Here is the most important function for drawing . landed here means
* the dataset being read, based on the Ticks and Ticks to draw we needs
* derive our own canvas layout. which is calculate our X pixels
* we will calculate the pixed for each value
* @param {value } param Interger : data vallue
* @param {index } param Interger : data index
* @param {datasetIndex } param Interger : datasetIndex
* @return {boolean } value in that index
* @override  getPixelForValue
*/

getPixelForValue: function(value,index, datasetIndex) {
  var me = this;
  //get the tick really drawing
  const ticksToDraw = me._ticksToDraw;
  // const minVal = Math.min(ticksToDraw);
  var maxVal = me.max;
  var minVal = me.min;

  // Note should be positive
  // init some useful info
  const chartWidth = me.width;
  const halfWidth = chartWidth/2;
  const middlePixel = me.left + halfWidth;

  //segments should be length -1
  const segments = ticksToDraw.length -1;
  const perSegmentPixel = chartWidth/segments;
  const perSegmentWidth = chartWidth/segments;
  const pixelPerOne = halfWidth/maxVal;
  const indexMe = me.index;

  /**
 * Too bad the dadaset Index was not in
 * use a counter to count it.since rectangle wants
 * calculate 4 time each
 * this is tricky, may cause prolbem , test it
  */
  var datasetLength = me.chart.scales.datasetCounts;

  var count = me.count;
  if(count == undefined){
    /**
    init part
    */

    count =1;
    me.count = count;
    me.datasetCounter = 0;
    me.datasetIndex0 = true;
  }else{
    count = count + 1;
    me.count = count;
  }
  /**
  The pattern here is : each rectangle need 3 parameter.
  the third one is the dataset
  */
  if(count >= 3){
    //one data within one dataset end
    me.count = 0;
    me.datasetCounter = me.datasetCounter + 1;
  }

  // adjust for negitve values,for negive the max and min is
  // reversed, special note : do not use < 0 otherwiese Axis 0
  // will get a wrong value
  if(value <= 0 ){
    maxVal = Math.abs(me.min);
    minVal = Math.abs(me.max);
  }
  // always treat is postive
  // try to make it simple
  var absValue = Math.abs(value);

  // do adjust to dataset 1
  if(!me.datasetIndex0){
    //if(me.DEBUG == "true"){
      // var id = me.id;
      // console.log("id is :", id);
      // console.log("value is :", value);
      // console.log("dir : left poit bar");
    //}

    me._updateDatasetFlag(me,datasetLength);
    var middlePixel_right = middlePixel - perSegmentPixel/2;
    if(absValue <= minVal) return  middlePixel_right;

    var updatePerPixelR = (halfWidth - perSegmentWidth/2)/(maxVal - minVal);
    return middlePixel_right - absValue * updatePerPixelR +  minVal * updatePerPixelR;
  }else{
    //if(me.DEBUG == "true"){
      // var id = me.id;
      // console.log("id is :", id);
      // console.log("value is :", value);
      // console.log("dir : right point bar");
    //}


    me._updateDatasetFlag(me,datasetLength);

    var middlePixel_left = middlePixel + perSegmentPixel/2;

    if(absValue <= minVal) return  middlePixel_left;
    //calculate leftover pixels
    var updatePerPixelL = (halfWidth - perSegmentWidth/2)/(maxVal - minVal);

    return middlePixel_left + absValue * updatePerPixelL - minVal * updatePerPixelL;
  }

},

})


/**
* Register out X Axes
* Scale type is : btbhbarscale X
* @export BtBHbarScale_X
*/
scaleService.registerScaleType('btbhbarscale_x', BtBHbarScale_X);

export default BtBHbarScale_X;
