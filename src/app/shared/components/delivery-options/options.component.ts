import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DeliveryOption } from '../../../core/models/checkout';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe]
})
export class OptionsComponent {
  options = input.required<DeliveryOption[]>();
  selectedOptionId = input<string | undefined>();

  optionSelected = output<DeliveryOption>();

  protected readonly currentSelection = signal<string | undefined>(undefined);
  protected selectOption(option: DeliveryOption): void {
    this.currentSelection.set(option.id);
    this.optionSelected.emit(option);
  }

  protected isSelected(optionId: string): boolean {
    return this.currentSelection() === optionId || this.selectedOptionId() === optionId;
  }
}
