import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AppRoutes } from './shared/enums/app-routes-enum';

export const routes: Routes = [
  {
    path: AppRoutes.HOME,
    redirectTo: '/catalog',
    pathMatch: 'full',
  },
  {
    path: AppRoutes.LOGIN,
    loadChildren: () => import('./features/auth/auth.routing').then((a) => a.AUTH),
  },
  {
    path: AppRoutes.REGISTER,
    loadComponent: () =>
      import('./features/auth/register/register-page.component').then(
        (m) => m.RegisterPageComponent
      ),
  },
  {
    path: AppRoutes.OTP_CONFIRMATION,
    loadComponent: () =>
      import('./features/auth/otp-confirmation/otp-confirmation-page.component').then(
        (m) => m.OtpConfirmationPageComponent
      ),
  },
  {
    path: AppRoutes.CATALOG,
    loadChildren: () => import('./features/catalog/catalog.routing').then((c) => c.CATALOG),
  },
  {
    path: AppRoutes.FAVOURITE,
    loadChildren: () => import('./features/favourites/favourites.routing').then((f) => f.FAVOURITE),
  },
  {
    path: AppRoutes.ADMIN,
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routing').then((a) => a.ADMIN),
  },
  {
    path: AppRoutes.CART,
    loadChildren: () => import('./features/cart/cart.routing').then((c) => c.CART),
  },
  {
    path: AppRoutes.CHECKOUT,
    canActivate: [authGuard],
    loadChildren: () => import('./features/checkout/checkout.routing').then((c) => c.CHECKOUT),
  },
  // Must ALWAYS be last so that it does not cause a 404 whilst angular finds a route
  {
    path: AppRoutes.PAGE_NOT_FOUND,
    loadChildren: () =>
      import('./features/page-not-found/page-not-found.routing').then((r) => r.PAGE_NOT_FOUND),
  },
];
