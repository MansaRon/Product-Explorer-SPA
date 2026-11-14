import { DestroyRef, effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminProductService } from './admin-product.service';
import { ProductCreateRequest } from '../../models/admin-product';

type FeedbackState = { ok: boolean; msg: string } | null;

@Injectable()
export class AdminProductFormService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly adminProductService = inject(AdminProductService);

  readonly productId: string | null = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = !!this.productId;

  readonly categories = this.adminProductService.categories;

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
    imageUrls: new FormArray<FormControl<string>>([new FormControl('', { nonNullable: true })]),
  });

  readonly submitFeedback = signal<FeedbackState>(null);

  get imageUrlsArray(): FormArray<FormControl<string>> {
    return this.form.controls.imageUrls;
  }

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
        });
        while (this.imageUrlsArray.length > 0) {
          this.imageUrlsArray.removeAt(0);
        }
        const urls = product.imageUrls?.length ? product.imageUrls : [''];
        urls.forEach((url) =>
          this.imageUrlsArray.push(new FormControl(url, { nonNullable: true }))
        );
      });
    }
  }

  addImageUrl(): void {
    this.imageUrlsArray.push(new FormControl('', { nonNullable: true }));
  }

  removeImageUrl(i: number): void {
    if (this.imageUrlsArray.length > 1) {
      this.imageUrlsArray.removeAt(i);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { title, description, price, category, quantity } = this.form.getRawValue();
    const imageUrls = this.imageUrlsArray.controls.map((c) => c.value).filter((u) => u.trim());
    const body: ProductCreateRequest = { title, description, price, category, quantity, imageUrls };

    if (this.isEditMode && this.productId) {
      this.adminProductService.updateProduct(this.productId, body).subscribe({
        next: () => this.flash(this.submitFeedback, 'Product updated successfully.', true),
        error: () => this.flash(this.submitFeedback, 'Failed to update product.', false),
      });
    } else {
      this.adminProductService.createProduct(body).subscribe({
        next: (product) => {
          this.flash(this.submitFeedback, 'Product created successfully.', true);
          this.router.navigate(['/admin/catalog', product.id, 'edit']);
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
