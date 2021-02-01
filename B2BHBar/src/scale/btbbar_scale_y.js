/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Dong Chen/Nazia Sultana
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/


/**
* @ Description : Scale Y used for the Back to Back HBar
*   this is the implementation of Y Axes
*/
import { scaleService, Scale } from 'chart.js';
import * as Chart from 'chart.js';
const helpers = Chart.helpers;
const DEBUG = "flase";
/**
* Const BtBHbarScale_Y used for Y Axes
* will overide the original which is default
* Y Axes
*/
//@override
const BtBHbarScale_Y = Scale.extend({
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
    var isNullOrUndef$1 = helpers.isNullOrUndef;

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

		Scale.prototype._configure.call(me);

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

})
/**
* Take the default configuration of category
*/
const defaultConfig = Object.assign({}, scaleService.getScaleDefaults('category'), {
});
/**
* Register Axes: Scale type is : btbhbarscale_y
* @export BtBHbarScale_Y
*/
scaleService.registerScaleType('btbhbarscale_y', BtBHbarScale_Y,defaultConfig);

export default BtBHbarScale_Y;
