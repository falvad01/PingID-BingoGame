import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from 'src/services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class numberAddedGuard implements CanActivate {

  constructor(private user: UserService, private router: Router) { }

  async canActivate(): Promise<boolean> {

    if(!(await this.user.checkDayNumber())) {
      return true;
    }
    this.router.navigate(['user/dashboard']);
    return false;
  }
};
