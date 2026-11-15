import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Product } from '../../models/product';
import {
  AdminProductApiResponse,
  AdminProductFilterParams,
  AdminProductListApiResponse,
  AdminReview,
  AdminReviewListApiResponse,
} from '../../models/admin-product';
import { skipNotFoundRedirect } from '../interceptor/error/error.interceptor';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly totalCountSignal = signal(0);
  private readonly isLoadingSignal = signal(false);
  private readonly selectedProductSignal = signal<Product | null>(null);
  private readonly isLoadingDetailSignal = signal(false);
  private readonly isMutatingSignal = signal(false);
  private readonly currentParamsSignal = signal<AdminProductFilterParams>({ page: 0, size: 20 });
  private readonly reviewsSignal = signal<AdminReview[]>([]);
  private readonly isLoadingReviewsSignal = signal(false);

  readonly products = this.productsSignal.asReadonly();
  readonly totalCount = this.totalCountSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly selectedProduct = this.selectedProductSignal.asReadonly();
  readonly isLoadingDetail = this.isLoadingDetailSignal.asReadonly();
  readonly isMutating = this.isMutatingSignal.asReadonly();
  readonly currentParams = this.currentParamsSignal.asReadonly();
  readonly reviews = this.reviewsSignal.asReadonly();
  readonly isLoadingReviews = this.isLoadingReviewsSignal.asReadonly();

  readonly categories = computed(() =>
    [...new Set(this.productsSignal().map((p) => p.category))].sort()
  );

  loadProducts(params?: AdminProductFilterParams): void {
    const merged = { ...this.currentParamsSignal(), ...params };
    this.currentParamsSignal.set(merged);
    this.isLoadingSignal.set(true);

    let httpParams = new HttpParams();
    if (merged.page !== undefined) httpParams = httpParams.set('page', merged.page);
    if (merged.size !== undefined) httpParams = httpParams.set('size', merged.size);
    if (merged.search?.trim()) httpParams = httpParams.set('search', merged.search.trim());
    if (merged.category) httpParams = httpParams.set('category', merged.category);

    this.http
      .get<AdminProductListApiResponse>('/products', { params: httpParams })
      .pipe(
        tap((r) => {
          this.productsSignal.set(r.data.products ?? []);
          this.totalCountSignal.set(r.data.totalElements ?? 0);
          this.isLoadingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        shareReplay({ bufferSize: 1, refCount: true }),
        catchError((err) => {
          console.error('Failed to load products:', err);
          this.isLoadingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  loadProduct(id: string): void {
    this.isLoadingDetailSignal.set(true);
    this.selectedProductSignal.set(null);
    this.http
      .get<AdminProductApiResponse>(`/products/${id}`)
      .pipe(
        tap((r) => {
          this.selectedProductSignal.set(r.data);
          this.isLoadingDetailSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load product:', err);
          this.isLoadingDetailSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  createProduct(formData: FormData): Observable<Product> {
    this.isMutatingSignal.set(true);
    return this.http
      .post<AdminProductApiResponse>('/products', formData, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.selectedProductSignal.set(r.data);
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

  updateProduct(id: string, formData: FormData): Observable<Product> {
    this.isMutatingSignal.set(true);
    return this.http
      .patch<AdminProductApiResponse>(`/products/product/${id}`, formData, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.selectedProductSignal.set(r.data);
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

  deleteProduct(id: string): Observable<void> {
    this.isMutatingSignal.set(true);
    return this.http
      .delete<{ message: string }>(`/products/product/${id}`, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap(() => this.isMutatingSignal.set(false)),
        map(() => undefined),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.isMutatingSignal.set(false);
          return throwError(() => err);
        })
      );
  }

  loadProductReviews(productId: string): void {
    this.isLoadingReviewsSignal.set(true);
    this.reviewsSignal.set([]);
    this.http
      .get<AdminReviewListApiResponse>(`/admin/products/${productId}/reviews`, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        tap((r) => {
          this.reviewsSignal.set(r.data ?? []);
          this.isLoadingReviewsSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load reviews:', err);
          this.isLoadingReviewsSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  removeReview(productId: string, reviewId: string): Observable<void> {
    return this.http
      .delete<{ message: string }>(`/admin/products/${productId}/reviews/${reviewId}`, {
        context: skipNotFoundRedirect(),
      })
      .pipe(
        map(() => undefined),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => throwError(() => err))
      );
  }

  flagReview(productId: string, reviewId: string, flagged: boolean): Observable<AdminReview> {
    return this.http
      .patch<{ data: AdminReview }>(
        `/admin/products/${productId}/reviews/${reviewId}/flag`,
        { flagged },
        { context: skipNotFoundRedirect() }
      )
      .pipe(
        map((r) => r.data),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => throwError(() => err))
      );
  }

  clearSelectedProduct(): void {
    this.selectedProductSignal.set(null);
    this.reviewsSignal.set([]);
  }
}
