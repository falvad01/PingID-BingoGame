import { Component } from '@angular/core';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {


  userName: String
  imagePath: String = ""


  constructor(private tokenService: TokenService, private userService: UserService) {

    this.userName = this.tokenService.getUserName()
    this.getUserProfile()
  }


  private getUserProfile() {

    this.userService.getProfile().then((data: any) => {
      this.imagePath = data.profile_image;

    }).catch(error => {
      this.imagePath = '../../../assets/user.png';
    })

  }

}
