import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  isLoading = true; 
  constructor() {}

  ngOnInit(): void {
      setTimeout(() => {
        this.isLoading = false;
      }, 3000)
  }

}
