import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order/order.service';
import { ProductService } from '../../../core/services/product/product.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { OrderConfirmationComponent } from '../../../shared/components/order-confirmation/order-confirmation.component';

@Component({
  selector: 'app-confirmation-container',
  templateUrl: './confirmation-container.component.html',
  styleUrls: ['./confirmation-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderConfirmationComponent]
})
export class ConfirmationContainerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly checkoutService = inject(CheckoutService);

  private readonly orderId = signal<string | null>(null);

  protected readonly order = computed(() => {
    const id = this.orderId();
    if (!id) return null;
    return this.orderService.getOrderById(id);
  });

  protected readonly orderExists = computed(() => !!this.order());

  protected readonly orderItemsWithProducts = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder) return [];

    return currentOrder.items.map(item => {
      const product = this.productService.getProductById(item.productId);
      return {
        ...item,
        product
      };
    });
  });

  ngOnInit() {
    this.checkoutService.goToStep('confirmation');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId.set(id);
    } else {
      this.router.navigate([`${AppRoutes.CATALOG}`]);
    }
  }

  protected continueShopping(): void {
    this.checkoutService.resetCheckout();
    this.router.navigate([`${AppRoutes.CATALOG}`]);
  }

  protected viewOrders(): void {
    // If admin, go to admin page, otherwise go back to main page
    this.router.navigate([[`${AppRoutes.CATALOG}`]]);
  }

}
