import { computed, Injectable, signal } from '@angular/core';
import { CartItem } from '../../models/cartitem';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartItems = signal<CartItem[]>([]);

  readonly itemCount = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  readonly items = this.cartItems.asReadonly();

  isInCart(productId: string): boolean {
    return this.cartItems().some(item => item.productId === productId);
  }

  toggleCart(productId: string): void {
    if (this.isInCart(productId)) {
      this.removeFromCart(productId);
    } else {
      this.addToCart(productId);
    }
  }

  private addToCart(productId: string): void {
    this.cartItems.update(items => [...items, { productId, quantity: 1}]);
  }

  private removeFromCart(productId: string): void {
    this.cartItems.update(items => items.filter(item => item.productId !== productId));
  }
}
