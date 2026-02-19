import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
