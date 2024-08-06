import { Component } from '@angular/core';
import { TokenService } from 'src/services/token/token.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {


  userName : String 


    constructor(private tokenService: TokenService){
      
      this.userName = this.tokenService.getUserName()
      console.log("Username: " + this.userName)
    }

}
