import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-clasification',
  standalone: true,
  imports: [NgFor],
  templateUrl: './clasification.component.html',
  styleUrl: './clasification.component.scss'
})
export class ClasificationComponent {
  tableData: any[] = [];

  constructor(private numberService: NumberService, private router: Router, private tokenService: TokenService) {

    this.getUsersQualy();
  }


  private async getUsersQualy() {
    console.log("Starting collectiong user data")
    try {
      const response: any = await this.numberService.getUserCLasification();
      this.processData(response);
    } catch (error) {
      console.error('Error retrieving user numbers:', error);
    }
  }

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
