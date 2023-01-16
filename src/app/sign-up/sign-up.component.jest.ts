import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node'
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

let requestBody: any;
let counter = 0;

const server = setupServer(
    rest.post('/api/1.0/users', (req, res, ctx) => {
        requestBody = req.body;
        counter += 1;
        return res(ctx.status(200), ctx.json({}))
    })
);

beforeEach(() => {
    counter = 0;
})

beforeAll(() => {
    server.listen();
})

afterAll(() => server.close());

const setup = async () => {
    await render(SignUpComponent, {
        imports: [HttpClientModule, SharedModule, ReactiveFormsModule]
    })
}

describe('SignUpComponent', () => {
    describe('Layout', () => {
        it('has Sign Up header', async() => {
            await setup();
            const header = screen.getByRole('heading', { name: 'Sign Up' });
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
        let signUpBtn: HTMLButtonElement;

        const fillForm = async () => {
            await setup();
            const username = screen.getByLabelText('Username');
            const email = screen.getByLabelText('Email');
            const password = screen.getByLabelText('Password');
            const passwordConfirmation = screen.getByLabelText('Confirm Password');
            await userEvent.type(username, 'user1');
            await userEvent.type(email, 'user1@mail.com');
            await userEvent.type(password, 'P4ssword');
            await userEvent.type(passwordConfirmation, 'P4ssword');
            signUpBtn = screen.getByRole('button', { name: 'Sign Up' });
        }

        it('enables Submit button when password and password confirmation is equal', async () => {
            await fillForm();
            expect(signUpBtn).toBeEnabled();
        })

        it('sends username, email and password to backend after clicking Submit button', async () => {
            await fillForm();
            await userEvent.click(signUpBtn);

            waitFor(() => {
                expect(requestBody).toEqual({
                    username: 'user1',
                    email: 'user1@mail.com',
                    password: 'P4ssword'
                });
            })
        })

        it('disables the Submit button when API is called', async () => {
            await fillForm();
            await userEvent.click(signUpBtn);
            await userEvent.click(signUpBtn);
            await waitFor(() => {
                expect(counter).toBe(1);
            })
        })

        it('displays spinner after clicking the Submit button', async () => {
            await fillForm();
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            await userEvent.click(signUpBtn);
            expect(screen.queryByRole('status')).toBeInTheDocument();
        })

        it('displays account activation notification after successful sign up request', async  () => {
            await fillForm();
            expect(screen.queryByText('Please check your email to activate account')).not.toBeInTheDocument();
            await userEvent.click(signUpBtn);
            const message = await screen.findByText('Please check your email to activate account');
            expect(message).toBeInTheDocument();
        })
      
        it('hides sign up form after successful request', async () => {
            await fillForm();
            const form = screen.getByTestId('form-sign-up');
            await userEvent.click(signUpBtn);
            await screen.findByText('Please check your email to activate account');
            expect(form).not.toBeInTheDocument();
        })
    })

    describe('Validation', () => {
        it.each`
            label         | inputValue              | message
            ${'Username'} | ${'{space}{backspace}'} | ${'Username is required'}
            ${'Username'} | ${'123'}                | ${'Username must be at least 4 characters long'}
        `('displays $message when $label has the value "$inputValue"', async ({ label, inputValue, message }) => {
            await setup();
            expect(screen.queryByText(message)).not.toBeInTheDocument();
            const usernameInput = screen.getByLabelText(label);
            await userEvent.type(usernameInput, inputValue);
            await userEvent.tab();
            expect(screen.queryByText(message)).toBeInTheDocument();
        })
    })
})

