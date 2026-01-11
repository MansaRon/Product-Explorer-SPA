/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';
import { FavouritesComponent } from '../favourites/favourites.component';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { ProductService } from '../../core/services/product/product.service';
import { Product } from '../../core/models/product';

describe(FavouritesComponent.name, () => {
  let spectator: Spectator<FavouritesComponent>;
  let favouriteService: SpyObject<FavouriteService>;
  let productService: SpyObject<ProductService>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'High-quality headphones',
      price: 199.99,
      category: 'Electronics',
      imageUrl: 'headphones.jpg',
      rating: 4.5,
      stock: 10
    },
    {
      id: '2',
      name: 'Laptop Stand',
      description: 'Ergonomic stand',
      price: 49.99,
      category: 'Accessories',
      imageUrl: 'stand.jpg',
      rating: 4.3,
      stock: 25
    }
  ];

  const createComponent = createComponentFactory({
    component: FavouritesComponent,
    providers: [
      mockProvider(FavouriteService, {
        favouritesId: signal(['1', '2']),
        count: signal(2),
        isFavorite: jest.fn().mockReturnValue(true),
        toggleFavorite: jest.fn(),
        clearAll: jest.fn()
      }),
      mockProvider(ProductService, {
        getProductById: jest.fn((id: string) => mockProducts.find(p => p.id === id))
      })
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
    favouriteService = spectator.inject(FavouriteService);
    productService = spectator.inject(ProductService);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Favorites Display', () => {
    it('should get favorite IDs from service', () => {
      expect(spectator.component['favoriteIds']()).toEqual(['1', '2']);
    });

    it('should get favorite count from service', () => {
      expect(spectator.component['favoriteCount']()).toBe(2);
    });

    it('should compute favorite products', () => {
      const favoriteProducts = spectator.component['favoriteProducts']();
      
      expect(favoriteProducts.length).toBe(2);
      expect(favoriteProducts[0].id).toBe('1');
      expect(favoriteProducts[1].id).toBe('2');
    });

    it('should filter out undefined products', () => {
      productService.getProductById.mockReturnValue(undefined);
      
      const favoriteProducts = spectator.component['favoriteProducts']();
      
      expect(favoriteProducts.length).toBe(0);
    });

    it('should compute hasFavorites as true when favorites exist', () => {
      expect(spectator.component['hasFavorites']()).toBe(true);
    });
  });

  describe('Favorite Actions', () => {
    it('should check if product is favorite', () => {
      favouriteService.isFavorite.mockReturnValue(true);
      
      const result = spectator.component['isFavorite']('1');
      
      expect(result).toBe(true);
      expect(favouriteService.isFavorite).toHaveBeenCalledWith('1');
    });

    it('should toggle favorite', () => {
      spectator.component['toggleFavorite']('1');
      
      expect(favouriteService.toggleFavorite).toHaveBeenCalledWith('1');
    });

    it('should clear all favorites with confirmation', () => {
      global.confirm = jest.fn(() => true);
      
      spectator.component['clearAllFavorites']();
      
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to remove all favorites?');
      expect(favouriteService.clearAll).toHaveBeenCalled();
    });

    it('should not clear favorites if user cancels', () => {
      global.confirm = jest.fn(() => false);
      
      spectator.component['clearAllFavorites']();
      
      expect(favouriteService.clearAll).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should hide when favorites exist', () => {
      expect(spectator.component['hasFavorites']()).toBe(true);
    });
  });
});