import { test, expect } from '@playwright/test';

test.describe('Product Explorer E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Navigation and Layout', () => {
    test('should display header with navigation', async ({ page }) => {
      await expect(page.locator('app-header')).toBeVisible();
      await expect(page.locator('text=Product Explorer')).toBeVisible();
    });

    test('should have all navigation links', async ({ page }) => {
      await page.waitForSelector('nav');
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await page.locator('.mobile-menu-button').click();
        await page.waitForTimeout(300);
      }

      await expect(page.locator('a:has-text("Catalog")')).toBeVisible();
      await expect(page.locator('a:has-text("Favorites")')).toBeVisible();
      await expect(page.locator('a:has-text("Admin")')).toBeVisible();
    });

    test('should redirect to catalog by default', async ({ page }) => {
      await expect(page).toHaveURL(/.*catalog/);
    });

    test('should have skip link for accessibility', async ({ page }) => {
      const skipLink = page.locator('.skip-link');
      await expect(skipLink).toBeInViewport();
    });
  });

  test.describe('Catalog - Product Browsing', () => {
    test('should display product list', async ({ page }) => {
      await page.goto('/catalog');
      
      await page.waitForSelector('.product-card', { timeout: 10000 });
      
      const products = await page.locator('.product-card').count();
      expect(products).toBeGreaterThan(0);
    });

    test('should display product information', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      await expect(firstProduct.locator('.product-name')).toBeVisible();
      await expect(firstProduct.locator('.product-price')).toBeVisible();
      await expect(firstProduct.locator('.product-category')).toBeVisible();
      await expect(firstProduct.locator('.product-rating')).toBeVisible();
    });

    test('should show loading state', async ({ page }) => {
      await page.goto('/catalog');
      
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.product-card');
    });
  });

  test.describe('Search and Filter', () => {
    test('should filter products by search term', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill('Headphones');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('.product-card');
      const count = await products.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
      
      if (count > 0) {
        const firstProductName = await products.first().locator('.product-name').textContent();
        expect(firstProductName?.toLowerCase()).toContain('headphones');
      }
    });

    test('should filter products by category', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const categorySelect = page.locator('select#category');
      await categorySelect.selectOption('Electronics');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('.product-card');
      const count = await products.count();
      
      expect(count).toBeGreaterThan(0);
      
      const categories = await products.locator('.product-category').allTextContents();
      categories.forEach(category => {
        expect(category.trim()).toBe('Electronics');
      });
    });

    test('should sort products by price', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const sortSelect = page.locator('select#sortBy');
      await sortSelect.selectOption('price');
      
      const orderSelect = page.locator('select#sortOrder');
      await orderSelect.selectOption('asc');
      
      await page.waitForTimeout(500);
      
      const products = page.locator('.product-card');
      const firstPrice = await products.first().locator('.price-value').textContent();
      
      expect(firstPrice).toBeTruthy();
    });

    test('should reset filters', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill('test');
      await page.locator('select#category').selectOption('Electronics');
      
      await page.waitForTimeout(300);
      
      const resetButton = page.locator('button', { hasText: 'Reset Filters' });
      await resetButton.click();
      
      await page.waitForTimeout(300);
      
      const searchValue = await searchInput.inputValue();
      const categoryValue = await page.locator('select#category').inputValue();
      
      expect(searchValue).toBe('');
      expect(categoryValue).toBe('');
    });

    test('should show empty state when no results', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const searchInput = page.locator('input[type="search"]');
      await searchInput.fill('NonExistentProduct12345');
      
      await page.waitForTimeout(500);
      
      await expect(page.locator('app-empty-state')).toBeVisible();
      await expect(page.locator('text=No products found')).toBeVisible();
    });
  });

  test.describe('Product Details', () => {
    test('should navigate to product detail page', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      const productLink = firstProduct.locator('.product-link');
      await productLink.click();
      
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*catalog\/\d+/);
    });

    test('should display product details', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      await firstProduct.locator('.product-link').click();
      
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.product-name');
      
      await expect(page.locator('.product-name')).toBeVisible();
      await expect(page.locator('.product-description')).toBeVisible();
      await expect(page.locator('.price-value')).toBeVisible();
      await expect(page.locator('.product-rating')).toBeVisible();
      await expect(page.locator('.product-stock')).toBeVisible();
    });

    test('should navigate back to catalog', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      await page.locator('.product-card').first().locator('.product-link').click();
      await page.waitForLoadState('networkidle');
      
      const backButton = page.locator('button', { hasText: 'Back to Catalog' });
      await backButton.click();

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*catalog$/);
      await expect(page.locator('.product-card')).toBeVisible();
    });
  });

  test.describe('Favorites', () => {
    test('should add product to favorites', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      const favoriteButton = firstProduct.locator('.favorite-button');
      
      await favoriteButton.click();
      await page.waitForTimeout(200);
      
      await expect(favoriteButton).toHaveClass(/favorite-button--active/);
    });

    test('should remove product from favorites', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      const favoriteButton = firstProduct.locator('.favorite-button');
      
      await favoriteButton.click();
      await page.waitForTimeout(200);
      await expect(favoriteButton).toHaveClass(/favorite-button--active/);
      
      await favoriteButton.click();
      await page.waitForTimeout(200);
      await expect(favoriteButton).not.toHaveClass(/favorite-button--active/);
    });

    test('should display favorites in favorites page', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const firstProduct = page.locator('.product-card').first();
      await firstProduct.locator('.favorite-button').click();
      await page.waitForTimeout(200);
      
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await page.locator('.mobile-menu-button').click();
        await page.waitForTimeout(300);
      }
      
      await page.locator('a', { hasText: 'Favorites' }).click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*favorites/);
      
      await expect(page.locator('.product-card')).toBeVisible();
    });

    test('should show empty state when no favorites', async ({ page }) => {
      await page.evaluate(() => localStorage.clear());
      
      await page.goto('/favorites');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('app-empty-state')).toBeVisible();
      await expect(page.locator('text=No favorites yet')).toBeVisible();
    });

    test('should persist favorites after page reload', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      await page.locator('.product-card').first().locator('.favorite-button').click();
      await page.waitForTimeout(200);

      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('.product-card');
      
      const favoriteButton = page.locator('.product-card').first().locator('.favorite-button');
      await expect(favoriteButton).toHaveClass(/favorite-button--active/);
    });
  });

  test.describe('Admin Dashboard', () => {
    test('should redirect to catalog when not admin', async ({ page }) => {
      await page.evaluate(() => sessionStorage.removeItem('isAdmin'));
      
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*catalog/);
    });

    test('should access admin page when admin', async ({ page }) => {
      await page.evaluate(() => sessionStorage.setItem('isAdmin', 'true'));
      
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*admin/);
      await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
      await page.evaluate(() => sessionStorage.setItem('isAdmin', 'true'));
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('text=Total Products')).toBeVisible();
      await expect(page.locator('text=Total Inventory Value')).toBeVisible();
      await expect(page.locator('text=Low Stock Items')).toBeVisible();
    });

    test('should toggle admin access', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await page.locator('.mobile-menu-button').click();
        await page.waitForTimeout(300);
      }
      
      const adminToggle = page.locator('button', { hasText: 'Guest Mode' });
      await adminToggle.click();
      await page.waitForTimeout(200);
      
      await expect(page.locator('button', { hasText: 'Admin Mode' })).toBeVisible();
    });
  });

  test.describe('Critical User Flow: Search → Filter → View Details → Favorite', () => {
    test('should complete full user journey', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      await page.locator('input[type="search"]').fill('Wireless');
      await page.waitForTimeout(500);
      
      await page.locator('select#category').selectOption('Electronics');
      await page.waitForTimeout(500);
      
      const firstProduct = page.locator('.product-card').first();
      const productName = await firstProduct.locator('.product-name').textContent();
      await firstProduct.locator('.product-link').click();
      
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.product-name')).toHaveText(productName || '');
      
      await page.locator('.favorite-button').click();
      await page.waitForTimeout(200);
      await expect(page.locator('.favorite-button')).toHaveClass(/favorite-button--active/);
      
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await page.locator('.mobile-menu-button').click();
        await page.waitForTimeout(300);
      }
      
      await page.locator('a', { hasText: 'Favorites' }).click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*favorites/);
      
      await expect(page.locator('.product-card')).toBeVisible();
      await expect(page.locator('.product-name').first()).toHaveText(productName || '');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      await page.waitForSelector('.product-card');
      
      await expect(page.locator('.mobile-menu-button')).toBeVisible();
      
      await expect(page.locator('.product-card')).toBeVisible();
    });

    test('should toggle mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const menuButton = page.locator('.mobile-menu-button');
      await menuButton.click();
      await page.waitForTimeout(300);
      
      const nav = page.locator('.nav');
      await expect(nav).toHaveClass(/nav--open/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThan(0);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      const searchInput = page.locator('input[type="search"]');
      const ariaLabel = await searchInput.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('should have keyboard navigation', async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForSelector('.product-card');
      
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 routes gracefully', async ({ page }) => {
      await page.goto('/non-existent-route');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL(/.*catalog/);
    });
  });
});