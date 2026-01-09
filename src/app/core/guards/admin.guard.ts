import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    if (!isAdmin) {
        return router.createUrlTree(['/catalog']);
    }

    return true;
};