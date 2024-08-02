import { Injectable } from '@angular/core';
import { TokenService } from '../token/token.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  ErrorMessage: string = '';


  constructor(private http: HttpClient, private token: TokenService) { }


  /**
 * Send the number to the API and perform the api call 
 * 
 * @param number the number to send
 * @returns 
 */
  getAllUSers() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });


      this.http.get(environment.API_PATH + 'user/getAllUsers', { headers: headers }).subscribe({
        next: (data: any) => {

          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          reject(error);
        }
      });
    });
  }

  registerNewUser(userName: String, nameSurname: String, password: string, admin: boolean) {


    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Registering %s", userName)

      this.http.post(environment.API_PATH + 'user/register', {
        "username": userName,
        "nameSurname": nameSurname,
        "password": password,
        "admin": admin
      }, { headers }).subscribe({
        next: (data: any) => {
          console.log(data)
          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          console.log(this.ErrorMessage);
          reject(false);
        }
      });
    });
  }


}
