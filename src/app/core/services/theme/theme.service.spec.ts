/* tslint:disable:no-unused-variable */
import { ThemeService } from './theme.service';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';

describe('Service: Theme', () => {
  let spectator: SpectatorService<ThemeService>;

  const createService = createServiceFactory({
    service: ThemeService
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
