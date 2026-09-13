import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-chevron-left-icon',
  templateUrl: './chevron-left-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChevronLeftIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
