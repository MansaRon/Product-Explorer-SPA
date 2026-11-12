export interface TopSellingProduct {
  productId: string;
  title: string;
  quantitySold: number;
  revenue: number;
}

export interface SalesByDay {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface AdminStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  topSellingProducts: TopSellingProduct[];
  salesByDay: SalesByDay[];
}

export interface AdminStatisticsApiResponse {
  data: AdminStatistics;
  message: string;
  status: string;
  statusCode: number;
  timestamp?: string;
}
