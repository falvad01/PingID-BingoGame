import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit{


  userName: String
  imagePath: String = ""
  isNumberAdded: boolean = false


  constructor(private tokenService: TokenService, private userService: UserService) {

    this.userName = this.tokenService.getUserName()
    this.getUserProfile()
  }

  ngOnInit(): void {
    this.userService.checkDayNumber().then((data) => {
      if(data)
        this.isNumberAdded = true;
    })
  }

  private getUserProfile() {

    this.userService.getProfile().then((data: any) => {
      this.imagePath = data.profile_image;

      if(data.profile_image == null){
        this.imagePath = '../../../assets/user.png';
      }

    }).catch(error => {
      this.imagePath = '../../../assets/user.png';
    })

  }

}
