import { Injectable, signal, computed } from '@angular/core';
import { 
  CheckoutState, 
  CheckoutStep, 
  ShippingAddress, 
  DeliveryOption, 
  PaymentMethod 
} from '../../models/checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // Private state
  private readonly checkoutState = signal<CheckoutState>({
    currentStep: 'shipping',
    completedSteps: new Set<CheckoutStep>()
  });

  // Public readonly state
  readonly state = this.checkoutState.asReadonly();

  // Computed: Current step
  readonly currentStep = computed(() => this.checkoutState().currentStep);

  // Computed: Shipping info
  readonly shippingAddress = computed(() => this.checkoutState().shipping);

  // Computed: Delivery option
  readonly deliveryOption = computed(() => this.checkoutState().delivery);

  // Computed: Payment method
  readonly paymentMethod = computed(() => this.checkoutState().payment);

  // Computed: Check if step is completed
  readonly isStepCompleted = computed(() => (step: CheckoutStep) => {
    return this.checkoutState().completedSteps.has(step);
  });

  // Computed: Check if can proceed to next step
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
      default:
        return false;
    }
  });

  // Computed: Checkout progress percentage
  readonly progressPercentage = computed(() => {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  });

  /**
   * Save shipping address and mark step as completed
   */
  setShippingAddress(address: ShippingAddress): void {
    this.checkoutState.update(state => ({
      ...state,
      shipping: address,
      completedSteps: new Set([...state.completedSteps, 'shipping'])
    }));
  }

  /**
   * Save delivery option and mark step as completed
   */
  setDeliveryOption(option: DeliveryOption): void {
    this.checkoutState.update(state => ({
      ...state,
      delivery: option,
      completedSteps: new Set([...state.completedSteps, 'delivery'])
    }));
  }

  /**
   * Save payment method and mark step as completed
   */
  setPaymentMethod(method: PaymentMethod): void {
    this.checkoutState.update(state => ({
      ...state,
      payment: method,
      completedSteps: new Set([...state.completedSteps, 'payment'])
    }));
  }

  /**
   * Navigate to a specific step
   */
  goToStep(step: CheckoutStep): void {
    this.checkoutState.update(state => ({
      ...state,
      currentStep: step
    }));
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    
    if (currentIndex < steps.length - 1) {
      this.goToStep(steps[currentIndex + 1]);
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    const steps: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review'];
    const currentIndex = steps.indexOf(this.checkoutState().currentStep);
    
    if (currentIndex > 0) {
      this.goToStep(steps[currentIndex - 1]);
    }
  }

  /**
   * Reset checkout state
   */
  resetCheckout(): void {
    this.checkoutState.set({
      currentStep: 'shipping',
      completedSteps: new Set<CheckoutStep>()
    });
  }

  /**
   * Get order summary for final review
   */
  getOrderSummary = computed(() => {
    const state = this.checkoutState();
    return {
      shipping: state.shipping,
      delivery: state.delivery,
      payment: state.payment,
      isComplete: !!state.shipping && !!state.delivery && !!state.payment
    };
  });
}