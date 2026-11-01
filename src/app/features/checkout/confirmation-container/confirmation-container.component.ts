import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, toOrderViewModel } from '../../../core/services/order/order.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { OrderConfirmationComponent } from '../../../shared/components/order-confirmation/order-confirmation.component';

@Component({
  selector: 'app-confirmation-container',
  templateUrl: './confirmation-container.component.html',
  styleUrls: ['./confirmation-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OrderConfirmationComponent],
})
export class ConfirmationContainerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly checkoutService = inject(CheckoutService);

  protected readonly order = computed(() => {
    const api = this.orderService.currentOrder();
    return api ? toOrderViewModel(api) : null;
  });

  protected readonly orderExists = computed(() => !!this.order());

  protected readonly orderItemsWithProducts = computed(() =>
    (this.order()?.items ?? []).map((item) => ({ ...item, product: undefined }))
  );

  ngOnInit(): void {
    this.checkoutService.goToStep('confirmation');
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate([AppRoutes.CATALOG]);
      return;
    }
    // If no current order in memory (e.g. page refresh), fetch from backend
    if (!this.orderService.currentOrder()) {
      this.orderService.loadOrderById(id);
    }
  }

  protected continueShopping(): void {
    this.checkoutService.resetCheckout();
    this.router.navigate([AppRoutes.CATALOG]);
  }

  protected viewOrders(): void {
    this.router.navigate([AppRoutes.CATALOG]);
  }
}
