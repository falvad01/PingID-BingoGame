import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {
  loading = false;
  user: string = '';
  pass: string = '';

  constructor(private router: Router, private authService: AuthService) {
    //
    // Subscribe to login service
    // this.authService.logginInObservable$.subscribe((data: boolean) => {
    //   this.loading = data;
    // });
    // //
    // // Subscribe to login status
    // this.authService.logedObservable$.subscribe((data: any) => {
    //   if (data == true)
    //     this.router.navigate(['/main']);
    // });
  }

  login() {
   // this.authService.login(this.user, this.pass);
  }
}
