(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Chart));
}(this, (function (Chart) { 'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Chart__default = /*#__PURE__*/_interopDefaultLegacy(Chart);

class ThermoController extends Chart.controllers.bar{
  _initialize(chart, datasetIndex) {

                   updateChartTicks(this.chart.data.datasets[0].data);
               }
   //@override
   updateElement(arc, index, reset){
     const me = this;
     const meta = me.getMeta();
     var dataset = me.getDataset();

   }

   _drawBubble(){
     const me = this;
             const ctx = me.chart.ctx;
             const meta = me.getMeta();

             ctx.beginPath();
             let height = me.chart.height;
             let width = me.chart.width;
             let cheight = 355;
             let unitheight = (height - 12)/cheight;
           //  ctx.arc(95, height - 57, (50*300)/height, 1.75 * Math.PI, 1.25 * Math.PI);
           // arc (x, y, radius, startangle, endagle)
             ctx.arc(95, (300*unitheight)+32, 30, 1.75 * Math.PI, 1.25 * Math.PI);
             ctx.fillStyle = "red";
             ctx.stroke();
             ctx.fill();


   }

 _drawBar(){
   const me = this;
           const ctx = me.chart.ctx;

           ctx.beginPath();
           ctx.strokeStyle = "#990000";
           ctx.rect(66, 7, 57, me.chart.height - 13);
           ctx.fillStyle = "red";
          //  ctx.stroke();

 }

 _drawTemperatureBar(){
  //reading the temperature from the data
             const me = this;
              const ctx = me.chart.ctx;

              const temperatureRead = me.chart.data.datasets[0].data;
              console.log("data: " + temperatureRead);
              let height = me.chart.height;
              let cheight = 345;
              let unitheight = (height - 20)/cheight;
              let baseheight = 300;
              let y = unitheight * (baseheight - temperatureRead) + 11;
              let actualHeight = unitheight * temperatureRead;

           //   alert("y" + y+ "actualHeight"+actualHeight);
              console.log("Height: " + me.chart.height);
              ctx.beginPath();

     // if temperatureRead = 200 the values should be like following
     //   ctx.fillRect(80, 150, 30, 286);

              ctx.fillRect(73, y -5, 45, actualHeight);

              ctx.fillStyle = "red";
              ctx.stroke();

 }

 //@override
    draw(){


      const me = this;
               //getting the chart area
               const chart = me.chart;
               //getting the meta data
               const data = me.getMeta().data || [];
               //getting the context
               const ctx = me._ctx;
               //me._initialize();
               //drawing the first pie
               me._drawBubble();
               me._drawBar();

               // draw the bar according to the Temperature
               me._drawTemperatureBar();

  }
}
 //import Scale, {defaults} from './scale';
 // Replace the value with what you actually want for a specific key
 
     //Chart.scaleService.registerScaleType('themometer', Scale, defaults);
     function updateChartTicks(data) {
         tempData = data;
         console.log("data set to: " + tempData);
         return 0;
     }

//import Scale, {defaults} from './scale';

var yLabels = {
			0 : '0\xB0 ', 50 : '50\xB0', 100 : '100\xB0', 150 : '150\xB0', 200 : '200\xB0',
		250 : '250\xB0', 300 : '300\xB0'
};
// Register the Controller and Scale
Chart__default['default'].controllers.thermometer = ThermoController;
Chart__default['default'].defaults.thermometer = {
					aspectRatio: -1,
					legend: {
							// display: false,
							position: 'right',
							labels: {
									fontColor: '#fff'
							}
					},
					scales: {
							xAxes: [{
									display: false,
                  stacked: true,
                  gridLines: {
                    display:false
                },
									ticks: {

									}
							}],
							yAxes: [{
									display: true,
                  stacked: true,
                  gridLines: {
                    display:false
                },
									ticks: {
                    fontColor:"#fff",
											beginAtZero: true,
											steps: 10,
											stepValue: 5,
											min: -52,
                      max: 300,
                      // textAlign:"center",
											callback: function(value, index, values) {
											// for a value (tick) equals to 8
											return yLabels[value] ;
											// 'junior-dev' will be returned instead and displayed on your chart
									}
									}
              },
            
            
              // {
              //   type: 'linear',
              //   position: 'right',
              //   gridLines: {
              //     display: false
              //   },
              //   ticks: {
              //     fontColor: '#fff',
              //     stepValue: 5,
              //     min: -70,
              //     max: 300,
							// 				stepValue: 5,

              //     stepSize: 2,
              //     autoSkip: false,
              //     callback: function(value, index, values) {
              //       // for a value (tick) equals to 8
              //    if(value > 5){
              //       if(yLabels[value]%50 == 0){
              //       return "____"

              //      }else{
              //       return "__"
              //      }
              //       // 'junior-dev' will be returned instead and displayed on your chart
              //   }
              // }
              //   },
            
              // }
            
            ],
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

})));
