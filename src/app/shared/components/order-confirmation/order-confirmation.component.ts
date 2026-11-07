import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../core/models/product';
import { CheckCircleIconComponent } from '../icons/check-circle-icon/check-circle-icon.component';
import { Order, OrderItem } from '../../../core/models/order';

export type OrderItemWithProduct = OrderItem & { product: Product | undefined };

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, CheckCircleIconComponent],
})
export class OrderConfirmationComponent {
  order = input<Order | null>();
  orderExists = input<boolean>(false);
  orderItemsWithProducts = input<OrderItemWithProduct[]>([]);

  continueShopping = output<void>();
  viewOrders = output<void>();
}
