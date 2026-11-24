import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AdminUserApi,
  AdminUserApiResponse,
  AdminUserFilterParams,
  AdminUserListApiResponse,
  UserBlockRequest,
  UserResetRequest,
} from '../../models/admin-user';
import { OrderApi, OrderListApiResponse } from '../../models/order';
import { skipNotFoundRedirect } from '../interceptor/error/error.interceptor';

const USER_STATUS_OPTIONS = ['ALL', 'ACTIVE', 'SUSPENDED', 'AWAITING_CONFIRMATION'] as const;

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly usersSignal = signal<AdminUserApi[]>([]);
  private readonly totalCountSignal = signal(0);
  private readonly isLoadingSignal = signal(false);
  private readonly selectedUserSignal = signal<AdminUserApi | null>(null);
  private readonly isLoadingDetailSignal = signal(false);
  private readonly isMutatingSignal = signal(false);
  private readonly userOrdersSignal = signal<OrderApi[]>([]);
  private readonly isLoadingOrdersSignal = signal(false);
  private readonly currentParamsSignal = signal<AdminUserFilterParams>({ page: 0, size: 20 });

  readonly users = this.usersSignal.asReadonly();
  readonly totalCount = this.totalCountSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly selectedUser = this.selectedUserSignal.asReadonly();
  readonly isLoadingDetail = this.isLoadingDetailSignal.asReadonly();
  readonly isMutating = this.isMutatingSignal.asReadonly();
  readonly userOrders = this.userOrdersSignal.asReadonly();
  readonly isLoadingOrders = this.isLoadingOrdersSignal.asReadonly();
  readonly currentParams = this.currentParamsSignal.asReadonly();

  readonly statusOptions = computed(() => USER_STATUS_OPTIONS);

  loadUsers(params?: AdminUserFilterParams): void {
    const merged = { ...this.currentParamsSignal(), ...params };
    this.currentParamsSignal.set(merged);
    this.isLoadingSignal.set(true);

    let httpParams = new HttpParams();
    if (merged.page !== undefined) httpParams = httpParams.set('page', merged.page);
    if (merged.size !== undefined) httpParams = httpParams.set('size', merged.size);
    if (merged.status && merged.status !== 'ALL')
      httpParams = httpParams.set('status', merged.status);
    if (merged.search?.trim()) httpParams = httpParams.set('search', merged.search.trim());

    this.http
      .get<AdminUserListApiResponse>('/admin/users', {
        params: httpParams,
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.usersSignal.set(r.data.users);
          this.totalCountSignal.set(r.data.totalElements);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load users:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadUser(id: string): void {
    this.isLoadingDetailSignal.set(true);
    this.selectedUserSignal.set(null);
    this.http
      .get<AdminUserApiResponse>(`/admin/users/${id}`, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.selectedUserSignal.set(r.data);
          this.isLoadingDetailSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load user:', err);
          this.isLoadingDetailSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadUserOrders(id: string): void {
    this.isLoadingOrdersSignal.set(true);
    this.userOrdersSignal.set([]);
    this.http
      .get<OrderListApiResponse>(`/admin/users/${id}/orders`, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.userOrdersSignal.set(r.data);
          this.isLoadingOrdersSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load user orders:', err);
          this.isLoadingOrdersSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  blockUser(id: string, reason?: string): Observable<AdminUserApi> {
    const body: UserBlockRequest = { blocked: true, ...(reason ? { reason } : {}) };
    this.isMutatingSignal.set(true);
    return this.http
      .patch<AdminUserApiResponse>(`/admin/users/${id}/block`, body, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.selectedUserSignal.set(r.data);
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

  unblockUser(id: string): Observable<AdminUserApi> {
    const body: UserBlockRequest = { blocked: false };
    this.isMutatingSignal.set(true);
    return this.http
      .patch<AdminUserApiResponse>(`/admin/users/${id}/block`, body, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.selectedUserSignal.set(r.data);
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

  resetUser(id: string, body: UserResetRequest): Observable<AdminUserApi> {
    this.isMutatingSignal.set(true);
    return this.http
      .patch<AdminUserApiResponse>(`/admin/users/${id}/reset`, body, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.selectedUserSignal.set(r.data);
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

  triggerPasswordReset(id: string): Observable<string> {
    this.isMutatingSignal.set(true);
    return this.http
      .post<{ message: string }>(
        `/admin/users/${id}/reset-password`,
        {},
        {
          context: skipNotFoundRedirect(),
        }
      )
      .pipe(
        tap(() => this.isMutatingSignal.set(false)),
        map((r) => r.message),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.isMutatingSignal.set(false);
          return throwError(() => err);
        })
      );
  }

  clearSelectedUser(): void {
    this.selectedUserSignal.set(null);
    this.userOrdersSignal.set([]);
  }
}
