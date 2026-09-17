export interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  reviewDate: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  rate: number;
  quantity: number;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
}
