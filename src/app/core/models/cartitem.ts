import { Product } from './product';

export interface CartItem {
  productDTO: Product;
  quantity: number;
  discount: number;
  tax: number;
  productPrice: number;
}

export interface CartResponse {
  data: {
    cartItems: CartItem[];
  };
  message: string;
  status: string;
  statusCode: number;
}
