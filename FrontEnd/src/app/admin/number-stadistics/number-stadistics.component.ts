import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-number-stadistics',
  templateUrl: './number-stadistics.component.html',
  styleUrls: ['./number-stadistics.component.scss'],
})
export class NumberStadisticsComponent implements OnInit {


  mostFrequentNumber: number | null = null; // Number that appears the most
  leastFrequentNumber: number | null = null; // Number that appears the least
  totalNumbers: number = 0; // Total numbers that have appeared
  missingNumbers: number = 0; // Total numbers that have not appeared
  onceAppearedCount: number = 0; // Count of numbers that have appeared only once
  moreThanOnceCount: number = 0; // Count of numbers that have appeared more than once

  constructor() { }

  ngOnInit() { }

}
