import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';
import { FavouritesComponent } from '../favourites/favourites.component';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { Product } from '../../core/models/product';
import { fromPartial } from '@total-typescript/shoehorn';

describe.skip(FavouritesComponent.name, () => {
  let spectator: Spectator<FavouritesComponent>;
  let favouriteService: SpyObject<FavouriteService>;

  const mockProducts: Product[] = fromPartial([
    { id: '1', title: 'Wireless Headphones' },
    { id: '2', title: 'Laptop Stand' },
  ]);

  const createComponent = createComponentFactory({
    component: FavouritesComponent,
    providers: [
      mockProvider(FavouriteService, {
        wishlistProducts: signal(mockProducts),
        count: signal(2),
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        clearAll: jest.fn(),
      }),
    ],
    shallow: true,
    detectChanges: false,
  });

  beforeEach(() => {
    spectator = createComponent();
    favouriteService = spectator.inject(FavouriteService);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Favorites Display', () => {
    it('should get favorite count from service', () => {
      expect(spectator.component['favoriteCount']()).toBe(2);
    });

    it('should expose wishlist products directly', () => {
      const products = spectator.component['favoriteProducts']();
      expect(products.length).toBe(2);
      expect(products[0].id).toBe('1');
      expect(products[1].id).toBe('2');
    });

    it('should compute hasFavorites as true when products exist', () => {
      expect(spectator.component['hasFavorites']()).toBe(true);
    });

    it('should compute hasFavorites as false when empty', () => {
      (favouriteService.count as ReturnType<typeof signal<number>>).set(0);
      expect(spectator.component['hasFavorites']()).toBe(false);
    });
  });

  describe('Favorite Actions', () => {
    it('should check if product is favourite', () => {
      favouriteService.isFavorite.mockReturnValue(true);
      expect(spectator.component['isFavorite']('1')).toBe(true);
      expect(favouriteService.isFavorite).toHaveBeenCalledWith('1');
    });

    it('should toggle favourite', () => {
      spectator.component['toggleFavorite']('1');
      expect(favouriteService.toggleFavorite).toHaveBeenCalledWith('1');
    });

    it('should clear all with confirmation', () => {
      global.confirm = jest.fn(() => true);
      spectator.component['clearAllFavorites']();
      expect(favouriteService.clearAll).toHaveBeenCalled();
    });

    it('should not clear if user cancels confirmation', () => {
      global.confirm = jest.fn(() => false);
      spectator.component['clearAllFavorites']();
      expect(favouriteService.clearAll).not.toHaveBeenCalled();
    });
  });
});
