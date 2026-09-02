import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-alert-triangle-icon',
  templateUrl: './alert-triangle-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertTriangleIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
