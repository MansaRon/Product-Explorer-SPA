import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { FavouriteService } from '../../core/services/favourite.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private readonly productService = inject(ProductService);
  private readonly favouriteService = inject(FavouriteService);
  private readonly router = inject(Router);
  
  protected readonly isAdmin = signal(sessionStorage.getItem('isAdmin') === 'true');
  
  protected readonly products = this.productService.filterProducts;
  protected readonly categories = this.productService.categories;
  protected readonly favoriteCount = this.favouriteService.count;
  
  protected readonly stats = computed(() => {
    const allProducts = this.products();
    const totalProducts = allProducts.length;
    const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = allProducts.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStock = allProducts.filter(p => p.stock === 0).length;
    const avgRating = totalProducts > 0 
      ? allProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts 
      : 0;
    
    return {
      totalProducts,
      totalValue,
      lowStock,
      outOfStock,
      avgRating,
      totalCategories: this.categories().length,
      totalFavorites: this.favoriteCount()
    };
  });
  
  protected readonly topRatedProducts = computed(() => {
    return [...this.products()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  });
  
  protected readonly categoryStats = computed(() => {
    const products = this.products();
    const stats = new Map<string, { count: number; totalValue: number }>();
    
    // to refactor this and use a helper method
    products.forEach(p => {
      const current = stats.get(p.category) || { count: 0, totalValue: 0 };
      stats.set(p.category, {
        count: current.count + 1,
        totalValue: current.totalValue + (p.price * p.stock)
      });
    });
    
    return Array.from(stats.entries()).map(([category, data]) => ({
      category,
      ...data
    }));
  });
  
  protected toggleAdminAccess(): void {
    const newValue = !this.isAdmin();
    this.isAdmin.set(newValue);
    sessionStorage.setItem('isAdmin', newValue.toString());
    
    if (!newValue) {
      this.router.navigate(['/catalog']);
    }
  }
  
  protected logout(): void {
    this.isAdmin.set(false);
    sessionStorage.removeItem('isAdmin');
    this.router.navigate(['/catalog']);
  }

}
