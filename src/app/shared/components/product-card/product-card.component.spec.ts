/* tslint:disable:no-unused-variable */
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product';

describe(ProductCardComponent.name, () => {
  let spectator: Spectator<ProductCardComponent>;
  
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test description for the product',
    price: 99.99,
    category: 'Electronics',
    imageUrl: 'test.jpg',
    rating: 4.5,
    stock: 10
  };

  const createComponent = createComponentFactory({
    component: ProductCardComponent,
    shallow: true,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        product: mockProduct,
        isFavorite: false
      }
    });
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  describe('Product Display', () => {
    it('should display product name', () => {
      expect(spectator.query('.product-name')).toHaveText('Test Product');
    });

    it('should display product price', () => {
      const priceElement = spectator.query('.price-value');
      expect(priceElement?.textContent).toContain('99.99');
    });

    it('should display product category', () => {
      expect(spectator.query('.product-category')).toHaveText('Electronics');
    });

    it('should display product rating', () => {
      const ratingElement = spectator.query('.product-rating');
      expect(ratingElement?.textContent).toContain('4.5');
    });

    it('should display product description', () => {
      expect(spectator.query('.product-description')).toHaveText('Test description for the product');
    });
  });

  describe('Stock Status', () => {
    it('should show "In stock" when stock >= 10', () => {
      expect(spectator.query('.product-stock')).toHaveText('In stock');
    });

    it('should show "Only X left" when stock < 10', () => {
      spectator.setInput('product', { ...mockProduct, stock: 5 });
      expect(spectator.query('.product-stock')).toHaveText('Only 5 left');
    });

    it('should show "Out of stock" when stock = 0', () => {
      spectator.setInput('product', { ...mockProduct, stock: 0 });
      expect(spectator.query('.product-stock')).toHaveText('Out of stock');
    });

    it('should apply low stock class when stock < 10', () => {
      spectator.setInput('product', { ...mockProduct, stock: 5 });
      expect(spectator.query('.product-stock')).toHaveClass('product-stock--low');
    });

    it('should apply out of stock class when stock = 0', () => {
      spectator.setInput('product', { ...mockProduct, stock: 0 });
      expect(spectator.query('.product-stock')).toHaveClass('product-stock--out');
    });
  });

  describe('Favorite Button', () => {
    it('should emit favoriteToggled when clicked', () => {
      let emittedId: string | undefined;
      spectator.output('favoriteToggled').subscribe((id: string) => emittedId = id);
      
      spectator.click('.favorite-button');
      
      expect(emittedId).toBe('1');
    });

    it('should apply active class when isFavorite is true', () => {
      spectator.setInput('isFavorite', true);
      expect(spectator.query('.favorite-button')).toHaveClass('favorite-button--active');
    });

    it('should not apply active class when isFavorite is false', () => {
      spectator.setInput('isFavorite', false);
      expect(spectator.query('.favorite-button')).not.toHaveClass('favorite-button--active');
    });

    it('should have correct aria-label when not favorite', () => {
      spectator.setInput('isFavorite', false);
      const button = spectator.query('.favorite-button');
      expect(button?.getAttribute('aria-label')).toBe('Add Test Product to favorites');
    });

    it('should have correct aria-label when favorite', () => {
      spectator.setInput('isFavorite', true);
      const button = spectator.query('.favorite-button');
      expect(button?.getAttribute('aria-label')).toBe('Remove Test Product from favorites');
    });

    it('should have correct aria-pressed attribute', () => {
      spectator.setInput('isFavorite', true);
      const button = spectator.query('.favorite-button');
      expect(button?.getAttribute('aria-pressed')).toBe('true');
    });
  });

  describe('Product Link', () => {
    it('should have correct route link', () => {
      const link = spectator.query<HTMLAnchorElement>('.product-link');
      expect(link?.getAttribute('href')).toBe('/catalog/1');
    });

    it('should have correct aria-label', () => {
      const link = spectator.query('.product-link');
      expect(link?.getAttribute('aria-label')).toBe('View details for Test Product');
    });
  });

  describe('Product Image', () => {
    it('should display product image', () => {
      const image = spectator.query<HTMLImageElement>('.product-image');
      expect(image?.getAttribute('src')).toBe('test.jpg');
      expect(image?.getAttribute('alt')).toBe('Test Product');
    });

    it('should have lazy loading attribute', () => {
      const image = spectator.query<HTMLImageElement>('.product-image');
      expect(image?.getAttribute('loading')).toBe('lazy');
    });
  });
});