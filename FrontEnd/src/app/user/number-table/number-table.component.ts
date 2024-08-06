import { Component, OnInit } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-number-table',
  templateUrl: './number-table.component.html',
  styleUrls: ['./number-table.component.scss'],
})
export class NumberTableComponent implements OnInit {

  numbers: number[] = []; // Array to store numbers to display
  greenNumbers: number[] = []; // Array to store numbers highlighted in green
  blueNumbers: number[] = []; // Array to store numbers highlighted in blue
  repetitionCounts: { [key: number]: number } = {}; // Store repetition counts for blue numbers

  constructor(private numberService: NumberService) { }

  ngOnInit() {
    this.obtainMarkedNumbers()
  }

  /**
   * Obtain the numbers from the backend service.
   * Calls the NumberService to retrieve user numbers and then processes the data.
   */
  obtainMarkedNumbers() {
    this.numberService.retrieveAllNumbers().then((response: any) => {
      this.processApiResponse(response);

    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  }

  // Function to process API response
  processApiResponse(data: { number: number; created_at: string }[]) {
    const numberCounts: { [key: number]: number } = {};

    // Count occurrences of each number
    data.forEach(item => {
      numberCounts[item.number] = (numberCounts[item.number] || 0) + 1;
    });

    // Populate greenNumbers and blueNumbers
    this.numbers = Array.from({ length: 100 }, (_, i) => i); // Numbers from 1 to 99

    this.greenNumbers = this.numbers.filter(num => numberCounts[num] > 0);
    this.blueNumbers = this.greenNumbers.filter(num => numberCounts[num] > 1);

    // Store repetition counts for blue numbers
    this.repetitionCounts = this.blueNumbers.reduce((acc, num) => {
      acc[num] = numberCounts[num];
      return acc;
    }, {} as { [key: number]: number });
  }

  // Function to get the highlight class based on the number
  getHighlightClass(num: number): string {

    if(num == 0){
      return 'highlight-transparent';
    }

    if (this.blueNumbers.includes(num)) {
      return 'highlight-blue';
    }
    if (this.greenNumbers.includes(num)) {
      return 'highlight-green';
    }
    return '';
  }

  // Function to get the repetition count for a number
  getRepetitionCount(num: number): number {
    return this.repetitionCounts[num] || 0;
  }

}
