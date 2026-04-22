import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../../notification/notification.service';

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
 
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const appError = normalise(error);
 
      switch (error.status) {
        case 0:
          notifications.error('No network connection. Please check your internet.');
          break;
 
        case 400:
          notifications.error(appError.message);
          break;
 
        case 401:
          notifications.warn('Your session has expired. Please log in again.');
          router.navigate(['/login']);
          break;
 
        case 403:
          notifications.error('You do not have permission to perform this action.');
          router.navigate(['/forbidden']);
          break;
 
        case 404:
          notifications.error('The requested resource was not found.');
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
