import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { OrderService } from './order.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { User } from '../../models/user';
import { of } from 'rxjs';
import { fromPartial } from '@total-typescript/shoehorn';
import { OrderApi, OrderApiResponse, OrderListApiResponse } from '../../models/order';

const mockUser: User = fromPartial({ id: 'user-123', accessToken: 'token-abc' });

// Defined at module level so it's shared — must be reset in beforeEach to avoid cross-test leakage
const currentUserSignal = signal<User | null>(null);

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

describe(OrderService.name, () => {
  let spectator: SpectatorService<OrderService>;
  let service: OrderService;
  let mockHttp: SpyObject<HttpClient>;

  const createService = createServiceFactory({
    service: OrderService,
    providers: [
      mockProvider(AuthService, { currentUser: currentUserSignal }),
      mockProvider(HttpClient),
    ],
  });

  beforeEach(() => {
    currentUserSignal.set(null);
    spectator = createService();
    service = spectator.service;

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

  describe('addOrder', () => {
    it('should set the current order', () => {
      service.addOrder(mockOrder);

      expect(service.currentOrder()).toEqual(mockOrder);
    });

    it('should prepend the order to the orders list', () => {
      currentUserSignal.set(mockUser);

      const newOrder: OrderApi = fromPartial({
        id: 'order-new',
        orderNumber: 'ORD-002',
        orderItems: [],
      });
      service.addOrder(newOrder);

      expect(service.orders()[0]).toEqual(newOrder);
      expect(service.orderCount()).toBeGreaterThanOrEqual(1);
    });

    it('should increment hasOrders to true when list was empty', () => {
      expect(service.hasOrders()).toBe(false);

      service.addOrder(mockOrder);

      expect(service.hasOrders()).toBe(true);
      expect(service.orderCount()).toBe(1);
    });
  });

  describe('refreshOrders', () => {
    it('should not call the API when no user is logged in', () => {
      jest.clearAllMocks();

      service.refreshOrders();

      expect(mockHttp.get).not.toHaveBeenCalled();
    });

    it('should call GET /order/user/{userId} when user is logged in', () => {
      currentUserSignal.set(mockUser);
      jest.clearAllMocks();
      mockHttp.get.mockReturnValue(of(mockOrderListResponse));

      service.refreshOrders();

      expect(mockHttp.get).toHaveBeenCalledWith(`/order/user/${mockUser.id}`);
    });
  });

  describe('loadOrderById', () => {
    it('should call GET /order/{userId}/{orderId} when user is logged in', () => {
      currentUserSignal.set(mockUser);
      mockHttp.get.mockReturnValue(of(mockOrderResponse));

      service.loadOrderById('order-789');

      expect(mockHttp.get).toHaveBeenCalledWith(`/order/${mockUser.id}/order-789`);
    });

    it('should not call the API when no user is logged in', () => {
      jest.clearAllMocks();

      service.loadOrderById('order-789');

      expect(mockHttp.get).not.toHaveBeenCalled();
    });

    it('should set the current order from the HTTP response', () => {
      currentUserSignal.set(mockUser);
      mockHttp.get.mockReturnValue(of(mockOrderResponse));

      service.loadOrderById('order-789');

      expect(service.currentOrder()).toEqual(mockOrder);
    });
  });

  describe('auth effect', () => {
    it('should call GET /order/user/{userId} when user logs in', () => {
      currentUserSignal.set(mockUser);
      TestBed.flushEffects();

      expect(mockHttp.get).toHaveBeenCalledWith(`/order/user/${mockUser.id}`);
    });

    it('should clear orders and current order when user logs out', () => {
      currentUserSignal.set(mockUser);
      TestBed.flushEffects();
      jest.clearAllMocks();
      service.setCurrentOrder(mockOrder);

      currentUserSignal.set(null);
      TestBed.flushEffects();

      expect(service.currentOrder()).toBeNull();
      expect(service.orderCount()).toBe(0);
    });
  });
});
