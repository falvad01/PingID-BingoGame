import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-clasification',
  standalone: true,
  imports: [NgFor],
  templateUrl: './clasification.component.html',
  styleUrl: './clasification.component.scss'
})
export class ClasificationComponent {
  tableData: any[] = [];

  constructor(private userService: UserService) {

    this.getUsersQualy();
  }

  /**
   * Get the user clasification
   */
  private async getUsersQualy() {
    console.log("Starting collectiong user data")
    try {
      const response: any = await this.userService.getUserCLasification();
      this.processData(response);
    } catch (error) {
      console.error('Error retrieving user numbers:', error);
    }
  }

  /**
   * Porcess the users data
   * @param data 
   */
  private processData(data: any) {
    if (Array.isArray(data)) {
      this.tableData = data.map((item: any, index: number) => ({
        position: index + 1,
        number_of_single_numbers: item.numberCount,
        number_of_repeated_numbers: item.repeatedCount,
        userName: item.username
      }));
    } else {
      console.error('Response is not an array:', data);
    }
  }
}
