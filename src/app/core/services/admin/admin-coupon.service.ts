import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Coupon,
  CouponApiResponse,
  CouponCreateRequest,
  CouponListApiResponse,
  CouponUpdateRequest,
} from '../../models/coupon';
import { skipNotFoundRedirect } from '../interceptor/error/error.interceptor';

@Injectable({ providedIn: 'root' })
export class AdminCouponService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly couponsSignal = signal<Coupon[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly isMutatingSignal = signal(false);

  readonly coupons = this.couponsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isMutating = this.isMutatingSignal.asReadonly();

  constructor() {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoadingSignal.set(true);
    this.http
      .get<CouponListApiResponse>('/admin/coupons', { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.couponsSignal.set(r.data ?? []);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
        catchError((err) => {
          console.error('Failed to load coupons:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  createCoupon(req: CouponCreateRequest): Observable<Coupon> {
    this.isMutatingSignal.set(true);
    return this.http
      .post<CouponApiResponse>('/admin/coupons', req, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.couponsSignal.update((list) => [...list, r.data]);
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

  updateCoupon(id: string, req: CouponUpdateRequest): Observable<Coupon> {
    this.isMutatingSignal.set(true);
    return this.http
      .put<CouponApiResponse>(`/admin/coupons/${id}`, req, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.couponsSignal.update((list) => list.map((c) => (c.id === id ? r.data : c)));
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

  deleteCoupon(id: string): Observable<void> {
    this.isMutatingSignal.set(true);
    return this.http
      .delete<{ message: string }>(`/admin/coupons/${id}`, { context: skipNotFoundRedirect() })
      .pipe(
        tap(() => {
          this.couponsSignal.update((list) => list.filter((c) => c.id !== id));
          this.isMutatingSignal.set(false);
        }),
        map(() => undefined),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.isMutatingSignal.set(false);
          return throwError(() => err);
        })
      );
  }
}
