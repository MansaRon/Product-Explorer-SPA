import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { ProductService } from '../../core/services/product/product.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductCardComponent, 
    EmptyStateComponent
  ],
})
export class FavouritesComponent {
  private readonly favouriteService = inject(FavouriteService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  
  protected readonly favoriteIds = this.favouriteService.favouritesId;
  protected readonly favoriteCount = this.favouriteService.count;
  
  protected readonly favoriteProducts = computed(() => {
    const ids = this.favoriteIds();
    return ids
      .map(id => this.productService.getProductById(id))
      .filter(product => product !== undefined);
  });
  
  protected readonly hasFavorites = computed(() => this.favoriteCount() > 0);
  
  protected isFavorite(productId: string): boolean {
    return this.favouriteService.isFavorite(productId);
  }
  
  protected toggleFavorite(productId: string): void {
    this.favouriteService.toggleFavorite(productId);
  }
  
  protected clearAllFavorites(): void {
    if (confirm('Are you sure you want to remove all favorites?')) {
      this.favouriteService.clearAll();
    }
  }

  protected back(): void {
    void this.router.navigate(['/catalog'], {
      relativeTo: this.route
    })
  }
}
