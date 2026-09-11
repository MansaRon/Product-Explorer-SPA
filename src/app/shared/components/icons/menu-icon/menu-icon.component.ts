import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-menu-icon',
  templateUrl: './menu-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
