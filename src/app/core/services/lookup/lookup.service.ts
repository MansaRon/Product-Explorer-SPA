import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LookupApiResponse, LookupType, LookupValue } from '../../models/lookup';
import { DeliveryOption, PaymentMethod } from '../../models/checkout';

@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  private readonly provincesSignal = signal<string[]>([]);
  private readonly deliveryOptionsSignal = signal<DeliveryOption[]>([]);
  private readonly paymentMethodsSignal = signal<PaymentMethod[]>([]);

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
      .get<LookupApiResponse>(`/lookup/${type}`)
      .pipe(
        tap((r) => this.applyResponse(type, r.data)),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error(`Failed to load ${type} lookup values:`, err);
          return EMPTY;
        })
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
