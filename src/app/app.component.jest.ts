import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event'
import { ActivateComponent } from './activate/activate.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { routes } from './router/app-router.module';
import { SharedModule } from './shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { UserComponent } from './user/user.component';
import { rest } from 'msw';
import { setupServer } from 'msw/node'

// Error: Error: connect ECONNREFUSED warning will appear if we didn't include the setupServer() configuration
const server = setupServer(
    rest.post('api/1.0/users/token/:token', (req, res, ctx) => {
        return res(ctx.status(200));
    })
);

beforeEach(() => {
    server.resetHandlers(); 
})

beforeAll(() => {
    server.listen();
})

afterAll(() => server.close());

const setup = async (path: string) => {
    const { navigate } = await render(AppComponent, {
        declarations: [HomeComponent, SignUpComponent, UserComponent, LoginComponent, ActivateComponent],
        imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
        routes: routes
    });
    await navigate(path);
}

describe('Routing', () => {
    it.each`
        path               | pageId
        ${'/'}             | ${'home-page'}
        ${'/signup'}       | ${'sign-up-page'}
        ${'/user/1'}       | ${'user-page'}
        ${'/user/2'}       | ${'user-page'}
        ${'/activate/123'} | ${'activation-page'}
        ${'/activate/456'} | ${'activation-page'}
    `('displays $pageId when path is $path', async ({ path, pageId }) => {
        await setup(path);
        const page = screen.queryByTestId(pageId);
        expect(page).toBeInTheDocument();
    })

    it.each`
        path         | title
        ${'/'}       | ${'Home'}
        ${'/signup'} | ${'Sign Up'}
        ${'/login'}  | ${'Login'}
    `('has link with title $title to $path', async ({ path, title }) => {
        await setup(path);
        const link = screen.queryByRole('link', { name: title });
        expect(link).toBeInTheDocument();
    })

    it.each`
        initialPath  | clickingTo   | visiblePage
        ${'/'}       | ${'Sign Up'} | ${'sign-up-page'}
        ${'/signup'} | ${'Home'}    | ${'home-page'}
        ${'/'}       | ${'Login'}   | ${'login-page'}
    `('displays $visiblePage after clicking $clickingTo link', async ({ initialPath, clickingTo, visiblePage }) => {
        await setup(initialPath);
        const link = screen.getByRole('link', { name: clickingTo });
        await userEvent.click(link);
        const page = await screen.findByTestId(visiblePage);
        expect(page).toBeInTheDocument();
    })
})