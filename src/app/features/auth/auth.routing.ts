import { Routes } from '@angular/router';

export const AUTH: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login-page.component').then((m) => m.LoginPageComponent),
  },
];
