import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';
import {
  CheckoutApiData,
  CheckoutApiResponse,
  CheckoutState,
  CheckoutStep,
  CheckoutUpdateRequest,
  DeliveryOption,
  mapToAddressDto,
  mapToBackendDeliverMethod,
  mapToBackendPaymentMethod,
  PaymentMethod,
  ShippingAddress,
} from '../../models/checkout';
import { OrderApi, OrderApiResponse } from '../../models/order';
import { ApplyCouponRequest, CouponValidationDTO } from '../../models/coupon';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private static readonly SESSION_KEY = 'pe_checkout';

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly checkoutState = signal<CheckoutState>({
    currentStep: 'shipping',
    completedSteps: new Set<CheckoutStep>(),
  });
  private readonly appliedCouponCodeSignal = signal<string | null>(null);
  private readonly appliedDiscountSignal = signal<number>(0);
  private readonly checkoutIdSignal = signal<string | null>(null);

  readonly checkoutId = this.checkoutIdSignal.asReadonly();
  readonly appliedCouponCode = this.appliedCouponCodeSignal.asReadonly();
  readonly appliedDiscount = this.appliedDiscountSignal.asReadonly();
  readonly state = this.checkoutState.asReadonly();

  readonly currentStep = computed(() => this.checkoutState().currentStep);
  readonly shippingAddress = computed(() => this.checkoutState().shipping);
  readonly deliveryOption = computed(() => this.checkoutState().delivery);
  readonly paymentMethod = computed(() => this.checkoutState().payment);

  constructor() {
    this.restoreSession();
    effect(() => {
      const state = this.checkoutState();
      this.saveSession({
        checkoutId: this.checkoutIdSignal(),
        currentStep: state.currentStep,
        completedSteps: [...state.completedSteps],
        shipping: state.shipping,
        delivery: state.delivery,
        payment: state.payment,
        appliedCouponCode: this.appliedCouponCodeSignal(),
        appliedDiscount: this.appliedDiscountSignal(),
      });
    });
  }

  readonly isStepCompleted = computed(
    () => (step: CheckoutStep) => this.checkoutState().completedSteps.has(step)
  );

  readonly canProceed = computed(() => {
    const state = this.checkoutState();
    switch (state.currentStep) {
      case 'shipping':
        return !!state.shipping;
      case 'delivery':
        return !!state.delivery;
      case 'payment':
        return !!state.payment;
      case 'review':
        return !!state.shipping && !!state.delivery && !!state.payment;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  });

  readonly progressPercentage = computed(() => {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  });

  readonly getOrderSummary = computed(() => {
    const state = this.checkoutState();
    return {
      shipping: state.shipping,
      delivery: state.delivery,
      payment: state.payment,
      isComplete: !!state.shipping && !!state.delivery && !!state.payment,
    };
  });

  setShippingAddress(address: ShippingAddress): void {
    this.checkoutState.update((state) => ({
      ...state,
      shipping: address,
      completedSteps: new Set([...state.completedSteps, 'shipping']),
    }));
  }

  setDeliveryOption(option: DeliveryOption): void {
    this.checkoutState.update((state) => ({
      ...state,
      delivery: option,
      completedSteps: new Set([...state.completedSteps, 'delivery']),
    }));
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.checkoutState.update((state) => ({
      ...state,
      payment: method,
      completedSteps: new Set([...state.completedSteps, 'payment']),
    }));
  }

  markStepCompleted(step: CheckoutStep): void {
    this.checkoutState.update((state) => ({
      ...state,
      completedSteps: new Set([...state.completedSteps, step]),
    }));
  }

  goToStep(step: CheckoutStep): void {
    this.checkoutState.update((state) => ({ ...state, currentStep: step }));
  }

  nextStep(): void {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    if (currentIndex < steps.length - 1) {
      this.goToStep(steps[currentIndex + 1]);
    }
  }

  previousStep(): void {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review', 'confirmation'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    if (currentIndex > 0) {
      this.goToStep(steps[currentIndex - 1]);
    }
  }

  resetCheckout(): void {
    this.checkoutIdSignal.set(null);
    this.appliedCouponCodeSignal.set(null);
    this.appliedDiscountSignal.set(0);
    this.checkoutState.set({
      currentStep: 'shipping',
      completedSteps: new Set<CheckoutStep>(),
    });
    try {
      sessionStorage.removeItem(CheckoutService.SESSION_KEY);
    } catch {
      /* unavailable */
    }
  }

  validateCoupon(code: string): Observable<CouponValidationDTO> {
    const checkoutId = this.checkoutIdSignal();
    if (!checkoutId) return throwError(() => new Error('No active checkout session.'));
    const body: ApplyCouponRequest = { code };
    return this.http
      .post<{ data: CouponValidationDTO }>(`/checkout/${checkoutId}/validate-coupon`, body)
      .pipe(
        map((r) => r.data),
        takeUntilDestroyed(this.destroyRef)
      );
  }

  applyCoupon(code: string): Observable<CheckoutApiData> {
    const checkoutId = this.checkoutIdSignal();
    if (!checkoutId) return throwError(() => new Error('No active checkout session.'));
    const body: ApplyCouponRequest = { code };
    return this.http.post<CheckoutApiResponse>(`/checkout/${checkoutId}/apply-coupon`, body).pipe(
      tap((r) => {
        this.appliedCouponCodeSignal.set(r.data.couponCode);
        this.appliedDiscountSignal.set(r.data.discount);
      }),
      map((r) => r.data),
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => throwError(() => err))
    );
  }

  removeCoupon(): Observable<CheckoutApiData> {
    const checkoutId = this.checkoutIdSignal();
    if (!checkoutId) return throwError(() => new Error('No active checkout session.'));
    return this.http.delete<CheckoutApiResponse>(`/checkout/${checkoutId}/coupon`).pipe(
      tap(() => {
        this.appliedCouponCodeSignal.set(null);
        this.appliedDiscountSignal.set(0);
      }),
      map((r) => r.data),
      takeUntilDestroyed(this.destroyRef),
      catchError((err) => throwError(() => err))
    );
  }

  private saveSession(data: {
    checkoutId: string | null;
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    shipping: ShippingAddress | undefined;
    delivery: DeliveryOption | undefined;
    payment: PaymentMethod | undefined;
    appliedCouponCode: string | null;
    appliedDiscount: number;
  }): void {
    try {
      sessionStorage.setItem(CheckoutService.SESSION_KEY, JSON.stringify(data));
    } catch {
      /* unavailable */
    }
  }

  private restoreSession(): void {
    try {
      const raw = sessionStorage.getItem(CheckoutService.SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (session.checkoutId) this.checkoutIdSignal.set(session.checkoutId);
      this.checkoutState.set({
        currentStep: session.currentStep ?? 'shipping',
        completedSteps: new Set<CheckoutStep>(session.completedSteps ?? []),
        shipping: session.shipping,
        delivery: session.delivery,
        payment: session.payment,
      });
      if (session.appliedCouponCode) {
        this.appliedCouponCodeSignal.set(session.appliedCouponCode);
        this.appliedDiscountSignal.set(session.appliedDiscount ?? 0);
      }
    } catch {
      sessionStorage.removeItem(CheckoutService.SESSION_KEY);
    }
  }

  initiateCheckout(): void {
    const user = this.authService.currentUser();
    if (!user?.id || this.checkoutIdSignal()) return;

    this.http
      .post<CheckoutApiResponse>(`/checkout/${user.id}/initiate-checkout`, null)
      .pipe(
        tap((response) => this.checkoutIdSignal.set(response.data.id)),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to initiate checkout:', err);
          return EMPTY;
        })
      )
      .subscribe();
  }

  confirmCheckout(callbacks: { onSuccess: (order: OrderApi) => void; onError: () => void }): void {
    const user = this.authService.currentUser();
    const checkoutId = this.checkoutIdSignal();
    const state = this.checkoutState();

    if (!user?.id || !checkoutId || !state.shipping || !state.delivery || !state.payment) {
      callbacks.onError();
      return;
    }

    const updateRequest: CheckoutUpdateRequest = {
      paymentMethod: mapToBackendPaymentMethod(state.payment),
      shippingAddress: mapToAddressDto(state.shipping),
      billingAddress: mapToAddressDto(state.shipping),
      shippingMethod: mapToBackendDeliverMethod(state.delivery),
    };

    this.http
      .patch<CheckoutApiResponse>(`/checkout/${user.id}`, updateRequest)
      .pipe(
        switchMap(() => this.http.post<OrderApiResponse>(`/checkout/${checkoutId}/confirm`, null)),
        tap((response) => {
          try {
            sessionStorage.removeItem(CheckoutService.SESSION_KEY);
          } catch {
            /* unavailable */
          }
          callbacks.onSuccess(response.data);
        }),
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          console.error('Failed to confirm checkout:', err);
          callbacks.onError();
          return EMPTY;
        })
      )
      .subscribe();
  }
}
