import { LoadingService } from './loading.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe(LoadingService.name, () => {
  let spectator: SpectatorService<LoadingService>;

  const createService = createServiceFactory({
    service: LoadingService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
