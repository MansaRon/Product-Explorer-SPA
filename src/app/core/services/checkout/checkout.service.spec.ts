import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { CheckoutService } from './checkout.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { signal, WritableSignal } from '@angular/core';
import { User } from '../../models/user';
import { of } from 'rxjs';
import { fromPartial } from '@total-typescript/shoehorn';
import {
  CheckoutApiData,
  CheckoutApiResponse,
  DeliveryOption,
  PaymentMethod,
  ShippingAddress,
} from '../../models/checkout';
import { OrderApi, OrderApiResponse } from '../../models/order';

const mockUser: User = fromPartial({ id: 'user-123', accessToken: 'token-abc' });

const mockShipping: ShippingAddress = {
  fullName: 'John Doe',
  phoneNumber: '0821234567',
  email: 'john@example.com',
  streetAddress: '123 Main St',
  city: 'Johannesburg',
  province: 'Gauteng',
  postalCode: '2000',
  country: 'South Africa',
};

const mockDelivery: DeliveryOption = {
  id: 'STANDARD',
  name: 'Standard Delivery',
  description: 'Delivered within 5-7 business days',
  estimatedDays: '5-7 days',
  price: 0,
};

const mockPayment: PaymentMethod = { id: 'CREDIT_CARD', type: 'card', label: 'Credit/Debit Card' };

const mockCheckoutData: CheckoutApiData = {
  id: 'checkout-456',
  subtotal: 100,
  discount: 0,
  tax: 15,
  shippingCost: 0,
  totalAmount: 115,
  status: 'PENDING',
};

const mockCheckoutResponse: CheckoutApiResponse = {
  data: mockCheckoutData,
  message: 'Checkout initiated.',
  status: 'OK',
  statusCode: 200,
};

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
  message: 'Order placed successfully!',
  status: 'OK',
  statusCode: 200,
};

