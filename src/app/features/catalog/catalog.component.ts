import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProductService } from '../../core/services/product.service';
import { FavouriteService } from '../../core/services/favourite.service';
import { SortField, SortOrder } from '../../core/models/filter-params';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    LoaderComponent,
    ErrorMessageComponent,
    ProductCardComponent,
    EmptyStateComponent
  ]
})
export class CatalogComponent {

  private readonly productService = inject(ProductService);
  private readonly favouriteService = inject(FavouriteService);
  
  protected readonly products = this.productService.filterProducts;
  protected readonly categories = this.productService.categories;
  protected readonly loading = this.productService.loading;
  protected readonly error = this.productService.error;
  protected readonly filterParams = this.productService.filterParams;
  
  protected readonly searchTerm = signal('');
  protected readonly selectedCategory = signal('');
  protected readonly selectedSort = signal<SortField>('name');
  protected readonly selectedOrder = signal<SortOrder>('asc');
  
  protected onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.productService.updateSearchTerm(value);
  }
  
  protected onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.productService.updateCategory(value);
  }
  
  protected onSortChange(value: string): void {
    const sortField = value as SortField;
    this.selectedSort.set(sortField);
    this.productService.updateSort(sortField, this.selectedOrder());
  }
  
  protected onOrderChange(value: string): void {
    const order = value as SortOrder;
    this.selectedOrder.set(order);
    this.productService.updateSort(this.selectedSort(), order);
  }
  
  protected resetFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedSort.set('name');
    this.selectedOrder.set('asc');
    this.productService.resetFilters();
  }
  
  protected isFavorite(productId: string): boolean {
    return this.favouriteService.isFavorite(productId);
  }
  
  protected toggleFavorite(productId: string): void {
    this.favouriteService.toggleFavorite(productId);
  }
  
  protected handleRetry(): void {
    this.productService.retryLoad();
  }

}
