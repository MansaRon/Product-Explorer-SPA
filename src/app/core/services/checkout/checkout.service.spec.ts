/* tslint:disable:no-unused-variable */
import { CheckoutService } from './checkout.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe(CheckoutService.name, () => {
  let spectator: SpectatorService<CheckoutService>;

  const createService = createServiceFactory({
    service: CheckoutService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
