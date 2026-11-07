import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order/order.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { OrderStatusClassPipe } from '../../../shared/pipes/order-status-class.pipe';
import { PaymentMethodLabelPipe } from '../../../shared/pipes/payment-method-label.pipe';
import { ShippingMethodLabelPipe } from '../../../shared/pipes/shipping-method-label.pipe';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    EmptyStateComponent,
    OrderStatusClassPipe,
    PaymentMethodLabelPipe,
    ShippingMethodLabelPipe,
  ],
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  protected readonly ordersRoute = `/${AppRoutes.ORDERS}`;
  protected readonly order = this.orderService.currentOrder;
  protected readonly orderExists = computed(() => !!this.order());

  protected get trackingRoute(): string {
    const id = this.route.snapshot.paramMap.get('id');
    return `/${AppRoutes.ORDERS}/${id}/${AppRoutes.ORDER_TRACKING}`;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate([AppRoutes.ORDERS]);
      return;
    }
    if (!this.orderService.currentOrder()) {
      this.orderService.loadOrderById(id);
    }
  }

  protected trackOrder(): void {
    const id = this.route.snapshot.paramMap.get('id');
    void this.router.navigate([AppRoutes.ORDERS, id, AppRoutes.ORDER_TRACKING]);
  }
}
