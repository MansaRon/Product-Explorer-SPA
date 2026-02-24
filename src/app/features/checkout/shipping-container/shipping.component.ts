import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { Router } from '@angular/router';
import { ShippingAddress } from '../../../core/models/checkout';
import { ShippingDumbComponent } from '../../../shared/components/shipping-form/shipping.component';

@Component({
  selector: 'app-shipping-container',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ShippingDumbComponent]
})
export class ShippingComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);

  protected readonly initialData = this.checkoutService.shippingAddress;

  protected handleSubmit(data: ShippingAddress): void {
    this.checkoutService.setShippingAddress(data);
    this.checkoutService.nextStep();
    this.router.navigate(['/checkout/delivery']);
  }

  protected handleCancel(): void {
    this.router.navigate(['/cart']);
  }
}
