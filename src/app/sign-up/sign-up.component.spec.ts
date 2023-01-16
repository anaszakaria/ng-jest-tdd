import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignUpComponent ],
      imports: [HttpClientTestingModule, SharedModule, ReactiveFormsModule]
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
      expect(button.textContent).toContain('Sign Up');
    })

    it('Sign Up button is disabled initially', () => {
      const signUp = fixture.nativeElement as HTMLElement;
      const button = signUp.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBeTruthy();
    })
  })

  describe('Interactions', () => {
    let signUpBtn: HTMLButtonElement;
    let httpTestingController: HttpTestingController;
    let signUp: HTMLElement;

    const fillForm = async () => {
      httpTestingController = TestBed.inject(HttpTestingController);
      signUp = fixture.nativeElement;
      await fixture.whenStable();

      const usernameInput = signUp.querySelector('input[id="username"]') as HTMLInputElement;
      const emailInput = signUp.querySelector('input[id="email"]') as HTMLInputElement;
      const passwordInput = signUp.querySelector('input[id="password"]') as HTMLInputElement;
      const passwordConfirmationInput = signUp.querySelector('input[id="passwordConfirmation"]') as HTMLInputElement;
      usernameInput.value = 'user1';
      usernameInput.dispatchEvent(new Event('input'));
      emailInput.value = 'user1@mail.com';
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));
      passwordInput.value = 'P4ssword';
      passwordInput.dispatchEvent(new Event('input'));
      passwordConfirmationInput.value = 'P4ssword';
      passwordConfirmationInput.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      signUpBtn = signUp.querySelector('button') as HTMLButtonElement;
    }

    it('enables Submit button when password and password confirmation is equal', async () => {
      await fillForm();
      expect(signUpBtn.disabled).toBeFalsy();
    })

    it('sends username, email and password to backend after clicking Submit button', async () => {
      await fillForm();
      signUpBtn.click();
      const req = httpTestingController.expectOne('/api/1.0/users');
      const requestBody = req.request.body;
      expect(requestBody).toEqual({
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword'
      });
    })

    it('disables the Submit button when API is called', async () => {
      await fillForm();
      signUpBtn.click();
      fixture.detectChanges();
      signUpBtn.click();
      httpTestingController.expectOne('/api/1.0/users');
      expect(signUpBtn.disabled).toBeTruthy();
    })

    it('displays spinner after clicking the Submit button', async () => {
      await fillForm();
      expect(signUp.querySelector('span[role="status"]')).toBeFalsy();
      signUpBtn.click();
      fixture.detectChanges();
      expect(signUp.querySelector('span[role="status"]')).toBeTruthy();
    })

    it('displays account activation notification after successful sign up request', async () => {
      await fillForm();
      expect(signUp.querySelector('.alert-success')).toBeFalsy();
      signUpBtn.click();
      const req = httpTestingController.expectOne('/api/1.0/users');
      req.flush({});
      fixture.detectChanges();
      const message = signUp.querySelector('.alert-success');
      expect(message?.textContent).toContain('Please check your email to activate account');
    })

    it('hides sign up form after successful request', async () => {
      await fillForm();
      expect(signUp.querySelector('div[data-testid="form-sign-up"]')).toBeTruthy();
      signUpBtn.click();
      const req = httpTestingController.expectOne('/api/1.0/users');
      req.flush({});
      fixture.detectChanges();
      expect(signUp.querySelector('div[data-testid="form-sign-up"]')).toBeFalsy();
    })
  })

  describe('Validation', () => {
    const testCases = [
      { field: 'username', value: '', error: 'Username is required' },
      { field: 'username', value: '123', error: 'Username must be at least 4 characters long' },
      { field: 'email', value: '', error: 'Email is required' },
      { field: 'email', value: 'wrong-format', error: 'Invalid email address' },
      { field: 'password', value: '', error: 'Password is required' },
      { field: 'password', value: 'password', error: 'Password must have at least 1 uppercase, 1 lowercase and 1 number' },
      { field: 'password', value: 'passWORD', error: 'Password must have at least 1 uppercase, 1 lowercase and 1 number' },
      { field: 'password', value: 'pass1234', error: 'Password must have at least 1 uppercase, 1 lowercase and 1 number' },
      { field: 'password', value: 'PASS1234', error: 'Password must have at least 1 uppercase, 1 lowercase and 1 number' },
      { field: 'passwordConfirmation', value: 'pass', error: 'Password and Confirm Password mismatch' },
    ];  

    testCases.forEach(({ field, value, error }) => {
      it(`displays '${error}' when ${field} has '${value}'`, () => {
        const signUp = fixture.nativeElement as HTMLElement;
        expect(signUp.querySelector(`div[data-testid="${field}-validation"]`)).toBeNull();
        const input = signUp.querySelector(`input[id="${field}"]`) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        const validationElement = signUp.querySelector(`div[data-testid="${field}-validation"]`) as HTMLDivElement;
        expect(validationElement.textContent).toContain(error);
      })
    })

    it('displays E-mail in use when is not unique', () => {
      const httpTestingController = TestBed.inject(HttpTestingController);
      const signUp = fixture.nativeElement as HTMLElement;
      expect(signUp.querySelector(`div[data-testid="email-validation"]`)).toBeNull();
      const input = signUp.querySelector(`input[id="email"]`) as HTMLInputElement;
      input.value = 'non-unique-email@mail.com';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      const request = httpTestingController.expectOne(({ url, method, body }) => {
        if (url === '/api/1.0/user/email' && method === 'POST') {
          return body.email === 'non-unique-email@mail.com';
        }
        return false;
      });
      request.flush({});
      fixture.detectChanges();
      const validationElement = signUp.querySelector(`div[data-testid="email-validation"]`) as HTMLDivElement;
      expect(validationElement.textContent).toContain('Email in use');
    })
  })
});
