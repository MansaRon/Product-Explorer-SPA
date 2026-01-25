import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CurrencyPipe
  ]
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly isFavorite = input<boolean>(false);
  readonly favoriteToggled = output<string>();
  readonly routeLink = input<string[]>();

  readonly vm = computed(() => this.product());
  
  protected handleFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteToggled.emit(this.product().id);
  }
}
