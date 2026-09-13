import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chevron-right-icon',
  templateUrl: './chevron-right-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronRightIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
