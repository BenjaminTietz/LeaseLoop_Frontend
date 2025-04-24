import { Component, inject, signal } from '@angular/core';
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



  ngOnInit() {
    this.themeService.initTheme();
    this.themeService.currentTheme.set(this.themeService.getCurrentTheme())
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.themeService.currentTheme.set(this.themeService.getCurrentTheme());
  }
}
