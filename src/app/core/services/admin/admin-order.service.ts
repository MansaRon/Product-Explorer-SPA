import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminOrderApi,
  AdminOrderApiResponse,
  AdminOrderFilterParams,
  AdminOrderListApiResponse,
  DeleteStaleApiResponse,
  OrderPriceAdjustRequest,
  OrderStatusUpdateRequest,
} from '../../models/admin-order';
import { ORDER_OLDER_THAN_DAYS } from '../../const/admin';

const ORDER_STATUS_OPTIONS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly ordersSignal = signal<AdminOrderApi[]>([]);
  private readonly totalCountSignal = signal(0);
  private readonly isLoadingSignal = signal(false);
  private readonly selectedOrderSignal = signal<AdminOrderApi | null>(null);
  private readonly isLoadingDetailSignal = signal(false);
  private readonly isMutatingSignal = signal(false);
  private readonly currentParamsSignal = signal<AdminOrderFilterParams>({ page: 0, size: 20 });

  readonly orders = this.ordersSignal.asReadonly();
  readonly totalCount = this.totalCountSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly selectedOrder = this.selectedOrderSignal.asReadonly();
  readonly isLoadingDetail = this.isLoadingDetailSignal.asReadonly();
  readonly isMutating = this.isMutatingSignal.asReadonly();
  readonly currentParams = this.currentParamsSignal.asReadonly();

  readonly statusOptions = computed(() => ORDER_STATUS_OPTIONS);

  loadOrders(params?: AdminOrderFilterParams): void {
    const merged = { ...this.currentParamsSignal(), ...params };
    this.currentParamsSignal.set(merged);
    this.isLoadingSignal.set(true);

    let httpParams = new HttpParams();
    if (merged.page !== undefined) httpParams = httpParams.set('page', merged.page);
    if (merged.size !== undefined) httpParams = httpParams.set('size', merged.size);
    if (merged.status && merged.status !== 'ALL')
      httpParams = httpParams.set('status', merged.status);
    if (merged.search?.trim()) httpParams = httpParams.set('search', merged.search.trim());
    if (merged.dateFrom) httpParams = httpParams.set('dateFrom', merged.dateFrom);
    if (merged.dateTo) httpParams = httpParams.set('dateTo', merged.dateTo);

    this.http
      .get<AdminOrderListApiResponse>('/order/admin/all', { params: httpParams })
      .pipe(
        tap((r) => {
          this.ordersSignal.set(r.data.orders);
          this.totalCountSignal.set(r.data.totalCount);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load orders:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadOrder(id: string): void {
    this.isLoadingDetailSignal.set(true);
    this.selectedOrderSignal.set(null);
    this.http
      .get<AdminOrderApiResponse>(`/order/admin/${id}`)
      .pipe(
        tap((r) => {
          this.selectedOrderSignal.set(r.data);
          this.isLoadingDetailSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load order:', err);
          this.isLoadingDetailSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  updateStatus(id: string, req: OrderStatusUpdateRequest): Observable<AdminOrderApi> {
    this.isMutatingSignal.set(true);
    return this.http.patch<AdminOrderApiResponse>(`/order/admin/${id}/status`, req).pipe(
      tap((r) => {
        this.selectedOrderSignal.set(r.data);
        this.isMutatingSignal.set(false);
      }),
      map((r) => r.data),
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        this.isMutatingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  updatePricing(id: string, req: OrderPriceAdjustRequest): Observable<AdminOrderApi> {
    this.isMutatingSignal.set(true);
    return this.http.patch<AdminOrderApiResponse>(`/order/admin/${id}/pricing`, req).pipe(
      tap((r) => {
        this.selectedOrderSignal.set(r.data);
        this.isMutatingSignal.set(false);
      }),
      map((r) => r.data),
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        this.isMutatingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  rebook(id: string): Observable<AdminOrderApi> {
    this.isMutatingSignal.set(true);
    return this.http.post<AdminOrderApiResponse>(`/order/admin/${id}/rebook`, null).pipe(
      tap((r) => {
        this.selectedOrderSignal.set(r.data);
        this.isMutatingSignal.set(false);
      }),
      map((r) => r.data),
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => {
        this.isMutatingSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  deleteStale(olderThanDays = ORDER_OLDER_THAN_DAYS): Observable<string> {
    return this.http
      .delete<DeleteStaleApiResponse>('/order/admin/stale', {
        params: new HttpParams().set('olderThanDays', olderThanDays),
      })
      .pipe(
        map((r) => r.message),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => throwError(() => err))
      );
  }

  clearSelectedOrder(): void {
    this.selectedOrderSignal.set(null);
  }
}
