import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  numbers: number[] = [];
  greenNumbers: number[] = [];
  blueNumbers: number[] = [];
  repetitionCounts: { [key: number]: number } = {}; // Store repetition counts for blue numbers

  header: any;
  subheader: any;
  message: any;
  isAlertOpen: any;
  alertButtons = ['Close'];


  constructor(private numberService: NumberService) {
    this.numbers = Array.from({ length: 99 }, (_, i) => i + 1);

  }

  ionViewWillEnter() {

    this.fetchHighlightedNumbers();
  }

  /**
   * 
   */
  fetchHighlightedNumbers() {

    this.numberService.retrieveAllUserNumbers().then((response: any) => {

      this.processData(response);

    }).catch((error: any) => {

    })

  }

  processData(data: { number: number, created_at: string }[]) {
    const numberFrequency: { [key: number]: number } = {};

    // Calculate frequency of each number
    data.forEach(item => {
      const num = item.number;
      if (numberFrequency[num]) {
        numberFrequency[num]++;
      } else {
        numberFrequency[num] = 1;
      }
    });

    // Determine greenNumbers, blueNumbers, and repetitionCounts
    this.greenNumbers = [];
    this.blueNumbers = [];
    this.repetitionCounts = {};

    for (const num in numberFrequency) {
      const count = numberFrequency[num];
      if (count > 1) {
        this.blueNumbers.push(Number(num));
        this.repetitionCounts[Number(num)] = count;
      } else {
        this.greenNumbers.push(Number(num));
      }
    }
  }


  getRepetitionCount(num: number): number {
    return this.repetitionCounts[num] || 0;
  }

  getHighlightClass(num: number): string {
    if (this.blueNumbers.includes(num)) {
      return 'highlight-blue';
    } else if (this.greenNumbers.includes(num)) {
      return 'highlight-green';
    } else {
      return '';
    }
  }

  /**
 * Set the dialog open or not
 * @param isOpen 
 */
  setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;

    if (!this.isAlertOpen) {
      this.header = ""
      this.subheader = ""
      this.message = ""
    }
  }

}
