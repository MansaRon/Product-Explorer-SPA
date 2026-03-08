import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from '@angular/core';
import { DeliveryOption, PaymentMethod, ShippingAddress } from '../../../core/models/checkout';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { ProductService } from '../../../core/services/product/product.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe]
})
export class OrderComponent {
  private readonly cartService = inject(CartService);
  private readonly productService = inject(ProductService);

  shippingAddress = input<ShippingAddress | undefined>();
  deliveryOption = input<DeliveryOption | undefined>();
  paymentMethod = input<PaymentMethod | undefined>();
  submitTrigger = input<number>(0);

  editShipping = output<void>();
  editDelivery = output<void>();
  editPayment = output<void>();
  placeOrder = output<void>();
  formValidity = output<boolean>();

  protected readonly cartItems = this.cartService.items;
  protected readonly subTotal = this.cartService.subTotal;
  protected readonly tax = this.cartService.tax;
  protected readonly total = this.cartService.total;

  protected readonly cartWithProducts = computed(() => {
    return this.cartItems().map(item => {
      const product = this.productService.getProductById(item.productId);
      return {
        ...item,
        product
      };
    });
  });

  constructor() {
    effect(() => {
      const shipping = this.shippingAddress();
      const delivery = this.deliveryOption();
      const payment = this.paymentMethod();
      const hasItems = this.cartItems().length > 0;

      const isValid = !!shipping && !!delivery && !!payment && hasItems;
      this.formValidity.emit(isValid);
    });

    effect(() => {
      const trigger = this.submitTrigger();
      if (trigger > 0) {
        this.onPlaceOrder();
      }
    });
  }

  private onPlaceOrder(): void {
    this.placeOrder.emit();
  }

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
  
