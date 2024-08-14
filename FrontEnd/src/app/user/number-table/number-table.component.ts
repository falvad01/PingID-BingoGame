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
  usernames: { [key: number]: string[] } = {}; // Store usernames associated with each number


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


  /**
   * Function to process API response
   * 
   * @param data 
   */
  processApiResponse(data: { number: number; created_at: string; User: { username: string } }[]) {
    const numberCounts: { [key: number]: number } = {};

    data.forEach(item => {
      const num = item.number;
      const username = item.User.username;

      numberCounts[num] = (numberCounts[num] || 0) + 1;

      if (!this.usernames[num]) {
        this.usernames[num] = [];
      }

      this.usernames[num].push(username);
    });

    this.numbers = Array.from({ length: 100 }, (_, i) => i);

    this.greenNumbers = this.numbers.filter(num => numberCounts[num] > 0);
    this.blueNumbers = this.greenNumbers.filter(num => numberCounts[num] > 1);

    this.repetitionCounts = this.blueNumbers.reduce((acc, num) => {
      acc[num] = numberCounts[num];
      return acc;
    }, {} as { [key: number]: number });
  }



  /**
   * Function to get the highlight class based on the number
   * 
   * @param num 
   * @returns 
   */
  getHighlightClass(num: number): string {

    if (num == 0) {
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

  /**
   * Function to get the repetition count for a number
   * 
   * @param num 
   * @returns 
   */
  getRepetitionCount(num: number): number {
    return this.repetitionCounts[num] || 0;
  }

  /**
 * Get the tooltip message for a number.
 * Includes a formatted string with all names to add it to the user
 * 
 * @param num - The number to get the tooltip message for.
 * @returns The tooltip message including all dates.
 */
  getTooltipMessage(num: number): string {
    const usernames = this.usernames[num] || [];
    return `${usernames.join(', ')}`;
  }

}
