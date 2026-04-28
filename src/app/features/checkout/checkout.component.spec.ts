/* tslint:disable:no-unused-variable */
import { CheckoutComponent } from './checkout.component';
import { createComponentFactory, mockProvider, Spectator } from '@ngneat/spectator';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Router } from '@angular/router';

describe.skip('CheckoutComponent', () => {
  let spectator: Spectator<CheckoutComponent>;
  
  const createComponent = createComponentFactory({
    component: CheckoutComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      })
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
