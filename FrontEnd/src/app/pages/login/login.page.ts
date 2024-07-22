import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import lottie from 'lottie-web';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loading = false;
  showErrorUser = false
  showErrorPass = false
  errorText = ""

  user: string = '';
  pass: string = '';


  constructor(private router: Router, private authService: AuthService) {

    //Subscribe to login service
    this.authService.logginInObservable$.subscribe((data: boolean) => {
      this.loading = data;

    });
    //
    // Subscribe to login status
    this.authService.logedObservable$.subscribe((data: boolean) => {
      if (data == true) {
        this.router.navigate(['/tabs/tab1']);
      } else {
        this.errorText = "Credential are incorrect"
        this.showErrorUser = true;
        this.showErrorPass = true;

      }
    });
  }

  ngOnInit() {

    lottie.loadAnimation({
      container: document.getElementById('lottie') as HTMLElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '../../../assets/dice_animation.json' // Ruta al archivo Lottie
    });
  }
  
  login() {

    if (this.user === '') {
      this.showErrorUser = true;
      this.errorText = "All fields are mandatory"
    } else {
      this.showErrorUser = false;
    }

    if (this.pass === '') {
      this.showErrorPass = true;
      this.errorText = "All fields are mandatory"

    } else {
      this.showErrorPass = false;

    }

    if (!this.showErrorPass && !this.showErrorUser) {
      this.authService.login(this.user, this.pass);
    }


  }
}
