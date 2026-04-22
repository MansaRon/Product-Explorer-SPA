import { HttpContextToken, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of, tap } from 'rxjs';
import { CacheService } from '../../cache/cache.service';

/**
 * CACHING INTERCEPTOR
 *
 * Responsibilities:
 * - Caches GET responses in memory with a configurable TTL (default 60s)
 * - Returns cached responses instantly without hitting the network
 * - Supports cache opt-in via HttpContext token (CACHE_REQUEST)
 * - Supports per-request TTL override (CACHE_TTL_MS)
 * - Cache entries expire automatically based on timestamp
 *
 * Usage – cache a specific request:
 *   this.http.get('/api/countries', {
 *     context: new HttpContext()
 *       .set(CACHE_REQUEST, true)
 *       .set(CACHE_TTL_MS, 5 * 60 * 1000)  // 5 minutes
 *   })
 *
 * Usage – bypass cache for a specific call:
 *   this.http.get('/api/data', { context: new HttpContext().set(CACHE_REQUEST, false) })
 */

export const CACHE_REQUEST = new HttpContextToken<boolean>(() => false);
export const CACHE_TTL_MS = new HttpContextToken<number>(() => 60_000);

export const cachingInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
 
  // Only cache GET requests that explicitly opt in
  if (req.method !== 'GET' || !req.context.get(CACHE_REQUEST)) {
    return next(req);
  }
 
  const ttl = req.context.get(CACHE_TTL_MS);
  const cached = cacheService.get(req.urlWithParams);
 
  if (cached) {
    return of(cached.clone());
  }
 
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.status === 200) {
        cacheService.set(req.urlWithParams, event, ttl);
      }
    })
  );
};
