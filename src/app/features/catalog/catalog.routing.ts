import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';
import { productDetailsResolver } from '../../core/services/resolver/product-details.resolver';

export const CATALOG: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./catalog.component').then(catalog => catalog.CatalogComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('../product-details/product-details.component').then(product => product.ProductDetailsComponent),
    resolve: { product: productDetailsResolver }
  }
];
