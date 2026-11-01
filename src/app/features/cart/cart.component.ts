import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CartService } from '../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { TrashIconComponent } from '../../shared/components/icons/trash-icon/trash-icon.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, EmptyStateComponent, TrashIconComponent],
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly cartWithProducts = computed(() =>
    this.cartService
      .items()
      .map((item) => ({
        productId: item.productDTO?.id ?? '',
        product: item.productDTO,
        quantity: item.quantity,
        productPrice: item.productPrice,
      }))
      .filter((item) => !!item.product)
  );

  protected readonly subTotal = this.cartService.subTotal;
  protected readonly tax = this.cartService.tax;
  protected readonly total = this.cartService.total;

  protected increaseQuantity(productId: string): void {
    this.cartService.increaseQuantity(productId);
  }

  protected decreaseQuantity(productId: string): void {
    this.cartService.decreaseQuantity(productId);
  }

  protected removeFromCart(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  protected continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  protected goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
