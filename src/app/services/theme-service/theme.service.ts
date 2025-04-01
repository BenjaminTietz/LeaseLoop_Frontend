import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  storageKey = 'user-theme';
  root = document.documentElement;
  constructor() {}

  initTheme(): void {
    let savedTheme = localStorage.getItem(this.storageKey);
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isValidTheme = (value: any): value is 'dark' | 'light' => {
      return value === 'dark' || value === 'light';
    };
    let theme: 'dark' | 'light' = isValidTheme(savedTheme) ? savedTheme : prefersDark ? 'dark' : 'light';
    this.setTheme(theme);
  }

  setTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      this.root.classList.add('dark-theme');
    } else {
      this.root.classList.remove('dark-theme');
    }
    localStorage.setItem(this.storageKey, theme);
  }

  toggleTheme(): void {
    let isDark = this.root.classList.contains('dark-theme');
    this.setTheme(isDark ? 'light' : 'dark');
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.root.classList.contains('dark-theme') ? 'dark' : 'light';
  }
}

