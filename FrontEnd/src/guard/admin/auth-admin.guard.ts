import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from 'src/services/token/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardAdmin implements CanActivate {

  constructor(private tokenService: TokenService, private router: Router) { }

  canActivate(): boolean {
    if (this.tokenService.isLogged() && this.tokenService.isAdmin()) {
      // User is logged in, allow access
      return true;
    } else {
      // User is not logged in, redirect to the login page
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}
