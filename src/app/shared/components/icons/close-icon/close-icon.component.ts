import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-close-icon',
  templateUrl: './close-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
