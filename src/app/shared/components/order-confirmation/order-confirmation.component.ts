import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Order } from '../../../core/services/order/order.service';
import { CheckCircleIconComponent } from '../icons/check-circle-icon/check-circle-icon.component';

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
  orderItemsWithProducts = input<any[]>([]);

  continueShopping = output<void>();
  viewOrders = output<void>();
}
