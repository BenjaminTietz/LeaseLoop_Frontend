import { Component, effect, signal } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Router, RouterOutlet } from '@angular/router';
import { SidenavToggleComponent } from '../../shared/dashboard-components/sidenav-toggle/sidenav-toggle.component';
import { CommonModule } from '@angular/common';
import { ThemeButtonComponent } from '../../shared/global/theme-button/theme-button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidenavComponent,
    RouterOutlet,
    SidenavToggleComponent,
    CommonModule,
    ThemeButtonComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  isSidebarOpen = signal(true);

  constructor() {
    effect(() => {
      console.log('Sidebar open state changed:', this.isSidebarOpen());
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((prev) => !prev);
  }
}
