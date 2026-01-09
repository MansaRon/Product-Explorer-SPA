// Typescript enums are not to be trusted anymore use the following format moving forward// Typescript enums are not to be trusted anymore use the following format moving forward
import { FilterParams } from "../models/filter-params";

export const initialFilterParams: FilterParams = {
    searchTerm: '',
    category: '',
    minPrice: 0,
    maxPrice: Number.MAX_SAFE_INTEGER,
    sortBy: 'name',
    sortOrder: 'asc'
} as const;

export type initialFilter = (typeof initialFilterParams)[keyof typeof initialFilterParams];