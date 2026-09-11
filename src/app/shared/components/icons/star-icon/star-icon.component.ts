import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-star-icon',
  templateUrl: './star-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
