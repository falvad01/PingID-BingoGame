import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
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
      console.log(data)
      if (data == true) {

        this.router.navigate(['/user/number']);
      } else {
        console.error("Bad crecentials")
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

  /**
   * Login in the app
   */
  login() {

    if (this.user === '') {
      console.error("User error")
      this.showErrorUser = true;
      this.errorText = "All fields are mandatory"
    } else {
      console.log("No User error")

      this.showErrorUser = false;
    }

    if (this.pass === '') {
      console.error("Pass error")

      this.showErrorPass = true;
      this.errorText = "All fields are mandatory"

    } else {
      console.log("No Pass error")

      this.showErrorPass = false;
    }

    if (!this.showErrorPass && !this.showErrorUser) {
      console.log("Continue")
      this.errorText = ""
      this.showErrorUser = false;
      this.showErrorPass = false;
      this.authService.login(this.user, this.pass);
    }
  }


  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    this.login();
  }

}
