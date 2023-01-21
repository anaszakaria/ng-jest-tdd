import { HttpClientModule } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import userEvent from '@testing-library/user-event';
import { getPage } from './test-helper';


const server = setupServer(
    rest.get('api/1.0/users', (req, res, ctx) => {
        let size = Number.parseInt(req.url.searchParams.get('size')!);
        let page = Number.parseInt(req.url.searchParams.get('page')!);
        if (Number.isNaN(size)) {
            size = 5;
        }
        if (Number.isNaN(page)) {
            page = 0;
        }
        return res(ctx.status(200), ctx.json(getPage(page, size)));
    })
)

beforeAll(() => server.listen());

beforeEach(() => server.resetHandlers());

afterAll(() => server.close());

const setup = async () => {
    await render(UserListComponent, {
        imports: [HttpClientModule]
    })
}

describe('User List', () => {
    it('displays 3 users in the list', async () => {
        await setup();
        await waitFor(() => {
            expect(screen.queryAllByText(/user/).length).toBe(3);
        })
    })

    it('displays next page button', async () => {
        await setup();
        await screen.findByText('user1');
        expect(screen.queryByText('Next >')).toBeInTheDocument();
    })

    it('displays next page after clicking next', async () => {
        await setup();
        await screen.findByText('user1');
        await userEvent.click(screen.getByText('Next >'));
        const firstUserInPage2 = await screen.findByText('user4');
        expect(firstUserInPage2).toBeInTheDocument();
    })

    it('hides next page button at the last page', async () => {
        await setup();
        await screen.findByText('user1');
        await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4');
        await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user7');
        expect(screen.queryByText('Next >')).not.toBeInTheDocument();
    })

    it('does not displays previous button in first page', async () => {
        await setup();
        await screen.findByText('user1');
        expect(screen.queryByText('Previous >')).not.toBeInTheDocument();
    })

    it('displays previous page button in page 2', async () => {
        await setup();
        await screen.findByText('user1');
        await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4');
        expect(screen.queryByText('Previous <')).toBeInTheDocument();
    })

    it('displays previous page after clicking the previous page button', async () => {
        await setup();
        await screen.findByText('user1');
        await userEvent.click(screen.getByText('Next >'));
        await screen.findByText('user4');
        await userEvent.click(screen.getByText('Previous <'));
        const firstUserInPage1 = await screen.findByText('user1');
        expect(firstUserInPage1).toBeInTheDocument();
    })
})