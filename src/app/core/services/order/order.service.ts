import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
import { Order, OrderApi, OrderApiResponse, OrderListApiResponse } from '../../models/order';

// View-model types used by OrderConfirmationComponent

export function toOrderViewModel(api: OrderApi): Order {
  return {
    id: api.id,
    userId: '',
    orderNumber: api.orderNumber,
    items: (api.orderItems ?? []).map((item) => ({
      productId: item.productId,
      productName: item.productTitle,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    subtotal: api.subtotal,
    tax: api.tax,
    total: api.totalAmount,
    status: api.orderStatus,
    createdAt: new Date(),
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly ordersSignal = signal<OrderApi[]>([]);
  private readonly currentOrderSignal = signal<OrderApi | null>(null);

  readonly orders = this.ordersSignal.asReadonly();
  readonly currentOrder = this.currentOrderSignal.asReadonly();
  readonly orderCount = computed(() => this.ordersSignal().length);
  readonly hasOrders = computed(() => this.ordersSignal().length > 0);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.loadUserOrders(user.id);
      } else {
        this.ordersSignal.set([]);
        this.currentOrderSignal.set(null);
      }
    });
  }

  setCurrentOrder(order: OrderApi): void {
    this.currentOrderSignal.set(order);
  }

  /** Use after placing a new order — sets the current order and prepends it to the orders list. */
  addOrder(order: OrderApi): void {
    this.currentOrderSignal.set(order);
    this.ordersSignal.update((orders) => [order, ...orders]);
  }

  refreshOrders(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.loadUserOrders(user.id);
    }
  }

  loadOrderById(orderId: string): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    this.http
      .get<OrderApiResponse>(`/order/${user.id}/${orderId}`)
      .pipe(
        tap((response) => this.currentOrderSignal.set(response.data)),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load order:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  private loadUserOrders(userId: string): void {
    this.http
      .get<OrderListApiResponse>(`/order/user/${userId}`)
      .pipe(
        tap((response) => this.ordersSignal.set(response.data ?? [])),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load user orders:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }
}
