import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { LoginService } from '../login/login.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isUserLoggedIn: boolean = false;
  //
  // Loggin In observable
  logginInObservable$: Observable<boolean>;
  private logginInInternal$: Observable<boolean>;
  private logginInSubject = new Subject<boolean>();
  //
  // Loged user observable
  logedObservable$: Observable<boolean>;
  private logedInternal$: Observable<boolean>;
  private logedSubject = new Subject<boolean>();

  token: any = [];

  /**
   * Constructor
   */
  constructor(private loginService: LoginService) {
    //
    // Create an observable to detect login/logout events
    this.logginInInternal$ = this.logginInSubject.asObservable().pipe(startWith(false));
    this.logginInObservable$ = this.logginInInternal$.pipe(startWith(false));
    //
    // Create an observable to ser logged user in/out
    this.logedInternal$ = this.logedSubject.asObservable().pipe();
    this.logedObservable$ = this.logedInternal$.pipe();
    //
    this.logedSubject.next(this.isLoggedIn());
  }

  /**
   * User login
   * @param userName
   * @param password
   */
  login(userName: string, password: string) {
    //
    // Set user as not logged and status to logging-in
    this.logedSubject.next(false);
    this.logginInSubject.next(true);
    //
    // Request API login
    this.loginService.requestLogin(userName, password).then((response: any) => {

      // User has access. Set user as logged
      localStorage.setItem('isUserLoggedIn', "true");
      //
      // Set user as logged and status to not logging-in
      this.logginInSubject.next(false);
      this.logedSubject.next(true);
    }).catch((error: any) => {
      //
      // An error has ocurred. Set user as not logged and status to not logging-in
      this.logginInSubject.next(false);
      this.logedSubject.next(false);
    });
  }

  /**
   * User login
   * @param userName
   * @param password
   */
  loginAdmin(userName: string, password: string) {
    //
    // Set user as not logged and status to logging-in
    this.logedSubject.next(false);
    this.logginInSubject.next(true);
    //
    // Request API login
    this.loginService.requestLoginAdmin(userName, password).then((response: any) => {

      // User has access. Set user as logged
      localStorage.setItem('isUserLoggedIn', "true");
      //
      // Set user as logged and status to not logging-in
      this.logginInSubject.next(false);
      this.logedSubject.next(true);
    }).catch((error: any) => {
      //
      // An error has ocurred. Set user as not logged and status to not logging-in
      this.logginInSubject.next(false);
      this.logedSubject.next(false);
    });
  }

  logout(): void {
    this.loginService.requestLogout();
    this.isUserLoggedIn = false;
    localStorage.removeItem('isUserLoggedIn');
    this.token = [];
    this.logedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isUserLoggedIn') == 'true' ? true : false;
  }
}