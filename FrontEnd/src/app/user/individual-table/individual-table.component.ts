import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  providers: [DatePipe],
  selector: 'app-individual-table',
  templateUrl: './individual-table.component.html',
  styleUrls: ['./individual-table.component.scss']
})
export class IndividualTableComponent {
  numbers: { number: number, count: number, dates: string[] }[] = [];

  constructor(private numberService: NumberService, private datepipe: DatePipe) {
    // Initialize numbers from 1 to 99
    this.obtainMarkedNumbers();
  }

  /**
   * Obtain the numbers from the backend service.
   * Calls the NumberService to retrieve user numbers and then processes the data.
   */
  obtainMarkedNumbers() {
    this.numberService.retrieveAllUserNumbers().then((response: any) => {

      this.processData(response);
    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  }

  /**
   * Process the data obtained from the backend.
   * Calculates frequency of each number and stores all dates associated with each number.
   * 
   * @param data - The data array containing number, count, and dates fields.
   */
  processData(data: { number: number, count: number, dates: string[] }[]) {
    const numberMap: { [key: number]: { count: number, dates: string[] } } = {};

    // Initialize all numbers from 1 to 99
    for (let i = 10; i <= 99; i++) {

      numberMap[i] = { count: 0, dates: [] };
    }

    // Populate with data from backend
    data.forEach(item => {
      if (item.number >= 10 && item.number <= 99) { // Only consider numbers within the range

        numberMap[item.number] = {
          count: item.count,
          dates: item.dates
        };
      }
    });

    // Convert the map to an array
    this.numbers = Object.keys(numberMap).map(num => ({
      number: parseInt(num, 10),
      count: numberMap[parseInt(num, 10)].count,
      dates: numberMap[parseInt(num, 10)].dates
    }));
  }

  /**
   * Depending on the count, return a CSS class for highlighting.
   * 
   * @param count - The count of occurrences of the number.
   * @returns The CSS class name.
   */
  getHighlightClass(n: number): string {
    if (n == 0) {
      return 'highlight-transparent';
    }
    for (var num of this.numbers) {

      if (num.number == n) {

        if (num.count == 1) {
          return 'highlight-green';
        } else if (num.count > 1) {
          return 'highlight-blue'
        }
      }
    }
    return ""
  }

  /**
   * Get the tooltip message for a number.
   * Includes a formatted string with all dates associated with the number.
   * 
   * @param dates - The dates to get the tooltip message for.
   * @returns The tooltip message including all dates.
   */
  getTooltipMessage(dates: string[]): string {
    const formattedDates = dates.map(date => this.datepipe.transform(new Date(date), 'dd/MM/yyyy')).join('\n ');
    return `${formattedDates}`;
  }
}
