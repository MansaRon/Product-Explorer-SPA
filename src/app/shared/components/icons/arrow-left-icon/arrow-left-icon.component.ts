import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-arrow-left-icon',
  templateUrl: './arrow-left-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrowLeftIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
