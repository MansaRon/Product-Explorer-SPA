import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../core/services/order/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AppRoutes } from '../../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, RouterLink],
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);

  protected readonly ordersRoute = `/${AppRoutes.ORDERS}`;
  protected readonly order = this.orderService.currentOrder;
  protected readonly orderExists = computed(() => !!this.order());

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

  protected statusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'status--delivered';
      case 'SHIPPED':
        return 'status--shipped';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'status--processing';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'status--cancelled';
      default:
        return 'status--pending';
    }
  }

  protected formatPaymentMethod(method: string): string {
    switch (method?.toUpperCase()) {
      case 'CREDIT_CARD':
        return 'Credit / Debit Card';
      case 'EFT':
        return 'EFT / Bank Transfer';
      case 'CASH_ON_DELIVERY':
        return 'Cash on Delivery';
      default:
        return method ?? '—';
    }
  }

  protected formatShippingMethod(method: string): string {
    switch (method?.toUpperCase()) {
      case 'EXPRESS':
        return 'Express Delivery (2–3 days)';
      case 'OVERNIGHT':
        return 'Overnight Delivery (next day)';
      case 'FREE':
        return 'Free Delivery (5–7 days)';
      default:
        return 'Standard Delivery (5–7 days)';
    }
  }

  // TODO: Navigate to order tracking page — to be implemented in a separate PR.
  protected trackOrder(): void {
    this.notifications.info('Order tracking is coming soon.');
  }
}
