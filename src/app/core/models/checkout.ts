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
  
export type CheckoutStep = 'shipping' | 'delivery' | 'payment' | 'review' | "confirmation";
  
export const SOUTH_AFRICAN_PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
] as const;
  
export const DELIVERY_OPTIONS: DeliveryOption[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Delivered within 5-7 business days',
      estimatedDays: '5-7 days',
      price: 0
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: 'Delivered within 2-3 business days',
      estimatedDays: '2-3 days',
      price: 50
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Delivered next business day',
      estimatedDays: 'Next day',
      price: 150
    }
];
  
export const PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      label: 'Credit/Debit Card'
    },
    {
      id: 'eft',
      type: 'eft',
      label: 'EFT/Bank Transfer'
    },
    {
      id: 'cash',
      type: 'cash',
      label: 'Cash on Delivery'
    }
];