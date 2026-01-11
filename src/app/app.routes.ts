import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/catalog',
        pathMatch: 'full'
    },
    {
        path: 'catalog',
        loadChildren: () => import('./features/catalog/catalog.routing').then(c => c.CATALOG)
    },
    {
        path: 'favorites',
        loadChildren: () => import('./features/favourites/favourites.routing').then(f => f.FAVOURITE)
    },
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadChildren: () => import('./features/admin/admin.routing').then(a => a.ADMIN)
    },
    {
        path: '**',
        redirectTo: '/catalog'
    }
];
