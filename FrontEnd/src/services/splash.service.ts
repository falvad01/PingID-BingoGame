import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplashService {

  private apiCount = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable(); // Observable to subscribe visibility changes

  constructor() { }
  /** 
   *  Displays the loader if it's not already shown.
   */
  showLoader() {
    if( this.apiCount === 0) {
      this.isLoadingSubject.next(true);
    }
    this.apiCount++;
  }
  /**
   * Hides the loader if there are no more pending API calls.
   */
  hideLoader() {
    this.apiCount--;
    if( this.apiCount === 0) {
      this.isLoadingSubject.next(false);
    }
  }
}
