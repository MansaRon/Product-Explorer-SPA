export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accessToken: string;
  refreshToken: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}
