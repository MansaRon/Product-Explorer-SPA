import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-currency-icon',
  templateUrl: './currency-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