describe(CheckoutService.name, () => {
  let spectator: SpectatorService<CheckoutService>;
  let service: CheckoutService;
  let mockAuthService: SpyObject<AuthService>;
  let mockHttp: SpyObject<HttpClient>;

  const createService = createServiceFactory({
    service: CheckoutService,
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

    mockHttp.post.mockReturnValue(of(mockCheckoutResponse));
    mockHttp.patch.mockReturnValue(of(mockCheckoutResponse));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start on the shipping step', () => {
      expect(service.currentStep()).toBe('shipping');
    });

    it('should have no completed steps', () => {
      expect(service.isStepCompleted()('shipping')).toBe(false);
      expect(service.isStepCompleted()('delivery')).toBe(false);
    });

    it('should have no checkoutId', () => {
      expect(service.checkoutId()).toBeNull();
    });

    it('canProceed should be false with no data set', () => {
      expect(service.canProceed()).toBe(false);
    });
  });

  describe('setShippingAddress', () => {
    it('should store the address and mark shipping complete', () => {
      service.setShippingAddress(mockShipping);

      expect(service.shippingAddress()).toEqual(mockShipping);
      expect(service.isStepCompleted()('shipping')).toBe(true);
    });

    it('should allow canProceed once address is set on the shipping step', () => {
      service.setShippingAddress(mockShipping);

      expect(service.canProceed()).toBe(true);
    });
  });

  describe('setDeliveryOption', () => {
    it('should store the option and mark delivery complete', () => {
      service.setDeliveryOption(mockDelivery);

      expect(service.deliveryOption()).toEqual(mockDelivery);
      expect(service.isStepCompleted()('delivery')).toBe(true);
    });
  });

  describe('setPaymentMethod', () => {
    it('should store the method and mark payment complete', () => {
      service.setPaymentMethod(mockPayment);

      expect(service.paymentMethod()).toEqual(mockPayment);
      expect(service.isStepCompleted()('payment')).toBe(true);
    });
  });

  describe('navigation', () => {
    it('nextStep() should advance from shipping to delivery', () => {
      service.nextStep();

      expect(service.currentStep()).toBe('delivery');
    });

    it('previousStep() should go back from delivery to shipping', () => {
      service.goToStep('delivery');
      service.previousStep();

      expect(service.currentStep()).toBe('shipping');
    });

    it('previousStep() should not go before shipping', () => {
      service.previousStep();

      expect(service.currentStep()).toBe('shipping');
    });

    it('goToStep() should jump directly to the given step', () => {
      service.goToStep('payment');

      expect(service.currentStep()).toBe('payment');
    });
  });

  describe('initiateCheckout', () => {
    it('should not call the API when user is not authenticated', () => {
      service.initiateCheckout();

      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('should POST to initiate-checkout when user is authenticated', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);

      service.initiateCheckout();

      expect(mockHttp.post).toHaveBeenCalledWith(
        `/checkout/${mockUser.id}/initiate-checkout`,
        null
      );
    });

    it('should store the checkoutId returned from the response', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);

      service.initiateCheckout();

      expect(service.checkoutId()).toBe(mockCheckoutData.id);
    });

    it('should not call the API a second time if checkoutId is already set', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);

      service.initiateCheckout();
      service.initiateCheckout();

      expect(mockHttp.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmCheckout', () => {
    it('should call onError when checkoutId has not been set', () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();

      service.setShippingAddress(mockShipping);
      service.setDeliveryOption(mockDelivery);
      service.setPaymentMethod(mockPayment);

      service.confirmCheckout({ onSuccess, onError });

      expect(onError).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should call onError when checkout data is incomplete', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();

      const onSuccess = jest.fn();
      const onError = jest.fn();

      service.confirmCheckout({ onSuccess, onError });

      expect(onError).toHaveBeenCalled();
      expect(mockHttp.patch).not.toHaveBeenCalled();
    });

    it('should PATCH to update checkout then POST to confirm and call onSuccess', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();

      service.setShippingAddress(mockShipping);
      service.setDeliveryOption(mockDelivery);
      service.setPaymentMethod(mockPayment);

      mockHttp.post.mockReturnValueOnce(of(mockOrderResponse));

      const onSuccess = jest.fn();
      const onError = jest.fn();

      service.confirmCheckout({ onSuccess, onError });

      expect(mockHttp.patch).toHaveBeenCalledWith(
        `/checkout/${mockUser.id}`,
        expect.objectContaining({ paymentMethod: 'CREDIT_CARD' })
      );
      expect(mockHttp.post).toHaveBeenCalledWith(`/checkout/${mockCheckoutData.id}/confirm`, null);
      expect(onSuccess).toHaveBeenCalledWith(mockOrder);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should map payment id "CREDIT_CARD" to CREDIT_CARD in the PATCH body', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();
      service.setShippingAddress(mockShipping);
      service.setDeliveryOption(mockDelivery);
      service.setPaymentMethod({ id: 'CREDIT_CARD', type: 'card', label: 'Credit/Debit Card' });

      mockHttp.post.mockReturnValueOnce(of(mockOrderResponse));
      service.confirmCheckout({ onSuccess: jest.fn(), onError: jest.fn() });

      expect(mockHttp.patch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ paymentMethod: 'CREDIT_CARD' })
      );
    });

    it('should send STANDARD as shippingMethod for the standard delivery option', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();
      service.setShippingAddress(mockShipping);
      service.setDeliveryOption({ ...mockDelivery, id: 'STANDARD' });
      service.setPaymentMethod(mockPayment);

      mockHttp.post.mockReturnValueOnce(of(mockOrderResponse));
      service.confirmCheckout({ onSuccess: jest.fn(), onError: jest.fn() });

      expect(mockHttp.patch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ shippingMethod: 'STANDARD' })
      );
    });

    it('should send EXPRESS as shippingMethod for the express delivery option', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();
      service.setShippingAddress(mockShipping);
      service.setDeliveryOption({ ...mockDelivery, id: 'EXPRESS' });
      service.setPaymentMethod(mockPayment);

      mockHttp.post.mockReturnValueOnce(of(mockOrderResponse));
      service.confirmCheckout({ onSuccess: jest.fn(), onError: jest.fn() });

      expect(mockHttp.patch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ shippingMethod: 'EXPRESS' })
      );
    });

    it('should send EFT as paymentMethod for the EFT payment option', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();
      service.setShippingAddress(mockShipping);
      service.setDeliveryOption(mockDelivery);
      service.setPaymentMethod({ id: 'EFT', type: 'eft', label: 'EFT/Bank Transfer' });

      mockHttp.post.mockReturnValueOnce(of(mockOrderResponse));
      service.confirmCheckout({ onSuccess: jest.fn(), onError: jest.fn() });

      expect(mockHttp.patch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ paymentMethod: 'EFT' })
      );
    });
  });

  describe('markStepCompleted', () => {
    it('should mark the given step as completed without changing other state', () => {
      service.markStepCompleted('review');

      expect(service.isStepCompleted()('review')).toBe(true);
      expect(service.currentStep()).toBe('shipping');
    });

    it('should not affect already-completed steps when marking a new one', () => {
      service.setShippingAddress(mockShipping);
      service.markStepCompleted('review');

      expect(service.isStepCompleted()('shipping')).toBe(true);
      expect(service.isStepCompleted()('review')).toBe(true);
    });

    it('should be idempotent — marking an already-completed step changes nothing', () => {
      service.setShippingAddress(mockShipping);
      service.markStepCompleted('shipping');

      expect(service.isStepCompleted()('shipping')).toBe(true);
    });
  });

  describe('resetCheckout', () => {
    it('should clear the checkoutId, step data, and return to the shipping step', () => {
      (mockAuthService.currentUser as unknown as WritableSignal<User | null>).set(mockUser);
      service.initiateCheckout();
      service.setShippingAddress(mockShipping);
      service.goToStep('review');

      service.resetCheckout();

      expect(service.checkoutId()).toBeNull();
      expect(service.currentStep()).toBe('shipping');
      expect(service.shippingAddress()).toBeUndefined();
    });
  });
});
