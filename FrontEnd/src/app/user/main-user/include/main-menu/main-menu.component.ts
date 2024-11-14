import { Component, OnDestroy, OnInit } from '@angular/core';
import { TokenService } from 'src/services/token/token.service';
import { ComunicationService } from 'src/services/user/comunication-service.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit,OnDestroy{


  userName: String
  imagePath: String = ""
  isNumberAdded: boolean = false
  comunicationServiceSubcription: any;

  constructor(private tokenService: TokenService, private userService: UserService, private comunicationService: ComunicationService) {

    this.userName = this.tokenService.getUserName()
    this.getUserProfile()
  }

  ngOnInit(): void {
    this.userService.checkDayNumber().then((data) => {
      if(data)
        this.isNumberAdded = true;
    })
    this.comunicationServiceSubcription = this.comunicationService.getNumberChanged().subscribe((numberAdded: boolean) => {
      this.isNumberAdded = numberAdded;
    })
  }
  ngOnDestroy(): void {
      this.comunicationServiceSubcription.unsubcribe();
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
