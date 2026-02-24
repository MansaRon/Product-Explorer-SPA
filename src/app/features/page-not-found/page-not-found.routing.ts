import { Routes } from '@angular/router';

export const PAGE_NOT_FOUND: Routes = [
  {
    path: '',
    loadComponent: () => import('./page-not-found.component').then(page => page.PageNotFoundComponent)
  }
];

