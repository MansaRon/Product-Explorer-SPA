import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-table-icon',
  templateUrl: './table-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
