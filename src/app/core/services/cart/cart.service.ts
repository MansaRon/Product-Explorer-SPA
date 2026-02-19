import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem } from '../../models/cartitem';
import { loadFromStorage, saveToStorage } from '../../../shared/utils/storage.util';
import { CART_STORAGE_KEY } from '../../const/cart-keys';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartItemsSignal = signal<CartItem[]>(this.loadInitialCart());
  
  readonly itemCount = computed(() => this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0));
  readonly items = this.cartItemsSignal.asReadonly();
  readonly uniqueProductCount = computed(() => this.cartItemsSignal().length);
  readonly isEmpty = computed(() => this.cartItemsSignal().length === 0);
  readonly productIds = computed(() => this.cartItemsSignal().map(item => item.productId));

  constructor() {
    // Autosave to localstorage whenever the cart changes
    effect(() => {
      const items = this.cartItemsSignal();
      saveToStorage(CART_STORAGE_KEY, items);
    })
  }

  isInCart(productId: string): boolean {
    return this.cartItemsSignal().some(item => item.productId === productId);
  }

  getcartItem(productId: string): CartItem | undefined {
    return this.cartItemsSignal().find(item => item.productId === productId);
  }

  getQuantity(productId: string): number {
    const item = this.getcartItem(productId);
    return item?.quantity ?? 0;
  }

  toggleCart(productId: string): void {
    if (this.isInCart(productId)) {
      this.removeFromCart(productId);
    } else {
      this.addToCart(productId);
    }
  }

  addToCart(productId: string, quantity: number = 1): void {
    this.cartItemsSignal.update(items => {
      const existingItem = items.find(item => item.productId === productId);

      if (existingItem) {
        return items.map(item => 
          item.productId === productId 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      } else {
        return [...items, { productId, quantity, addedAt: new Date() }];
      }
    });
  }

  removeFromCart(productId: string): void {
    this.cartItemsSignal.update(items => items.filter(item => item.productId !== productId));
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItemsSignal.update(items => 
      items.map(item => 
        item.productId === productId 
        ? { ...item, quantity } 
        : item
      )
    );
  }

  increaseQuantity(productId: string): void {
    const currentQuantity = this.getQuantity(productId);
    this.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: string): void {
    const currentQuantity = this.getQuantity(productId);
    this.updateQuantity(productId, currentQuantity - 1);
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
  }

  getCartSummary = computed(() => ({
    totalItems: this.itemCount(),
    uniqueProducts: this.uniqueProductCount(),
    isEmpty: this.isEmpty(),
    items: this.items()
  }));

  private loadInitialCart(): CartItem[] {
    return loadFromStorage<CartItem[]>(CART_STORAGE_KEY, []);
  }
}
