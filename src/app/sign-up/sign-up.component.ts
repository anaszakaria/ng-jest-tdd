import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  password = '';
  passwordConfirmation = '';

  constructor() { }

  ngOnInit(): void {
  }

  onChangePassword(event: Event) {
    this.password = (event.target as HTMLInputElement).value;
  }

  onChangePasswordConfirmation(event: Event) {
    this.passwordConfirmation = (event.target as HTMLInputElement).value;
  }

  isDisabled() {
    return this.password ? (this.password !== this.passwordConfirmation) : true
  }
}
