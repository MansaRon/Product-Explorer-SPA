import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../../../environment';

/**
 * BASE URL INTERCEPTOR
 *
 * Responsibilities:
 * - Prepends the configured API base URL to all relative requests
 * - Leaves absolute URLs (http/https) untouched, so calls to CDNs,
 *   third-party APIs, and assets are not affected
 * - Removes any accidental double-slashes in the resulting URL
 *
 * This means services can use clean relative paths:
 *   this.http.get('/products')  →  https://api.myapp.com/v1/products
 *
 * environment.ts:
 *   export const environment = {
 *     production: false,
 *     apiBaseUrl: 'https://api.myapp.com/v1',
 *   };
 */

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    // Leave absolute URLs as-is
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      return next(req);
    }
   
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
   
    const fullUrl = `${base}${path}`;
   
    return next(req.clone({ url: fullUrl }));
};
