import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigatorService {
  router = inject(Router);
  actualRoute = signal<string>('');

  /**
   * Listens to router events and updates the actualRoute signal
   * whenever a NavigationEnd event is received.
   */
  constructor() {
    this.actualRoute.set(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.actualRoute.set(event.urlAfterRedirects);
      });
  }

  /**
   * Navigates to a route given by the path parameter.
   * @param path The route path to navigate to.
   */
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  /**
   * Navigate back in the browser history.
   */
  goBack(): void {
    window.history.back();
  }
}
