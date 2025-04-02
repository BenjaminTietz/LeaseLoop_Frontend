import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './landing-page/login/login.component';
import { RegisterComponent } from './landing-page/register/register.component';
import { ForgotPasswordComponent } from './landing-page/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './landing-page/reset-password/reset-password.component';
import { ActivateAccountComponent } from './landing-page/activate-account/activate-account.component';

// Dashboard
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { BookingsComponent } from './dashboard/bookings/bookings.component';

// Guards
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    children: [
      { path: '', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'activate-account/:token', component: ActivateAccountComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'bookings', component: BookingsComponent },
      { path: '', redirectTo: 'rooms', pathMatch: 'full' },
    ],
  },
];
