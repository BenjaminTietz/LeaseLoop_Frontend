import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { SidenavToggleComponent } from '../../shared/dashboard-components/sidenav-toggle/sidenav-toggle.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';
import { SettingsService } from '../../services/settings-service/settings.service';
import { FillDataOverlayComponent } from '../fill-data-overlay/fill-data-overlay.component';
import { disableBackgroundScroll, enableBackgroundScroll } from '../../utils/scroll.utils';

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
    FillDataOverlayComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({  transform: 'translateX(-100%)' }),
        animate(
          '200ms ease-out',
          style({  transform: 'translateX(100%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({  transform: 'translateX(-100%)' })
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
  windowWidth = signal(window.innerWidth);

  mobileWidth = computed(() => {
  return this.windowWidth() <= 650 ? `${this.windowWidth() - 50}px` : '250px';
  });

  @HostListener('window:resize')
  onResize() {
  this.windowWidth.set(window.innerWidth);
  }

  /**
   * Gets user full data from the server and sets current URL to the router's URL.
   * Subscribes to router's events and updates the current URL whenever the route changes.
   */
  constructor() {
    this.settingsService.getUserFullData();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(this.router.url);
      }
    });
  }

  ngOnInit(){
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * Toggles the sidebar open or closed. If the sidebar is already open, it sets its state to false.
   * If the sidebar is closed, it sets its state to true.
   */
  toggleSidebar(): void {
    this.isSidebarOpen.update((prev) => !prev);
    if(this.windowWidth() <= 650) {
      disableBackgroundScroll()
    }else{
      enableBackgroundScroll()
    }
  }

  closeSidenav = () => {
    this.isSidebarOpen.set(false);
    enableBackgroundScroll()
  };

  isAllowedRoute = computed(
    () =>
      this.currentUrl() === '/owner/dashboard/settings' ||
      this.currentUrl() === '/owner/dashboard/help'
  );

  shouldShowOverlay = computed(() => {
    const data = this.settingsService.newUserData();
    return !data.data_filled && !this.isAllowedRoute();
  });
}
