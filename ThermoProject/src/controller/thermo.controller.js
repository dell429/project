import * as Chart from 'chart.js'
import {DatasetController} from 'chart.js'
const helpers = Chart.helpers;

export default class ThermoController extends Chart.controllers.bar{
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
             let cheight = 350;
             let unitheight = (height - 12)/cheight;
           //  ctx.arc(95, height - 57, (50*300)/height, 1.75 * Math.PI, 1.25 * Math.PI);
           // arc (x, y, radius, startangle, endagle)
             ctx.arc(95, (300*unitheight)+32, 30, 1.75 * Math.PI, 1.25 * Math.PI);
             ctx.fillStyle = "#4040bf";
             ctx.stroke();
             ctx.fill();


   }

 _drawBar(){
   const me = this;
           const ctx = me.chart.ctx;

           ctx.beginPath();
           ctx.strokeStyle = "#990000";
           ctx.rect(66, 7, 57, me.chart.height - 13);
           ctx.fillStyle = "#4040bf";
           ctx.stroke();

 }

 _drawTemperatureBar(){
  //reading the temperature from the data
             const me = this;
              const ctx = me.chart.ctx;

              const temperatureRead = me.chart.data.datasets[0].data;
              console.log("data: " + temperatureRead);
              let height = me.chart.height;
              let cheight = 350
              let unitheight = (height - 12)/cheight;
              let baseheight = 300;
              let y = unitheight * (baseheight - temperatureRead) + 11;
              let actualHeight = unitheight * temperatureRead;

           //   alert("y" + y+ "actualHeight"+actualHeight);
              console.log("Height: " + me.chart.height);
              ctx.beginPath();

     // if temperatureRead = 200 the values should be like following
     //   ctx.fillRect(80, 150, 30, 286);

              ctx.fillRect(80, y, 30, actualHeight);

              ctx.fillStyle = "#4040bf";
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
