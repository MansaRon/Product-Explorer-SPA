import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import {
  WishlistDeleteResponse,
  WishlistItem,
  WishlistListResponse,
  WishlistSingleResponse,
} from '../../models/wishlist';
import { Product } from '../../models/product';

@Injectable({
  providedIn: 'root',
})
export class FavouriteService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly favSignal = signal<Set<string>>(new Set());
  private readonly wishlistItemsSignal = signal<WishlistItem[]>([]);

  readonly count = computed(() => this.favSignal().size);

  readonly wishlistProducts = computed<Product[]>(() =>
    this.wishlistItemsSignal()
      .map((item) => item.productDTO)
      .filter((p): p is Product => !!p)
  );

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.id) {
        this.loadWishlist(user.id);
      } else {
        this.favSignal.set(new Set());
        this.wishlistItemsSignal.set([]);
      }
    });
  }

  isFavorite(productId: string): boolean {
    return this.favSignal().has(productId);
  }

  toggleFavorite(productId: string): void {
    if (this.isFavorite(productId)) {
      this.removeFavorite(productId);
    } else {
      this.addFavorite(productId);
    }
  }

  addFavorite(productId: string): void {
    if (this.isFavorite(productId)) return;

    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.http
      .post<WishlistSingleResponse>('/wishlist', {
        userID: user.id,
        productID: productId,
      })
      .pipe(
        tap((response) => {
          this.favSignal.update((current) => new Set([...current, productId]));
          if (response?.data) {
            this.wishlistItemsSignal.update((items) => [...items, response.data]);
          }
        }),
        catchError((err) => {
          console.error('Failed to add to wishlist:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  removeFavorite(productId: string): void {
    if (!this.isFavorite(productId)) return;

    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.http
      .delete<WishlistDeleteResponse>(`/wishlist/${user.id}`, {
        body: { userID: user.id, productID: productId },
      })
      .pipe(
        tap(() => {
          this.favSignal.update((current) => {
            const next = new Set(current);
            next.delete(productId);
            return next;
          });
          this.wishlistItemsSignal.update((items) =>
            items.filter((item) => item.productDTO?.id !== productId)
          );
        }),
        catchError((err) => {
          console.error('Failed to remove from wishlist:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  clearAll(): void {
    const user = this.authService.currentUser();
    if (!user?.id) return;

    const ids = Array.from(this.favSignal());
    this.favSignal.set(new Set());
    this.wishlistItemsSignal.set([]);

    ids.forEach((productId) => {
      this.http
        .delete<WishlistDeleteResponse>(`/wishlist/${user.id}`, {
          body: { userID: user.id, productID: productId },
        })
        .pipe(catchError(() => EMPTY))
        .subscribe();
    });
  }

  private loadWishlist(userId: string): void {
    this.http
      .get<WishlistListResponse>(`/wishlist/${userId}`)
      .pipe(
        tap((response) => {
          const items = response?.dataList ?? [];
          this.wishlistItemsSignal.set(items);
          const ids = new Set(
            items.map((item) => item.productDTO?.id).filter((id): id is string => !!id)
          );
          this.favSignal.set(ids);
        }),
        catchError((err) => {
          console.error('Failed to load wishlist:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }
}
