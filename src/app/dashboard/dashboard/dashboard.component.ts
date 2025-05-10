import { Component, computed, effect, inject, signal } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { NavigationEnd, Router, RouterOutlet, withDebugTracing } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { SidenavToggleComponent } from '../../shared/dashboard-components/sidenav-toggle/sidenav-toggle.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';
import { SettingsService } from '../../services/settings-service/settings.service';
import { FillDataOverlayComponent } from "../fill-data-overlay/fill-data-overlay.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidenavComponent,
    RouterOutlet,
    CommonModule,
    ThemeButtonComponent,
    SidenavToggleComponent,
    ClickOutsideDirective,
    FillDataOverlayComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate(
          '250ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateX(-100%)' })
        ),
      ]),
    ]),
  ],
})
export class DashboardComponent {
  settingsService = inject(SettingsService);
  isSidebarOpen = signal(false);
  router = inject(Router);
  currentUrl = signal(this.router.url);

  constructor() {
    this.settingsService.getUserFullData();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(this.router.url);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((prev) => !prev);
  }

  closeSidenav = () => {
    this.isSidebarOpen.set(false);
  };

  isAllowedRoute = computed(() => this.currentUrl() === '/dashboard/settings' || this.currentUrl() === '/dashboard/help');

  shouldShowOverlay = computed(() => {
    const data = this.settingsService.newUserData();
    return !data.data_filled && !this.isAllowedRoute();
  });
}
