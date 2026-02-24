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
        path: 'cart',
        loadChildren: () => import('./features/cart/cart.routing').then(c => c.CART)
    },
    {
        path:'checkout',
        loadChildren: () => import('./features/checkout/checkout.routing').then(c => c.CHECKOUT)
    },
    // Must ALWAYS be last so that it does not cause a 404 whilst angular finds a route
    {
        path: '**',
        loadChildren: () => import('./features/page-not-found/page-not-found.routing').then(r => r.PAGE_NOT_FOUND)
    }
];
