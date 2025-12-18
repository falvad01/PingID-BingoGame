import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { ThemeService } from 'src/services/theme/theme.service';
import { UserService } from 'src/services/user/user.service';
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


  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService,
    private userService: UserService
  ) {

    //Subscribe to login service
    this.authService.logginInObservable$.subscribe((data: boolean) => {
      console.log('LoggingIn status:', data);
      this.loading = data;

    });
    //
    // Subscribe to login status
    this.authService.logedObservable$.subscribe(async (data: boolean) => {
      console.log('Logged status changed:', data);
      // Solo redirigir cuando data es true
      if (data === true) {
        // Check if user has already entered today's number
        try {
          const hasEnteredNumber = await this.userService.checkDayNumber();
          if (hasEnteredNumber) {
            console.log('User has entered number, redirecting to /user/dashboard');
            this.router.navigate(['/user/dashboard']);
          } else {
            console.log('User has not entered number, redirecting to /user/number');
            this.router.navigate(['/user/number']);
          }
        } catch (error) {
          console.error('Error checking daily number status:', error);
          // Default to number entry screen on error
          this.router.navigate(['/user/number']);
        }
      }
      // No mostrar error aquí, se maneja en el catch del login
    });
  }

  ngOnInit() {

    lottie.loadAnimation({
      container: document.getElementById('lottie') as HTMLElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '../../../assets/dice_animation.json'
    });
  }

  /**
   * Login in the app
   */
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
      this.errorText = ""
      this.showErrorUser = false;
      this.showErrorPass = false;
      this.authService.login(this.user, this.pass);
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
