import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
import {
  Order,
  OrderApi,
  OrderApiResponse,
  OrderListApiResponse,
  OrderTrackingApiResponse,
  OrderTrackingData,
} from '../../models/order';

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
  private readonly trackingDataSignal = signal<OrderTrackingData | null>(null);
  private readonly isLoadingTrackingSignal = signal(false);

  readonly orders = this.ordersSignal.asReadonly();
  readonly currentOrder = this.currentOrderSignal.asReadonly();
  readonly trackingData = this.trackingDataSignal.asReadonly();
  readonly isLoadingTracking = this.isLoadingTrackingSignal.asReadonly();
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

  loadTrackingData(orderId: string): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    this.trackingDataSignal.set(null);
    this.isLoadingTrackingSignal.set(true);
    this.http
      .get<OrderTrackingApiResponse>(`/order/${user.id}/${orderId}/track`)
      .pipe(
        tap((res) => {
          this.trackingDataSignal.set(res.data);
          this.isLoadingTrackingSignal.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to load tracking data:', err);
          this.isLoadingTrackingSignal.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  cancelOrder(
    orderId: string,
    reason: string | undefined,
    callbacks: { onSuccess: (order: OrderApi) => void; onError: (message: string) => void }
  ): void {
    const user = this.authService.currentUser();
    if (!user?.id) {
      callbacks.onError('Not authenticated');
      return;
    }
    const body = reason?.trim() ? { reason: reason.trim() } : null;
    this.http
      .post<OrderApiResponse>(`/order/${user.id}/${orderId}/cancel`, body)
      .pipe(
        tap((res) => callbacks.onSuccess(res.data)),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          const msg: string = err?.error?.message ?? 'Failed to cancel order. Please try again.';
          callbacks.onError(msg);
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
