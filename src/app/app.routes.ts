import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AppRoutes } from './shared/enums/app-routes-enum';
import { ConsumerShellComponent } from './features/consumer-shell/consumer-shell.component';

export const routes: Routes = [
  // Admin must be declared before the consumer shell so its path is matched first.
  // The consumer shell uses path: '' (prefix match) and would otherwise capture /admin.
  {
    path: AppRoutes.ADMIN,
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routing').then((a) => a.ADMIN),
  },
  // Consumer shell — wraps all customer-facing routes with the global header
  {
    path: AppRoutes.HOME,
    component: ConsumerShellComponent,
    children: [
      {
        path: AppRoutes.HOME,
        redirectTo: `/${AppRoutes.CATALOG}`,
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
        loadChildren: () =>
          import('./features/favourites/favourites.routing').then((f) => f.FAVOURITE),
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
      {
        path: AppRoutes.ORDERS,
        canActivate: [authGuard],
        loadChildren: () => import('./features/orders/orders.routing').then((o) => o.ORDERS),
      },
      // Must always be last inside the shell
      {
        path: AppRoutes.PAGE_NOT_FOUND,
        loadChildren: () =>
          import('./features/page-not-found/page-not-found.routing').then((r) => r.PAGE_NOT_FOUND),
      },
    ],
  },
];
