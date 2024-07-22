import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
/**
* API login service
*/
export class LoginService {

  ErrorMessage: string = '';
  constructor(private http: HttpClient, private token: TokenService) {

  }

  /**
   * Request API user login
   * @param user
   * @param password
   * @returns
   */
  requestLogin(user: string, password: string) {
    //
    // Clear error message
    this.ErrorMessage = '';


    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
      console.log("user %s password %s  %s body", user, password)

      this.http.post(environment.API_PATH + 'user/login', {
        "username": user,
        "password": password
      }, { headers }).subscribe({
        next: (data: any) => {
          this.token.updateToken(data.token);
          resolve(true);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          console.log(this.ErrorMessage);
          reject(false);
        }
      });
    });
  }

  /**
   * Request API user logout
   */
  requestLogout() {
    var user = this.token.getUserEmail();
    this.http.post(environment.API_PATH + 'logout', { user }).subscribe({
      next: (data: any) => {
      },
      error: error => {
      }
    });
  }
}