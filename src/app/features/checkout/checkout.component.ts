import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { CartService } from '../../core/services/cart/cart.service';
import { CheckoutStep } from '../../core/models/checkout';
import { CheckIconComponent } from '../../shared/components/icons/check-icon/check-icon.component';
import { TruckIconComponent } from '../../shared/components/icons/truck-icon/truck-icon.component';
import { CalendarIconComponent } from '../../shared/components/icons/calendar-icon/calendar-icon.component';
import { CreditCardIconComponent } from '../../shared/components/icons/credit-card-icon/credit-card-icon.component';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    CheckIconComponent,
    TruckIconComponent,
    CalendarIconComponent,
    CreditCardIconComponent,
  ],
})
export class CheckoutComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly currentStep = this.checkoutService.currentStep;
  protected readonly progressPercentage = this.checkoutService.progressPercentage;
  protected readonly isEmpty = this.cartService.isEmpty;

  protected readonly steps = computed<
    {
      id: CheckoutStep;
      label: string;
      icon: string;
      route: string;
      isActive: boolean;
      isCompleted: boolean;
    }[]
  >(() => [
    {
      id: 'shipping' satisfies CheckoutStep,
      label: 'Shipping',
      icon: 'truck',
      route: `/${AppRoutes.CHECKOUT_SHIPPING}`,
      isActive: this.currentStep() === 'shipping',
      isCompleted: this.checkoutService.isStepCompleted()('shipping'),
    },
    {
      id: 'delivery' satisfies CheckoutStep,
      label: 'Delivery',
      icon: 'calendar',
      route: `/${AppRoutes.CHECKOUT_DELIVERY}`,
      isActive: this.currentStep() === 'delivery',
      isCompleted: this.checkoutService.isStepCompleted()('delivery'),
    },
    {
      id: 'payment' satisfies CheckoutStep,
      label: 'Payment',
      icon: 'card',
      route: `/${AppRoutes.CHECKOUT_PAYMENT}`,
      isActive: this.currentStep() === 'payment',
      isCompleted: this.checkoutService.isStepCompleted()('payment'),
    },
    {
      id: 'review' satisfies CheckoutStep,
      label: 'Review',
      icon: 'check',
      route: `/${AppRoutes.CHECKOUT_REVIEW}`,
      isActive: this.currentStep() === 'review',
      isCompleted: this.checkoutService.isStepCompleted()('review'),
    },
  ]);

  constructor() {
    if (this.isEmpty()) {
      this.router.navigate(['/cart']);
      return;
    }
    this.checkoutService.initiateCheckout();
  }

  protected goToStep(step: CheckoutStep, route: string): void {
    this.checkoutService.goToStep(step);
    this.router.navigate([route]);
  }
}
