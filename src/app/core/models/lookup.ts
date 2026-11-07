export type LookupType = 'PROVINCE' | 'DELIVERY_OPTION' | 'PAYMENT_METHOD';

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
