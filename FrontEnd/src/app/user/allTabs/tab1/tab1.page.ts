import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  numbers: number[] = [];
  greenNumbers: number[] = [];
  blueNumbers: number[] = [];
  repetitionCounts: { [key: number]: number } = {};
  tooltipMessages: { [key: number]: string } = {};
  tooltipDates: { [key: number]: string[] } = {}; // Store all dates for tooltips

  activeNumber: number | null = null;

  constructor(private numberService: NumberService, private router: Router, private tokenService: TokenService) {
    // Initialize numbers from 1 to 99
    this.numbers = Array.from({ length: 99 }, (_, i) => i + 1);
  }

  /**
   * This method is called every time the user enters the tab.
   * It checks the login status and fetches the marked numbers if the user is logged in.
   */
  ionViewWillEnter() {
  
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
   * Calculates frequency of each number and determines greenNumbers, blueNumbers, and repetitionCounts.
   * Also stores all dates associated with each number.
   * 
   * @param data - The data array containing number and created_at fields.
   */
  processData(data: { number: number, created_at: string }[]) {
    const numberFrequency: { [key: number]: number } = {};
    const dateMap: { [key: number]: string[] } = {};

    data.forEach(item => {
      const num = item.number;
      numberFrequency[num] = (numberFrequency[num] || 0) + 1;

      if (!dateMap[num]) {
        dateMap[num] = [];
      }
      dateMap[num].push(item.created_at);
    });

    this.greenNumbers = [];
    this.blueNumbers = [];
    this.repetitionCounts = {};
    this.tooltipDates = dateMap; // Store all dates for each number

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

  /**
   * Count the numbers that are repeated.
   * 
   * @param num - The number to count.
   * @returns The repetition count of the number.
   */
  getRepetitionCount(num: number): number {
    return this.repetitionCounts[num] || 0;
  }

  /**
   * Depending on the number, return a CSS class for highlighting.
   * 
   * @param num - The number to determine the highlight class.
   * @returns The CSS class name.
   */
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
   * Handle mouse over event for a cell.
   * Sets the activeNumber to the number of the cell being hovered over.
   * 
   * @param num - The number of the cell being hovered over.
   */
  handleMouseOver(num: number) {
    if (this.greenNumbers.includes(num) || this.blueNumbers.includes(num)) {
      this.activeNumber = num;
    }
  }

  /**
   * Handle mouse out event for a cell.
   * Resets the activeNumber to null when the mouse leaves the cell.
   */
  handleMouseOut() {
    this.activeNumber = null;
  }

  /**
   * Get the tooltip message for a number.
   * Includes a formatted string with all dates associated with the number.
   * 
   * @param num - The number to get the tooltip message for.
   * @returns The tooltip message including all dates.
   */
  getTooltipMessage(num: number): string {
    const message = this.tooltipMessages[num] || '';
    const dates = this.tooltipDates[num] || [];
    const formattedDates = dates.map(date => new Date(date).toLocaleDateString()).join(', ');
    return `${message}\nObtenido: ${formattedDates}`;
  }
}
