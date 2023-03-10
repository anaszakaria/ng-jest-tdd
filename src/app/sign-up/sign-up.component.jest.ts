import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node'
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

type UniqueEmailCheck = {
    email: string
};

let requestBody: any;
let counter = 0;

const server = setupServer(
    rest.post('/api/1.0/users', (req, res, ctx) => {
        requestBody = req.body;
        counter += 1;
        return res(ctx.status(200), ctx.json({}))
    }),
    rest.post('/api/1.0/user/email', (req, res, ctx) => {
        const body = req.body as UniqueEmailCheck;
        if (body.email === 'non-unique-email@mail.com') {
            return res(ctx.status(200), ctx.json({}));
        }
        return res(ctx.status(404), ctx.json({}));
    })
);

beforeEach(() => {
    counter = 0;
    server.resetHandlers(); 
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

        it('enables Submit button when all the fields have valid input', async () => {
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

        it('displays validation error coming from backend after submit failure', async () => {
            // overrride setupServer request
            server.use(
                rest.post('/api/1.0/users', (req, res, ctx) => {
                    return res(ctx.status(400), ctx.json({
                        validationErrors: { email: 'Email in use' }
                    }))
                })
            )
            await fillForm();
            await userEvent.click(signUpBtn);
            const errorMessage = await screen.findByText('Email in use');
            expect(errorMessage).toBeInTheDocument();
        })

        it('hides Sign Up button spinner after sign up request fails', async () => {
            // overrride setupServer request
            server.use(
                rest.post('/api/1.0/users', (req, res, ctx) => {
                    return res(ctx.status(400), ctx.json({
                        validationErrors: { email: 'Email in use' }
                    }))
                })
            )
            await fillForm();
            await userEvent.click(signUpBtn);
            await screen.findByText('Email in use');
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
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
            label                  | inputValue                     | message
            ${'Username'}          | ${'{space}{backspace}'}        | ${'Username is required'}
            ${'Username'}          | ${'123'}                       | ${'Username must be at least 4 characters long'}
            ${'Email'}             | ${'{space}{backspace}'}        | ${'Email is required'}
            ${'Email'}             | ${'wrong-format'}              | ${'Invalid email address'}
            ${'Password'}          | ${'{space}{backspace}'}        | ${'Password is required'}
            ${'Password'}          | ${'password'}                  | ${'Password must have at least 1 uppercase, 1 lowercase and 1 number'}
            ${'Password'}          | ${'passWORD'}                  | ${'Password must have at least 1 uppercase, 1 lowercase and 1 number'}
            ${'Password'}          | ${'pass1234'}                  | ${'Password must have at least 1 uppercase, 1 lowercase and 1 number'}
            ${'Password'}          | ${'PASS1234'}                  | ${'Password must have at least 1 uppercase, 1 lowercase and 1 number'}
            ${'Confirm Password'}  | ${'pass'}                      | ${'Password and Confirm Password mismatch'}
            ${'Email'}             | ${'non-unique-email@mail.com'} | ${'Email in use'}
        `('displays "$message" when $label has the value "$inputValue"', async ({ label, inputValue, message }) => {
            await setup();
            expect(screen.queryByText(message)).not.toBeInTheDocument();
            const input = screen.getByLabelText(label);
            await userEvent.type(input, inputValue);
            await userEvent.tab();
            const errorMessage = await screen.findByText(message);
            expect(errorMessage).toBeInTheDocument();
        })
    })
})

