import { Product } from './product';

export interface WishlistItem {
  id: string;
  userID: string;
  productID: string;
  productDTO: Product;
}

export interface WishlistListResponse {
  dataList: WishlistItem[];
  message: string;
  status: string;
  statusCode: number;
}

export interface WishlistSingleResponse {
  data: WishlistItem;
  message: string;
  status: string;
  statusCode: number;
}

export interface WishlistDeleteResponse {
  dataDelete: string;
  message: string;
  status: string;
  statusCode: number;
}
