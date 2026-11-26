import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DeliveryOption, PaymentMethod, ShippingAddress } from '../../../core/models/checkout';
import { CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart/cart.service';
import { CheckoutService } from '../../../core/services/checkout/checkout.service';
import { CouponValidationDTO } from '../../../core/models/coupon';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CurrencyPipe, ReactiveFormsModule],
})
export class OrderComponent {
  private readonly cartService = inject(CartService);
  private readonly checkoutService = inject(CheckoutService);
  private readonly destroyRef = inject(DestroyRef);

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

  protected readonly appliedCouponCode = this.checkoutService.appliedCouponCode;
  protected readonly appliedDiscount = this.checkoutService.appliedDiscount;
  protected readonly discountedTotal = computed(
    () => this.total() - this.checkoutService.appliedDiscount()
  );

  protected readonly couponControl = new FormControl('', { nonNullable: true });
  protected readonly couponValidation = signal<CouponValidationDTO | null>(null);
  protected readonly isCouponValidating = signal(false);
  protected readonly isCouponApplying = signal(false);

  protected readonly cartWithProducts = computed(() =>
    this.cartItems()
      .map((item) => ({
        productId: item.productDTO?.id ?? '',
        product: item.productDTO,
        quantity: item.quantity,
        productPrice: item.productPrice,
      }))
      .filter((item) => !!item.product)
  );

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

    this.couponControl.valueChanges
      .pipe(
        debounceTime(300),
        filter((code) => code.trim().length > 0),
        switchMap((code) => {
          this.isCouponValidating.set(true);
          this.couponValidation.set(null);
          return this.checkoutService.validateCoupon(code.trim().toUpperCase());
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (result) => {
          this.couponValidation.set(result);
          this.isCouponValidating.set(false);
        },
        error: () => this.isCouponValidating.set(false),
      });
  }

  protected applyCoupon(): void {
    const code = this.couponControl.value.trim().toUpperCase();
    if (!code) return;
    this.isCouponApplying.set(true);
    this.checkoutService.applyCoupon(code).subscribe({
      next: () => {
        this.couponValidation.set(null);
        this.couponControl.setValue('');
        this.isCouponApplying.set(false);
      },
      error: () => this.isCouponApplying.set(false),
    });
  }

  protected removeCoupon(): void {
    this.checkoutService.removeCoupon().subscribe();
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
