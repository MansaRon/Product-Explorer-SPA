import { CacheService } from './cache.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe(CacheService.name, () => {
  let spectator: SpectatorService<CacheService>;

  const createService = createServiceFactory({
    service: CacheService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
