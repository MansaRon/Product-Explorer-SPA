import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CurrencyPipe } from '@angular/common';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../core/models/product';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ArrowLeftIconComponent } from '../../shared/components/icons/arrow-left-icon/arrow-left-icon.component';
import { HeartIconComponent } from '../../shared/components/icons/heart-icon/heart-icon.component';
import { CartIconComponent } from '../../shared/components/icons/cart-icon/cart-icon.component';
import { StarIconComponent } from '../../shared/components/icons/star-icon/star-icon.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ErrorMessageComponent,
    CurrencyPipe,
    ArrowLeftIconComponent,
    HeartIconComponent,
    CartIconComponent,
    StarIconComponent,
  ],
})
export class ProductDetailsComponent {
  private readonly favouriteService = inject(FavouriteService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly product = toSignal(
    this.route.data.pipe(map(data => data['product'] as Product | undefined))
  );

  protected readonly isFavorite = computed(() => {
    const id = this.product()?.id;
    return id ? this.favouriteService.isFavorite(id) : false;
  });

  protected readonly isInCart = computed(() => {
    const id = this.product()?.id;
    return id ? this.cartService.isInCart(id) : false;
  });

  protected readonly notFound = computed(() => !this.product());

  protected goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected toggleFavorite(): void {
    const id = this.product()?.id;
    if (id) this.favouriteService.toggleFavorite(id);
  }

  protected toggleCart(): void {
    const id = this.product()?.id;
    if (id) this.cartService.toggleCart(id);
  }
}
