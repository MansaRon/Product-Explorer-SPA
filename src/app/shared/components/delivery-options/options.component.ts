import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { DeliveryOption } from '../../../core/models/checkout';
import { LookupService } from '../../../core/services/lookup/lookup.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
})
export class OptionsComponent {
  initialData = input<DeliveryOption | undefined>();
  submitTrigger = input<number>(0);

  optionSelected = output<DeliveryOption>();
  formValidity = output<boolean>();

  protected selectedOption: DeliveryOption | undefined;
  protected readonly deliveryOptions = inject(LookupService).deliveryOptions;

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.selectedOption = data;
        this.formValidity.emit(true);
      } else {
        this.formValidity.emit(false);
      }
    });

    effect(() => {
      const trigger = this.submitTrigger();
      if (trigger) {
        this.onSubmit();
      }
    });
  }

  protected selectOption(option: DeliveryOption): void {
    this.selectedOption = option;
    this.formValidity.emit(true);
    this.optionSelected.emit(option);
  }

  protected isSelected(optionId: string): boolean {
    return this.selectedOption?.id === optionId;
  }

  private onSubmit(): void {
    if (this.selectedOption) {
      this.optionSelected.emit(this.selectedOption);
    }
  }
}
