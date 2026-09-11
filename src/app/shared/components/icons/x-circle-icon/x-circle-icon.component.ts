import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-x-circle-icon',
  templateUrl: './x-circle-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XCircleIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
