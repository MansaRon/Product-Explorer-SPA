import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const ADMIN: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./admin.component').then(admin => admin.AdminComponent)
  }
];