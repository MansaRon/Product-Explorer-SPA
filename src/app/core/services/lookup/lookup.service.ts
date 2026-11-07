import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LookupApiResponse, LookupType, LookupValue } from '../../models/lookup';
import { DeliveryOption, PaymentMethod } from '../../models/checkout';
import { skipNotFoundRedirect } from '../interceptor/error/error.interceptor';

const FALLBACK_PROVINCES: string[] = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];

const FALLBACK_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'STANDARD',
    name: 'Standard Delivery',
    description: 'Delivered within 5-7 business days',
    estimatedDays: '5-7 days',
    price: 0,
  },
  {
    id: 'EXPRESS',
    name: 'Express Delivery',
    description: 'Delivered within 2-3 business days',
    estimatedDays: '2-3 days',
    price: 50,
  },
  {
    id: 'OVERNIGHT',
    name: 'Overnight Delivery',
    description: 'Delivered next business day',
    estimatedDays: 'Next day',
    price: 150,
  },
];

const FALLBACK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'CREDIT_CARD', type: 'card', label: 'Credit/Debit Card' },
  { id: 'EFT', type: 'eft', label: 'EFT/Bank Transfer' },
  { id: 'CASH_ON_DELIVERY', type: 'cash', label: 'Cash on Delivery' },
];

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly provincesSignal = signal<string[]>(FALLBACK_PROVINCES);
  private readonly deliveryOptionsSignal = signal<DeliveryOption[]>(FALLBACK_DELIVERY_OPTIONS);
  private readonly paymentMethodsSignal = signal<PaymentMethod[]>(FALLBACK_PAYMENT_METHODS);

  readonly provinces = this.provincesSignal.asReadonly();
  readonly deliveryOptions = this.deliveryOptionsSignal.asReadonly();
  readonly paymentMethods = this.paymentMethodsSignal.asReadonly();

  constructor() {
    this.load('PROVINCE');
    this.load('DELIVERY_OPTION');
    this.load('PAYMENT_METHOD');
  }

  private load(type: LookupType): void {
    this.http
      .get<LookupApiResponse>(`/lookup/${type}`, { context: skipNotFoundRedirect() })
      .pipe(
        tap((r) => {
          if (r.data?.length) {
            this.applyResponse(type, r.data);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError(() => EMPTY)
      )
      .subscribe();
  }

  private applyResponse(type: LookupType, values: LookupValue[]): void {
    if (type === 'PROVINCE') {
      this.provincesSignal.set(values.map((v) => v.label));
    } else if (type === 'DELIVERY_OPTION') {
      this.deliveryOptionsSignal.set(values.map((v) => this.toDeliveryOption(v)));
    } else {
      this.paymentMethodsSignal.set(values.map((v) => this.toPaymentMethod(v)));
    }
  }

  private toDeliveryOption(v: LookupValue): DeliveryOption {
    return {
      id: v.code,
      name: v.label,
      description: (v.metadata?.['description'] as string) ?? '',
      estimatedDays: (v.metadata?.['estimatedDays'] as string) ?? '',
      price: (v.metadata?.['price'] as number) ?? 0,
    };
  }

  private toPaymentMethod(v: LookupValue): PaymentMethod {
    return {
      id: v.code,
      type: (v.metadata?.['iconType'] as 'card' | 'eft' | 'cash') ?? 'card',
      label: v.label,
    };
  }
}
