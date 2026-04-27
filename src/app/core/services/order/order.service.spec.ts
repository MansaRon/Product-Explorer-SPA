/* tslint:disable:no-unused-variable */
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';
import { OrderService } from './order.service';

describe(OrderService.name, () => {
  let spectator: SpectatorService<OrderService>;

  const createService = createServiceFactory({
    service: OrderService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
