import { computed, Injectable, signal } from '@angular/core';
import { FAV_KEY } from '../const/service-keys';

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {
  private readonly favSignal = signal<Set<string>>(this.loadFromStorage());

  readonly favourites = this.favSignal.asReadonly();
  readonly favouritesId = computed(() => Array.from(this.favSignal()));
  readonly count = computed(() => this.favSignal().size);

  isFavorite(productId: string): boolean {
    return this.favSignal().has(productId);
  }

  toggleFavorite(productId: string): void {
    this.favSignal.update(favorites => {
      const newFavorites = new Set(favorites);
      
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      
      this.saveToStorage(newFavorites);
      return newFavorites;
    });
  }

  addFavorite(productId: string): void {
    if (!this.isFavorite(productId)) {
      this.favSignal.update(favorites => {
        const newFavorites = new Set(favorites);
        newFavorites.add(productId);
        this.saveToStorage(newFavorites);
        return newFavorites;
      });
    }
  }
  
  removeFavorite(productId: string): void {
    if (this.isFavorite(productId)) {
      this.favSignal.update(favorites => {
        const newFavorites = new Set(favorites);
        newFavorites.delete(productId);
        this.saveToStorage(newFavorites);
        return newFavorites;
      });
    }
  }
  
  clearAll(): void {
    this.favSignal.set(new Set());
    this.saveToStorage(new Set());
  }

  private loadFromStorage(): Set<string> {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
    }
    return new Set();
  }
  
  private saveToStorage(favorites: Set<string>): void {
    try {
      const array = Array.from(favorites);
      localStorage.setItem(FAV_KEY, JSON.stringify(array));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

}
