/* tslint:disable:no-unused-variable */
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { CartService } from './cart.service';

describe('Service: Cart', () => {
  let spectator: SpectatorService<CartService>;

    const createService = createServiceFactory({
      service: CartService
    });
  
    beforeEach(() => {
      localStorage.clear();
      spectator = createService();
      jest.clearAllMocks();
    });
  
    afterEach(() => {
      localStorage.clear();
    });
  
    it('should be created', () => {
      expect(spectator.service).toBeTruthy();
    });
});
