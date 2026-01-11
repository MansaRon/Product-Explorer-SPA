/* tslint:disable:no-unused-variable */

import { ProductService } from './product.service';
import { createHttpFactory, HttpMethod, mockProvider, SpectatorHttp } from '@ngneat/spectator/jest';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/product';
import { DestroyRef } from '@angular/core';

describe('Service: Product', () => {
  let spectator: SpectatorHttp<ProductService>;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      category: 'Electronics',
      imageUrl: 'headphones.jpg',
      rating: 4.5,
      stock: 10
    },
    {
      id: '2',
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand',
      price: 49.99,
      category: 'Accessories',
      imageUrl: 'stand.jpg',
      rating: 4.3,
      stock: 25
    }
  ];

  const createHttp = createHttpFactory({
    service: ProductService,
    providers: [
      mockProvider(HttpClient),
      {
        provide: DestroyRef,
        useValue: {
          onDestroy: jest.fn()
        }
      }
    ]
  });

  beforeEach(() => {
    spectator = createHttp();
  });

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });

  describe('loadProducts', () => {
    it('should call HttpClient.get on initialization', () => {
      const url = '/assets/data/products.json';
      spectator.expectOne(url, HttpMethod.GET);
    });

    it('should set loading state to true initially', () => {
      expect(spectator.service.loading()).toBe(true);
    });
  });

  describe('getProductsById', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should return product when id exists', () => {
      const product = spectator.service.getProductById('1');
      
      expect(product).toBeDefined();
      expect(product?.name).toBe('Wireless Headphones');
    });

    it('should return undefined when id does not exist', () => {
      const product = spectator.service.getProductById('999');
      
      expect(product).toBeUndefined();
    });
  });

  describe('updateSearchTerm', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should filter products by search term', () => {
      spectator.service.updateSearchTerm('Headphones');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Wireless Headphones');
    });

    it('should be case-insensitive', () => {
      spectator.service.updateSearchTerm('WIRELESS');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Wireless Headphones');
    });

    it('should return all products when search term is empty', () => {
      spectator.service.updateSearchTerm('');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(mockProducts.length);
    });

    it('should search in product description', () => {
      spectator.service.updateSearchTerm('aluminum');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Laptop Stand');
    });
  });

  describe('updateCategory', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should filter products by category', () => {
      spectator.service.updateCategory('Electronics');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(2);
      expect(filtered.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should return all products when category is empty', () => {
      spectator.service.updateCategory('');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(mockProducts.length);
    });
  });

  describe('updatePriceRange', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should filter products within price range', () => {
      spectator.service.updatePriceRange(50, 100);
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('USB-C Hub');
    });

    it('should include products at exact boundaries', () => {
      spectator.service.updatePriceRange(49.99, 59.99);
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(2);
    });
  });

  describe('updateSort', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should sort products by name ascending', () => {
      spectator.service.updateSort('name', 'asc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].name).toBe('Laptop Stand');
      expect(sorted[sorted.length - 1].name).toBe('Wireless Headphones');
    });

    it('should sort products by name descending', () => {
      spectator.service.updateSort('name', 'desc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].name).toBe('Wireless Headphones');
      expect(sorted[sorted.length - 1].name).toBe('Laptop Stand');
    });

    it('should sort products by price ascending', () => {
      spectator.service.updateSort('price', 'asc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].price).toBe(49.99);
      expect(sorted[sorted.length - 1].price).toBe(199.99);
    });

    it('should sort products by price descending', () => {
      spectator.service.updateSort('price', 'desc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].price).toBe(199.99);
      expect(sorted[sorted.length - 1].price).toBe(49.99);
    });

    it('should sort products by rating ascending', () => {
      spectator.service.updateSort('rating', 'asc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].rating).toBe(4.2);
      expect(sorted[sorted.length - 1].rating).toBe(4.8);
    });

    it('should sort products by rating descending', () => {
      spectator.service.updateSort('rating', 'desc');
      
      const sorted = spectator.service.filterProducts();
      expect(sorted[0].rating).toBe(4.8);
      expect(sorted[sorted.length - 1].rating).toBe(4.2);
    });
  });

  describe('resetFilters', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should reset all filters to initial state', () => {
      spectator.service.updateSearchTerm('test');
      spectator.service.updateCategory('Electronics');
      spectator.service.updatePriceRange(50, 100);
      spectator.service.updateSort('price', 'desc');
      
      spectator.service.resetFilters();
      
      const params = spectator.service.filterParams();
      expect(params.searchTerm).toBe('');
      expect(params.category).toBe('');
      expect(params.minPrice).toBe(0);
      expect(params.maxPrice).toBe(Number.MAX_SAFE_INTEGER);
      expect(params.sortBy).toBe('name');
      expect(params.sortOrder).toBe('asc');
    });

    it('should return all products after reset', () => {
      spectator.service.updateSearchTerm('Headphones');
      spectator.service.resetFilters();
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(mockProducts.length);
    });
  });

  describe('categories', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should return unique categories', () => {
      const categories = spectator.service.categories();
      
      expect(categories).toContain('Electronics');
      expect(categories).toContain('Accessories');
      expect(categories.length).toBe(2);
    });

    it('should return sorted categories', () => {
      const categories = spectator.service.categories();
      
      expect(categories[0]).toBe('Accessories');
      expect(categories[1]).toBe('Electronics');
    });
  });

  describe('retryLoad', () => {
    it('should make new HTTP request', () => {
      const req1 = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req1.flush('Error', { status: 500, statusText: 'Server Error' });

      spectator.service.retryLoad();

      spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
    });
  });

  describe('Combined Filtering', () => {
    beforeEach((done) => {
      const req = spectator.expectOne('/assets/data/products.json', HttpMethod.GET);
      req.flush(mockProducts);
      setTimeout(() => done(), 1000);
    });

    it('should apply search and category filters together', () => {
      spectator.service.updateSearchTerm('USB');
      spectator.service.updateCategory('Accessories');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('USB-C Hub');
    });

    it('should apply all filters and sorting together', () => {
      spectator.service.updateCategory('Electronics');
      spectator.service.updatePriceRange(100, 200);
      spectator.service.updateSort('price', 'desc');
      
      const filtered = spectator.service.filterProducts();
      expect(filtered.length).toBe(2);
      expect(filtered[0].price).toBe(199.99);
      expect(filtered[1].price).toBe(129.99);
    });
  });
});
