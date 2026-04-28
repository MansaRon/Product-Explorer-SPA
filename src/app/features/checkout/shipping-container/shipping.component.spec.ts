/* tslint:disable:no-unused-variable */
import { ShippingComponent } from './shipping.component';
import { Router } from '@angular/router';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';

describe.skip('ShippingComponent', () => {
  let spectator: Spectator<ShippingComponent>;
  
  const createComponent = createComponentFactory({
    component: ShippingComponent,
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
