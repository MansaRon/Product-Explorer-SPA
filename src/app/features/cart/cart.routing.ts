import { Routes } from '@angular/router';

export const CART: Routes = [
  {
    path: '',
    loadComponent: () => import('./cart.component').then(cart => cart.CartComponent)
  }
];