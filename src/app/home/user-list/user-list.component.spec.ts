import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { getPage } from './test-helper';

const parsePageParams = (request: TestRequest) => {
  let size = Number.parseInt(request.request.params.get('size')!);
  let page = Number.parseInt(request.request.params.get('page')!);
  if (Number.isNaN(size)) {
    size = 5;
  }
  if (Number.isNaN(page)) {
    page = 0;
  }
  return {
    size, page
  }
}

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserListComponent],
      imports: [HttpClientTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('displays 3 users in list', () => {
    // () => true - the URL is not important, just a request that will return successful response in this case
    const request = httpTestingController.expectOne(() => true); 
    const { page, size } = parsePageParams(request);
    request.flush(getPage(page, size));
    fixture.detectChanges();
    const listItems = fixture.nativeElement.querySelectorAll('li');
    expect(listItems.length).toBe(3);
  })

  it('sends size params as 3', () => {
    const request = httpTestingController.expectOne(() => true);
    expect(request.request.params.get('size')).toBe(3);
  })

  it('displays next page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    expect(nextPageButton).toBeTruthy();
  })

  it('request next page after clicking next page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    nextPageButton.click();
    const nextRequest = httpTestingController.expectOne(() => true);
    expect(nextRequest.request.params.get('page')).toBe(1);
  })

  it('does not display next page at last page', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(2, 3));
    fixture.detectChanges();
    const nextPageButton = fixture.nativeElement.querySelector('button[data-testid="next-button"]');
    expect(nextPageButton).toBeFalsy();
  })

  it('does not displays previous button at first page', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    const prevPageButton = fixture.nativeElement.querySelector('button[data-testid="prev-button"]');
    expect(prevPageButton).toBeFalsy();
  })

  it('displays previous page button in page 2', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(1, 3));
    fixture.detectChanges();
    const prevPageButton = fixture.nativeElement.querySelector('button[data-testid="prev-button"]');
    expect(prevPageButton).toBeTruthy();
  })

  it('displays previous page after clicking the previous page button', () => {
    const request = httpTestingController.expectOne(() => true);
    request.flush(getPage(1, 3));
    fixture.detectChanges();
    const prevPageButton = fixture.nativeElement.querySelector('button[data-testid="prev-button"]');
    prevPageButton.click();
    const prevRequest = httpTestingController.expectOne(() => true);
    expect(prevRequest.request.params.get('page')).toBe(0);
  })

  it('displays spinner during the API call', () => {
    const request = httpTestingController.expectOne(() => true);
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeTruthy();
    request.flush(getPage(0, 3));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('span[role="status"]')).toBeFalsy();
  })
});
