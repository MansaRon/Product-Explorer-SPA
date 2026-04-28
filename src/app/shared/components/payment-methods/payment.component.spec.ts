/* tslint:disable:no-unused-variable */
import { PaymentMethodComponent } from './payment.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('PaymentComponent', () => {
  let spectator: Spectator<PaymentMethodComponent>;
  
  const createComponent = createComponentFactory({
    component: PaymentMethodComponent,
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
