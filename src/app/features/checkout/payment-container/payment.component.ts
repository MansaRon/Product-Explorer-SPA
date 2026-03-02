import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PAYMENT_METHODS, PaymentMethod } from '../../../core/models/checkout';
import { Router } from '@angular/router';
import { PaymentMethodComponent } from '../../../shared/components/payment-methods/payment.component';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaymentMethodComponent, FooterComponent]
})
export class PaymentComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly initialData = this.checkoutService.paymentMethod;

  protected readonly isFormValid = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitTrigger = signal(0);
  private selectedMethod: PaymentMethod | undefined;

  protected handleValidilityChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  protected handleMethodSelected(method: PaymentMethod): void {
    this.selectedMethod = method;
  }

  protected handleBack(): void {
    this.checkoutService.previousStep();
    this.router.navigate([`${AppRoutes.CHECKOUT_DELIVERY}`]);
  }
  
  protected handleContinue(): void {
    const selected = this.selectedMethod;
    if (selected) {
      this.checkoutService.setPaymentMethod(selected);
      this.checkoutService.nextStep();
      this.router.navigate([`${AppRoutes.CHECKOUT_REVIEW}`]);
      this.isSubmitting.set(false);      
    } else {
      this.submitTrigger.update(n => n + 1);
    }
  }

}
