/* tslint:disable:no-unused-variable */
import { OrderComponent } from './order.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('OrderComponent', () => {
  let spectator: Spectator<OrderComponent>;
  
  const createComponent = createComponentFactory({
    component: OrderComponent,
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
