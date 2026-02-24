import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PAYMENT_METHODS, PaymentMethod } from '../../../core/models/checkout';
import { Router } from '@angular/router';
import { PaymentMethodComponent } from '../../../shared/components/payment-methods/payment.component';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaymentMethodComponent]
})
export class PaymentComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly selectedMethod = signal<PaymentMethod | null>(this.checkoutService.paymentMethod() ?? null);
  protected selectedMethodId = signal<string | undefined>(this.checkoutService.paymentMethod()?.id);

  protected handleMethodSelected(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.selectedMethodId.set(method.id);
  }

  protected handleContinue(): void {
    const selected = this.selectedMethod();
    if (!selected) return;

    this.checkoutService.setPaymentMethod(selected);
    this.checkoutService.nextStep();
    this.router.navigate(['/checkout/review']);
  }

  protected handleBack(): void {
    this.checkoutService.previousStep();
    this.router.navigate(['/checkout/delivery']);
  }

}
