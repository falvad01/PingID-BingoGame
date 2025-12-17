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
          console.log("Peticion correct")
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
   * @param seasonId Optional season ID to filter numbers by season
   * @returns the numbers or an error
   */
  retrieveAllUserNumbers(seasonId?: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `number/getUserNumbers/${seasonId}`
        : 'number/getUserNumbers';

      console.log("Getting user numbers" + (seasonId ? ` for season ${seasonId}` : ""))

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct")
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
  * Get all the numbers for the logged user
  * @returns the numbers or an error
  */
  retrieveAllNumbers() {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      console.log("Getting all user numbers")

      this.http.get(environment.API_PATH + 'number/getAllNumbers', { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct")
          // Handle new response structure { numbers: [...], metadata: {...} }
          // or old structure (just array)
          if (data && data.numbers && Array.isArray(data.numbers)) {
            // New structure - return the whole object so metadata is available
            resolve(data);
          } else if (Array.isArray(data)) {
            // Old structure - just return the array
            resolve(data);
          } else {
            // Unexpected format
            console.error('Unexpected data format from getAllNumbers:', data);
            resolve(data);
          }
        },
        error: error => {
          this.ErrorMessage = error.error ? error.error.error : error.message;
          reject(error);
        }
      });
    });
  }

  /**
   * Obtain the stadistics from the backend
   * @param seasonId Optional season ID to filter statistics by season
   * @returns 
   */
  getStadistics(seasonId?: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `number/getStadistics/${seasonId}`
        : 'number/getStadistics';

      console.log("Getting statistics" + (seasonId ? ` for season ${seasonId}` : ""))

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct")
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
   * Obtain the numbers introduced in the actual day
   * @param seasonId Optional season ID to filter today's numbers by season
   * @returns  
   */
  getDayNumbers(seasonId?: number) {

    return new Promise((resolve, reject) => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.token.getToken()
      });

      const endpoint = seasonId
        ? `number/getTodayNumbers/${seasonId}`
        : 'number/getTodayNumbers';

      console.log("Getting day numbers" + (seasonId ? ` for season ${seasonId}` : ""))

      this.http.get(environment.API_PATH + endpoint, { headers: headers }).subscribe({
        next: (data: any) => {
          console.log("Peticion correct")
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