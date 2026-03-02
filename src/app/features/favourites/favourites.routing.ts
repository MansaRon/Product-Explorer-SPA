import { Routes } from '@angular/router';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

export const FAVOURITE: Routes = [
  {
    path: AppRoutes.HOME,
    loadComponent: () => import('./favourites.component').then(favourite => favourite.FavouritesComponent)
  }
];

