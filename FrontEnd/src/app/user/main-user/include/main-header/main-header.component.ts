import { Component } from '@angular/core';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss']
})
export class MainHeaderComponent {

  constructor(private tokenService: TokenService){

  }

  logOut() {

    this.tokenService.closeSession()
  }

}
