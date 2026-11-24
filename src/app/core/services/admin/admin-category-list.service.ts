import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminCategoryService } from './admin-category.service';
import { LookupValue } from '../../models/lookup';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

type Feedback = { ok: boolean; msg: string } | null;

@Injectable()
export class AdminCategoryListService {
  readonly adminCategoryService = inject(AdminCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = this.adminCategoryService.categories;
  readonly isLoading = this.adminCategoryService.isLoading;
  readonly isMutating = this.adminCategoryService.isMutating;

  readonly columns: TableColumnDef[] = [
    { key: 'label', header: 'Label', cellClass: 'td--name' },
    { key: 'code', header: 'Code', cellClass: 'td--mono' },
    { key: 'sortOrder', header: 'Order', cellClass: 'td--narrow' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: '', cellClass: 'td--action' },
  ];

  readonly isFormOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly isEditing = computed(() => !!this.editingId());
  readonly feedback = signal<Feedback>(null);

  readonly form = new FormGroup({
    code: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)],
    }),
    label: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    active: new FormControl(true, { nonNullable: true }),
    sortOrder: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.min(0)],
    }),
  });

  constructor() {
    // Auto-generate code from label while user hasn't touched the code field
    this.form.controls.label.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (!this.isEditing() && !this.form.controls.code.dirty) {
          const code = val
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '');
          this.form.controls.code.setValue(code, { emitEvent: false });
        }
      });

    // Auto-uppercase the code field
    this.form.controls.code.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        const upper = val.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        if (val !== upper) {
          this.form.controls.code.setValue(upper, { emitEvent: false });
        }
      });
  }

  asCategory(row: unknown): LookupValue {
    return row as LookupValue;
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ code: '', label: '', active: true, sortOrder: 0 });
    this.form.controls.code.enable();
    this.form.controls.code.markAsPristine();
    this.isFormOpen.set(true);
    this.feedback.set(null);
  }

  openEdit(cat: LookupValue): void {
    this.editingId.set(cat.id);
    this.form.reset({
      code: cat.code,
      label: cat.label,
      active: cat.active,
      sortOrder: cat.sortOrder,
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

    const { label, active, sortOrder } = this.form.getRawValue();

    if (this.isEditing()) {
      const id = this.editingId()!;
      this.adminCategoryService.updateCategory(id, { label, active, sortOrder }).subscribe({
        next: () => {
          this.closeForm();
          this.flash(true, 'Category updated successfully.');
        },
        error: () => this.flash(false, 'Failed to update category.'),
      });
    } else {
      const { code } = this.form.getRawValue();
      this.adminCategoryService
        .createCategory({ type: 'CATEGORY', code, label, active, sortOrder })
        .subscribe({
          next: () => {
            this.closeForm();
            this.flash(true, 'Category created successfully.');
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Failed to create category.';
            this.flash(false, msg);
          },
        });
    }
  }

  toggleActive(cat: LookupValue): void {
    this.adminCategoryService.updateCategory(cat.id, { active: !cat.active }).subscribe({
      error: () =>
        this.flash(false, `Failed to ${cat.active ? 'deactivate' : 'activate'} category.`),
    });
  }

  private flash(ok: boolean, msg: string): void {
    this.feedback.set({ ok, msg });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.feedback.set(null));
  }
}
