import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { CartService } from './cart.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { User } from '../../models/user';
import { CartItem, CartResponse } from '../../models/cartitem';
import { of, throwError } from 'rxjs';
import { fromPartial } from '@total-typescript/shoehorn';

const mockUser: User = fromPartial({ id: 'user-123', accessToken: 'token-abc' });

const mockCartItem: CartItem = fromPartial({
  productDTO: fromPartial({ id: 'prod-1', title: 'Test Product' }),
  quantity: 2,
  productPrice: 100,
  tax: 15,
  discount: 0,
});

const mockCartResponse: CartResponse = {
  data: { cartItems: [mockCartItem], totalPrice: 115 },
  message: 'Cart retrieved.',
  status: 'OK',
  statusCode: 200,
};

const emptyCartResponse: CartResponse = {
  data: { cartItems: [], totalPrice: 0 },
  message: 'Cart cleared.',
  status: 'OK',
  statusCode: 200,
};

// signal created once at describe level — must be reset in beforeEach to avoid cross-test leakage
const currentUserSignal = signal<User | null>(null);

describe(CartService.name, () => {
  let spectator: SpectatorService<CartService>;
  let service: CartService;
  let mockHttp: SpyObject<HttpClient>;

  const createService = createServiceFactory({
    service: CartService,
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

    mockHttp.get.mockReturnValue(of(mockCartResponse));
    mockHttp.delete.mockReturnValue(of(emptyCartResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('localClear', () => {
    it('should set isEmpty to true without making an API call', () => {
      service.localClear();

      expect(service.isEmpty()).toBe(true);
      expect(mockHttp.delete).not.toHaveBeenCalled();
    });

    it('should set itemCount to 0', () => {
      service.localClear();

      expect(service.itemCount()).toBe(0);
    });

    it('should clear items without making an API call', () => {
      service.localClear();

      expect(service.items()).toEqual([]);
      expect(mockHttp.delete).not.toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('should call DELETE /cart/{userId}/clear when user is logged in', () => {
      currentUserSignal.set(mockUser);

      service.clearCart();

      expect(mockHttp.delete).toHaveBeenCalledWith(`/cart/${mockUser.id}/clear`);
    });

    it('should empty the cart signal from the API response', () => {
      currentUserSignal.set(mockUser);

      service.clearCart();

      expect(service.isEmpty()).toBe(true);
    });

    it('should clear the local signal even when the API returns an error', () => {
      currentUserSignal.set(mockUser);
      mockHttp.delete.mockReturnValue(
        throwError(() => ({ status: 400, message: 'Cart not found for user' }))
      );

      service.clearCart();

      expect(service.isEmpty()).toBe(true);
    });

    it('should not call the API when no user is logged in', () => {
      // currentUserSignal is null (reset in beforeEach)
      service.clearCart();

      expect(mockHttp.delete).not.toHaveBeenCalled();
    });
  });

  describe('loadCart error handling', () => {
    it('should show an empty cart when the load API returns an error', () => {
      mockHttp.get.mockReturnValue(
        throwError(() => ({ status: 400, message: 'Cart not found for user' }))
      );

      currentUserSignal.set(mockUser);

      expect(service.isEmpty()).toBe(true);
    });
  });
});
