import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NumberService } from 'src/services/number/number.service';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  tableData: any[] = [];

  constructor(private numberService: NumberService, private router: Router, private tokenService: TokenService) { }

  ionViewWillEnter() {
    this.getUsersQualy();

    console.log("Checking loggin status")
    if (!this.tokenService.isLogged()) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Call the backend to obtain the data needed to the 
   */
  private async getUsersQualy() {
    try {
      const response: any = await this.numberService.getUserCLasification();
      console.log('Original response:', response);
      this.processData(response);
    } catch (error) {
      console.error('Error retrieving user numbers:', error);
    }
  }

  /**
   * Process data receibed from the backend to fill the clasification table
   * @param data data to proecess
   */
  private processData(data: any) {
    console.log('Processing data...');
    if (Array.isArray(data)) {
      this.tableData = data.map((item: any, index: number) => ({
        position: index + 1,
        number_of_single_numbers: item.numberCount,
        number_of_repeated_numbers: item.repeatedCount,
        userName: item.user.username
      }));
      console.log('Transformed tableData:', this.tableData);
    } else {
      console.error('Response is not an array:', data);
    }
  }

}
