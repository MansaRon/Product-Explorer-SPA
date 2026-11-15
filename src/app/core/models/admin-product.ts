import { Product } from './product';

export interface AdminProductFilterParams {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
}

export interface ProductCreateRequest {
  title: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  rate: number;
}

export type ProductUpdateRequest = Partial<ProductCreateRequest>;

export interface AdminReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  flagged?: boolean;
  verifiedPurchase?: boolean;
}

export interface AdminProductListApiResponse {
  data: {
    products: Product[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  };
  message: string;
  status: string;
  statusCode: number;
}

export interface AdminProductApiResponse {
  data: Product;
  message: string;
  status: string;
  statusCode: number;
}

export interface AdminReviewListApiResponse {
  data: AdminReview[];
  message: string;
  status: string;
  statusCode: number;
}
