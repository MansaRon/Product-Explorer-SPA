/* tslint:disable:no-unused-variable */
import { Router } from '@angular/router';
import { Spectator, createComponentFactory, mockProvider } from '@ngneat/spectator';
import { DeliveryComponent } from './delivery.component';

describe.skip('DeliveryComponent', () => {
  let spectator: Spectator<DeliveryComponent>;
  
  const createComponent = createComponentFactory({
    component: DeliveryComponent,
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
