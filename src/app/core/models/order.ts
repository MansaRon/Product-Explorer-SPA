import { DeliveryOption, PaymentMethod, ShippingAddress } from './checkout';

export interface OrderStatusHistoryEntry {
  status: string;
  timestamp: string;
  notes?: string;
  updatedBy?: string;
}

export interface OrderTrackingData {
  orderNumber: string;
  currentStatus: string;
  shippingMethod: string;
  cancellable: boolean;
  placedAt?: string;
  estimatedDeliveryDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  history: OrderStatusHistoryEntry[];
}

export interface OrderTrackingApiResponse {
  data: OrderTrackingData;
  message: string;
  status: string;
  statusCode: number;
}

export interface OrderItemApi {
  id: string;
  productId: string;
  productTitle: string;
  imageUrls: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  tax: number;
}

export interface OrderAddressApi {
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

export interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderApi {
  id: string;
  orderNumber: string;
  orderStatus: string;
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  shippingCost: number;
  transactionId?: string;
  createdAt?: string;
  estimatedDeliveryDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  orderItems: OrderItemApi[];
  shippingAddress: OrderAddressApi;
  billingAddress: OrderAddressApi;
}

export interface OrderApiResponse {
  data: OrderApi;
  message: string;
  status: string;
  statusCode: number;
}

export interface OrderListApiResponse {
  data: OrderApi[];
  message: string;
  status: string;
  statusCode: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: Date;
  orderNumber?: string;
  shippingAddress?: ShippingAddress;
  deliveryOption?: DeliveryOption;
  paymentMethod?: PaymentMethod;
}
