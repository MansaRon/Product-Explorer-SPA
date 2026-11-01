import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([`/${AppRoutes.LOGIN}`], {
      queryParams: { returnUrl: state.url },
    });
  }

  return true;
};
