import { render, screen } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from '@testing-library/user-event';
import 'whatwg-fetch';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

const setup = async () => {
    await render(SignUpComponent, {
        imports: [HttpClientTestingModule]
    })
}

describe('SignUpComponent', () => {
    describe('Layout', () => {
        it('has Sign Up header', async() => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Sign Up'});
            expect(header).toBeInTheDocument();
        })

        it('has username input', async () => {
            await setup();
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        })

        it('has email input', async () => {
            await setup();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
        })

        it('has password input', async () => {
            await setup();
            expect(screen.getByLabelText('Password')).toBeInTheDocument();
        })

        it('has password type for password input', async () => {
            await setup();
            const input = screen.getByLabelText('Password');
            expect(input).toHaveAttribute('type', 'password');
        })

        it('has password confirmation input', async () => {
            await setup();
            expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        })
      
        it('has password type for password confirmation input', async () => {
            await setup();
            const input = screen.getByLabelText('Confirm Password');
            expect(input).toHaveAttribute('type', 'password');
        })

        it('has Sign Up button', async () => {
            await setup();
            const signUpBtn = screen.getByRole('button', { name: 'Sign Up' });
            expect(signUpBtn).toBeInTheDocument(); 
        })
      
        it('Sign Up button is disabled initially', async () => {
            await setup();
            const signUpBtn = screen.getByRole('button', { name: 'Sign Up' });
            expect(signUpBtn).toBeDisabled();
        })
    })

    describe('Interactions', () => {
        it('enables Submit button when password and password confirmation is equal', async () => {
            await setup();
            const passwordInput = screen.getByLabelText('Password');
            const passwordConfirmationInput = screen.getByLabelText('Confirm Password');
            await userEvent.type(passwordInput, 'P4ssword');
            await userEvent.type(passwordConfirmationInput, 'P4ssword');
            const signUpBtn = screen.getByRole('button', { name: 'Sign Up' });
            expect(signUpBtn).toBeEnabled();
        })

        it('sends username, email and password to backend after clicking Submit button', async () => {
            await setup();
            const httpTestingController = TestBed.inject(HttpTestingController);
            const username = screen.getByLabelText('Username');
            const email = screen.getByLabelText('Email');
            const password = screen.getByLabelText('Password');
            const passwordConfirmation = screen.getByLabelText('Confirm Password');
            await userEvent.type(username, 'user1');
            await userEvent.type(email, 'user1@mail.com');
            await userEvent.type(password, 'P4ssword');
            await userEvent.type(passwordConfirmation, 'P4ssword');

            const button = screen.getByRole('button', { name: 'Sign Up' });
            await userEvent.click(button);

            const req = httpTestingController.expectOne('/api/1.0/users');
            const requestBody = req.request.body;
            expect(requestBody).toEqual({
                username: 'user1',
                email: 'user1@mail.com',
                password: 'P4ssword'
            });
        })
    })
})

