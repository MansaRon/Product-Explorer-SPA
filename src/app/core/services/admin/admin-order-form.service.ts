import { DestroyRef, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminOrderService } from './admin-order.service';
import { ORDER_STATUSES } from '../../const/admin';
import { OrderPriceAdjustRequest, OrderStatusUpdateRequest } from '../../models/admin-order';

export type FeedbackState = { ok: boolean; msg: string } | null;

// Provided at component level — same lifetime as OrderDetailComponent.
// Owns both FormGroups, their validation logic, mutation dispatch, and
// feedback state so the component has no form concerns at all.
@Injectable()
export class AdminOrderFormService {
  private readonly adminOrderService = inject(AdminOrderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  // Shared with the component so it can call loadOrder without re-injecting the route.
  readonly orderId = inject(ActivatedRoute).snapshot.paramMap.get('id')!;

  readonly ORDER_STATUSES = ORDER_STATUSES;

  readonly statusForm = this.fb.group({
    newStatus: ['', Validators.required],
    notes: [''],
  });

  readonly pricingForm = this.fb.group({
    discount: [null as number | null, Validators.min(0)],
    shippingCost: [null as number | null, Validators.min(0)],
    reason: ['', Validators.required],
  });

  readonly statusFeedback = signal<FeedbackState>(null);
  readonly pricingFeedback = signal<FeedbackState>(null);
  readonly rebookFeedback = signal<FeedbackState>(null);
  readonly showRebookConfirm = signal(false);

  submitStatus(): void {
    if (this.statusForm.invalid || this.adminOrderService.isMutating()) return;
    const { newStatus, notes } = this.statusForm.getRawValue();
    const req: OrderStatusUpdateRequest = { newStatus: newStatus! };
    if (notes?.trim()) req.notes = notes.trim();

    this.adminOrderService.updateStatus(this.orderId, req).subscribe({
      next: () => {
        this.statusForm.reset();
        this.flash(this.statusFeedback, 'Status updated successfully.', true);
      },
      error: () => this.flash(this.statusFeedback, 'Failed to update status.', false),
    });
  }

  submitPricing(): void {
    if (this.pricingForm.invalid || this.adminOrderService.isMutating()) return;
    const { discount, shippingCost, reason } = this.pricingForm.getRawValue();
    const req: OrderPriceAdjustRequest = { reason: reason! };
    if (discount !== null && discount !== undefined) req.discount = discount;
    if (shippingCost !== null && shippingCost !== undefined) req.shippingCost = shippingCost;

    this.adminOrderService.updatePricing(this.orderId, req).subscribe({
      next: () => {
        this.pricingForm.reset();
        this.flash(this.pricingFeedback, 'Pricing updated successfully.', true);
      },
      error: () => this.flash(this.pricingFeedback, 'Failed to update pricing.', false),
    });
  }

  openRebookConfirm(): void {
    this.showRebookConfirm.set(true);
  }

  cancelRebook(): void {
    this.showRebookConfirm.set(false);
  }

  executeRebook(): void {
    this.showRebookConfirm.set(false);
    this.adminOrderService.rebook(this.orderId).subscribe({
      next: () => this.flash(this.rebookFeedback, 'Order rebooked successfully.', true),
      error: () => this.flash(this.rebookFeedback, 'Failed to rebook order.', false),
    });
  }

  private flash(sig: WritableSignal<FeedbackState>, msg: string, ok: boolean): void {
    sig.set({ ok, msg });
    timer(4000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sig.set(null));
  }
}
