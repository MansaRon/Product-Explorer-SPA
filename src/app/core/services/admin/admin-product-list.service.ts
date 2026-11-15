import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminProductService } from './admin-product.service';
import { AdminCategoryService } from './admin-category.service';
import { Product } from '../../models/product';
import { TableColumnDef } from '../../../shared/components/data-table/data-table.component';

@Injectable()
export class AdminProductListService {
  private readonly adminProductService = inject(AdminProductService);
  private readonly adminCategoryService = inject(AdminCategoryService);
  private readonly destroyRef = inject(DestroyRef);

  readonly products = this.adminProductService.products;
  readonly totalCount = this.adminProductService.totalCount;
  readonly isLoading = this.adminProductService.isLoading;
  readonly categories = this.adminCategoryService.activeCategories;

  readonly currentPage = computed(() => this.adminProductService.currentParams().page ?? 0);
  readonly pageSize = computed(() => this.adminProductService.currentParams().size ?? 20);

  readonly searchControl = new FormControl('');
  readonly categoryFilter = signal('');

  readonly showDeleteConfirm = signal(false);
  readonly pendingProductId = signal<string | null>(null);
  readonly actionMessage = signal<{ ok: boolean; text: string } | null>(null);

  readonly columns: TableColumnDef[] = [
    { key: 'thumbnail', header: '' },
    { key: 'title', header: 'Product', cellClass: 'td--name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', cellClass: 'td--price' },
    { key: 'quantity', header: 'Stock' },
    { key: 'rate', header: 'Rating' },
    { key: 'actions', header: '', cellClass: 'td--action' },
  ];

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
        switchMap((value) => {
          this.adminProductService.loadProducts({ search: value ?? '', page: 0 });
          return [];
        })
      )
      .subscribe();
  }

  load(): void {
    this.categoryFilter.set('');
    this.searchControl.setValue('', { emitEvent: false });
    this.adminProductService.loadProducts({
      page: 0,
      size: 20,
      search: undefined,
      category: undefined,
    });
  }

  goToPage(page: number): void {
    this.adminProductService.loadProducts({ page });
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryFilter.set(value);
    this.adminProductService.loadProducts({ category: value || undefined, page: 0 });
  }

  openDeleteConfirm(productId: string): void {
    this.pendingProductId.set(productId);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.pendingProductId.set(null);
  }

  executeDelete(): void {
    const id = this.pendingProductId();
    if (!id) return;
    this.showDeleteConfirm.set(false);
    this.pendingProductId.set(null);
    this.adminProductService.deleteProduct(id).subscribe({
      next: () => {
        this.adminProductService.loadProducts({ page: 0 });
        this.flash(true, 'Product deleted successfully.');
      },
      error: () => this.flash(false, 'Failed to delete product.'),
    });
  }

  asProduct(row: unknown): Product {
    return row as Product;
  }

  stockLabel(quantity: number): string {
    if (quantity === 0) return 'Out of stock';
    if (quantity <= 10) return `Low (${quantity})`;
    return `In stock (${quantity})`;
  }

  stockClass(quantity: number): string {
    if (quantity === 0) return 'stock-badge--out';
    if (quantity <= 10) return 'stock-badge--low';
    return 'stock-badge--in';
  }

  private flash(ok: boolean, text: string): void {
    this.actionMessage.set({ ok, text });
    timer(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actionMessage.set(null));
  }
}
