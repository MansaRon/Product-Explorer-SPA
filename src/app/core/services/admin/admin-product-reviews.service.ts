import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminProductService } from './admin-product.service';
import { AdminReview } from '../../models/admin-product';

@Injectable()
export class AdminProductReviewsService {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly adminProductService = inject(AdminProductService);

  readonly productId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly reviews = this.adminProductService.reviews;
  readonly isLoadingReviews = this.adminProductService.isLoadingReviews;
  readonly selectedProduct = this.adminProductService.selectedProduct;

  readonly reviewFilter = signal<'ALL' | 'FLAGGED'>('ALL');

  readonly filteredReviews = computed(() => {
    const all = this.reviews();
    return this.reviewFilter() === 'FLAGGED' ? all.filter((r) => r.flagged) : all;
  });

  readonly flaggedCount = computed(() => this.reviews().filter((r) => r.flagged).length);

  readonly showRemoveConfirm = signal(false);
  readonly pendingReviewId = signal<string | null>(null);
  readonly actionMessage = signal<{ ok: boolean; text: string } | null>(null);

  loadAll(): void {
    this.adminProductService.loadProduct(this.productId);
    this.adminProductService.loadProductReviews(this.productId);
  }

  openRemoveConfirm(reviewId: string): void {
    this.pendingReviewId.set(reviewId);
    this.showRemoveConfirm.set(true);
  }

  cancelRemove(): void {
    this.showRemoveConfirm.set(false);
    this.pendingReviewId.set(null);
  }

  executeRemove(): void {
    const id = this.pendingReviewId();
    if (!id) return;
    this.showRemoveConfirm.set(false);
    this.pendingReviewId.set(null);
    this.adminProductService.removeReview(this.productId, id).subscribe({
      next: () => {
        this.adminProductService.loadProductReviews(this.productId);
        this.flash(true, 'Review removed.');
      },
      error: () => this.flash(false, 'Failed to remove review.'),
    });
  }

  flagReview(reviewId: string): void {
    this.adminProductService.flagReview(this.productId, reviewId, true).subscribe({
      next: () => {
        this.adminProductService.loadProductReviews(this.productId);
        this.flash(true, 'Review flagged.');
      },
      error: () => this.flash(false, 'Failed to flag review.'),
    });
  }

  approveReview(reviewId: string): void {
    this.adminProductService.flagReview(this.productId, reviewId, false).subscribe({
      next: () => {
        this.adminProductService.loadProductReviews(this.productId);
        this.flash(true, 'Review approved.');
      },
      error: () => this.flash(false, 'Failed to approve review.'),
    });
  }

  asReview(row: unknown): AdminReview {
    return row as AdminReview;
  }

  private flash(ok: boolean, text: string): void {
    this.actionMessage.set({ ok, text });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionMessage.set(null));
  }
}
