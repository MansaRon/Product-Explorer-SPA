import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isAdmin()) {
    return router.createUrlTree([`/${AppRoutes.CATALOG}`]);
  }

  return true;
};
