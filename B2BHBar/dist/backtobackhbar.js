(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Chart));
}(this, (function (Chart$1) { 'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Chart__default = /*#__PURE__*/_interopDefaultLegacy(Chart$1);

/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Dong Chen Nazia Sultana
* @ Reviewed By: Dong Chen
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/


/**
* Private function used by main function, no need document
* Here we copy some of the private function in ChartJS
* since it is also private in ChartJS
*/
const helpers = Chart.helpers;

function _computeTickLimit() {
  return Number.POSITIVE_INFINITY;
}

function _generateTicks(generationOptions, dataRange) {
 var ticks = [];
 // To get a "nice" value for the tick spacing, we will use the appropriately named
 // "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
 // for details.

 var MIN_SPACING = 1e-14;
 var stepSize = generationOptions.stepSize;
 var unit = stepSize || 1;
 var maxNumSpaces = generationOptions.maxTicks - 1;
 var min = generationOptions.min;
 var max = generationOptions.max;
 var precision = generationOptions.precision;
 var rmin = dataRange.min;
 var rmax = dataRange.max;
 var spacing = helpers.niceNum((rmax - rmin) / maxNumSpaces / unit) * unit;
 var factor, niceMin, niceMax, numSpaces;

 // Beyond MIN_SPACING floating point numbers being to lose precision
 // such that we can't do the math necessary to generate ticks
 if (spacing < MIN_SPACING && helpers.isNullOrUndef(min) && helpers.isNullOrUndef(max)) {
   return [rmin, rmax];
 }

 numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
 if (numSpaces > maxNumSpaces) {
   // If the calculated num of spaces exceeds maxNumSpaces, recalculate it
   spacing = helpers$1.niceNum(numSpaces * spacing / maxNumSpaces / unit) * unit;
 }

 if (stepSize || helpers.isNullOrUndef(precision)) {
   // If a precision is not specified, calculate factor based on spacing
   factor = Math.pow(10, helpers._decimalPlaces(spacing));
 } else {
   // If the user specified a precision, round to that number of decimal places
   factor = Math.pow(10, precision);
   spacing = Math.ceil(spacing * factor) / factor;
 }

 niceMin = Math.floor(rmin / spacing) * spacing;
 niceMax = Math.ceil(rmax / spacing) * spacing;

 // If min, max and stepSize is set and they make an evenly spaced scale use it.
 if (stepSize) {
   // If very close to our whole number, use it.
   if (!helpers.isNullOrUndef(min) && helpers.almostWhole(min / spacing, spacing / 1000)) {
     niceMin = min;
   }
   if (!helpers.isNullOrUndef(max) && helpers.almostWhole(max / spacing, spacing / 1000)) {
     niceMax = max;
   }
 }

 numSpaces = (niceMax - niceMin) / spacing;
 // If very close to our rounded value, use it.
 if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
   numSpaces = Math.round(numSpaces);
 } else {
   numSpaces = Math.ceil(numSpaces);
 }

 niceMin = Math.round(niceMin * factor) / factor;
 niceMax = Math.round(niceMax * factor) / factor;
 ticks.push(helpers.isNullOrUndef(min) ? niceMin : min);
 for (var j = 1; j < numSpaces; ++j) {
   ticks.push(Math.round((niceMin + j * spacing) * factor) / factor);
 }
 ticks.push(helpers.isNullOrUndef(max) ? niceMax : max);

 return ticks;
}


function _nonNegativeOrDefault(value, defaultValue) {
 return helpers.isFinite(value) && value >= 0 ? value : defaultValue;
}


function _updateMinMax(scale, meta, data) {
 var ilen = data.length;
 var i, value;

 for (i = 0; i < ilen; ++i) {
   value = scale._parseValue(data[i]);
   if (isNaN(value.min) || isNaN(value.max) || meta.data[i].hidden) {
     continue;
   }

   scale.min = Math.min(scale.min, value.min);
   scale.max = Math.max(scale.max, value.max);
 }
}

function _checkValue(array) {

  var positiveAll = array.every(function (e){
    return e > 0;
  });

  var negtiveAll = array.every(function (e){
    return e < 0;
  });

  return positiveAll || negtiveAll;
}

/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Dong Chen
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/
const helpers$2 = Chart$1.helpers;
/**
* @ Description : Scale X used for the Back to Back HBar
*   this is the implementation of X Axes
*/
const BtBHbarScale_X = Chart$1.Scale.extend({

  _getTickLimit: function() {
    var me = this;
    var tickOpts = me.options.ticks;
    var stepSize = tickOpts.stepSize;
    var maxTicksLimit = tickOpts.maxTicksLimit;
    var maxTicks;

    if (stepSize) {
      maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
    } else {
      maxTicks = _computeTickLimit();
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

  me.min = _nonNegativeOrDefault(tickOpts.min, me.min);
  me.max = _nonNegativeOrDefault(tickOpts.max, me.max);

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
     stepSize: helpers$2.valueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
   };
   var ticks = me.ticks = _generateTicks(numericGeneratorOptions, me);
   //check the values
   if ( _checkValue(ticks) == false){
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
   me.max = helpers$2.max(ticks);
   me.min = helpers$2.min(ticks);

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
      _updateMinMax(me, meta, data);
    }
  }

  helpers$2.each(stacks, function(stackValues) {
    values = stackValues.pos.concat(stackValues.neg);
    me.min = Math.min(me.min, helpers$2.min(values));
    me.max = Math.max(me.max, helpers$2.max(values));
  });

  me.min = helpers$2.isFinite(me.min) && !isNaN(me.min) ? me.min : DEFAULT_MIN;
  me.max = helpers$2.isFinite(me.max) && !isNaN(me.max) ? me.max : DEFAULT_MAX;

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
  }else {
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
  }else {
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

});


/**
* Register out X Axes
* Scale type is : btbhbarscale X
* @export BtBHbarScale_X
*/
Chart$1.scaleService.registerScaleType('btbhbarscale_x', BtBHbarScale_X);

/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Dong Chen 
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/
const helpers$3 = Chart$1.helpers;
/**
* Const BtBHbarScale_Y used for Y Axes
* will overide the original which is default
* Y Axes
*/
//@override
const BtBHbarScale_Y = Chart$1.Scale.extend({
  /**
  * function determineDataLimits()
  * @override
  */
  //
  determineDataLimits() {
    var me = this;
		var labels = me._getLabels();
		var ticksOpts = me.options.ticks;
		var min = ticksOpts.min;
		var max = ticksOpts.max;
		var minIndex = 0;
		var maxIndex = labels.length - 1;
		var findIndex;

		if (min !== undefined) {
			// user specified min value
			findIndex = labels.indexOf(min);
			if (findIndex >= 0) {
				minIndex = findIndex;
			}
		}

		if (max !== undefined) {
			// user specified max value
			findIndex = labels.indexOf(max);
			if (findIndex >= 0) {
				maxIndex = findIndex;
			}
		}

		me.minIndex = minIndex;
		me.maxIndex = maxIndex;
		me.min = labels[minIndex];
		me.max = labels[maxIndex];

  },
  /**
  * function buildTicks()
  * building all the ticks for our system, in this overid function
  * we will build up the duplicate ticks for both values
  * @param {chart} param chart - description chart parameter was use most
  * of the time, it is just not show up in the parameter list, but it was a
  * gloval one
  * @override
  */
  buildTicks: function() {
		var me = this;
		var labels = me._getLabels();
		var minIndex = me.minIndex;
		var maxIndex = me.maxIndex;

		// If we are viewing some subset of labels, slice the original array
		me.ticks = (minIndex === 0 && maxIndex === labels.length - 1) ? labels : labels.slice(minIndex, maxIndex + 1);
	},
  /**
  * function getLabelForIndex()
  * building all the ticks for our system
  * @param {index } param Interger : data index
  * @param {datasetIndex } param Interger : dataset index
  * @return {index}
  * @override
  */
  getLabelForIndex: function(index, datasetIndex) {
		var me = this;
		var chart = me.chart;

		if (chart.getDatasetMeta(datasetIndex).controller._getValueScaleId() === me.id) {
			return me.getRightValue(chart.data.datasets[datasetIndex].data[index]);
		}

		return me._getLabels()[index];
	},
  /**
  * function _isBothDatasetVisible()
  * here we check both visible undefine logic with true problem
  * @param {chart } param chart : global chart
  * @return {boolean } visible
  */

  _isBothDatasetVisible(chart){
    var visible = true;
    for (var i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
      //always 0
			var hidden = chart.data.datasets[i]._meta[0].hidden;
      if(hidden){
        visible = false;
        break;
      }

		}
    return visible;
  },
  /**
  * function getPixelForValue()
  * here we will calculate the pixed for each value
  * @param {value } param Interger : data vallue
  * @param {index } param Interger : data index
  * @param {datasetIndex } param Interger : datasetIndex
  * @override  getPixelForValue
  */
  // Used to get data value locations.  Value can either be an index or a numerical value
	getPixelForValue: function(value, index, datasetIndex) {
		var me = this;
		var valueCategory, labels, idx;
    var isNullOrUndef$1 = helpers$3.isNullOrUndef;

		if (!isNullOrUndef$1(index) && !isNullOrUndef$1(datasetIndex)) {
			value = me.chart.data.datasets[datasetIndex].data[index];
		}

		// If value is a data object, then index is the index in the data array,
		// not the index of the scale. We need to change that.
		if (!isNullOrUndef$1(value)) {
			valueCategory = me.isHorizontal() ? value.x : value.y;
		}
		if (valueCategory !== undefined || (value !== undefined && isNaN(index))) {
			labels = me._getLabels();
			value = helpers$1.valueOrDefault(valueCategory, value);
			idx = labels.indexOf(value);
			index = idx !== -1 ? idx : index;
			if (isNaN(index)) {
				index = value;
			}
		}
    /**  Calculate the value based on the percentage*/
    var calculateV = me.getPixelForDecimal((index - me._startValue) / me._valueRange);
    /**
    For now , we are move arry 0 down, will do that only when array 0 is active
    me.chart.active.length == 0
    */
    console.log("current Active type  : " + (typeof  me.chart.active));
    if(me.chart.active != undefined){
      console.log("current Active length is : " + me.chart.active.length);
    }
    /*here due to enable/disable we need know which is enabled
        isDatasetVisible ??
    */
    if(me._isBothDatasetVisible(me.chart)){
      //mve this into a private function
      if(datasetIndex%2 == 0) {
        //for the odd number dataset need addjust
        // in function calculateBarIndexPixels do real calculate
        //computeFitCategoryTraits,options.barThickness;
        var perSlotLength = me._length/me._ticksToDraw.length  ;

        perSlotLength -= (me.margins.top +  me.margins.bottom) ;
        /**
        get the dataset size , bug here , need calculate the active
        undefined means both active,div by 2
        */
        perSlotLength  /= me.chart.config.data.datasets.length;



        calculateV += perSlotLength ;
        //var optionsI = me.ctx.options;
        /*
        This is very important to do a alignment,if we don't set this ,
        the system will calcalate a value based on their OPTIMIZE:
        */
        me.options.barThickness = perSlotLength;
      }

    }

    // if(me.chart.active == undefined){
    //
    // }
    //if(me.DEBUG == "true"){
      console.log("Calculated Y is : " + calculateV);
    //}
    return calculateV;
		//return me.getPixelForDecimal((index - me._startValue) / me._valueRange);
	},

  /**
  * function _configure()
  * here we check both visible undefine logic with true problem
  * Did some configuation , otherwise the start and end id missing
  */

  _configure: function() {
		var me = this;
		var offset = me.options.offset;
		var ticks = me.ticks;

		Chart$1.Scale.prototype._configure.call(me);

		if (!me.isHorizontal()) {
			// For backward compatibility, vertical category scale reverse is inverted.
			me._reversePixels = !me._reversePixels;
		}

		if (!ticks) {
			return;
		}

		me._startValue = me.minIndex - (offset ? 0.5 : 0);
		me._valueRange = Math.max(ticks.length - (offset ? 0 : 1), 1);
	},

});
/**
* Take the default configuration of category
*/
const defaultConfig = Object.assign({}, Chart$1.scaleService.getScaleDefaults('category'), {
});
/**
* Register Axes: Scale type is : btbhbarscale_y
* @export BtBHbarScale_Y
*/
Chart$1.scaleService.registerScaleType('btbhbarscale_y', BtBHbarScale_Y,defaultConfig);

/**
*  Back to Back horizontalBar index, dream start here
* @ Version 1.0
* @ Author : Dong Chen
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/


// Register the Controller and Scale

/**
 * From here we register our default parameters
 * If you want more please put it here
 * Chart.controllers.BtBHbar = BtBHbar;
 */
Chart__default['default'].defaults.horizontalBar = {
		hover: {
			mode: 'index',
			axis: 'y'
		},

			scales: {
				xAxes: [{
					type: 'btbhbarscale_x',
					position: 'bottom'
				}],

				yAxes: [{
					type: 'btbhbarscale_y',
					position: 'left',
					offset: true,
					gridLines: {
						offsetGridLines: true
					}
				}]
			},

		elements: {
			rectangle: {
				borderSkipped: 'left'
			}
		},

		tooltips: {
			mode: 'index',
			axis: 'y'
		}
};

})));
