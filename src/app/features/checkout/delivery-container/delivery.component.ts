import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Router } from '@angular/router';
import { DELIVERY_OPTIONS, DeliveryOption } from '../../../core/models/checkout';
import { OptionsComponent } from '../../../shared/components/delivery-options/options.component';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OptionsComponent]
})
export class DeliveryComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly deliveryOptions = DELIVERY_OPTIONS;
  protected readonly selectedOption = signal<DeliveryOption | null>(this.checkoutService.deliveryOption() ?? null);
  protected selectedOptionId = signal<string | undefined>(this.checkoutService.deliveryOption()?.id);
  
  protected handleOptionSelected(option: DeliveryOption): void {
    this.selectedOption.set(option);
    this.selectedOptionId.set(option.id);
  }

  protected handleContinue(): void {
    const selected = this.selectedOption();
    if (!selected) return;

    this.checkoutService.setDeliveryOption(selected);
    this.checkoutService.nextStep();
    this.router.navigate(['/checkout/payment']);
  }

  protected handleBack(): void {
    this.checkoutService.previousStep();
    this.router.navigate(['/checkout/shipping']);
  }
}
