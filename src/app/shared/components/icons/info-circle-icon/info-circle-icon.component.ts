import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-info-circle-icon',
  templateUrl: './info-circle-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoCircleIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
