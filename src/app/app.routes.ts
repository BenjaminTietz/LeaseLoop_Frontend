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
import { OverviewComponent } from './dashboard/overview/overview.component';
import { ClientsComponent } from './dashboard/clients/clients.component';
import { ServiceManagementComponent } from './dashboard/service-management/service-management.component';
import { PromocodesComponent } from './dashboard/promocodes/promocodes.component';
// Guards
import { AuthGuard } from './guards/auth.guard';

// Legal
import { LegalNoticeComponent } from './legal/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { PropertiesComponent } from './dashboard/properties/properties.component';
import { UnitsComponent } from './dashboard/units/units.component';
import { InvoicesComponent } from './dashboard/invoices/invoices.component';
import { AnalyticsComponent } from './dashboard/analytics/analytics.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { HelpPageComponent } from './dashboard/help-page/help-page.component';
import { BookingLandingComponent } from './booking-page/booking-landing/booking-landing.component';

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
    children: [
      { path: '', component: OverviewComponent },
      { path: 'properties', component: PropertiesComponent },
      { path: 'units', component: UnitsComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'services', component: ServiceManagementComponent },
      { path: 'promocodes', component: PromocodesComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'help', component: HelpPageComponent },
    ],
  },
  {
    path: 'booking-landing',
    component: BookingLandingComponent,
    children: [],
  },
];
