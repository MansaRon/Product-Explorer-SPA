import { Routes } from '@angular/router';

export const CATALOG: Routes = [
  { 
    path: '',
    loadComponent: () => import('./catalog.component').then(catalog => catalog.CatalogComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('../product-details/product-details.component').then(product => product.ProductDetailsComponent)
  }
];
