import { Component, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;

  startDate = '';

  constructor() {}

  formatDate(value: string) {
    //return format(parseISO(value), 'MMM dd yyyy');
    return value;
  }

}
