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
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
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
  estimatedDeliveryDate?: string;
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
