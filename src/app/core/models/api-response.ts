export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface PagedData<T> {
  products: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PagedApiResponse<T> {
  data: { items: T[]; totalCount: number; page: number; size: number };
  message: string;
  status: string;
  statusCode: number;
}
