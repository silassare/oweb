export interface IOZoneApiJSON<R> {
    error: number;
    msg: string;
    data: R;
    utime: number;
    stime?: number;
    stoken?: string;
}
export interface IOZoneApiAddResponse<T> extends IOZoneApiJSON<{
    item: T;
}> {
}
export interface IOZoneApiGetResponse<T> extends IOZoneApiJSON<{
    item: T;
    relations?: {
        [key: string]: any;
    };
}> {
}
export interface IOZoneApiGetAllResponse<T> extends IOZoneApiJSON<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations?: {
        [key: string]: any;
    };
}> {
}
export interface IOZoneApiUpdateResponse<T> extends IOZoneApiJSON<{
    item: T;
}> {
}
export interface IOZoneApiUpdateAllResponse extends IOZoneApiJSON<{
    affected: number;
}> {
}
export interface IOZoneApiDeleteResponse<T> extends IOZoneApiJSON<{
    item: T;
}> {
}
export interface IOZoneApiDeleteAllResponse extends IOZoneApiJSON<{
    affected: number;
}> {
}
export interface IOZoneApiGetRelationItemsResponse<T> extends IOZoneApiJSON<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations: {
        [key: string]: any;
    };
}> {
}
export interface IOZoneApiGetRelationItemResponse<T> extends IOZoneApiJSON<{
    item: T;
    relations?: {
        [key: string]: any;
    };
}> {
}
export declare type tOZoneApiFilterCondition = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'like' | 'not_like';
export declare type tOZoneApiFilter = {
    0: tOZoneApiFilterCondition;
    1: string | string[] | number;
    2?: 'or' | 'and';
} | {
    0: 'is_null' | 'is_not_null';
    1?: 'or' | 'and';
};
export declare type tOZoneApiFiltersMap = {
    [key: string]: tOZoneApiFilter[];
};
export interface IOZoneApiRequestOptions {
    data?: any;
    filters?: tOZoneApiFiltersMap;
    relations?: string | string[];
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
}
