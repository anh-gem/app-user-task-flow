import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const loggedIn = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('loggedIn=true'));

  console.log('Cookies:', document.cookie);
  console.log('isLoggedIn:', loggedIn);

  if (loggedIn) {
    return true;
  }

  alert('Please login first');
  router.navigate(['/']);
  return false;
};
