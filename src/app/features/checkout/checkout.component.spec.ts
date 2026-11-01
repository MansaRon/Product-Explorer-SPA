import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { CheckoutComponent } from './checkout.component';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { CheckoutStep } from '../../core/models/checkout';

describe.skip('CheckoutComponent', () => {
  let spectator: Spectator<CheckoutComponent>;
  let component: CheckoutComponent;
  let mockRouter: SpyObject<Router>;
  let mockCheckoutService: SpyObject<CheckoutService>;
  let mockCartService: SpyObject<CartService>;

  const createComponent = createComponentFactory({
    component: CheckoutComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router),
      mockProvider(CheckoutService, {
        currentStep: signal<CheckoutStep>('shipping'),
        progressPercentage: signal(20),
        isStepCompleted: signal(() => false),
      }),
      mockProvider(CartService, {
        isEmpty: signal(false),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    component = spectator.component;

    mockRouter = spectator.inject(Router);
    mockCheckoutService = spectator.inject(CheckoutService);
    mockCartService = spectator.inject(CartService);

    mockRouter.navigate.mockReturnValue(Promise.resolve(true));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initiateCheckout when cart is not empty', () => {
    expect(mockCheckoutService.initiateCheckout).toHaveBeenCalled();
  });

  it('should redirect to /cart when cart is empty', () => {
    (mockCartService.isEmpty as ReturnType<typeof signal<boolean>>).set(true);

    spectator = createComponent({ detectChanges: false });
    mockRouter = spectator.inject(Router);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
  });

  it('should navigate to the given route on goToStep', () => {
    component['goToStep']('delivery', '/checkout/delivery');

    expect(mockCheckoutService.goToStep).toHaveBeenCalledWith('delivery');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/checkout/delivery']);
  });
});
