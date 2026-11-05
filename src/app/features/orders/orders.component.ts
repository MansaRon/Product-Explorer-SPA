import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order/order.service';
import { OrderApi } from '../../core/models/order';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { AppRoutes } from '../../shared/enums/app-routes-enum';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, EmptyStateComponent],
})
export class OrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly orders = this.orderService.orders;
  protected readonly orderCount = this.orderService.orderCount;
  protected readonly hasOrders = this.orderService.hasOrders;

  protected readonly sortedOrders = computed(() =>
    [...this.orders()].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
  );

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

  protected itemSummary(order: OrderApi): string {
    const count = order.orderItems?.length ?? 0;
    if (count === 0) return 'No items';
    const first = order.orderItems[0].productTitle;
    return count === 1 ? first : `${first} +${count - 1} more`;
  }

  protected viewOrder(order: OrderApi): void {
    this.orderService.setCurrentOrder(order);
    void this.router.navigate([AppRoutes.ORDERS, order.id]);
  }

  protected backToCatalog(): void {
    void this.router.navigate([AppRoutes.CATALOG]);
  }
}
