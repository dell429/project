/**
*  Back to Back horizontalBar index, dream start here
* @ Version 1.0
* @ Author : Dong Chen
* @ Reviewed By: Nazia Sultana
* @ Customer: Professor
* @ Date: 2020-12-01 updated
*/

import Chart from 'chart.js';
//import BtBHbar from './controller/btbhbar_controller category';
import BtBHbarScale_X from './scale/btbbar_scale_x';
import BtBHbarScale_Y from './scale/btbbar_scale_y';


// Register the Controller and Scale

/**
 * From here we register our default parameters
 * If you want more please put it here
 * Chart.controllers.BtBHbar = BtBHbar;
 */
Chart.defaults.horizontalBar = {
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
}
