import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-heart-icon',
  templateUrl: './heart-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeartIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
  readonly filled = input.required<boolean>();
}
