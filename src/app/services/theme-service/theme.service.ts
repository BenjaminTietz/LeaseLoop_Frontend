import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  storageKey = 'user-theme';
  root = document.documentElement;
  currentTheme = signal('');
  constructor() {}

  /**
   * Initializes the theme for the application based on the user's preference.
   * It first checks for a saved theme in localStorage. If a valid theme ('dark' or 'light')
   * is found, it uses that theme. Otherwise, it checks the user's system preference
   * for a dark theme using media queries. If the user prefers a dark theme, it sets
   * the theme to 'dark'; otherwise, it defaults to 'light'. The chosen theme is then
   * applied and stored.
   */
  initTheme(): void {
    let savedTheme = localStorage.getItem(this.storageKey);
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isValidTheme = (value: any): value is 'dark' | 'light' => {
      return value === 'dark' || value === 'light';
    };
    let theme: 'dark' | 'light' = isValidTheme(savedTheme)
      ? savedTheme
      : prefersDark
      ? 'dark'
      : 'light';
    this.setTheme(theme);
  }

  /**
   * Sets the application's theme to either 'light' or 'dark'.
   *
   * This method updates the root element's class to reflect the specified theme
   * and stores the selected theme in localStorage for persistence. If the theme
   * is 'dark', the 'dark-theme' class is added to the root element; otherwise,
   * it is removed.
   *
   * @param theme - The desired theme, either 'light' or 'dark'.
   */
  setTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      this.root.classList.add('dark-theme');
    } else {
      this.root.classList.remove('dark-theme');
    }
    localStorage.setItem(this.storageKey, theme);
  }

  /**
   * Toggles the application's theme between 'light' and 'dark' based on its
   * current state. If the current theme is 'light', it sets the theme to 'dark';
   * otherwise, it sets the theme to 'light'. The selected theme is then stored
   * in localStorage for persistence.
   */
  toggleTheme(): void {
    let isDark = this.root.classList.contains('dark-theme');
    this.setTheme(isDark ? 'light' : 'dark');
  }

  /**
   * Retrieves the current theme of the application.
   *
   * This method checks if the 'dark-theme' class is present on the root element.
   * If the class is present, it returns 'dark'; otherwise, it returns 'light'.
   *
   * @returns The current theme, either 'light' or 'dark'.
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.root.classList.contains('dark-theme') ? 'dark' : 'light';
  }
}
