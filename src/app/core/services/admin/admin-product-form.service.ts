import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminProductService } from './admin-product.service';
import { AdminCategoryService } from './admin-category.service';

type FeedbackState = { ok: boolean; msg: string } | null;

@Injectable()
export class AdminProductFormService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly adminProductService = inject(AdminProductService);
  readonly adminCategoryService = inject(AdminCategoryService);

  readonly productId: string | null = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.productId;

  readonly categories = this.adminCategoryService.activeCategories;

  readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    category: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    quantity: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    rate: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(5)],
    }),
  });

  readonly selectedFiles = signal<File[]>([]);
  readonly previewUrls = signal<string[]>([]);

  readonly existingImageUrls = computed(
    () => this.adminProductService.selectedProduct()?.imageUrls ?? []
  );

  readonly submitFeedback = signal<FeedbackState>(null);

  constructor() {
    if (this.isEditMode) {
      effect(() => {
        const product = this.adminProductService.selectedProduct();
        if (!product) return;
        this.form.patchValue({
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          quantity: product.quantity,
          rate: product.rate,
        });
      });
    }
  }

  onFilesChange(event: Event): void {
    this.previewUrls().forEach((url) => URL.revokeObjectURL(url));
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedFiles.set(files);
    this.previewUrls.set(files.map((f) => URL.createObjectURL(f)));
  }

  removeFile(i: number): void {
    URL.revokeObjectURL(this.previewUrls()[i]);
    this.selectedFiles.update((files) => files.filter((_, idx) => idx !== i));
    this.previewUrls.update((urls) => urls.filter((_, idx) => idx !== i));
  }

  clearFiles(): void {
    this.revokePreviewUrls();
    this.selectedFiles.set([]);
  }

  revokePreviewUrls(): void {
    this.previewUrls().forEach((url) => URL.revokeObjectURL(url));
    this.previewUrls.set([]);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.isEditMode && this.selectedFiles().length === 0) {
      this.submitFeedback.set({ ok: false, msg: 'At least one image is required.' });
      return;
    }

    const { title, description, price, category, quantity, rate } = this.form.getRawValue();
    const fd = new FormData();
    fd.append('product', JSON.stringify({ title, description, price, category, quantity, rate }));
    this.selectedFiles().forEach((f) => fd.append('images', f, f.name));

    if (this.isEditMode && this.productId) {
      this.adminProductService.updateProduct(this.productId, fd).subscribe({
        next: () => {
          this.submitFeedback.set({ ok: true, msg: 'Product updated successfully.' });
          timer(2000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.router.navigate(['/admin/catalog']));
        },
        error: () => this.flash(this.submitFeedback, 'Failed to update product.', false),
      });
    } else {
      this.adminProductService.createProduct(fd).subscribe({
        next: (product) => {
          this.submitFeedback.set({ ok: true, msg: 'Product created successfully.' });
          timer(2000)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.router.navigate(['/admin/catalog', product.id, 'edit']));
        },
        error: () => this.flash(this.submitFeedback, 'Failed to create product.', false),
      });
    }
  }

  private flash(sig: WritableSignal<FeedbackState>, msg: string, ok: boolean): void {
    sig.set({ ok, msg });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sig.set(null));
  }
}
