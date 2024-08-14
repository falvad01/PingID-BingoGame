import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent {
  registerForm: FormGroup;
  profilePic: File | null = null;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      profilePic: [null]
    }, { validator: this.passwordMatchValidator });
  }

  // Validator to ensure that password and confirmPassword match
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value 
      ? null : { 'mismatch': true };
  }

  // Handle file input change event
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.profilePic = event.target.files[0];
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.registerForm.valid) {
      const formData = new FormData();
      formData.append('name', this.registerForm.get('name')?.value);
      formData.append('surname', this.registerForm.get('surname')?.value);
      formData.append('username', this.registerForm.get('username')?.value);
      formData.append('password', this.registerForm.get('password')?.value);
      formData.append('confirmPassword', this.registerForm.get('confirmPassword')?.value);

      if (this.profilePic) {
        formData.append('profilePic', this.profilePic, this.profilePic.name);
      }

      // Perform the registration logic here
      // Example: this.authService.register(formData).subscribe(response => { /* handle response */ });
      console.log('Form submitted');
    } else {
      console.log('Form is invalid');
    }
  }
}
