/* tslint:disable:no-unused-variable */

import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { FavouriteService } from './favourite.service';

describe(FavouriteService.name, () => {
  let spectator: SpectatorService<FavouriteService>;

  const createService = createServiceFactory({
    service: FavouriteService
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

  describe('Initialization', () => {
    it('should start with empty favorites', () => {
      expect(spectator.service.count()).toBe(0);
    });
  });

  describe('addFavorite', () => {
    it('should add product to favorites', () => {
      spectator.service.addFavorite('1');
      
      expect(spectator.service.isFavorite('1')).toBe(true);
      expect(spectator.service.count()).toBe(1);
    });

    it('should not add duplicate favorites', () => {
      spectator.service.addFavorite('1');
      spectator.service.addFavorite('1');
      
      expect(spectator.service.count()).toBe(1);
    });

    it('should persist to localStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.addFavorite('1');
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'product-fav-key',
        JSON.stringify(['1'])
      );
    });
  });

  describe('removeFavorite', () => {
    beforeEach(() => {
      spectator.service.addFavorite('1');
      spectator.service.addFavorite('2');
    });

    it('should remove product from favorites', () => {
      spectator.service.removeFavorite('1');
      
      expect(spectator.service.isFavorite('1')).toBe(false);
      expect(spectator.service.count()).toBe(1);
    });

    it('should persist to localStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.removeFavorite('1');
      
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  describe('toggleFavorite', () => {
    it('should add when not present', () => {
      spectator.service.toggleFavorite('1');
      
      expect(spectator.service.isFavorite('1')).toBe(true);
    });

    it('should remove when present', () => {
      spectator.service.addFavorite('1');
      spectator.service.toggleFavorite('1');
      
      expect(spectator.service.isFavorite('1')).toBe(false);
    });
  });

  describe('clearAll', () => {
    beforeEach(() => {
      spectator.service.addFavorite('1');
      spectator.service.addFavorite('2');
    });

    it('should clear all favorites', () => {
      spectator.service.clearAll();
      
      expect(spectator.service.count()).toBe(0);
    });

    it('should persist empty state to localStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      spectator.service.clearAll();
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'product-fav-key',
        JSON.stringify([])
      );
    });
  });

  describe('isFavorite', () => {
    beforeEach(() => {
      spectator.service.addFavorite('1');
    });

    it('should return true for favorite product', () => {
      expect(spectator.service.isFavorite('1')).toBe(true);
    });

    it('should return false for non-favorite product', () => {
      expect(spectator.service.isFavorite('999')).toBe(false);
    });
  });

  describe('favouritesId', () => {
    it('should return array of favorite IDs', () => {
      spectator.service.addFavorite('1');
      spectator.service.addFavorite('2');
      
      const ids = spectator.service.favouritesId();
      
      expect(ids).toEqual(expect.arrayContaining(['1', '2']));
      expect(ids.length).toBe(2);
    });

    it('should return empty array when no favorites', () => {
      const ids = spectator.service.favouritesId();
      
      expect(ids).toEqual([]);
    });
  });
});