import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-sun-icon',
  templateUrl: './sun-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SunIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
