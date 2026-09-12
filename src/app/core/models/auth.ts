export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export type AuthFormData =
  | ({ mode: 'login' } & LoginRequest)
  | ({ mode: 'register' } & RegisterRequest)
  | ({ mode: 'forgot-password' } & ForgotPasswordRequest);

export interface OtpConfirmRequest {
  phone: string;
  otp: string;
}
