import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Product } from '../../models/product';
import { FilterParams, SortField, SortOrder } from '../../models/filter-params';
import { initialFilterParams } from '../../const/filter-params';
import { catchError, delay, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly httpClient = inject(HttpClient);

  private readonly productsSignal = signal<Product[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly filterParamsSignal = signal<FilterParams>(initialFilterParams);

  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly filterParams = this.filterParamsSignal.asReadonly();

  readonly filterProducts = computed(() => {
    const products = this.productsSignal();
    const params = this.filterParamsSignal();

    let filtered = [...products];

    if (params.searchTerm) {
      const searchProduct = params.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchProduct) || 
        p.description.toLowerCase().includes(searchProduct)
      );
    }

    if (params.category) {
      filtered = filtered.filter(category => category.category === params.category);
    }

    filtered = filtered.filter(pf => 
      pf.price >= 
      params.minPrice && 
      pf.price <= 
      params.maxPrice
    );

    filtered.sort((a, b) => {
      const aVal = a[params.sortBy];
      const bVal = b[params.sortBy];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return params.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  });

  readonly categories = computed(() => {
    const products = this.productsSignal();
    const uniqueCategories = new Set(products.map(p => p.category));
    return Array.from(uniqueCategories).sort();
  });

  constructor() { 
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.httpClient.get<Product[]>('/assets/data/products.json')
    .pipe(
      delay(800),
      takeUntilDestroyed(),
      catchError(error => {
        this.errorSignal.set('Failed to load products. Please try again.');
        console.error('Error loading products:', error);
        return of([]);
      })
    )
    .subscribe(products => {
      this.productsSignal.set(products);
      this.loadingSignal.set(false);
    });
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }
  
  updateSearchTerm(searchTerm: string): void {
    this.filterParamsSignal.update(params => ({
      ...params,
      searchTerm
    }));
  }
  
  updateCategory(category: string): void {
    this.filterParamsSignal.update(params => ({
      ...params,
      category
    }));
  }
  
  updatePriceRange(minPrice: number, maxPrice: number): void {
    this.filterParamsSignal.update(params => ({
      ...params,
      minPrice,
      maxPrice
    }));
  }
  
  updateSort(sortBy: SortField, sortOrder: SortOrder): void {
    this.filterParamsSignal.update(params => ({
      ...params,
      sortBy,
      sortOrder
    }));
  }
  
  resetFilters(): void {
    this.filterParamsSignal.set(initialFilterParams);
  }
  
  retryLoad(): void {
    this.loadProducts();
  }

}
