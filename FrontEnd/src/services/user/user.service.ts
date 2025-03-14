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

  /**
   * Register a new user
   * 
   * @param userName 
   * @param nameSurname 
   * @param password 
   * @param admin 
   * @returns 
   */
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

  /*
   * Obtain que users clasifications
   * 
   * @returns 
   */
  getUserClasification() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting user clasification")

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

  /*
   * Obtain the user profile
   * 
   * @returns 
   */
  getProfile() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting user profile")

      this.http.get(environment.API_PATH + 'user/getProfile', { headers: headers }).subscribe({
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

    /*
   * Edir profile
   * 
   * @returns 
   */
    editProfile(userName: String, nameSurname: String, profileImage: string) {

      return new Promise((resolve, reject) => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.token.getToken()
        });
  
        console.log("Edit profile %s", userName)
        console.log("Base64 length:", profileImage.length);

        this.http.post(environment.API_PATH + 'user/editProfile', {
          "username": userName,
          "name_surname": nameSurname,
          "profile_image": profileImage,
         
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

      /*
   * Obtain the number remaining to obtain the line in the bingo
   * 
   * @returns 
   */
  getLineRemaining() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting user profile")

      this.http.get(environment.API_PATH + 'user/bingoLine', { headers: headers }).subscribe({
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
/**
 * Check if the user have added the daily number
 * @returns 
 */
  checkDayNumber() {
    return new Promise((res,rej) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("checking user number")

      this.http.get(environment.API_PATH + 'user/isDayNumberAdded', { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct %s", data)
          res(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          rej(error);
        }
      });
    })
  }
}
