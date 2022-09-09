import OZone from './OZone';
export interface OApiResponse<R> {
    error: number;
    msg: string;
    data: R;
    utime: number;
    stime?: number;
    stoken?: string;
}
export declare type OApiAddResponse<T> = OApiResponse<{
    item: T;
}>;
export declare type OApiGetResponse<T> = OApiResponse<{
    item: T;
    relations?: {
        [key: string]: any;
    };
}>;
export declare type OApiGetAllResponse<T> = OApiResponse<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations?: {
        [key: string]: any;
    };
}>;
export declare type OApiUpdateResponse<T> = OApiResponse<{
    item: T;
}>;
export declare type OApiUpdateAllResponse = OApiResponse<{
    affected: number;
}>;
export declare type OApiDeleteResponse<T> = OApiResponse<{
    item: T;
}>;
export declare type OApiDeleteAllResponse = OApiResponse<{
    affected: number;
}>;
export declare type OApiGetPaginatedRelationItemsResponse<R> = OApiResponse<{
    items: R[];
    max?: number;
    page?: number;
    total?: number;
}>;
export declare type OApiGetRelationItemResponse<R> = OApiResponse<{
    item: R;
}>;
export declare type OApiFilterCondition = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'like' | 'not_like';
export declare type OApiFilter = {
    0: Exclude<OApiFilterCondition, 'is_null' | 'is_not_null'>;
    1: string | number | (string | number)[];
    2?: 'or' | 'and';
} | {
    0: 'is_null' | 'is_not_null';
    1?: 'or' | 'and';
};
export declare type OApiFilters = {
    [key: string]: number | string | OApiFilter[];
};
export interface OApiServiceRequestOptions {
    data?: any;
    filters?: OApiFilters;
    relations?: string | string[];
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
    [key: string]: unknown;
}
export declare function cleanRequestOptions(options: OApiServiceRequestOptions): OApiServiceRequestOptions;
export default OZone;
//# sourceMappingURL=index.d.ts.map