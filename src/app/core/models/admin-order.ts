import { CustomerInfo, OrderApi } from './order';

export interface AdminOrderApi extends OrderApi {
  customerInfo: CustomerInfo;
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
  status: string;
  notes?: string;
}

export interface OrderPriceAdjustRequest {
  discount?: number;
  totalAmount?: number;
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
  type: 'FULL' | 'PARTIAL';
  amount: number;
  reason: string;
  initiatedBy: string;
  createdAt: string;
  status: string;
}
