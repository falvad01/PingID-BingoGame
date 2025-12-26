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

      console.info("Registering %s", userName)

      this.http.post(environment.API_PATH + 'user/register', {
        "username": userName,
        "nameSurname": nameSurname,
        "password": password,
        "admin": admin
      }, { headers }).subscribe({
        next: (data: any) => {
          console.info(data)
          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          console.info(this.ErrorMessage);
          reject(false);
        }
      });
    });
  }

  /*
   * Obtain the users clasifications
   * @param seasonId Optional season ID to filter classification by season
   * @returns 
   */
  getUserClasification(seasonId?: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `user/getUsersQualify/${seasonId}`
        : 'user/getUsersQualify';

      console.info("Getting user clasification" + (seasonId ? ` for season ${seasonId}` : ""))

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Peticion correct %s", data)
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

      console.info("Getting user profile")

      this.http.get(environment.API_PATH + 'user/getProfile', { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Peticion correct %s", data)
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

      console.info("Edit profile %s", userName)
      console.info("Base64 length:", profileImage.length);

      this.http.post(environment.API_PATH + 'user/editProfile', {
        "username": userName,
        "name_surname": nameSurname,
        "profile_image": profileImage,

      }, { headers }).subscribe({
        next: (data: any) => {
          console.info(data)
          resolve(data);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          console.info(this.ErrorMessage);
          reject(false);
        }
      });
    });
  }

  /*
* Obtain the number remaining to obtain the line in the bingo
* @param seasonId Optional season ID to filter bingo lines by season
* @returns 
*/
  getLineRemaining(seasonId?: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `user/bingoLine/${seasonId}`
        : 'user/bingoLine';

      console.info("Getting bingo line" + (seasonId ? ` for season ${seasonId}` : ""))

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Peticion correct %s", data)
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
    return new Promise((res, rej) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.info("checking user number")

      this.http.get(environment.API_PATH + 'user/isDayNumberAdded', { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Peticion correct %s", data)
          res(data.hasNumber);
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          rej(error);
        }
      });
    })
  }

  /**
   * Get all seasons
   * @returns Promise with all seasons
   */
  getAllSeasons() {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.info("Getting all seasons");

      this.http.get(environment.API_PATH + 'user/season', { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Seasons retrieved", data);
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
   * Get all line winners (historical list)
   * @param seasonId Optional season ID
   * @returns Promise with array of all line winners
   */
  getLineWinners(seasonId?: number) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `user/lineWinners/${seasonId}`
        : 'user/lineWinners';

      console.info("Getting line winners" + (seasonId ? ` for season ${seasonId}` : ""));

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Line winners retrieved", data);
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
   * Get all bingo winners (historical list)
   * @param seasonId Optional season ID
   * @returns Promise with array of all bingo winners
   */
  getBingoWinners(seasonId?: number) {
    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `user/bingoWinners/${seasonId}`
        : 'user/bingoWinners';

      console.info("Getting bingo winners" + (seasonId ? ` for season ${seasonId}` : ""));

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.info("Bingo winners retrieved", data);
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
