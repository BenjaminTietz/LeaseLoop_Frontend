import { Component, effect, signal } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { RouterOutlet, withDebugTracing } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';
import { SidenavToggleComponent } from '../../shared/dashboard-components/sidenav-toggle/sidenav-toggle.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { ClickOutsideDirective } from '../../directives/outside-click/click-outside.directive';

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
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update((prev) => !prev);
  }

  closeSidenav = () => {
    this.isSidebarOpen.set(false);
  };
}
