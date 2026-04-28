/* tslint:disable:no-unused-variable */
import { CartComponent } from './cart.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';

describe.skip('CartComponent', () => {
  let spectator: Spectator<CartComponent>;

  const createComponent = createComponentFactory({
    component: CartComponent
  });

  beforeEach(() => {
    spectator = createComponent();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
