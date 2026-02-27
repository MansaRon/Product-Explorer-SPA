import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { PAYMENT_METHODS, PaymentMethod } from '../../../core/models/checkout';

@Component({
  selector: 'app-payment-options',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodComponent {
  initialData = input<PaymentMethod | undefined>();
  submitTrigger = input<number>(0);

  methodSelected = output<PaymentMethod>();
  formValidity = output<boolean>();

  protected selectedMethod: PaymentMethod | undefined;
  protected readonly paymentMethods: PaymentMethod[] = PAYMENT_METHODS;

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.selectedMethod = data;
        this.formValidity.emit(true);
      } else {
        this.formValidity.emit(false);
      }
    });

    effect(() => {
      const trigger = this.submitTrigger();
      if (trigger > 0) {
        this.onSubmit();
      }
    });
  }

  protected selectMethod(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.formValidity.emit(true);
    this.methodSelected.emit(method);
  }

  protected isSelected(methodId: string): boolean {
    return this.selectedMethod?.id === methodId;
  }

  protected getSelectedMethod(): PaymentMethod | undefined {
    return this.selectedMethod;
  }

  private onSubmit(): void {
    if (this.selectedMethod) {
      this.methodSelected.emit(this.selectedMethod);
    }
  }
}
