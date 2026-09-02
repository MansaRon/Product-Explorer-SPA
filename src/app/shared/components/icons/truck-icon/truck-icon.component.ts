import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-truck-icon',
  templateUrl: './truck-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruckIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
