import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CartItemWithProduct, OrderComponent, OrderSummaryData } from '../../../shared/components/order-summary/order.component';
import { CartService } from '../../../core/services/cart/cart.service';
import { ProductService } from '../../../core/services/product/product.service';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { calculateOrderSummary } from '../../../shared/utils/price-calculations.util';
import { OrderService } from '../../../core/services/order/order.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

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
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly placing = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitTrigger = signal(0);

  protected readonly cartWithProducts = computed(() => {
    return this.cartService.items().map(item => {
      const product = this.productService.getProductById(item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        product: product ? {
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price
        } : undefined
      };
    }).filter(item => item.product !== undefined) as CartItemWithProduct[];
  });

  protected readonly subTotal = computed(() => {
    return this.cartWithProducts().reduce((total, item) => {
      return total + (item?.product.price * item.quantity);
    }, 0);
  });

  protected readonly summaryData = computed((): OrderSummaryData | undefined => {
    const shipping = this.checkoutService.shippingAddress();
    const delivery = this.checkoutService.deliveryOption();
    const payment = this.checkoutService.paymentMethod();

    if (!shipping || !delivery || !payment) return undefined;

    const calculations = calculateOrderSummary(this.subTotal(), delivery.price);
    return { shipping, delivery, payment, items: this.cartWithProducts(), subtotal: calculations.subtotal, deliveryCost: calculations.delivery, tax: calculations.tax, total: calculations.total };
  });

  protected readonly canPlaceOrder = computed(() => {
    return !!this.summaryData();
  });

  protected async handlePlaceOrder(): Promise<void> {
    if (this.placing()) return;

    const summary = this.summaryData();
    if (!summary) {
      alert('Please complete all checkout steps.');
      return;
    }

    this.placing.set(true);

    try {
      const order = this.orderService.createOrder({
        userId: 'guest',
        items: summary.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: summary.subtotal,
        tax: summary.tax,
        total: summary.total,
        status: 'pending'
      });

      this.cartService.clearCart();

      this.checkoutService.resetCheckout();

      this.router.navigate(['/order-confirmation', order.id]);
    } catch (error) {
      console.log('Failed to place order', error);
      alert('Failed to place order. Please try again');
      this.placing.set(false);
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
