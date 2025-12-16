import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminToken = localStorage.getItem('adminToken');
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');

  if (adminToken && isAdminLoggedIn === 'true') {
    return true;
  } else {
    router.navigate(['/login']); // Redirigir al login principal
    return false;
  }
};
