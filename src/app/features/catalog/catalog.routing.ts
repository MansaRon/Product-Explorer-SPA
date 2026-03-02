import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const CATALOG: Routes = [
  { 
    path: AppRoutes.HOME,
    loadComponent: () => import('./catalog.component').then(catalog => catalog.CatalogComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('../product-details/product-details.component').then(product => product.ProductDetailsComponent)
  }
];
