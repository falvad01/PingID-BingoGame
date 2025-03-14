import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenService } from 'src/services/token/token.service';
import { UserService } from 'src/services/user/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {


  file: any;
  nameSurname: string = ""
  userName: string = ""



  constructor(private fb: FormBuilder, private userService: UserService) {

    this.getUserProfile()

  }

  getUserProfile() {

    this.userService.getProfile().then((data: any) => {

      this.file = data.profile_image;
      this.userName = data.username
      this.nameSurname = data.name_surname

    }).catch(error => {

    })

  }

  sendProfileData() {

    this.userService.editProfile(this.userName, this.nameSurname, this.file)
  }

 

  onFileChange(event: any) {
    const files = event.target.files as FileList;

    if (files.length > 0) {
      const _file = URL.createObjectURL(files[0]);
      this.compressImage2(_file, 128).then(compressed => {
        console.log("Compressed image" + compressed)
        this.file = compressed;
      })
      this.resetInput();
    }
  }

  resetInput() {
    const input = document.getElementById('avatar-input-file') as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  // Validator to ensure that password and confirmPassword match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  /**
   * 
   * @param src 
   * @param newX 
   * @param newY 
   * @returns 
   */
  compressImage(src: any, newX: number, newY: number) {
    console.log("REsizing image")
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx!.drawImage(img, 0, 0, newX, newY);
        const data = ctx!.canvas.toDataURL();
        res(data);
      }
      img.onerror = error => rej(error);
    })
  }

   compressImage2(base64Str: string, maxSize = 500) {
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
  
        const scaleFactor = maxSize / Math.max(img.width, img.height);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
  
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7)); // Comprime a JPEG con 70% de calidad
      };
    });
  }



}
