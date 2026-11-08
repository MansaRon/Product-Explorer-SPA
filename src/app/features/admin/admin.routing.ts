import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';
import { AdminShellComponent } from './admin-shell/admin-shell.component';

export const ADMIN: Routes = [
  {
    path: AppRoutes.HOME,
    component: AdminShellComponent,
    children: [
      { path: AppRoutes.HOME, redirectTo: AppRoutes.ADMIN_DASHBOARD, pathMatch: 'full' },
      {
        path: AppRoutes.ADMIN_DASHBOARD,
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: AppRoutes.ADMIN_ORDERS,
        loadComponent: () =>
          import('./orders/order-list/order-list.component').then((m) => m.OrderListComponent),
      },
      {
        path: AppRoutes.ADMIN_USERS,
        loadComponent: () =>
          import('./users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: AppRoutes.ADMIN_CATALOG,
        loadComponent: () =>
          import('./catalog/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: AppRoutes.ADMIN_CATEGORIES,
        loadComponent: () =>
          import('./categories/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
      {
        path: AppRoutes.ADMIN_COUPONS,
        loadComponent: () =>
          import('./coupons/coupon-list/coupon-list.component').then((m) => m.CouponListComponent),
      },
    ],
  },
];
