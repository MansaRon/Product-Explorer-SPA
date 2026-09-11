import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-banknote-icon',
  templateUrl: './banknote-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BanknoteIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
