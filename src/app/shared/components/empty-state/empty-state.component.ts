import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SearchIconComponent } from '../icons/search-icon/search-icon.component';
import { HeartIconComponent } from '../icons/heart-icon/heart-icon.component';
import { TableIconComponent } from '../icons/table-icon/table-icon.component';
import { CartIconComponent } from '../icons/cart-icon/cart-icon.component';
import { InfoCircleIconComponent } from '../icons/info-circle-icon/info-circle-icon.component';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchIconComponent, HeartIconComponent, TableIconComponent, CartIconComponent, InfoCircleIconComponent],
})
export class EmptyStateComponent {
  private readonly router = inject(Router);
  readonly icon = input<'search' | 'heart' | 'box' | 'info' | 'cart'>('info');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly showButton = input<boolean>(true);
  readonly buttonText = input<string>('Go to Catalog');
  readonly buttonRoute = input<string>('/catalog');

  protected handleBttonClick(): void {
    this.router.navigate([this.buttonRoute()]);
  }
}
