import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const ORDERS: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: `:id/${AppRoutes.ORDER_TRACKING}`,
    loadComponent: () =>
      import('./order-tracking/order-tracking.component').then((m) => m.OrderTrackingComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
  },
];
