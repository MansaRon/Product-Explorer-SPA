import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
  SpyObject,
} from '@ngneat/spectator/jest';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../../models/user';
import { fromPartial } from '@total-typescript/shoehorn';

describe(AuthService.name, () => {
  let spectator: SpectatorService<AuthService>;
  let router: SpyObject<Router>;
  let http: SpyObject<HttpClient>;

  const mockUser: User = fromPartial({
    id: '1',
    name: 'Jane Doe',
    email: 'jane@test.com',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    roles: ['USER'],
  });

  const mockAdminUser: User = fromPartial({ ...mockUser, roles: ['USER', 'ADMIN'] });

  const createService = createServiceFactory({
    service: AuthService,
    providers: [
      mockProvider(Router, { navigate: jest.fn().mockResolvedValue(true) }),
      mockProvider(HttpClient, { post: jest.fn() }),
    ],
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    spectator = createService();
    router = spectator.inject(Router);
    http = spectator.inject(HttpClient);
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should start unauthenticated when storage is empty', () => {
      expect(spectator.service.isAuthenticated()).toBe(false);
      expect(spectator.service.isAdmin()).toBe(false);
    });
  });

  describe('login', () => {
    it('should set currentUser and return the user', () => {
      http.post.mockReturnValue(of({ data: mockUser }));
      spectator.service.login({ email: 'jane@test.com', password: 'pass' }).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
      expect(spectator.service.isAuthenticated()).toBe(true);
      expect(spectator.service.currentUser()).toEqual(mockUser);
    });

    it('should set isAdmin true when user has ADMIN role', () => {
      http.post.mockReturnValue(of({ data: mockAdminUser }));
      spectator.service.login({ email: 'admin@test.com', password: 'pass' }).subscribe();
      expect(spectator.service.isAdmin()).toBe(true);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      http.post.mockReturnValue(of({ data: mockUser }));
      spectator.service.login({ email: 'jane@test.com', password: 'pass' }).subscribe();
    });

    it('should clear the current user', () => {
      spectator.service.logout();
      expect(spectator.service.isAuthenticated()).toBe(false);
      expect(spectator.service.currentUser()).toBeNull();
    });
  });

  describe('logoutAndRedirect', () => {
    it('should logout and navigate to /login', () => {
      spectator.service.logoutAndRedirect();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      expect(spectator.service.getAccessToken()).toBeNull();
    });

    it('should return access token when authenticated', () => {
      http.post.mockReturnValue(of({ data: mockUser }));
      spectator.service.login({ email: 'jane@test.com', password: 'pass' }).subscribe();
      expect(spectator.service.getAccessToken()).toBe('access-token');
    });
  });

  describe('toggleAdmin', () => {
    it('should toggle dev admin override', () => {
      expect(spectator.service.isAdmin()).toBe(false);
      spectator.service.toggleAdmin();
      expect(spectator.service.isAdmin()).toBe(true);
      spectator.service.toggleAdmin();
      expect(spectator.service.isAdmin()).toBe(false);
    });
  });
});
