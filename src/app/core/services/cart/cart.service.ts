import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CartItem, CartResponse } from '../../models/cartitem';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly cartItemsSignal = signal<CartItem[]>([]);

  readonly itemCount = computed(() =>
    this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0)
  );
  readonly items = this.cartItemsSignal.asReadonly();
  readonly uniqueProductCount = computed(() => this.cartItemsSignal().length);
  readonly isEmpty = computed(() => this.cartItemsSignal().length === 0);
  readonly productIds = computed(() =>
    this.cartItemsSignal()
      .map((item) => item.productDTO?.id)
      .filter((id): id is string => !!id)
  );

  readonly subTotal = computed(() =>
    this.cartItemsSignal().reduce((total, item) => total + item.productPrice, 0)
  );
  readonly tax = computed(() => this.subTotal() * 0.15);
  readonly total = computed(() => this.subTotal() + this.tax());

  readonly getCartSummary = computed(() => ({
    totalItems: this.itemCount(),
    uniqueProducts: this.uniqueProductCount(),
    isEmpty: this.isEmpty(),
    items: this.items(),
  }));

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.loadCart(user.id);
      } else {
        this.cartItemsSignal.set([]);
      }
    });
  }

  isInCart(productId: string): boolean {
    return this.cartItemsSignal().some((item) => item.productDTO?.id === productId);
  }

  getcartItem(productId: string): CartItem | undefined {
    return this.cartItemsSignal().find((item) => item.productDTO?.id === productId);
  }

  getQuantity(productId: string): number {
    return this.getcartItem(productId)?.quantity ?? 0;
  }

  toggleCart(productId: string): void {
    if (this.isInCart(productId)) {
      this.removeFromCart(productId);
    } else {
      this.addToCart(productId);
    }
  }

  addToCart(productId: string, quantity = 1): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    const params = new HttpParams().set('quantity', quantity);
    this.http
      .post<CartResponse>(`/cart/${user.id}/add-item/${productId}`, null, { params })
      .pipe(
        tap((response) => this.syncFromResponse(response)),
        catchError((err) => {
          console.error('Failed to add to cart:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  removeFromCart(productId: string): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.http
      .delete<CartResponse>(`/cart/${user.id}/delete-item/${productId}`)
      .pipe(
        tap((response) => this.syncFromResponse(response)),
        catchError((err) => {
          console.error('Failed to remove from cart:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  updateQuantity(productId: string, quantity: number): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    const params = new HttpParams().set('newQuantity', quantity);
    this.http
      .patch<CartResponse>(`/cart/${user.id}/update-item/${productId}`, null, { params })
      .pipe(
        tap((response) => this.syncFromResponse(response)),
        catchError((err) => {
          console.error('Failed to update cart:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  increaseQuantity(productId: string): void {
    this.updateQuantity(productId, this.getQuantity(productId) + 1);
  }

  decreaseQuantity(productId: string): void {
    this.updateQuantity(productId, this.getQuantity(productId) - 1);
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
  }

  private loadCart(userId: string): void {
    this.http
      .get<CartResponse>(`/cart/${userId}`)
      .pipe(
        tap((response) => this.syncFromResponse(response)),
        catchError((err) => {
          console.error('Failed to load cart:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  private syncFromResponse(response: CartResponse): void {
    this.cartItemsSignal.set(response?.data?.cartItems ?? []);
  }
}
