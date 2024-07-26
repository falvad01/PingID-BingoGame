import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TokenService } from '../token/token.service';


@Injectable({
  providedIn: 'root'
})
export class NumberService {


  ErrorMessage: string = '';


  constructor(private http: HttpClient, private token: TokenService) { }


  /**
   * Send the number to the API and perform the api call 
   * 
   * @param number the number to send
   * @returns 
   */
  requestSendNumber(number: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Adding number %s", number)

      this.http.post(environment.API_PATH + 'number/add?number=' + number, null, { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct %s", data)
          resolve(true);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          reject(error);
        }
      });
    });
  }



  /**
   * Get all the numbers for the logged user
   * @returns the numbers or an error
   */
  retrieveAllUserNumbers() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting all user numbers")

      this.http.get(environment.API_PATH + 'number/getUserNumbers', { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct %s", data)
          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          reject(error);
        }
      });
    });
  }

  getUserCLasification() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting all user numbers")

      this.http.get(environment.API_PATH + 'user/getUsersQualify', { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct %s", data)
          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          reject(error);
        }
      });
    });
  }
}


