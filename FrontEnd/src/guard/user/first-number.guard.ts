import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { UserService } from 'src/services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class firstNumberGuard implements CanActivate {

  constructor(private user: UserService, private router: Router) { }

  async canActivate(): Promise<boolean> {
    if(await this.user.checkDayNumber()) {
      return true;
    }
    this.router.navigate(['user/number']);
    return false;
  }
}