import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WritableSignal } from '@angular/core';
import { AdminUserService } from './admin-user.service';
import { UserResetRequest } from '../../models/admin-user';
import { OrderApi } from '../../models/order';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

type FeedbackState = { ok: boolean; msg: string } | null;

@Injectable()
export class AdminUserFormService {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminUserService = inject(AdminUserService);

  readonly userId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly resetForm = this.fb.group({
    name: [''],
    email: ['', Validators.email],
    phone: [''],
  });

  readonly resetFeedback = signal<FeedbackState>(null);
  readonly blockFeedback = signal<FeedbackState>(null);
  readonly passwordResetFeedback = signal<FeedbackState>(null);
  readonly showBlockConfirm = signal(false);
  readonly showUnblockConfirm = signal(false);

  readonly orderColumns: TableColumnDef[] = [
    { key: 'orderNumber', header: 'Order #', cellClass: 'td--mono' },
    { key: 'orderStatus', header: 'Status' },
    { key: 'totalAmount', header: 'Total', cellClass: 'td--price' },
    { key: 'createdAt', header: 'Date' },
    { key: 'actions', header: '', cellClass: 'td--action' },
  ];

  constructor() {
    effect(() => {
      const user = this.adminUserService.selectedUser();
      if (user) {
        this.resetForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone,
        });
      }
    });
  }

  asOrder(row: unknown): OrderApi {
    return row as OrderApi;
  }

  submitReset(): void {
    if (this.resetForm.invalid || this.resetForm.pristine) return;
    const { name, email, phone } = this.resetForm.value;
    const body: UserResetRequest = {};
    if (name?.trim()) body.name = name.trim();
    if (email?.trim()) body.email = email.trim();
    if (phone?.trim()) body.phone = phone.trim();
    if (!Object.keys(body).length) return;

    this.adminUserService.resetUser(this.userId, body).subscribe({
      next: () => this.flash(this.resetFeedback, 'Profile updated successfully.', true),
      error: () => this.flash(this.resetFeedback, 'Failed to update profile.', false),
    });
  }

  openBlockConfirm(): void {
    this.showBlockConfirm.set(true);
  }

  cancelBlock(): void {
    this.showBlockConfirm.set(false);
  }

  executeBlock(): void {
    this.showBlockConfirm.set(false);
    this.adminUserService.blockUser(this.userId).subscribe({
      next: () => this.flash(this.blockFeedback, 'User has been blocked.', true),
      error: () => this.flash(this.blockFeedback, 'Failed to block user.', false),
    });
  }

  openUnblockConfirm(): void {
    this.showUnblockConfirm.set(true);
  }

  cancelUnblock(): void {
    this.showUnblockConfirm.set(false);
  }

  executeUnblock(): void {
    this.showUnblockConfirm.set(false);
    this.adminUserService.unblockUser(this.userId).subscribe({
      next: () => this.flash(this.blockFeedback, 'User has been unblocked.', true),
      error: () => this.flash(this.blockFeedback, 'Failed to unblock user.', false),
    });
  }

  triggerPasswordReset(): void {
    this.adminUserService.triggerPasswordReset(this.userId).subscribe({
      next: (msg) => this.flash(this.passwordResetFeedback, msg, true),
      error: () => this.flash(this.passwordResetFeedback, 'Failed to send password reset.', false),
    });
  }

  private flash(sig: WritableSignal<FeedbackState>, msg: string, ok: boolean): void {
    sig.set({ ok, msg });
    timer(4000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sig.set(null));
  }
}
