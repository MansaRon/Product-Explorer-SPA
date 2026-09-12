import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-message-icon',
  templateUrl: './message-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageIconComponent {
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly color = input.required<string>();
}
