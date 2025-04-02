import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token =
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/']);
};
