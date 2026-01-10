/* tslint:disable:no-unused-variable */

import { createServiceFactory, SpectatorService, SpyObject } from '@ngneat/spectator/jest';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { mockProvider } from '@ngneat/spectator/jest';

describe(AuthService.name, () => {
  let spectator: SpectatorService<AuthService>;
  let router: SpyObject<Router>;

  const createService = createServiceFactory({
    service: AuthService,
    providers: [
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      })
    ]
  });

  beforeEach(() => {
    sessionStorage.clear();
    spectator = createService();
    router = spectator.inject(Router);
    jest.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should start as not admin', () => {
      expect(spectator.service.isAdmin()).toBe(false);
      expect(spectator.service.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should set admin status to true', () => {
      spectator.service.login();
      
      expect(spectator.service.isAdmin()).toBe(true);
      expect(spectator.service.isAuthenticated()).toBe(true);
    });

    it('should persist to sessionStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.login();
      
      expect(setItemSpy).toHaveBeenCalledWith('isAdmin', 'true');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      spectator.service.login();
    });

    it('should set admin status to false', () => {
      spectator.service.logout();
      
      expect(spectator.service.isAdmin()).toBe(false);
      expect(spectator.service.isAuthenticated()).toBe(false);
    });

    it('should persist to sessionStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.logout();
      
      expect(setItemSpy).toHaveBeenCalledWith('isAdmin', 'false');
    });
  });

  describe('toggleAdmin', () => {
    it('should toggle from false to true', () => {
      spectator.service.toggleAdmin();
      
      expect(spectator.service.isAdmin()).toBe(true);
    });

    it('should toggle from true to false', () => {
      spectator.service.login();
      spectator.service.toggleAdmin();
      
      expect(spectator.service.isAdmin()).toBe(false);
    });

    it('should persist each toggle', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.toggleAdmin();
      expect(setItemSpy).toHaveBeenLastCalledWith('isAdmin', 'true');
      
      spectator.service.toggleAdmin();
      expect(setItemSpy).toHaveBeenLastCalledWith('isAdmin', 'false');
    });
  });

  describe('logoutAndRedirect', () => {
    beforeEach(() => {
      spectator.service.login();
    });

    it('should logout and navigate to catalog', async () => {
      await spectator.service.logoutAndRedirect();
      
      expect(spectator.service.isAdmin()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/catalog']);
    });
  });
});
