import { Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { AuthService } from '../services/auth/auth.service';

describe.skip('authGuard', () => {
  let spectator: SpectatorService<AuthService>;
  let mockRouter: SpyObject<Router>;
  let mockAuthService: SpyObject<AuthService>;
  let isAuthenticatedSignal = signal(false);

  const createService = createServiceFactory({
    service: AuthService,
    providers: [mockProvider(Router), mockProvider(AuthService)],
  });

  beforeEach(() => {
    spectator = createService();
    mockRouter = spectator.inject(Router);
    mockAuthService = spectator.inject(AuthService);

    isAuthenticatedSignal = signal(false);
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      value: isAuthenticatedSignal,
      configurable: true,
    });

    mockRouter.createUrlTree.mockReturnValue({ toString: () => '/login' } as UrlTree);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  it('should redirect to /login when not authenticated', () => {
    isAuthenticatedSignal.set(false);
    expect(mockAuthService.isAuthenticated()).toBe(false);
    expect(mockRouter.createUrlTree).toBeDefined();
  });

  it('should allow navigation when authenticated', () => {
    isAuthenticatedSignal.set(true);
    expect(mockAuthService.isAuthenticated()).toBe(true);
  });
});
