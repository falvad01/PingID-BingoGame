import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-number-stadistics',
  templateUrl: './number-stadistics.component.html',
  styleUrls: ['./number-stadistics.component.scss'],
})
export class NumberStadisticsComponent implements OnInit {


  mostFrequentNumber: number = 0 // Number that appears the most
  allNumbersIntroduced: number = 0 // Number that appears the least
  totalNumbers: number = 0; // Total numbers that have appeared
  missingNumbers: number = 0; // Total numbers that have not appeared
  onceAppearedCount: number = 0; // Count of numbers that have appeared only once
  moreThanOnceCount: number = 0; // Count of numbers that have appeared more than once

  constructor(private numberService: NumberService) {
    this.calculateStatistics()
  }
  ngOnInit() { }

  calculateStatistics() {

    this.numberService.getStadistics().then((data: any) => {

      this.mostFrequentNumber = data.mostFrequentNumber
      this.allNumbersIntroduced = data.allNumbersIntroduced
      this.totalNumbers = data.totalNumbers
      this.missingNumbers = data.missingNumbers
      this.onceAppearedCount = data.onceAppearedCount
      this.moreThanOnceCount = data.moreThanOnceCount

    }).catch(error => {

    })

  }

}
