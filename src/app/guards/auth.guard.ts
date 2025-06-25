import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard to check if user is logged in
 *
 * If user is logged in (i.e. has a token in local or session storage), it
 * allows the route to activate. Otherwise, it redirects to the
 * `/owner` route.
 *
 * @returns {boolean} true if route can be activated, false otherwise
 */

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    return true;
  }
  return router.createUrlTree(['/owner']);
};
