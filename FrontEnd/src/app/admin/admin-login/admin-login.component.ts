import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  loading = false;
  showErrorUser = false;
  showErrorPass = false;
  errorText = '';

  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Subscribe to login process
    this.authService.logginInObservable$.subscribe((data: boolean) => {
      this.loading = data;
    });

    // Subscribe to login status
    this.authService.logedObservable$.subscribe((data: boolean) => {
      if (data == true) {
        // Check if admin login was successful
        if (localStorage.getItem('isAdminLoggedIn') === 'true') {
          this.router.navigate(['/admin/dashboard']);
        }
      } else {
        this.errorText = "Admin credentials are incorrect";
        this.showErrorUser = true;
        this.showErrorPass = true;
      }
    });
  }

  ngOnInit(): void {
    // Check if already logged in as admin
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  /**
   * Admin login
   */
  login() {
    if (this.username === '') {
      this.showErrorUser = true;
      this.errorText = "All fields are mandatory";
    } else {
      this.showErrorUser = false;
    }

    if (this.password === '') {
      this.showErrorPass = true;
      this.errorText = "All fields are mandatory";
    } else {
      this.showErrorPass = false;
    }

    if (!this.showErrorPass && !this.showErrorUser) {
      this.errorText = "";
      this.showErrorUser = false;
      this.showErrorPass = false;
      this.authService.loginAdmin(this.username, this.password);
    }
  }
}
