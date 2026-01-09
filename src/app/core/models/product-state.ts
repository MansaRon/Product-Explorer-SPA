import { Product } from "./product";

export interface ProductState {
    products: Product[];
    loading: boolean;
    error: string | null;
}