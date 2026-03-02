import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Router } from '@angular/router';
import { ShippingAddress } from '../../../core/models/checkout';
import { ShippingDumbComponent } from '../../../shared/components/shipping-form/shipping.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-shipping-container',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShippingDumbComponent, FooterComponent]
})
export class ShippingComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly initialData = this.checkoutService.shippingAddress;

  protected readonly isFormValid = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitTrigger = signal(0);

  protected handleContinue(): void {
    this.submitTrigger.update(n => n + 1);
  }

  protected handleValidilityChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  protected handleCancel(): void {
    this.checkoutService.resetCheckout();
    this.router.navigate([`${AppRoutes.CART}`]);
  }

  protected handleSubmit(data: ShippingAddress): void {
    this.isSubmitting.set(true);
    this.checkoutService.setShippingAddress(data);
    this.checkoutService.nextStep();
    this.router.navigate([`${AppRoutes.CHECKOUT_DELIVERY}`]);
    this.isSubmitting.set(false);
  }
}
