import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-check-icon',
  templateUrl: './check-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
