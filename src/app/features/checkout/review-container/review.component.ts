import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OrderComponent } from '../../../shared/components/order-summary/order.component';
import { CartService } from '../../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { OrderService } from '../../../core/services/order/order.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-review-container',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderComponent, FooterComponent],
})
export class ReviewComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly submitTrigger = signal(0);
  protected readonly isFormValid = signal(false);

  protected readonly shippingAddress = this.checkoutService.shippingAddress;
  protected readonly deliveryOption = this.checkoutService.deliveryOption;
  protected readonly paymentMethod = this.checkoutService.paymentMethod;

  protected handleValidilityChange(isValid: boolean): void {
    this.isFormValid.set(isValid);
  }

  protected handleContinue(): void {
    this.submitTrigger.update((n) => n + 1);
  }

  protected handlePlaceOrder(): void {
    const shipping = this.shippingAddress();
    const delivery = this.deliveryOption();
    const payment = this.paymentMethod();

    if (!shipping || !delivery || !payment) {
      this.notifications.error('Missing required checkout information. Please complete all steps.');
      return;
    }

    if (this.cartService.isEmpty()) {
      this.notifications.error('Your cart is empty.');
      return;
    }

    this.isSubmitting.set(true);

    this.checkoutService.confirmCheckout({
      onSuccess: (order) => {
        this.orderService.setCurrentOrder(order);
        this.cartService.clearCart();
        this.checkoutService.goToStep('confirmation');
        this.router.navigate([AppRoutes.CHECKOUT, AppRoutes.CONFIRMATION, order.id]);
        this.isSubmitting.set(false);
      },
      onError: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  protected handleBack(): void {
    this.checkoutService.previousStep();
    this.router.navigate(['checkout/payment']);
  }

  protected handleEditShipping(): void {
    this.checkoutService.goToStep('shipping');
    this.router.navigate(['checkout/shipping']);
  }

  protected handleEditDelivery(): void {
    this.checkoutService.goToStep('delivery');
    this.router.navigate(['checkout/delivery']);
  }

  protected handleEditPayment(): void {
    this.checkoutService.goToStep('payment');
    this.router.navigate(['checkout/payment']);
  }
}
