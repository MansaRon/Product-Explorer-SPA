export interface Coupon {
  id: string;
  code: string;
  amount: number;
  minSpend: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateRequest {
  code: string;
  amount: number;
  minSpend?: number;
  expiresAt: string;
  usageLimit: number;
  active?: boolean;
}

export interface CouponUpdateRequest {
  code: string;
  amount: number;
  minSpend: number;
  expiresAt: string;
  usageLimit: number;
  active: boolean;
}

export interface CouponApiResponse {
  data: Coupon;
  message: string;
  status: string;
  statusCode: number;
}

export interface CouponListApiResponse {
  data: Coupon[];
  message: string;
  status: string;
  statusCode: number;
}

export interface CouponValidationDTO {
  valid: boolean;
  code: string;
  discountAmount: number;
  reason: string | null;
}

export interface ApplyCouponRequest {
  code: string;
}
