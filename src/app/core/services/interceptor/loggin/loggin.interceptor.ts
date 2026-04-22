import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environment';

/**
 * LOGGING INTERCEPTOR
 *
 * Responsibilities:
 * - Logs outgoing requests and incoming responses in non-production environments
 * - Measures request duration
 * - Redacts sensitive headers (Authorization, Cookie) before logging
 * - In production, only logs errors (status >= 400) to avoid noise
 *
 * Tip: Replace console.* calls with your preferred logger (e.g., NGX Logger, Datadog RUM).
 *  */

const REDACTED = '[REDACTED]';
const SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key'];

export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const start = performance.now();
  const safeHeaders = redactHeaders(req.headers.keys(), req);
 
  if (!environment.production) {
    console.groupCollapsed(`➡️  ${req.method} ${req.url}`);
    console.log('Headers:', safeHeaders);
    if (req.body) console.log('Body:', req.body);
    console.groupEnd();
  }
 
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const duration = (performance.now() - start).toFixed(1);
 
          if (!environment.production) {
            console.groupCollapsed(
              `%c✅ ${event.status} ${req.method} ${req.url} (${duration}ms)`,
              'color: green'
            );
            console.log('Response body:', event.body);
            console.groupEnd();
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        const duration = (performance.now() - start).toFixed(1);
 
        // Always log errors, even in production
        console.groupCollapsed(
          `%c❌ ${error.status} ${req.method} ${req.url} (${duration}ms)`,
          'color: red'
        );
        console.error('Error:', error.message);
        console.error('Details:', error.error);
        console.groupEnd();
      },
    })
  );
};

function redactHeaders(keys: string[], req: HttpRequest<unknown>): Record<string, string> {
  return keys.reduce((acc, key) => {
    acc[key] = SENSITIVE_HEADERS.includes(key.toLowerCase()) ? REDACTED : req.headers.get(key) ?? '';
    return acc;
  }, {} as Record<string, string>);
}