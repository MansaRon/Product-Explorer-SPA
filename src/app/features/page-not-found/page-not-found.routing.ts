import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const PAGE_NOT_FOUND: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./page-not-found.component').then(page => page.PageNotFoundComponent)
  }
];

