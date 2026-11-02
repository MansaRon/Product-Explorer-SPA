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

// TODO move this to the backend
export const SOUTH_AFRICAN_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
] as const;

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivered within 5-7 business days',
    estimatedDays: '5-7 days',
    price: 0,
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Delivered within 2-3 business days',
    estimatedDays: '2-3 days',
    price: 50,
  },
  {
    id: 'overnight',
    name: 'Overnight Delivery',
    description: 'Delivered next business day',
    estimatedDays: 'Next day',
    price: 150,
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    label: 'Credit/Debit Card',
  },
  {
    id: 'eft',
    type: 'eft',
    label: 'EFT/Bank Transfer',
  },
  {
    id: 'cash',
    type: 'cash',
    label: 'Cash on Delivery',
  },
];

// --- Backend-aligned types ---

export type BackendPaymentMethod = 'CREDIT_CARD' | 'CASH_ON_DELIVERY' | 'NOT_SELECTED';
export type BackendDeliverMethod = 'DHL' | 'FedEx' | 'Express' | 'FREE';

export interface AddressApiDto {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CheckoutUpdateRequest {
  paymentMethod: BackendPaymentMethod;
  shippingAddress: AddressApiDto;
  billingAddress: AddressApiDto;
  shippingMethod: BackendDeliverMethod;
}

export interface CheckoutApiData {
  id: string;
  subtotal: number;
  discount: number;
  tax: number;
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
    streetAddress: address.streetAddress,
    city: address.city,
    state: address.province,
    country: address.country,
    postalCode: address.postalCode,
  };
}

export function mapToBackendPaymentMethod(method: PaymentMethod): BackendPaymentMethod {
  switch (method.type) {
    case 'card':
      return 'CREDIT_CARD';
    case 'cash':
      return 'CASH_ON_DELIVERY';
    default:
      return 'NOT_SELECTED'; // EFT has no backend equivalent — backend gap
  }
}

export function mapToBackendDeliverMethod(option: DeliveryOption): BackendDeliverMethod {
  switch (option.id) {
    case 'express':
      return 'Express';
    case 'overnight':
      return 'DHL';
    default:
      return 'FREE'; // standard → FREE
  }
}
