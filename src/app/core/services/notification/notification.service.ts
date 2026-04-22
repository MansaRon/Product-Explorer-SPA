import { computed, Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warn' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

/**
 * NOTIFICATION SERVICE
 *
 * A lightweight, signal-based toast notification service.
 * The error interceptor (and any component) can call:
 *   notifications.error('Something went wrong')
 *   notifications.success('Saved!')
 *   notifications.warn('Session expiring soon')
 *   notifications.info('3 items in your cart')
 *
 * Display layer:
 *   Add <app-notifications> to app.component.html — it subscribes to
 *   the `all` signal and renders the queue automatically.
 *
 * Default durations:
 *   error  → 6 s  (errors need time to read)
 *   warn   → 4 s
 *   info   → 3 s
 *   success → 3 s
 */

const DEFAULT_DURATIONS: Record<NotificationType, number> = {
  error: 6000,
  warn: 4000,
  info: 3000,
  success: 3000,
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);

  readonly all = this._notifications.asReadonly();
  readonly hasAny = computed(() => this._notifications().length > 0);

  success(message: string, duration?: number): void {
    this.push('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.push('error', message, duration);
  }

  warn(message: string, duration?: number): void {
    this.push('warn', message, duration);
  }

  info(message: string, duration?: number): void {
    this.push('info', message, duration);
  }

  dismiss(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  dismissAll(): void {
    this._notifications.set([]);
  }

  private push(type: NotificationType, message: string, duration?: number): void {
    const id = crypto.randomUUID();
    const resolvedDuration = duration ?? DEFAULT_DURATIONS[type];

    const notification: Notification = {
      id,
      type,
      message,
      duration: resolvedDuration,
    };

    this._notifications.update((list) => [...list, notification]);

    if (resolvedDuration > 0) {
      setTimeout(() => this.dismiss(id), resolvedDuration);
    }
  }
}
