import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-check-circle-icon',
  templateUrl: './check-circle-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckCircleIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
