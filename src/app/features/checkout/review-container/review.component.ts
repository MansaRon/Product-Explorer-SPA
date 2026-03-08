import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { OrderComponent } from '../../../shared/components/order-summary/order.component';
import { CartService } from '../../../core/services/cart/cart.service';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { OrderService } from '../../../core/services/order/order.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductService } from '../../../core/services/product/product.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-review-container',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderComponent, FooterComponent]
})
export class ReviewComponent {
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
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
    this.submitTrigger.update(n => n + 1);
  }

  protected handlePlaceOrder(): void {
    this.isSubmitting.set(true);

    try {
      const subTotal = this.cartService.subTotal();
      const tax = this.cartService.tax();
      const total = this.cartService.total();
      const shipping = this.shippingAddress();
      const delivery = this.deliveryOption();
      const payment = this.paymentMethod();

      if (!shipping || !delivery || !payment) {
        alert('Missing required checkout information. Please complete all steps.');
        this.isSubmitting.set(false);
        return;
      }

      const cartItems = this.cartService.items();

      if (cartItems.length === 0) {
        alert('Cart is empty');
        this.isSubmitting.set(false);
        return;
      }

      const orderItems = cartItems.map(cartItem => {
        const product = this.productService.getProductById((cartItem.productId));
        if (!product) {
          alert(`Product ${cartItem.productId} not found`);
        }

        return {
          productId: cartItem.productId,
          productName: product!.name,
          quantity: cartItem.quantity,
          price: product!.price
        };
      });

      const order = this.orderService.createOrder({
        items: orderItems,
        subTotal,
        tax,
        total,
        shippingAddress: shipping,
        deliveryOption: delivery,
        paymentMethod: payment
      });

      this.cartService.clearCart();

      this.checkoutService.goToStep('confirmation');

      this.router.navigate([AppRoutes.CHECKOUT, AppRoutes.CONFIRMATION, order.id]);
    } catch (error) {
      console.log('Failed to place order', error);
      alert('Failed to place order. Please try again');
    } finally {
      this.isSubmitting.set(false);
    }
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
