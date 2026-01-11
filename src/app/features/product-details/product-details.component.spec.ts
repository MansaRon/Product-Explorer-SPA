/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { ProductService } from '../../core/services/product/product.service';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { Product } from '../../core/models/product';

describe(ProductDetailsComponent.name, () => {
  let spectator: Spectator<ProductDetailsComponent>;
  let productService: SpyObject<ProductService>;
  let favouriteService: SpyObject<FavouriteService>;
  let router: SpyObject<Router>;

  const mockProduct: Product = {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones',
    price: 199.99,
    category: 'Electronics',
    imageUrl: 'headphones.jpg',
    rating: 4.5,
    stock: 10
  };

  const createComponent = createComponentFactory({
    component: ProductDetailsComponent,
    providers: [
      mockProvider(ProductService, {
        getProductById: jest.fn().mockReturnValue(mockProduct)
      }),
      mockProvider(FavouriteService, {
        isFavorite: jest.fn().mockReturnValue(false),
        toggleFavorite: jest.fn()
      }),
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      }),
      mockProvider(ActivatedRoute, {
        paramMap: of(new Map([['id', '1']]))
      })
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
    productService = spectator.inject(ProductService);
    favouriteService = spectator.inject(FavouriteService);
    router = spectator.inject(Router);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Product Loading', () => {
    it('should display product when found', () => {
      const product = spectator.component['product']();
      expect(product).toEqual(mockProduct);
    });

    it('should show not found when product does not exist', () => {
      productService.getProductById.mockReturnValue(undefined);
      
      const notFound = spectator.component['notFound']();
      expect(notFound).toBe(true);
    });
  });

  describe('Favorite Functionality', () => {
    it('should check if product is favorite', () => {
      favouriteService.isFavorite.mockReturnValue(true);
      
      const isFavorite = spectator.component['isFavorite']();
      expect(isFavorite).toBe(true);
    });

    it('should toggle favorite when button clicked', () => {
      spectator.component['toggleFavorite']();
      
      expect(favouriteService.toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to catalog', () => {
      spectator.component['goBack']();
      
      expect(router.navigate).toHaveBeenCalledWith(['/catalog']);
    });
  });

  describe('Product Display', () => {
    it('should compute isFavorite status', () => {
      favouriteService.isFavorite.mockReturnValue(true);
      
      const isFavorite = spectator.component['isFavorite']();
      expect(isFavorite).toBe(true);
    });

    it('should compute notFound status', () => {
      productService.getProductById.mockReturnValue(undefined);
      
      const notFound = spectator.component['notFound']();
      expect(notFound).toBe(true);
    });
  });
});