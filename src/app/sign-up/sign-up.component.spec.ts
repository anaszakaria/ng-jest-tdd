import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpComponent ],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Layout', () => {
    it('has Sign Up header', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const h1 = signUp.querySelector('h1');
      expect(h1?.textContent).toBe('Sign Up');
    })

    it('has username input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="username"]');
      const input = signUp.querySelector('input[id="username"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Username');
    })

    it('has email input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="email"]');
      const input = signUp.querySelector('input[id="email"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Email');
    })

    it('has password input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="password"]');
      const input = signUp.querySelector('input[id="password"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Password');
    })

    it('has password type for password input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const input = signUp.querySelector('input[id="password"]') as HTMLInputElement;
      expect(input.type).toBe('password');
    })

    it('has password confirmation input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const label = signUp.querySelector('label[for="passwordConfirmation"]');
      const input = signUp.querySelector('input[id="passwordConfirmation"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Confirm Password');
    })

    it('has password type for password confirmation input', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const input = signUp.querySelector('input[id="passwordConfirmation"]') as HTMLInputElement;
      expect(input.type).toBe('password');
    })

    it('has Sign Up button', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const button = signUp.querySelector('button') as HTMLButtonElement;
      expect(button.textContent).toBe('Sign Up');
    })

    it('Sign Up button is disabled initially', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const button = signUp.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBeTruthy();
    })
  })

  describe('Interactions', () => {
    it('enables Submit button when password and password confirmation is equal', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const passwordInput = signUp.querySelector('input[id="password"]') as HTMLInputElement;
      const passwordConfirmationInput = signUp.querySelector('input[id="passwordConfirmation"]') as HTMLInputElement;
      passwordInput.value = 'P4ssword';
      passwordInput.dispatchEvent(new Event('input'));
      passwordConfirmationInput.value = 'P4ssword';
      passwordConfirmationInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const button = signUp.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBeFalsy();
    })

    it('sends username, email and password to backend after clicking Submit button', () => {
      const httpTestingController = TestBed.inject(HttpTestingController);
      const signUp = fixture.nativeElement as HTMLElement;
      const usernameInput = signUp.querySelector('input[id="username"]') as HTMLInputElement;
      const emailInput = signUp.querySelector('input[id="email"]') as HTMLInputElement;
      const passwordInput = signUp.querySelector('input[id="password"]') as HTMLInputElement;
      const passwordConfirmationInput = signUp.querySelector('input[id="passwordConfirmation"]') as HTMLInputElement;
      usernameInput.value = 'user1';
      usernameInput.dispatchEvent(new Event('input'));
      emailInput.value = 'user1@mail.com';
      emailInput.dispatchEvent(new Event('input'));
      passwordInput.value = 'P4ssword';
      passwordInput.dispatchEvent(new Event('input'));
      passwordConfirmationInput.value = 'P4ssword';
      passwordConfirmationInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      const button = signUp.querySelector('button') as HTMLButtonElement;
      button.click();
      const req = httpTestingController.expectOne('/api/1.0/users');
      const requestBody = req.request.body;
      expect(requestBody).toEqual({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword'
      });
    })
  })
});
