/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';
import { AdminComponent } from '../admin/admin.component';
import { ProductService } from '../../core/services/product/product.service';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Product } from '../../core/models/product';

describe(AdminComponent.name, () => {
  let spectator: Spectator<AdminComponent>;
  let productService: SpyObject<ProductService>;
  let favouriteService: SpyObject<FavouriteService>;
  let authService: SpyObject<AuthService>;

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
      rating: 4.8,
      stock: 5
    },
    {
      id: '3',
      name: 'USB-C Hub',
      description: '7-in-1 hub',
      price: 59.99,
      category: 'Electronics',
      imageUrl: 'hub.jpg',
      rating: 4.2,
      stock: 0
    }
  ];

  const createComponent = createComponentFactory({
    component: AdminComponent,
    providers: [
      mockProvider(ProductService, {
        filterProducts: signal(mockProducts),
        categories: signal(['Electronics', 'Accessories'])
      }),
      mockProvider(FavouriteService, {
        count: signal(5)
      }),
      mockProvider(AuthService, {
        isAdmin: signal(true),
        toggleAdmin: jest.fn(),
        logoutAndRedirect: jest.fn().mockResolvedValue(undefined)
      })
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
    productService = spectator.inject(ProductService);
    favouriteService = spectator.inject(FavouriteService);
    authService = spectator.inject(AuthService);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Admin Status', () => {
    it('should get admin status from auth service', () => {
      expect(spectator.component['isAdmin']()).toBe(true);
    });
  });

  describe('Statistics Computation', () => {
    it('should compute total products', () => {
      const stats = spectator.component['stats']();
      expect(stats.totalProducts).toBe(3);
    });

    it('should compute total inventory value', () => {
      const stats = spectator.component['stats']();
      const expectedValue = (199.99 * 10) + (49.99 * 5) + (59.99 * 0);
      expect(stats.totalValue).toBeCloseTo(expectedValue, 2);
    });

    it('should compute low stock count', () => {
      const stats = spectator.component['stats']();
      expect(stats.lowStock).toBe(1);
    });

    it('should compute out of stock count', () => {
      const stats = spectator.component['stats']();
      expect(stats.outOfStock).toBe(1);
    });

    it('should compute average rating', () => {
      const stats = spectator.component['stats']();
      const expectedAvg = (4.5 + 4.8 + 4.2) / 3;
      expect(stats.avgRating).toBeCloseTo(expectedAvg, 2);
    });

    it('should compute total categories', () => {
      const stats = spectator.component['stats']();
      expect(stats.totalCategories).toBe(2);
    });

    it('should get total favorites', () => {
      const stats = spectator.component['stats']();
      expect(stats.totalFavorites).toBe(5);
    });
  });

  describe('Top Rated Products', () => {
    it('should compute top 5 rated products', () => {
      const topRated = spectator.component['topRatedProducts']();
      
      expect(topRated.length).toBeLessThanOrEqual(5);
    });

    it('should sort products by rating descending', () => {
      const topRated = spectator.component['topRatedProducts']();
      
      expect(topRated[0].rating).toBe(4.8);
      expect(topRated[1].rating).toBe(4.5);
      expect(topRated[2].rating).toBe(4.2);
    });
  });

  describe('Category Statistics', () => {
    it('should compute category stats', () => {
      const categoryStats = spectator.component['categoryStats']();
      
      expect(categoryStats.length).toBe(2);
    });

    it('should count products per category', () => {
      const categoryStats = spectator.component['categoryStats']();
      const electronicsStats = categoryStats.find(s => s.category === 'Electronics');
      const accessoriesStats = categoryStats.find(s => s.category === 'Accessories');
      
      expect(electronicsStats?.count).toBe(2);
      expect(accessoriesStats?.count).toBe(1);
    });

    it('should compute total value per category', () => {
      const categoryStats = spectator.component['categoryStats']();
      const electronicsStats = categoryStats.find(s => s.category === 'Electronics');
      
      const expectedValue = (199.99 * 10) + (59.99 * 0);
      expect(electronicsStats?.totalValue).toBeCloseTo(expectedValue, 2);
    });
  });

  describe('Admin Actions', () => {
    it('should toggle admin access', () => {
      spectator.component['toggleAdminAccess']();
      
      expect(authService.toggleAdmin).toHaveBeenCalled();
    });

    it('should logout and redirect', async () => {
      await spectator.component['logout']();
      
      expect(authService.logoutAndRedirect).toHaveBeenCalled();
    });
  });

  describe('Data Sources', () => {
    it('should get products from product service', () => {
      expect(spectator.component['products']()).toEqual(mockProducts);
    });

    it('should get categories from product service', () => {
      expect(spectator.component['categories']()).toEqual(['Electronics', 'Accessories']);
    });

    it('should get favorite count from favourite service', () => {
      expect(spectator.component['favoriteCount']()).toBe(5);
    });
  });
});