/* tslint:disable:no-unused-variable */
import { OrderConfirmationComponent } from './order-confirmation.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('OrderConfirmationComponent', () => {
  let spectator: Spectator<OrderConfirmationComponent>;
  
  const createComponent = createComponentFactory({
    component: OrderConfirmationComponent,
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
