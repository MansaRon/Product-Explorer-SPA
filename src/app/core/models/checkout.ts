export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  price: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'eft' | 'cash';
  label: string;
}

export interface CheckoutState {
  shipping?: ShippingAddress;
  delivery?: DeliveryOption;
  payment?: PaymentMethod;
  currentStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;
}

export type CheckoutStep = 'shipping' | 'delivery' | 'payment' | 'review' | 'confirmation';

// --- Backend-aligned types ---

export type BackendPaymentMethod = 'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'EFT' | 'NOT_SELECTED';
export type BackendDeliverMethod = 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'FREE';

export interface AddressApiDto {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  apartment?: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CheckoutUpdateRequest {
  paymentMethod: BackendPaymentMethod;
  shippingAddress: AddressApiDto;
  billingAddress?: AddressApiDto;
  shippingMethod: BackendDeliverMethod;
}

export interface CheckoutApiData {
  id: string;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  estimatedDeliveryDate?: string;
}

export interface CheckoutApiResponse {
  data: CheckoutApiData;
  message: string;
  status: string;
  statusCode: number;
}

export function mapToAddressDto(address: ShippingAddress): AddressApiDto {
  return {
    fullName: address.fullName,
    phoneNumber: address.phoneNumber,
    email: address.email,
    apartment: address.apartment,
    streetAddress: address.streetAddress,
    city: address.city,
    state: address.province,
    country: address.country,
    postalCode: address.postalCode,
  };
}

export function mapToBackendPaymentMethod(method: PaymentMethod): BackendPaymentMethod {
  switch (method.id.toUpperCase()) {
    case 'CREDIT_CARD':
      return 'CREDIT_CARD';
    case 'EFT':
      return 'EFT';
    case 'CASH_ON_DELIVERY':
      return 'CASH_ON_DELIVERY';
  }
  // Fallback via type for legacy session state (id was lowercase before lookup integration)
  switch (method.type) {
    case 'card':
      return 'CREDIT_CARD';
    case 'eft':
      return 'EFT';
    case 'cash':
      return 'CASH_ON_DELIVERY';
    default:
      return 'NOT_SELECTED';
  }
}

export function mapToBackendDeliverMethod(option: DeliveryOption): BackendDeliverMethod {
  switch (option.id.toUpperCase()) {
    case 'EXPRESS':
      return 'EXPRESS';
    case 'OVERNIGHT':
      return 'OVERNIGHT';
    case 'FREE':
      return 'FREE';
    default:
      return 'STANDARD';
  }
}
