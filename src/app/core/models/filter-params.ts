export type SortField = 'name' | 'price' | 'rating';
export type SortOrder = 'asc' | 'desc';

export interface FilterParams {
    searchTerm: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    sortBy: SortField;
    sortOrder: SortOrder;
}