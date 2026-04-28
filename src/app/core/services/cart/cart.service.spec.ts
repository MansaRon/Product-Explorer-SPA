/* tslint:disable:no-unused-variable */
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { CartService } from './cart.service';
import { HttpClient } from '@angular/common/http';

describe.skip('Service: Cart', () => {
  let spectator: SpectatorService<CartService>;

    const createService = createServiceFactory({
      service: CartService,
      providers: [
        mockProvider(HttpClient),
      ]
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
