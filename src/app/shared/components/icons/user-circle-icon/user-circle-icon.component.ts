import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-user-circle-icon',
  templateUrl: './user-circle-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCircleIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
