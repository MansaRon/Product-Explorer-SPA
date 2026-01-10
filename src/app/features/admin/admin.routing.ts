import { Routes } from '@angular/router';

export const ADMIN: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.component').then(admin => admin.AdminComponent)
  }
];