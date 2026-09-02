import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-moon-icon',
  templateUrl: './moon-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoonIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
