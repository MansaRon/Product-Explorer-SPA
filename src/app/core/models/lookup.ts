export type LookupType = 'PROVINCE' | 'DELIVERY_OPTION' | 'PAYMENT_METHOD' | 'CATEGORY';

export interface LookupValue {
  id: string;
  type: LookupType;
  code: string;
  label: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
  active: boolean;
}

export interface LookupApiResponse {
  data: LookupValue[];
  message: string;
  status: string;
  statusCode: number;
}

export interface LookupItemApiResponse {
  data: LookupValue;
  message: string;
  status: string;
  statusCode: number;
}

export interface LookupCreateRequest {
  type: LookupType;
  code: string;
  label: string;
  active?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}

export interface LookupUpdateRequest {
  label?: string;
  active?: boolean;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
}
