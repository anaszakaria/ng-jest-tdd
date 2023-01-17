import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from './router/app-router.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { HomeComponent } from './home/home.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SharedModule } from './shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent, 
        SignUpComponent,
        HomeComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(routes), 
        HttpClientTestingModule,
        SharedModule, 
        ReactiveFormsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Routing', () => {
    it('displays Home page at / URL', async () => {
      await router.navigate(['/']);
      fixture.detectChanges();
      const homePage = fixture.nativeElement.querySelector('[data-testid="home-page"]');
      expect(homePage).toBeTruthy();
    })

    it('displays Sign Up page at /signup URL', async () => {
      await router.navigate(['/signup']);
      fixture.detectChanges();
      const signUpPage = fixture.nativeElement.querySelector('[data-testid="sign-up-page"]');
      expect(signUpPage).toBeTruthy();
    })
  })
});
