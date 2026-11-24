import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LookupApiResponse,
  LookupCreateRequest,
  LookupItemApiResponse,
  LookupUpdateRequest,
  LookupValue,
} from '../../models/lookup';
import { skipNotFoundRedirect } from '../interceptor/error/error.interceptor';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly categoriesSignal = signal<LookupValue[]>([]);
  private readonly isLoadingSignal = signal(false);
  private readonly isMutatingSignal = signal(false);

  readonly categories = this.categoriesSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly isMutating = this.isMutatingSignal.asReadonly();

  readonly activeCategories = computed(() =>
    this.categoriesSignal()
      .filter((c) => c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  );

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingSignal.set(true);
    this.http
      .get<LookupApiResponse>('/admin/lookup/CATEGORY', { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.categoriesSignal.set(r.data ?? []);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load categories:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  createCategory(req: LookupCreateRequest): Observable<LookupValue> {
    this.isMutatingSignal.set(true);
    return this.http
      .post<LookupItemApiResponse>('/admin/lookup', req, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          this.categoriesSignal.update((cats) =>
            [...cats, r.data].sort((a, b) => a.sortOrder - b.sortOrder)
          );
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

  updateCategory(id: string, req: LookupUpdateRequest): Observable<LookupValue> {
    this.isMutatingSignal.set(true);
    return this.http
      .put<LookupItemApiResponse>(`/admin/lookup/${id}`, req, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.categoriesSignal.update((cats) =>
            cats.map((c) => (c.id === id ? r.data : c)).sort((a, b) => a.sortOrder - b.sortOrder)
          );
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
}
