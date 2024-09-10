import { Component } from '@angular/core';
import { NumbersTimeLineComponent } from "../numbers-time-line/numbers-time-line.component";
import { ClasificationComponent } from "../clasification/clasification.component";
import { NumberBarChartComponent } from '../number-bar-chart/number-bar-graph.component';
import { ClasificationChartComponent } from "../clasification-chart/clasification-chart.component";
import { StackerBarChartComponent } from "../../stacker-bar-chart/stacker-bar-chart.component";
import { NumberTableComponent } from '../number-table/number-table.component';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [NumbersTimeLineComponent, ClasificationComponent, NumberBarChartComponent, ClasificationChartComponent, StackerBarChartComponent, NumberTableComponent],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent {

}
