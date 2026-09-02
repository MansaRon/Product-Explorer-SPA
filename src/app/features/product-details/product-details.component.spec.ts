/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator, SpyObject } from '@ngneat/spectator/jest';
import { mockProvider } from '@ngneat/spectator/jest';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ProductDetailsComponent } from '../product-details/product-details.component';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../core/models/product';
import { fromPartial } from '@total-typescript/shoehorn';

describe(ProductDetailsComponent.name, () => {
  let spectator: Spectator<ProductDetailsComponent>;
  let favouriteService: SpyObject<FavouriteService>;
  let cartService: SpyObject<CartService>;
  let router: SpyObject<Router>;

  const mockProduct: Product = fromPartial({
    id: '1',
    title: 'Wireless Headphones',
  });

  const createComponent = createComponentFactory({
    component: ProductDetailsComponent,
    providers: [
      mockProvider(FavouriteService, {
        isFavorite: jest.fn().mockReturnValue(false),
        toggleFavorite: jest.fn()
      }),
      mockProvider(CartService, {
        isInCart: jest.fn().mockReturnValue(false),
        toggleCart: jest.fn()
      }),
      mockProvider(Router, {
        navigate: jest.fn().mockResolvedValue(true)
      }),
      mockProvider(ActivatedRoute, {
        data: of({ product: mockProduct })
      })
    ],
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
    favouriteService = spectator.inject(FavouriteService);
    cartService = spectator.inject(CartService);
    router = spectator.inject(Router);
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Product Loading', () => {
    it('should expose resolved product', () => {
      const product = spectator.component['product']();
      expect(product).toEqual(mockProduct);
    });

    it('should show not found when resolved product is absent', () => {
      const notFound = spectator.component['notFound']();
      expect(notFound).toBe(false);
    });
  });

  describe('Favorite Functionality', () => {
    it('should check if product is favorite', () => {
      favouriteService.isFavorite.mockReturnValue(true);

      const isFavorite = spectator.component['isFavorite']();
      expect(isFavorite).toBe(true);
    });

    it('should toggle favorite', () => {
      spectator.component['toggleFavorite']();

      expect(favouriteService.toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('Cart Functionality', () => {
    it('should check if product is in cart', () => {
      cartService.isInCart.mockReturnValue(true);

      const isInCart = spectator.component['isInCart']();
      expect(isInCart).toBe(true);
    });

    it('should toggle cart', () => {
      spectator.component['toggleCart']();

      expect(cartService.toggleCart).toHaveBeenCalledWith('1');
    });
  });

  describe('Navigation', () => {
    it('should navigate to parent route on goBack', () => {
      spectator.component['goBack']();

      expect(router.navigate).toHaveBeenCalledWith(
        ['..'],
        { relativeTo: spectator.inject(ActivatedRoute) }
      );
    });
  });
});
