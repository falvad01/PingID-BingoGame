import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-numbers-time-line',
  standalone: true,
  imports: [NgFor],
  templateUrl: './numbers-time-line.component.html',
  styleUrls: ['./numbers-time-line.component.scss']
})
export class NumbersTimeLineComponent {
  todayNumbers: any;

  constructor(private numberService: NumberService) {
    this.getTodayNumbers();
  }

  /**
   * Obtain the numbers introduced on the current day
   */
  getTodayNumbers() {
    this.numberService.getDayNumbers().then((data:any) => {
      // Convertir el array de bytes en una URL para cada imagen de usuario
      this.todayNumbers = data.map((td: any) => ({
        ...td,
        imageUrl: this.getImageUrl(td.User?.profile_image)
      }));
    }).catch(error => {
      console.error('Error fetching today numbers:', error);
    });
  }

  getImageUrl(profileImage: string): string {
    if (profileImage != null) {
      return profileImage;
    } else {
      return '../../../assets/user.png';
    }
  }
}
