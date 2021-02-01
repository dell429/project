import * as Chart from 'chart.js';
import {DatasetController} from 'chart.js';
export default class ThermoController extends Chart.controller.pie{
  updateElement(arc, index, rest){
    const me = this;
  }
}

console.log("imported correctly");
