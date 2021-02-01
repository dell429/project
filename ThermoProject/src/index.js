import Chart from 'chart.js';
import ThermoController from './controller/thermo.controller';
//import Scale, {defaults} from './scale';

var yLabels = {
			0 : '0\xB0 ', 50 : '50\xB0', 100 : '100\xB0', 150 : '150\xB0', 200 : '200\xB0',
		250 : '250\xB0', 300 : '300\xB0'
};
// Register the Controller and Scale
Chart.controllers.thermometer = ThermoController;
Chart.defaults.thermometer = {
					aspectRatio: -1,
					legend: {
							// display: false,
							position: 'right',
							labels: {
									fontColor: '#000'
							}
					},
					scales: {
							xAxes: [{
									display: false,
									stacked: true,
									ticks: {

									}
							}],
							yAxes: [{
									display: true,
									stacked: true,
									ticks: {
											beginAtZero: true,
											steps: 10,
											stepValue: 5,
											min: -50,
											max: 300,
											callback: function(value, index, values) {
											// for a value (tick) equals to 8
											return yLabels[value];
											// 'junior-dev' will be returned instead and displayed on your chart
									}
									}
							}],
					},
					// tooltips: {
					//     callbacks: {
					//         title: () => null,
					//         label: (bodyItem, data) => {
					//             const dataset = data.datasets[bodyItem.datasetIndex];
					//             const d = dataset.data[bodyItem.index];
					//             return dataset.label + ': ' + d.real + ' + ' + d.imag + 'i';
					//         }
					//     }
					// }
};
//Chart.scaleService.registerScaleType('themometer', Scale, defaults);
