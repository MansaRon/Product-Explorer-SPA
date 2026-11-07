import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpContextToken,
  HttpContext,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Set on requests where a 404 should NOT redirect to the not-found page (e.g. optional/lookup calls). */
export const SKIP_NOT_FOUND_REDIRECT = new HttpContextToken<boolean>(() => false);

export function skipNotFoundRedirect(): HttpContext {
  return new HttpContext().set(SKIP_NOT_FOUND_REDIRECT, true);
}

/** Set on requests that should silently fail — no toast notifications, no redirects on error. */
export const SILENT_REQUEST = new HttpContextToken<boolean>(() => false);

export function silentRequest(): HttpContext {
  return new HttpContext().set(SILENT_REQUEST, true);
}
import { Router } from '@angular/router';
import { NotificationService } from '../../notification/notification.service';
import { AuthService } from '../../auth/auth.service';
import { AppRoutes } from '../../../../shared/enums/app-routes-enum';

/**
 * ERROR INTERCEPTOR
 *
 * Responsibilities:
 * - Centralises HTTP error handling so individual services/components don't repeat it
 * - Maps HTTP status codes to user-friendly messages
 * - Shows toast/snackbar notifications via NotificationService
 * - Handles navigation side-effects (401 → login, 403 → forbidden page)
 * - Re-throws a normalised AppError so components can still react if needed
 */

export interface AppError {
  status: number;
  message: string;
  originalError: HttpErrorResponse;
}

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = normalise(error);
      const silent = req.context.get(SILENT_REQUEST);

      if (!silent) {
        switch (error.status) {
          case 0:
            notifications.error('No network connection. Please check your internet.');
            break;

          case 400:
            notifications.error(appError.message);
            break;

          case 401:
            notifications.warn('Your session has expired. Please log in again.');
            authService.logout();
            router.navigate([`/${AppRoutes.LOGIN}`], { queryParams: { returnUrl: router.url } });
            break;

          case 403:
            notifications.error('You do not have permission to perform this action.');
            // TODO - Consider redirecting to a dedicated "Forbidden" page instead of the login page
            router.navigate(['/forbidden']);
            break;

          case 404:
            if (!req.context.get(SKIP_NOT_FOUND_REDIRECT)) {
              notifications.error('The requested resource was not found.');
              router.navigate([`/${AppRoutes.PAGE_NOT_FOUND}`], {
                queryParams: { returnUrl: router.url },
              });
            }
            break;

          case 409:
            notifications.error(appError.message || 'A conflict occurred. Please try again.');
            break;

          case 422:
            notifications.error(appError.message || 'Unprocessable request.');
            break;

          case 429:
            notifications.warn('Too many requests. Please slow down.');
            break;

          case 500:
          case 502:
          case 503:
            notifications.error('A server error occurred. Our team has been notified.');
            break;

          default:
            notifications.error(`Unexpected error (${error.status}). Please try again.`);
        }
      }

      return throwError(() => appError);
    })
  );
};

function normalise(error: HttpErrorResponse): AppError {
  let message = 'An unexpected error occurred.';

  if (error.error) {
    if (typeof error.error === 'string') {
      message = error.error;
    } else if (error.error.message) {
      message = error.error.message;
    } else if (error.error.error) {
      message = error.error.error;
    }
  } else if (error.message) {
    message = error.message;
  }

  return { status: error.status, message, originalError: error };
}
