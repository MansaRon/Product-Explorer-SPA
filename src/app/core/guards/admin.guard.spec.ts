import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { createServiceFactory, mockProvider, SpectatorService, SpyObject } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';

describe('adminGuard', () => {
  let spectator: SpectatorService<AuthService>;
  let mockRouter: SpyObject<Router>;
  let mockAuthService: SpyObject<AuthService>;
  let isAdminSignal = signal(false);

  const createService = createServiceFactory({
    service: AuthService,
    providers: [
      mockProvider(Router),
      mockProvider(AuthService, {
        isAdmin: jest.fn().mockReturnValue(true)
      })
    ]
  });

  beforeEach(() => {
    sessionStorage.clear();
    spectator = createService();
    mockRouter = spectator.inject(Router);
    mockAuthService = spectator.inject(AuthService);

    isAdminSignal = signal(false);
    Object.defineProperty(mockAuthService, 'isAdmin', {
      value: isAdminSignal,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});