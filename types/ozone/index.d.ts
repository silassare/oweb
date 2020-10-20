import OZone from './OZone';
export interface OApiJSON<R> {
    error: number;
    msg: string;
    data: R;
    utime: number;
    stime?: number;
    stoken?: string;
}
export declare type OApiAddJSON<T> = OApiJSON<{
    item: T;
}>;
export declare type OApiGetJSON<T> = OApiJSON<{
    item: T;
    relations?: {
        [key: string]: any;
    };
}>;
export declare type OApiGetAllJSON<T> = OApiJSON<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations?: {
        [key: string]: any;
    };
}>;
export declare type OApiUpdateJSON<T> = OApiJSON<{
    item: T;
}>;
export declare type OApiUpdateAllJSON = OApiJSON<{
    affected: number;
}>;
export declare type OApiDeleteJSON<T> = OApiJSON<{
    item: T;
}>;
export declare type OApiDeleteAllJSON = OApiJSON<{
    affected: number;
}>;
export declare type OApiGetRelationItemsJSON<T> = OApiJSON<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations: {
        [key: string]: any;
    };
}>;
export declare type OApiGetRelationItemJSON<T> = OApiJSON<{
    item: T;
    relations?: {
        [key: string]: any;
    };
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
export declare type OApiFiltersMap = {
    [key: string]: number | string | OApiFilter[];
};
export interface OApiRequestOptions {
    data?: any;
    filters?: OApiFiltersMap;
    relations?: string | string[];
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
}
export declare function cleanRequestOptions(options: OApiRequestOptions): OApiRequestOptions;
export default OZone;
