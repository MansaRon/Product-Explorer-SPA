import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout/checkout.service';
import { CartService } from '../../core/services/cart/cart.service';
import { CheckoutStep } from '../../core/models/checkout';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet]
})
export class CheckoutComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly currentStep = this.checkoutService.currentStep;
  protected readonly progressPercentage = this.checkoutService.progressPercentage;
  protected readonly isEmpty = this.cartService.isEmpty;

  protected readonly steps = computed(() => [
    {
      id: 'shipping' as CheckoutStep,
      label: 'Shipping',
      icon: 'truck',
      route: '/checkout/shipping',
      isActive: this.currentStep() === 'shipping',
      isCompleted: this.checkoutService.isStepCompleted()('shipping')
    },
    {
      id: 'delivery' as CheckoutStep,
      label: 'Delivery',
      icon: 'calendar',
      route: '/checkout/delivery',
      isActive: this.currentStep() === 'delivery',
      isCompleted: this.checkoutService.isStepCompleted()('delivery')
    },
    {
      id: 'payment' as CheckoutStep,
      label: 'Payment',
      icon: 'card',
      route: '/checkout/payment',
      isActive: this.currentStep() === 'payment',
      isCompleted: this.checkoutService.isStepCompleted()('payment')
    },
    {
      id: 'review' as CheckoutStep,
      label: 'Review',
      icon: 'check',
      route: '/checkout/review',
      isActive: this.currentStep() === 'review',
      isCompleted: false
    }
  ]);

  constructor() {
    // Redirect to cart if empty
    if (this.isEmpty()) {
      this.router.navigate(['/cart']);
    }
  }

  protected goToStep(step: CheckoutStep, route: string): void {
    this.checkoutService.goToStep(step);
    this.router.navigate([route]);
  }
}