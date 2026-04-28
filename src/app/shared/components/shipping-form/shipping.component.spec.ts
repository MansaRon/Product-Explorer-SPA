/* tslint:disable:no-unused-variable */
import { ShippingDumbComponent } from './shipping.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('ShippingComponent', () => {
  let spectator: Spectator<ShippingDumbComponent>;
  
  const createComponent = createComponentFactory({
    component: ShippingDumbComponent,
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
