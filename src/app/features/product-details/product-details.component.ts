import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { Router, RouterLink } from '@angular/router';
import { FavouriteService } from '../../core/services/favourite.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, 
    LoaderComponent, 
    ErrorMessageComponent
  ],
})
export class ProductDetailsComponent {
  private readonly productService = inject(ProductService);
  private readonly favouriteService = inject(FavouriteService);
  private readonly router = inject(Router);
  
  readonly id = input.required<string>();
  
  protected readonly product = computed(() => {
    return this.productService.getProductById(this.id());
  });
  
  protected readonly isFavorite = computed(() => {
    const productId = this.id();
    return this.favouriteService.isFavorite(productId);
  });
  
  protected readonly notFound = computed(() => !this.product());

  protected toggleFavorite(): void {
    this.favouriteService.toggleFavorite(this.id());
  }
  
  protected goBack(): void {
    this.router.navigate(['/catalog']);
  }
}
