import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { OrderService } from './order.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../models/user';
import { of } from 'rxjs';
import { fromPartial } from '@total-typescript/shoehorn';
import { OrderApi, OrderApiResponse, OrderListApiResponse } from '../../models/order';

const mockUser: User = fromPartial({ id: 'user-123', accessToken: 'token-abc' });

const mockOrder: OrderApi = fromPartial({
  id: 'order-789',
  orderNumber: 'ORD-001',
  orderStatus: 'PENDING',
  totalAmount: 115,
  subtotal: 100,
  tax: 15,
  orderItems: [],
});

const mockOrderResponse: OrderApiResponse = {
  data: mockOrder,
  message: 'Order retrieved.',
  status: 'OK',
  statusCode: 200,
};

const mockOrderListResponse: OrderListApiResponse = {
  data: [mockOrder],
  message: 'Orders retrieved.',
  status: 'OK',
  statusCode: 200,
};

describe.skip(OrderService.name, () => {
  let spectator: SpectatorService<OrderService>;
  let service: OrderService;
  let mockAuthService: SpyObject<AuthService>;
  let mockHttp: SpyObject<HttpClient>;

  const createService = createServiceFactory({
    service: OrderService,
    providers: [
      mockProvider(AuthService, {
        currentUser: signal<User | null>(null),
      }),
      mockProvider(HttpClient),
    ],
  });

  beforeEach(() => {
    spectator = createService();
    service = spectator.service;

    mockAuthService = spectator.inject(AuthService);
    mockHttp = spectator.inject(HttpClient);

    mockHttp.get.mockReturnValue(of(mockOrderListResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with empty orders', () => {
      expect(service.orderCount()).toBe(0);
      expect(service.hasOrders()).toBe(false);
    });

    it('should have no current order', () => {
      expect(service.currentOrder()).toBeNull();
    });
  });

  describe('setCurrentOrder', () => {
    it('should update the current order signal', () => {
      service.setCurrentOrder(mockOrder);

      expect(service.currentOrder()).toEqual(mockOrder);
    });

    it('should expose the order id and number after being set', () => {
      service.setCurrentOrder(mockOrder);

      expect(service.currentOrder()?.id).toBe('order-789');
      expect(service.currentOrder()?.orderNumber).toBe('ORD-001');
    });
  });

  describe('loadOrderById', () => {
    it('should call GET /order/{orderId}', () => {
      mockHttp.get.mockReturnValue(of(mockOrderResponse));

      service.loadOrderById('order-789');

      expect(mockHttp.get).toHaveBeenCalledWith('/order/order-789');
    });

    it('should set the current order from the HTTP response', () => {
      mockHttp.get.mockReturnValue(of(mockOrderResponse));

      service.loadOrderById('order-789');

      expect(service.currentOrder()).toEqual(mockOrder);
    });
  });

  describe('auth effect', () => {
    it('should call GET /order/user/{userId} when user logs in', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);

      expect(mockHttp.get).toHaveBeenCalledWith(`/order/user/${mockUser.id}`);
    });

    it('should clear orders and current order when user logs out', () => {
      service.setCurrentOrder(mockOrder);

      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(null);

      expect(service.currentOrder()).toBeNull();
      expect(service.orderCount()).toBe(0);
    });
  });
});
