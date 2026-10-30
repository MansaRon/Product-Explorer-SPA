import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { FavouriteService } from './favourite.service';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { mockProvider } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';
import { User } from '../../models/user';
import { of } from 'rxjs';
import { fromPartial } from '@total-typescript/shoehorn';

const mockUser: User = fromPartial({
  id: 'user-123',
  accessToken: 'token-abc',
});

describe(FavouriteService.name, () => {
  let spectator: SpectatorService<FavouriteService>;

  const createService = createServiceFactory({
    service: FavouriteService,
    providers: [
      mockProvider(AuthService, {
        currentUser: signal<User | null>(null),
        isAuthenticated: signal(false),
      }),
      mockProvider(HttpClient, {
        get: jest.fn().mockReturnValue(of({ dataList: [] })),
        post: jest.fn().mockReturnValue(of({ data: null })),
        delete: jest.fn().mockReturnValue(of({})),
      }),
    ],
  });

  beforeEach(() => {
    spectator = createService();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should start with empty favourites', () => {
      expect(spectator.service.count()).toBe(0);
    });
  });

  describe('isFavorite', () => {
    it('should return false when wishlist is empty', () => {
      expect(spectator.service.isFavorite('product-1')).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('should not call API when user is not authenticated', () => {
      const http = spectator.inject(HttpClient);
      spectator.service.addFavorite('product-1');
      expect(http.post).not.toHaveBeenCalled();
    });

    it('should call POST /wishlist when user is authenticated', () => {
      const authService = spectator.inject(AuthService);
      const http = spectator.inject(HttpClient);
      (authService.currentUser as ReturnType<typeof signal<User | null>>).set(mockUser);

      spectator.service.addFavorite('product-1');

      expect(http.post).toHaveBeenCalledWith('/wishlist', {
        userID: mockUser.id,
        productID: 'product-1',
      });
    });

    it('should not call API for a duplicate', () => {
      const authService = spectator.inject(AuthService);
      const http = spectator.inject(HttpClient);
      (authService.currentUser as ReturnType<typeof signal<User | null>>).set(mockUser);

      spectator.service.addFavorite('product-1');
      spectator.service.addFavorite('product-1');

      expect(http.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeFavorite', () => {
    it('should not call API when user is not authenticated', () => {
      const http = spectator.inject(HttpClient);
      spectator.service.removeFavorite('product-1');
      expect(http.delete).not.toHaveBeenCalled();
    });

    it('should call DELETE /wishlist/{userId} when authenticated', () => {
      const authService = spectator.inject(AuthService);
      const http = spectator.inject(HttpClient);
      (authService.currentUser as ReturnType<typeof signal<User | null>>).set(mockUser);

      spectator.service.addFavorite('product-1');
      spectator.service.removeFavorite('product-1');

      expect(http.delete).toHaveBeenCalledWith(`/wishlist/${mockUser.id}`, {
        body: { userID: mockUser.id, productID: 'product-1' },
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should call addFavorite when product is not in wishlist', () => {
      const addSpy = jest.spyOn(spectator.service, 'addFavorite');
      spectator.service.toggleFavorite('product-1');
      expect(addSpy).toHaveBeenCalledWith('product-1');
    });

    it('should call removeFavorite when product is already in wishlist', () => {
      const authService = spectator.inject(AuthService);
      (authService.currentUser as ReturnType<typeof signal<User | null>>).set(mockUser);

      spectator.service.addFavorite('product-1');
      const removeSpy = jest.spyOn(spectator.service, 'removeFavorite');
      spectator.service.toggleFavorite('product-1');

      expect(removeSpy).toHaveBeenCalledWith('product-1');
    });
  });

  describe('clearAll', () => {
    it('should not call API when user is not authenticated', () => {
      const http = spectator.inject(HttpClient);
      spectator.service.clearAll();
      expect(http.delete).not.toHaveBeenCalled();
    });

    it('should reset count to 0', () => {
      spectator.service.clearAll();
      expect(spectator.service.count()).toBe(0);
    });
  });
});
