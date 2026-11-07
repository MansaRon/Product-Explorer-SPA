import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, EmptyStateComponent, ConfirmModalComponent],
})
export class FavouritesComponent {
  private readonly favouriteService = inject(FavouriteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly favoriteProducts = this.favouriteService.wishlistProducts;
  protected readonly favoriteCount = this.favouriteService.count;
  protected readonly hasFavorites = computed(() => this.favouriteService.count() > 0);

  protected readonly showClearConfirm = signal(false);

  protected readonly clearConfirmMessage = computed(() => {
    const count = this.favoriteCount();
    return `Are you sure you want to remove all ${count} ${count === 1 ? 'favorite' : 'favorites'}? This action cannot be undone.`;
  });

  protected isFavorite(productId: string): boolean {
    return this.favouriteService.isFavorite(productId);
  }

  protected toggleFavorite(productId: string): void {
    this.favouriteService.toggleFavorite(productId);
  }

  protected clearAllFavorites(): void {
    this.showClearConfirm.set(true);
  }

  protected onConfirmClear(): void {
    this.favouriteService.clearAll();
    this.showClearConfirm.set(false);
  }

  protected onCancelClear(): void {
    this.showClearConfirm.set(false);
  }

  protected back(): void {
    void this.router.navigate(['/catalog'], { relativeTo: this.route });
  }
}
