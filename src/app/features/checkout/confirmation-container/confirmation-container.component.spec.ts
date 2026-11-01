import { createComponentFactory, mockProvider, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { ConfirmationContainerComponent } from './confirmation-container.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order/order.service';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { signal } from '@angular/core';
import { fromPartial } from '@total-typescript/shoehorn';
import { OrderApi } from '../../../core/models/order';

const mockOrder: OrderApi = fromPartial({
  id: 'order-789',
  orderNumber: 'ORD-001',
  orderStatus: 'PENDING',
  totalAmount: 115,
  subtotal: 100,
  tax: 15,
  orderItems: [],
});

describe.skip('ConfirmationContainerComponent', () => {
  let spectator: Spectator<ConfirmationContainerComponent>;
  let component: ConfirmationContainerComponent;
  let mockRouter: SpyObject<Router>;
  let mockOrderService: SpyObject<OrderService>;
  let mockCheckoutService: SpyObject<CheckoutService>;

  const createComponent = createComponentFactory({
    component: ConfirmationContainerComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router),
      mockProvider(ActivatedRoute, {
        snapshot: { paramMap: { get: jest.fn().mockReturnValue('order-789') } },
      }),
      mockProvider(OrderService, {
        currentOrder: signal<OrderApi | null>(mockOrder),
      }),
      mockProvider(CheckoutService),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    component = spectator.component;

    mockRouter = spectator.inject(Router);
    mockOrderService = spectator.inject(OrderService);
    mockCheckoutService = spectator.inject(CheckoutService);

    mockRouter.navigate.mockReturnValue(Promise.resolve(true));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call goToStep("confirmation") on ngOnInit', () => {
    component.ngOnInit();

    expect(mockCheckoutService.goToStep).toHaveBeenCalledWith('confirmation');
  });

  it('should NOT call loadOrderById when currentOrder is already in memory', () => {
    component.ngOnInit();

    expect(mockOrderService.loadOrderById).not.toHaveBeenCalled();
  });

  it('should call loadOrderById when currentOrder is null', () => {
    (mockOrderService.currentOrder as ReturnType<typeof signal<OrderApi | null>>).set(null);

    component.ngOnInit();

    expect(mockOrderService.loadOrderById).toHaveBeenCalledWith('order-789');
  });

  it('should reset checkout and navigate to catalog on continueShopping', () => {
    component['continueShopping']();

    expect(mockCheckoutService.resetCheckout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
