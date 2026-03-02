import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Router } from '@angular/router';
import { DeliveryOption } from '../../../core/models/checkout';
import { OptionsComponent } from '../../../shared/components/delivery-options/options.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OptionsComponent, FooterComponent]
})
export class DeliveryComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly initialData = this.checkoutService.deliveryOption;

  protected readonly isFormValid = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitTrigger = signal(0);
  protected selectedOption: DeliveryOption | undefined;
  
  protected handleOptionSelected(option: DeliveryOption): void {
    this.selectedOption = option;
  }

  protected handleValidilityChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  protected handleBack(): void {
    this.checkoutService.previousStep();
    this.router.navigate([`${AppRoutes.CHECKOUT_SHIPPING}`]);
  }
  
  protected handleContinue(): void {
    if (this.selectedOption) {
      this.isSubmitting.set(true);
      this.checkoutService.setDeliveryOption(this.selectedOption);
      this.checkoutService.nextStep();
      this.router.navigate([`${AppRoutes.CHECKOUT_PAYMENT}`]);
      this.isSubmitting.set(false);
    } else {
      this.submitTrigger.update(n => n + 1);
    }
  }
}
