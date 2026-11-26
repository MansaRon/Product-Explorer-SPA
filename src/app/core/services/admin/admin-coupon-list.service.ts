import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminCouponService } from './admin-coupon.service';
import { Coupon } from '../../models/coupon';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

type Feedback = { ok: boolean; msg: string } | null;

@Injectable()
export class AdminCouponListService {
  readonly adminCouponService = inject(AdminCouponService);
  private readonly destroyRef = inject(DestroyRef);

  readonly coupons = this.adminCouponService.coupons;
  readonly isLoading = this.adminCouponService.isLoading;
  readonly isMutating = this.adminCouponService.isMutating;

  readonly columns: TableColumnDef[] = [
    { key: 'code', header: 'Code', cellClass: 'td--mono' },
    { key: 'amount', header: 'Amount' },
    { key: 'minSpend', header: 'Min Spend' },
    { key: 'expiresAt', header: 'Expires' },
    { key: 'usage', header: 'Usage', cellClass: 'td--narrow' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '', cellClass: 'td--action' },
  ];

  readonly isFormOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly isEditing = computed(() => !!this.editingId());
  readonly feedback = signal<Feedback>(null);
  readonly showDeleteConfirm = signal(false);
  private deletingId = signal<string | null>(null);

  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z0-9_-]+$/)],
    }),
    amount: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    minSpend: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
    expiresAt: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    usageLimit: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    active: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    // Auto-uppercase and sanitise the code field
    this.form.controls.code.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        const upper = val.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (val !== upper) {
          this.form.controls.code.setValue(upper, { emitEvent: false });
        }
      });
  }

  asCoupon(row: unknown): Coupon {
    return row as Coupon;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      code: '',
      amount: null,
      minSpend: 0,
      expiresAt: '',
      usageLimit: null,
      active: true,
    });
    this.form.controls.code.enable();
    this.isFormOpen.set(true);
    this.feedback.set(null);
  }

  openEdit(coupon: Coupon): void {
    this.editingId.set(coupon.id);
    this.form.reset({
      code: coupon.code,
      amount: coupon.amount,
      minSpend: coupon.minSpend,
      expiresAt: this.toDatetimeLocal(coupon.expiresAt),
      usageLimit: coupon.usageLimit,
      active: coupon.active,
    });
    this.form.controls.code.disable();
    this.isFormOpen.set(true);
    this.feedback.set(null);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.editingId.set(null);
    this.form.reset();
    this.form.controls.code.enable();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const expiresAt = this.toLocalDateTime(raw.expiresAt);

    if (this.isEditing()) {
      const id = this.editingId()!;
      const req = {
        code: raw.code,
        amount: raw.amount!,
        minSpend: raw.minSpend,
        expiresAt,
        usageLimit: raw.usageLimit!,
        active: raw.active,
      };
      this.adminCouponService.updateCoupon(id, req).subscribe({
        next: () => {
          this.closeForm();
          this.flash(true, 'Coupon updated successfully.');
        },
        error: () => this.flash(false, 'Failed to update coupon.'),
      });
    } else {
      const req = {
        code: raw.code,
        amount: raw.amount!,
        minSpend: raw.minSpend,
        expiresAt,
        usageLimit: raw.usageLimit!,
        active: raw.active,
      };
      this.adminCouponService.createCoupon(req).subscribe({
        next: () => {
          this.closeForm();
          this.flash(true, 'Coupon created successfully.');
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'Failed to create coupon.';
          this.flash(false, msg);
        },
      });
    }
  }

  openDeleteConfirm(id: string): void {
    this.deletingId.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.deletingId.set(null);
    this.showDeleteConfirm.set(false);
  }

  executeDelete(): void {
    const id = this.deletingId();
    if (!id) return;
    this.showDeleteConfirm.set(false);
    this.adminCouponService.deleteCoupon(id).subscribe({
      next: () => this.flash(true, 'Coupon deleted.'),
      error: () => this.flash(false, 'Failed to delete coupon.'),
    });
    this.deletingId.set(null);
  }

  private toDatetimeLocal(isoString: string): string {
    // "2026-12-31T23:59:59" → "2026-12-31T23:59" for datetime-local input
    return isoString?.slice(0, 16) ?? '';
  }

  private toLocalDateTime(datetimeLocal: string): string {
    // "2026-12-31T23:59" → "2026-12-31T23:59:00" for backend LocalDateTime
    if (!datetimeLocal) return '';
    return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
  }

  private flash(ok: boolean, msg: string): void {
    this.feedback.set({ ok, msg });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.feedback.set(null));
  }
}
