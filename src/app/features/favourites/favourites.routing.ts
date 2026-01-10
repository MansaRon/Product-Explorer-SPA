import { Routes } from '@angular/router';

export const FAVOURITE: Routes = [
  {
    path: '',
    loadComponent: () => import('./favourites.component').then(favourite => favourite.FavouritesComponent)
  }
];

