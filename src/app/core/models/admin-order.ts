import { CustomerInfo, OrderApi, OrderStatusHistoryEntry } from './order';

export interface PaymentDetails {
  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: string;
  transactionId?: string;
}

export interface AdminOrderApi extends OrderApi {
  customerInfo: CustomerInfo;
  updatedAt?: string;
  paymentDetails?: PaymentDetails;
  statusHistory?: OrderStatusHistoryEntry[];
  refunds: RefundRecord[];
}

export interface AdminOrderApiResponse {
  data: AdminOrderApi;
  message: string;
  status: string;
  statusCode: number;
  timestamp?: string;
}

export interface AdminOrderListApiResponse {
  data: {
    orders: AdminOrderApi[];
    totalCount: number;
    page: number;
    size: number;
  };
  message: string;
  status: string;
  statusCode: number;
}

export interface AdminOrderFilterParams {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderStatusUpdateRequest {
  newStatus: string;
  notes?: string;
}

export interface OrderPriceAdjustRequest {
  discount?: number;
  shippingCost?: number;
  reason: string;
}

export interface RefundRequest {
  type: 'FULL' | 'PARTIAL';
  amount?: number;
  reason: string;
  restoreInventory: boolean;
}

export interface RefundRecord {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  processedBy?: string;
}

export interface RefundListApiResponse {
  data: RefundRecord[];
  message: string;
  status: string;
  statusCode: number;
}

export interface DeleteStaleApiResponse {
  data: null;
  message: string;
  status: string;
  statusCode: number;
}
