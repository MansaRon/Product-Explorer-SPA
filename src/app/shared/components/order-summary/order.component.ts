import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DeliveryOption, PaymentMethod, ShippingAddress } from '../../../core/models/checkout';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe]
})
export class OrderComponent {
  summary = input.required<OrderSummaryData>();

  editShipping = output<void>();
  editDelivery = output<void>();
  editPayment = output<void>();

  protected handleEditShipping(): void {
    this.editShipping.emit();
  }

  protected handleEditDelivery(): void {
    this.editDelivery.emit();
  }

  protected handleEditPayment(): void {
    this.editPayment.emit();
  }
}

export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: {
    name: string;
    imageUrl?: string;
    price: number;
  };
}

export interface OrderSummaryData {
  shipping: ShippingAddress;
  delivery: DeliveryOption;
  payment: PaymentMethod;
  items: CartItemWithProduct[];
  subtotal: number;
  deliveryCost: number;
  tax: number;
  total: number;
}
  
