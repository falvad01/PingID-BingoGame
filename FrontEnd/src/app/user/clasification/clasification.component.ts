import { NgFor, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';
import { UserService } from 'src/services/user/user.service';
import { SeasonService } from 'src/app/services/season.service';

@Component({
  selector: 'app-clasification',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './clasification.component.html',
  styleUrl: './clasification.component.scss'
})
export class ClasificationComponent {
  tableData: any[] = [];
  activeSeasonId: number | null = null;

  constructor(
    private userService: UserService,
    private seasonService: SeasonService
  ) {
    this.getUsersQualy();
  }

  /**
   * Get the user clasification
   */
  private async getUsersQualy() {
    console.info("Starting collecting user data")

    // Get active season first
    this.seasonService.getActiveSeason().subscribe({
      next: async (season) => {
        this.activeSeasonId = season.id;
        console.info('Active season:', season);

        // Get classification for active season
        this.userService.getUserClasification(this.activeSeasonId).then(data => {
          console.info('Classification data received:', data);
          console.info('Is array?', Array.isArray(data));
          console.info('Data length:', Array.isArray(data) ? data.length : 'not an array');
          this.processData(data);
        }).catch(error => {
          console.error('Error retrieving user numbers:', error);
        });
      },
      error: (error) => {
        console.error('Error loading active season:', error);
      }
    });
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
      console.info('tableData after processing:', this.tableData);
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
