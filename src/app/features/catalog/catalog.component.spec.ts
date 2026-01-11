/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { signal } from '@angular/core';
import { CatalogComponent } from '../catalog/catalog.component';
import { ProductService } from '../../core/services/product/product.service';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { Product } from '../../core/models/product';

describe(CatalogComponent.name, () => {
  let spectator: Spectator<CatalogComponent>;
  let productService: SpyObject<ProductService>;
  let favouriteService: SpyObject<FavouriteService>;

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
    component: CatalogComponent,
    providers: [
      mockProvider(ProductService, {
        filterProducts: signal(mockProducts),
        categories: signal(['Electronics', 'Accessories']),
        loading: signal(false),
        error: signal(null),
        filterParams: signal({
          searchTerm: '',
          category: '',
          minPrice: 0,
          maxPrice: Number.MAX_SAFE_INTEGER,
          sortBy: 'name',
          sortOrder: 'asc'
        }),
        updateSearchTerm: jest.fn(),
        updateCategory: jest.fn(),
        updateSort: jest.fn(),
        resetFilters: jest.fn(),
        retryLoad: jest.fn()
      }),
      mockProvider(FavouriteService, {
        isFavorite: jest.fn().mockReturnValue(false),
        toggleFavorite: jest.fn()
      })
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
    productService = spectator.inject(ProductService);
    favouriteService = spectator.inject(FavouriteService);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty search term', () => {
      expect(spectator.component['searchTerm']()).toBe('');
    });

    it('should initialize with empty category', () => {
      expect(spectator.component['selectedCategory']()).toBe('');
    });

    it('should initialize with default sort', () => {
      expect(spectator.component['selectedSort']()).toBe('name');
      expect(spectator.component['selectedOrder']()).toBe('asc');
    });
  });

  describe('Search Functionality', () => {
    it('should update search term when input changes', () => {
      spectator.component['onSearchChange']('headphones');
      
      expect(spectator.component['searchTerm']()).toBe('headphones');
      expect(productService.updateSearchTerm).toHaveBeenCalledWith('headphones');
    });

    it('should clear search term when empty string', () => {
      spectator.component['onSearchChange']('test');
      spectator.component['onSearchChange']('');
      
      expect(spectator.component['searchTerm']()).toBe('');
      expect(productService.updateSearchTerm).toHaveBeenCalledWith('');
    });
  });

  describe('Category Filtering', () => {
    it('should update category when selection changes', () => {
      spectator.component['onCategoryChange']('Electronics');
      
      expect(spectator.component['selectedCategory']()).toBe('Electronics');
      expect(productService.updateCategory).toHaveBeenCalledWith('Electronics');
    });

    it('should handle empty category selection', () => {
      spectator.component['onCategoryChange']('');
      
      expect(spectator.component['selectedCategory']()).toBe('');
      expect(productService.updateCategory).toHaveBeenCalledWith('');
    });
  });

  describe('Sorting', () => {
    it('should update sort field', () => {
      spectator.component['onSortChange']('price');
      
      expect(spectator.component['selectedSort']()).toBe('price');
      expect(productService.updateSort).toHaveBeenCalledWith('price', 'asc');
    });

    it('should update sort order', () => {
      spectator.component['onOrderChange']('desc');
      
      expect(spectator.component['selectedOrder']()).toBe('desc');
      expect(productService.updateSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should update both sort field and order', () => {
      spectator.component['onSortChange']('rating');
      spectator.component['onOrderChange']('desc');
      
      expect(spectator.component['selectedSort']()).toBe('rating');
      expect(spectator.component['selectedOrder']()).toBe('desc');
      expect(productService.updateSort).toHaveBeenCalledWith('rating', 'desc');
    });
  });

  describe('Reset Filters', () => {
    it('should reset all filters', () => {
      spectator.component['onSearchChange']('test');
      spectator.component['onCategoryChange']('Electronics');
      spectator.component['onSortChange']('price');
      spectator.component['onOrderChange']('desc');
      
      spectator.component['resetFilters']();
      
      expect(spectator.component['searchTerm']()).toBe('');
      expect(spectator.component['selectedCategory']()).toBe('');
      expect(spectator.component['selectedSort']()).toBe('name');
      expect(spectator.component['selectedOrder']()).toBe('asc');
      expect(productService.resetFilters).toHaveBeenCalled();
    });
  });

  describe('Favorites', () => {
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
  });

  describe('Error Handling', () => {
    it('should handle retry on error', () => {
      spectator.component['handleRetry']();
      
      expect(productService.retryLoad).toHaveBeenCalled();
    });
  });

  describe('Data Display', () => {
    it('should display products from service', () => {
      expect(spectator.component['products']()).toEqual(mockProducts);
    });

    it('should display categories from service', () => {
      expect(spectator.component['categories']()).toEqual(['Electronics', 'Accessories']);
    });

    it('should display loading state from service', () => {
      expect(spectator.component['loading']()).toBe(false);
    });

    it('should display error state from service', () => {
      expect(spectator.component['error']()).toBeNull();
    });
  });
});
