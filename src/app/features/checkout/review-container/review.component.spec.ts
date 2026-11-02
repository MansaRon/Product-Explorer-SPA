import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { ReviewComponent } from './review.component';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { CartService } from '../../../core/services/cart/cart.service';
import { OrderService } from '../../../core/services/order/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { signal, WritableSignal } from '@angular/core';
import { fromPartial } from '@total-typescript/shoehorn';
import { ShippingAddress, DeliveryOption, PaymentMethod } from '../../../core/models/checkout';

const mockShipping: ShippingAddress = fromPartial({
  streetAddress: '123 Main St',
  city: 'Johannesburg',
  province: 'Gauteng',
  postalCode: '2000',
  country: 'South Africa',
});

const mockDelivery: DeliveryOption = fromPartial({ id: 'standard', price: 0 });
const mockPayment: PaymentMethod = fromPartial({ id: 'card', type: 'card' });

describe.skip('ReviewComponent', () => {
  let spectator: Spectator<ReviewComponent>;
  let component: ReviewComponent;
  let mockRouter: SpyObject<Router>;
  let mockCheckoutService: SpyObject<CheckoutService>;
  let mockCartService: SpyObject<CartService>;
  let mockNotificationService: SpyObject<NotificationService>;

  const createComponent = createComponentFactory({
    component: ReviewComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router),
      mockProvider(CheckoutService, {
        shippingAddress: signal<ShippingAddress | undefined>(mockShipping),
        deliveryOption: signal<DeliveryOption | undefined>(mockDelivery),
        paymentMethod: signal<PaymentMethod | undefined>(mockPayment),
      }),
      mockProvider(CartService, {
        isEmpty: signal(false),
        items: signal([]),
        subTotal: signal(0),
        tax: signal(0),
        total: signal(0),
      }),
      mockProvider(OrderService),
      mockProvider(NotificationService),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    component = spectator.component;

    mockRouter = spectator.inject(Router);
    mockCheckoutService = spectator.inject(CheckoutService);
    mockCartService = spectator.inject(CartService);
    mockNotificationService = spectator.inject(NotificationService);

    mockRouter.navigate.mockReturnValue(Promise.resolve(true));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call confirmCheckout when cart is empty', () => {
    (mockCartService.isEmpty as unknown as WritableSignal<boolean>).set(true);

    component['handlePlaceOrder']();

    expect(mockCheckoutService.confirmCheckout).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalled();
  });

  it('should call checkoutService.confirmCheckout when all checkout data is present', () => {
    component['handlePlaceOrder']();

    expect(mockCheckoutService.confirmCheckout).toHaveBeenCalled();
  });

  it('should navigate back to payment on handleBack', () => {
    component['handleBack']();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['checkout/payment']);
  });

  it('should navigate to shipping and call goToStep on handleEditShipping', () => {
    component['handleEditShipping']();

    expect(mockCheckoutService.goToStep).toHaveBeenCalledWith('shipping');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['checkout/shipping']);
  });
});
