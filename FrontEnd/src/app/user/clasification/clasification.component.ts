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
    this.userService.getUserClasification().then(data => {
      this.processData(data);
    }).catch(error => {
      console.error('Error retrieving user numbers:', error);
    })
  }

  /**
   * Porcess the users data
   * @param data 
   */
  private processData(data: any) {
    if (Array.isArray(data)) {
      this.tableData = data.map((item: any, index: number) => ({
        number_of_single_numbers: item.numberCount,
        number_of_repeated_numbers: item.repeatedCount,
        userName: item.username,
        profile_image: this.getImageUrl(item.profile_image),
        daysSinceLastEntry: this.getLastDayText(item.daysSinceLastEntry)
      }));
    } else {
      console.error('Response is not an array:', data);
    }
  }

  /**
   * 
   * @param profileImage 
   * @returns 
   */
  getImageUrl(profileImage: string): string {
    if (profileImage != null) {
      return profileImage;
    } else {
      return '../../../assets/user.png';
    }
  }

  getLastDayText(days: number): string {

    if (days == null) {
      return "No ha introducido número"
    } else if (days == 1) {
      return "Número introducido hoy"
    } else {
      return days == 2 ? "Número introducido hace " + (days - 1) + " dia" : "Número introducido hace " + (days - 1) + " dias"
    }

  }
}
