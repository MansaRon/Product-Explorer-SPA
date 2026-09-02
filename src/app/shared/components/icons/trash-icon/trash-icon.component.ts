import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-trash-icon',
  templateUrl: './trash-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrashIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
