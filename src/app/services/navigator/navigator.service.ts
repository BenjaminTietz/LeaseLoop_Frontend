import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigatorService {
  router = inject(Router);
  actualRoute = signal(this.router.url)

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.actualRoute.set(event.urlAfterRedirects);
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
