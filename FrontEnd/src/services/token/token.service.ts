import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
 
@Injectable({
  providedIn: 'root'
})
export class TokenService {
 
  private userName: string = '';
  private userId: number = 0;
  private user: string = '';
  private userEmail: string = '';
  private userPicture: string = '';
  private hasAccess: boolean = false;
  private createdAt: Date | undefined;
  private administrator: boolean = false;
  /**
   * Constructor
   */
  constructor() {
    //
    // If a token is saved in local storage, decode it
    var token = localStorage.getItem('token');
    if( token )
      this.decodeToken( token );
  }
  //
  // Use localsotrage to save token
  updateToken( token:string){
    //
    // Check if any token is passed
    if(!token){
      this.closeSession();
      return;
    }
    //
    this.decodeToken( token );
    //
    // save token in local storage
    localStorage.setItem('token',token);
  }
  /**
   * Returns stored token
   * @returns
   */
  getToken(): string{
    var token = localStorage.getItem('token');
    if( !token )
      return '';
    return token;
  }
  /**
   * Decode token and extract info
   * @param token
   * @returns
   */
  decodeToken( token: string )
  {
    console.log("Decoding token")
    //
    // check jwt token
    try{
      const helper = new JwtHelperService();
      const decoded = helper.decodeToken( token );
      console.log("aa %s", decoded.profile_image)
      //
      this.userName = decoded.username;
      this.userId = decoded.userId;
      this.user = decoded.user;
      this.userEmail = decoded.userEmail;
      this.userPicture = decoded.profile_image;
      this.hasAccess = decoded.allow;
      this.createdAt = decoded.createdAt;
      this.administrator = decoded.admin;
    } catch(error) {
      this.closeSession();
      return;
    }
  }
  /**
   * Check if user is logged
   * @returns
   */
  isLogged(){
    //
    // Check if token is expired
    const helper = new JwtHelperService();
    const token = localStorage.getItem('token');
    if( !token ){
      return false;
    }
    if( helper.isTokenExpired( token ) ){
      this.closeSession();
      return false;
    }
    return true;
  }
  /**
   * Get the user ID
   * @returns 
   */
  getUserId(){
    return this.userId;
  }
  /**
   * Get the user name
   * @returns 
   */
  getUserName(){
    return this.userName;
  }
  /**
   * Get the user email
   * @returns 
   */
  getUserEmail(){
    return this.userEmail;
  }
  /**
   * Get the user picture 
   * @returns 
   */
  getUserPicture(){
    return this.userPicture;
  }
 
  isAdmin(){
    return this.administrator;
  }
  //
  // Close session. Clear local storage data
  closeSession(){
    localStorage.clear();
    this.userName = '';
    this.userId = 0;
    this.user = '';
    this.userEmail = '';
    this.userPicture = '';
    this.hasAccess = false;
    this.administrator = false;
    this.createdAt = new Date("0");
  }
}