import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-calendar-icon',
  templateUrl: './calendar-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
