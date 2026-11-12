import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminStatistics, AdminStatisticsApiResponse } from '../../models/admin-stats';
import { AdminOrderApi, AdminOrderListApiResponse } from '../../models/admin-order';

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly statsSignal = signal<AdminStatistics | null>(null);
  private readonly isLoadingSignal = signal(false);
  private readonly recentOrdersSignal = signal<AdminOrderApi[]>([]);
  private readonly isLoadingOrdersSignal = signal(false);

  readonly stats = this.statsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly recentOrders = this.recentOrdersSignal.asReadonly();
  readonly isLoadingOrders = this.isLoadingOrdersSignal.asReadonly();

  loadStats(): void {
    this.isLoadingSignal.set(true);
    this.http
      .get<AdminStatisticsApiResponse>('/order/admin/statistics')
      .pipe(
        tap((r) => {
          this.statsSignal.set(r.data);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load admin statistics:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadRecentOrders(): void {
    this.isLoadingOrdersSignal.set(true);
    this.http
      .get<AdminOrderListApiResponse>('/order/admin/all')
      .pipe(
        tap((r) => {
          this.recentOrdersSignal.set(r.data.orders.slice(0, 10));
          this.isLoadingOrdersSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load recent orders:', err);
          this.isLoadingOrdersSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }
}
