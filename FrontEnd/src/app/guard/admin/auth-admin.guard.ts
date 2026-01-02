import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin');

  if (token && isAdmin === 'true') {
    return true;
  } else {
    router.navigate(['/login']); // Redirect to regular login
    return false;
  }
};
