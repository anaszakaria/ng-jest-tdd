import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  username = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  apiProgress = false;
  signUpSuccess = false;

  constructor(private httpClient: HttpClient, private userService: UserService) { }

  ngOnInit(): void {
  }

  onChangeUsername(event: Event) {
    this.username = (event.target as HTMLInputElement).value;
  }

  onChangeEmail(event: Event) {
    this.email = (event.target as HTMLInputElement).value;
  }

  onChangePassword(event: Event) {
    this.password = (event.target as HTMLInputElement).value;
  }

  onChangePasswordConfirmation(event: Event) {
    this.passwordConfirmation = (event.target as HTMLInputElement).value;
  }

  onClickSignUp() {
    this.apiProgress = true;
    this.userService.signUp({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe(() => {
      this.signUpSuccess = true;
    })
  }

  isDisabled() {
    return this.password ? (this.password !== this.passwordConfirmation) : true
  }
}
