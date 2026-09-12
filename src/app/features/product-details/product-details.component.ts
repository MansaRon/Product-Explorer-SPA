import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FavouriteService } from '../../core/services/favourite/favourite.service';
import { CartService } from '../../core/services/cart/cart.service';
import { Product } from '../../core/models/product';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ArrowLeftIconComponent } from '../../shared/components/icons/arrow-left-icon/arrow-left-icon.component';
import { HeartIconComponent } from '../../shared/components/icons/heart-icon/heart-icon.component';
import { CartIconComponent } from '../../shared/components/icons/cart-icon/cart-icon.component';
import { StarIconComponent } from '../../shared/components/icons/star-icon/star-icon.component';
import { ChevronLeftIconComponent } from '../../shared/components/icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from '../../shared/components/icons/chevron-right-icon/chevron-right-icon.component';
import { MessageIconComponent } from '../../shared/components/icons/message-icon/message-icon.component';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ErrorMessageComponent,
    CurrencyPipe,
    DatePipe,
    ArrowLeftIconComponent,
    HeartIconComponent,
    CartIconComponent,
    StarIconComponent,
    ChevronLeftIconComponent,
    ChevronRightIconComponent,
    MessageIconComponent,
  ],
})
export class ProductDetailsComponent {
  private readonly favouriteService = inject(FavouriteService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly product = toSignal(
    this.route.data.pipe(map((data) => data['product'] as Product | undefined))
  );

  protected readonly isFavorite = computed(() => {
    const id = this.product()?.id;
    return id ? this.favouriteService.isFavorite(id) : false;
  });

  protected readonly isInCart = computed(() => {
    const id = this.product()?.id;
    return id ? this.cartService.isInCart(id) : false;
  });

  protected readonly notFound = computed(() => !this.product());

  protected readonly selectedImageIndex = signal(0);

  constructor() {
    effect(() => {
      this.product();
      this.selectedImageIndex.set(0);
    });
  }

  protected readonly currentImage = computed(() => {
    const urls = this.product()?.imageUrls ?? [];
    return urls[this.selectedImageIndex()] ?? '/assets/placeholder.jpg';
  });

  protected readonly hasMultipleImages = computed(
    () => (this.product()?.imageUrls?.length ?? 0) > 1
  );

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected prevImage(): void {
    const len = this.product()?.imageUrls?.length ?? 0;
    this.selectedImageIndex.update((i) => (i - 1 + len) % len);
  }

  protected nextImage(): void {
    const len = this.product()?.imageUrls?.length ?? 0;
    this.selectedImageIndex.update((i) => (i + 1) % len);
  }

  protected readonly reviews = computed(() => this.product()?.reviews ?? []);

  protected readonly hasReviews = computed(() => this.reviews().length > 0);

  protected readonly averageRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return r.reduce((sum, rv) => sum + rv.rating, 0) / r.length;
  });

  protected starsArray(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < rounded);
  }

  protected goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected toggleFavorite(): void {
    const id = this.product()?.id;
    if (id) this.favouriteService.toggleFavorite(id);
  }

  protected toggleCart(): void {
    const id = this.product()?.id;
    if (id) this.cartService.toggleCart(id);
  }
}
