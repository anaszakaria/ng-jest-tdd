import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl(''),
    password: new FormControl(''),
    passwordConfirmation: new FormControl('')
  })
  
  apiProgress = false;
  signUpSuccess = false;

  constructor(private httpClient: HttpClient, private userService: UserService) { }

  ngOnInit(): void {
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
