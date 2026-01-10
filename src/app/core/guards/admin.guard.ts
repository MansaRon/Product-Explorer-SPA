import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../core/services/auth/auth.service";

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.isAdmin()) {
        return router.createUrlTree(['/catalog']);
    }

    return true;
};