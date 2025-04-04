import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../services/theme-service/theme.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NavigatorService } from '../../../services/navigator/navigator.service';
@Component({
  selector: 'app-theme-button',
  standalone: true,
  imports: [MatIcon, CommonModule],
  templateUrl: './theme-button.component.html',
  styleUrl: './theme-button.component.scss',
})
export class ThemeButtonComponent {
  title = 'thynkris-frontend';
  currentTheme: 'light' | 'dark';
  themeService = inject(ThemeService);
  navigator = inject(NavigatorService);

  constructor() {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit() {
    this.themeService.initTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.currentTheme = this.themeService.getCurrentTheme();
  }
}
