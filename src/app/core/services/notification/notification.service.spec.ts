import { NotificationService } from './notification.service';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator';

describe(NotificationService.name, () => {
  let spectator: SpectatorService<NotificationService>;

  const createService = createServiceFactory({
    service: NotificationService
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
