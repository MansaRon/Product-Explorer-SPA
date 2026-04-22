import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpContextToken,
} from '@angular/common/http';
import { timer, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

/**
 * RETRY INTERCEPTOR
 *
 * Responsibilities:
 * - Automatically retries failed requests using exponential backoff
 * - Only retries on transient errors: network failures (0) and server errors (5xx)
 * - Never retries client errors (4xx) – those are not transient
 * - Supports per-request opt-out via HttpContext token (SKIP_RETRY)
 * - Configurable max attempts and base delay
 *
 * Default behaviour:
 *   - Max 3 attempts (1 original + 2 retries)
 *   - Delay doubles each attempt: 1s → 2s → 4s (capped at 30s)
 *   - Adds ±20% jitter to prevent thundering-herd on distributed failures
 *
 * Usage – skip retry for a specific call:
 *   this.http.post('/api/payment', body, {
 *     context: new HttpContext().set(SKIP_RETRY, true)
 *   })
 */

export const SKIP_RETRY = new HttpContextToken<boolean>(() => false);
export const MAX_RETRIES = new HttpContextToken<number>(() => 2);

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

const RETRYABLE_STATUSES = new Set([0, 429, 500, 502, 503, 504]);

export const retryInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (req.context.get(SKIP_RETRY)) {
    return next(req);
  }

  const maxRetries = req.context.get(MAX_RETRIES);
  let attempt = 0;

  return next(req).pipe(
    retry({
      count: maxRetries,
      delay: (error: HttpErrorResponse) => {
        if (!RETRYABLE_STATUSES.has(error.status)) {
          // Non-retryable – propagate immediately
          return throwError(() => error);
        }

        attempt++;
        const exponential = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        const jitter = exponential * 0.2 * Math.random();
        const delay = Math.min(exponential + jitter, MAX_DELAY_MS);

        console.warn(
          `[RetryInterceptor] Attempt ${attempt}/${maxRetries} for ${req.method} ${req.url} — retrying in ${Math.round(delay)}ms`
        );

        return timer(delay);
      },
    }),
    catchError((error) => throwError(() => error))
  );
};