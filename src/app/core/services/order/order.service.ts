import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
import { OrderApi, OrderApiResponse, OrderListApiResponse } from '../../models/order';
import { DeliveryOption, PaymentMethod, ShippingAddress } from '../../models/checkout';

// View-model types used by OrderConfirmationComponent
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: Date;
  orderNumber?: string;
  shippingAddress?: ShippingAddress;
  deliveryOption?: DeliveryOption;
  paymentMethod?: PaymentMethod;
}

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

  loadOrderById(orderId: string): void {
    this.http
      .get<OrderApiResponse>(`/order/${orderId}`)
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
