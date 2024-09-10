import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-number-table',
  standalone: true,
  imports: [NgFor, NgClass, TooltipModule, NgIf],
  templateUrl: './number-table.component.html',
  styleUrls: ['./number-table.component.scss']
})
export class NumberTableComponent {
  numbers: { number: number, repetitions: number, users: { username: string, count: number }[] }[] = [];

  // Initialize numbers from 1 to 99
  allNumbers: number[] = Array.from({ length: 100 }, (_, i) => i);

  constructor(private numberService: NumberService) {
    this.obtainAllNumbers();
  }

  /**
   * Obtain all numbers from the backend service.
   * Calls the NumberService to retrieve all numbers and then processes the data.
   */
  obtainAllNumbers() {
    this.numberService.retrieveAllNumbers().then((response: any) => {
      this.processData(response);
    }).catch((error: any) => {
      console.error('Error fetching data:', error);
    });
  }

  /**
   * Process the data obtained from the backend.
   * Formats the data to include user information and counts.
   * 
   * @param data - The data array containing number, repetitions, and users fields.
   */
  processData(data: { number: number, repetitions: number, users: { username: string, count: number }[] }[]) {
    // Initialize the numbers with empty users array and 0 repetitions
    const numberData = this.allNumbers.map(num => ({
      number: num,
      repetitions: 0,
      users: []
    }));

    // Map numbers to their user data
    const numberMap = new Map<number, { repetitions: number, users: { username: string, count: number }[] }>();
    data.forEach(item => {
      numberMap.set(item.number, {
        repetitions: item.repetitions,
        users: item.users
      });
    });

    // Update the numberData array with user data
    numberData.forEach((numData: any) => {
      const data = numberMap.get(numData.number);
      if (data) {
        numData.repetitions = data.repetitions;
        numData.users = data.users;
      }
    });

    this.numbers = numberData;
  }

  /**
   * Depending on the number, return a CSS class for highlighting.
   * 
   * @param num - The number to determine the highlight class.
   * @returns The CSS class name.
   */
  getHighlightClass(n: number): string {
    if (n == 0) {
      return 'highlight-transparent';
    }
    for (var num of this.numbers) {

      if (num.number == n) {

        if (num.repetitions == 1) {
          return 'highlight-green';
        } else if (num.repetitions > 1) {
          return 'highlight-blue'
        }
      }
    }
    return ""
  }

  /**
   * Get the tooltip message for a number.
   * Includes a formatted string with all users and their counts associated with the number.
   * 
   * @param users - The users to get the tooltip message for.
   * @returns The tooltip message including all users.
   */
  getTooltipMessage(users: { username: string, count: number }[]): string {
    const formattedUsers = users.map(user => `${user.username}: ${user.count}`).join('\n ');
    return `${formattedUsers}`;
  }
}
