import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CartService } from '../../core/services/cart/cart.service';
import { ProductService } from '../../core/services/product/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, EmptyStateComponent],
})
export class CartComponent {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  protected readonly cartItems = this.cartService.items;

  protected readonly cartWithProducts = computed(() => {
    return this.cartItems().map(item => {
      const product = this.productService.getProductById(item.productId);
      return {
        ...item, product
      };
    }).filter(item => item.product !== undefined);
  });

  protected readonly subTotal = computed(() => {
    return this.cartWithProducts().reduce((total, item) => {
      return total + (item.product!.price * item.quantity);
    }, 0)
  });

  protected readonly tax = computed(() => {
    return this.subTotal() * 0.15;
  });

  protected readonly total = computed(() => {
    return this.subTotal() + this.tax();
  });

  protected removeFromCart(productId: string): void {
    this.cartService.toggleCart(productId);
  }

  protected continueShopping(): void {
    this.router.navigate(['/catalog']);
  }

  protected goToCheckout(): void {
    alert('Going to checkout!');
  }

}
