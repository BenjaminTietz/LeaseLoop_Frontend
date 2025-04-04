import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './landing-page/login/login.component';
import { RegisterComponent } from './landing-page/register/register.component';
import { ForgotPasswordComponent } from './landing-page/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './landing-page/reset-password/reset-password.component';
import { ActivateAccountComponent } from './landing-page/activate-account/activate-account.component';
import { MainLandingComponent } from './landing-page/main-landing/main-landing.component';
// Dashboard
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { BookingsComponent } from './dashboard/bookings/bookings.component';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Legal
import { LegalNoticeComponent } from './legal/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    children: [
      { path: '', component: MainLandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'activate-account/:uid/:token',
        component: ActivateAccountComponent,
      },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'legal-notice', component: LegalNoticeComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [{ path: 'bookings', component: BookingsComponent }],
  },
];
