export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'AWAITING_CONFIRMATION';

export interface AdminUserApi {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt?: string;
  blockedReason?: string;
}

export interface AdminUserFilterParams {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}

export interface UserBlockRequest {
  blocked: boolean;
  reason?: string;
}

export interface UserResetRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface AdminUserListApiResponse {
  data: {
    users: AdminUserApi[];
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

export interface AdminUserApiResponse {
  data: AdminUserApi;
  message: string;
  status: string;
  statusCode: number;
}
