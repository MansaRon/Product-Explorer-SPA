import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const CART: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./cart.component').then(cart => cart.CartComponent)
  }
];