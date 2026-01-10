import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FavouriteService } from '../../core/services/favourite.service';
import { ProductService } from '../../core/services/product.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ErrorMessageComponent
  ],
})
export class ProductDetailsComponent {
  private readonly productService = inject(ProductService);
  private readonly favouriteService = inject(FavouriteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  protected readonly id = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id') ?? '')
    )
  );
  
  protected readonly product = computed(() => {
    const productId = this.id();
    if (!productId) return undefined;
    return this.productService.getProductById(productId);
  });
  
  protected readonly isFavorite = computed(() => {
    const productId = this.id();
    if (!productId) return false;
    return this.favouriteService.isFavorite(productId);
  });
  
  protected readonly notFound = computed(() => !this.product());

  protected toggleFavorite(): void {
    const productId = this.id();
    if (productId) {
      this.favouriteService.toggleFavorite(productId);
    }
  }
  
  protected goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
