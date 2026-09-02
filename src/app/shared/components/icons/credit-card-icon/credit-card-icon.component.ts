import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-credit-card-icon',
  templateUrl: './credit-card-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditCardIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
