import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../core/user.service';
import { passwordMatchValidator } from './password-match.validator';
import { UniqueEmailValidator } from './unique-email.validator';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.uniqueEmailValidator.validate.bind(this.uniqueEmailValidator)],
      updateOn: 'blur'
    }),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)]),
    passwordConfirmation: new FormControl('')
  }, { validators: [passwordMatchValidator] })
  
  apiProgress = false;
  signUpSuccess = false;

  constructor(private httpClient: HttpClient, private userService: UserService, private uniqueEmailValidator: UniqueEmailValidator) { }

  ngOnInit(): void {
  }

  get usernameError() {
    const field = this.signUpForm.get('username');
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors['required']) {
        return 'Username is required'
      } else {
        return 'Username must be at least 4 characters long'
      }
    }
    return;
  }

  get emailError() {
    const field = this.signUpForm.get('email');
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors['required']) {
        return 'Email is required'
      } else if (field.errors['email']) {
        return 'Invalid email address'
      } else if (field.errors['uniqueEmail']) {
        return 'Email in use'
      }
    }
    return;
  }

  get passwordError() {
    const field = this.signUpForm.get('password');
    if (field?.errors && (field?.touched || field?.dirty)) {
      if (field.errors['required']) {
        return 'Password is required'
      } else if (field.errors['pattern']) {
        return 'Password must have at least 1 uppercase, 1 lowercase and 1 number'
      }
    }
    return;
  }

  get passwordConfirmationError() {
    if (this.signUpForm.errors && (this.signUpForm?.touched || this.signUpForm?.dirty)) {
      if (this.signUpForm.errors['passwordMismatch']) {
        return 'Password and Confirm Password mismatch'
      }
    }
    return;
  }

  onClickSignUp() {
    const body = this.signUpForm.value;
    delete body.passwordConfirmation;
    this.apiProgress = true;
    this.userService.signUp(body).subscribe(() => {
      this.signUpSuccess = true;
    })
  }

  isDisabled() {
    return this.signUpForm.get('password')?.value ? (this.signUpForm.get('password')?.value !== this.signUpForm.get('passwordConfirmation')?.value) : true
  }
}
