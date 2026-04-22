import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../../loading/loading.service';

/**
 * LOADING INTERCEPTOR
 *
 * Responsibilities:
 * - Increments an active-request counter when a request starts
 * - Decrements it when the request completes (success or error)
 * - LoadingService exposes an `isLoading$` signal/observable the UI subscribes to
 * - Supports opt-out via a custom request context or header (skipLoading)
 *
 * Usage in component:
 *   loading = inject(LoadingService).isLoading;   // Angular signal
 *
 * Skip loading indicator for a specific call:
 *   this.http.get('/api/data', { context: new HttpContext().set(SKIP_LOADING, true) })
 */

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
 
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }
 
  loadingService.increment();
 
  return next(req).pipe(
    finalize(() => loadingService.decrement())
  );
};
