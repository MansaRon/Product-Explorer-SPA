/* tslint:disable:no-unused-variable */
import { Router } from '@angular/router';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { PaymentComponent } from './payment.component';

describe.skip('PaymentComponent', () => {
  let spectator: Spectator<PaymentComponent>;
  
  const createComponent = createComponentFactory({
    component: PaymentComponent,
    shallow: true,
    detectChanges: false,
    providers: [
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      }),
    ]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
