import { Component } from '@angular/core';
import { NumberService } from 'src/services/number/number.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  tableData: any[] = [];

  constructor(private numberService: NumberService) { }

  ionViewWillEnter() {
    this.getUsersQualy();
  }

  private async getUsersQualy() {
    try {
      const response: any = await this.numberService.getUserCLasification();
      console.log('Original response:', response);
      this.processData(response);
    } catch (error) {
      console.error('Error retrieving user numbers:', error);
    }
  }

  private processData(response: any) {
    console.log('Processing data...');
    if (Array.isArray(response)) {
      this.tableData = response.map((item: any, index: number) => ({
        position: index + 1,
        number_of_single_numbers: item.numberCount,
        number_of_repeated_numbers: item.repeatedCount,
        userName: item.user.username
      }));
      console.log('Transformed tableData:', this.tableData);
    } else {
      console.error('Response is not an array:', response);
    }
  }

}
