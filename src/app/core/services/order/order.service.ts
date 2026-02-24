import { Injectable, signal, computed, effect } from '@angular/core';
import { loadFromStorage, saveToStorage } from '../../../shared/utils/storage.util';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

const ORDERS_STORAGE_KEY = 'user_orders';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Private signal for order state
  private readonly ordersSignal = signal<Order[]>(
    this.loadInitialOrders()
  );

  // Public readonly signals
  readonly orders = this.ordersSignal.asReadonly();

  // Computed: Total number of orders
  readonly orderCount = computed(() => this.ordersSignal().length);

  // Computed: Pending orders
  readonly pendingOrders = computed(() =>
    this.ordersSignal().filter(order => order.status === 'pending')
  );

  // Computed: Completed orders
  readonly completedOrders = computed(() =>
    this.ordersSignal().filter(order => 
      order.status === 'delivered' || order.status === 'cancelled'
    )
  );

  // Computed: Check if there are any orders
  readonly hasOrders = computed(() => this.ordersSignal().length > 0);

  constructor() {
    // Effect: Auto-save to localStorage whenever orders change
    effect(() => {
      const orders = this.ordersSignal();
      this.persistOrders(orders);
    });
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | undefined {
    return this.ordersSignal().find(order => order.id === orderId);
  }

  /**
   * Create a new order
   */
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: this.generateOrderId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.ordersSignal.update(orders => [...orders, newOrder]);
    return newOrder;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.ordersSignal.update(orders =>
      orders.map(order =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): void {
    this.updateOrderStatus(orderId, 'cancelled');
  }

  /**
   * Delete an order completely
   */
  deleteOrder(orderId: string): void {
    this.ordersSignal.update(orders =>
      orders.filter(order => order.id !== orderId)
    );
  }

  /**
   * Clear all orders
   */
  clearAllOrders(): void {
    this.ordersSignal.set([]);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: Order['status']): Order[] {
    return this.ordersSignal().filter(order => order.status === status);
  }

  /**
   * Get total spent across all orders
   */
  getTotalSpent = computed(() => {
    return this.ordersSignal()
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  });

  // Private: Generate unique order ID
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Private: Load orders from storage using StorageService
  private loadInitialOrders(): Order[] {
    return loadFromStorage<Order[]>(ORDERS_STORAGE_KEY, []);
  }

  // Private: Save orders to storage using StorageService
  private persistOrders(orders: Order[]): void {
    saveToStorage(ORDERS_STORAGE_KEY, orders);
  }
}