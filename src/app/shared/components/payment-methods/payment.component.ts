import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PaymentMethod } from '../../../core/models/checkout';

@Component({
  selector: 'app-payment-options',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodComponent {
  methods = input.required<PaymentMethod[]>();
  selectedMethodId = input<string | undefined>();
  methodSelected = output<PaymentMethod>();

  protected readonly currentSelection = signal<string | undefined>(undefined);
  protected selectMethod(method: PaymentMethod): void {
  this.currentSelection.set(method.id);
    this.methodSelected.emit(method);
  }

  protected isSelected(methodId: string): boolean {
    return this.currentSelection() === methodId || this.selectedMethodId() === methodId;
  }

  protected getSelectedMethod(): PaymentMethod | undefined {
    const selectedId = this.currentSelection() || this.selectedMethodId();
    return this.methods().find(m => m.id === selectedId);
  }
}
