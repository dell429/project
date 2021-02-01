/**
*  Back to Back horizontalBar
* @ Version 1.0
* @ Author : Nazia Sultana/Dong Chen
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

export function _computeTickLimit() {
  return Number.POSITIVE_INFINITY;
}

export function _generateTicks(generationOptions, dataRange) {
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


export function _nonNegativeOrDefault(value, defaultValue) {
 return helpers.isFinite(value) && value >= 0 ? value : defaultValue;
}


export function _updateMinMax(scale, meta, data) {
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

export function _checkValue(array) {
  var result;

  var positiveAll = array.every(function (e){
    return e > 0;
  })

  var negtiveAll = array.every(function (e){
    return e < 0;
  })

  return positiveAll || negtiveAll;
}
