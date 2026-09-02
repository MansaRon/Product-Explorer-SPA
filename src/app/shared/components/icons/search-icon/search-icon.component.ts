import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-search-icon',
  templateUrl: './search-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
