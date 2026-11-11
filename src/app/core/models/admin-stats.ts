export interface OrderStatusStats {
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

export interface PlatformStats {
  totalUsers: number;
  blockedUsers: number;
  newUsersThisMonth: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  avgProductRating: number;
}

export interface SalesTrendPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface TopSellingProduct {
  productId: string;
  title: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface CustomerAnalytics {
  newUsersThisMonth: number;
  returningUsersThisMonth: number;
  conversionRate: number;
}
