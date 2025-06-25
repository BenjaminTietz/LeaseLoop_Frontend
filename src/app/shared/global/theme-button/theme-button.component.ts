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
  themeService = inject(ThemeService);
  navigator = inject(NavigatorService);

  /**
   * Initializes the theme settings on component initialization.
   * Calls the theme service to set the initial theme and updates the current theme state.
   */
  ngOnInit() {
    this.themeService.initTheme();
    this.themeService.currentTheme.set(this.themeService.getCurrentTheme());
  }

  /**
   * Toggles the application theme between light and dark.
   * This method calls the theme service to toggle the theme and then updates the component's current theme state.
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.themeService.currentTheme.set(this.themeService.getCurrentTheme());
  }
}
