import { OWebApp, OWebKeyStorage, OWebCom, iComResponse } from "./oweb";
export interface iServiceAddResponse<T> extends iComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface iServiceGetResponse<T> extends iComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface iServiceGetAllResponse<T> extends iComResponse {
    data: {
        items: T[];
        max?: number;
        page?: number;
        total?: number;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface iServiceUpdateResponse<T> extends iComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface iServiceUpdateAllData extends iComResponse {
    data: {
        affected: number;
    };
}
export interface iServiceDeleteResponse<T> extends iComResponse {
    data: {
        item: T;
    };
}
export interface iServiceDeleteAllResponse<T> extends iComResponse {
    data: {
        affected: number;
    };
}
export interface iServiceGetRelationItemsResponse<T> extends iComResponse {
    data: {
        items: T[];
        max?: number;
        page?: number;
        total?: number;
        relations: {
            [key: string]: any;
        };
    };
}
export interface iServiceGetRelationItemResponse<T> extends iComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export declare type tServiceAddSuccess<T> = (response: iServiceAddResponse<T>) => void;
export declare type tServiceUpdateSuccess<T> = (response: iServiceUpdateResponse<T>) => void;
export declare type tServiceUpdateAllSuccess<T> = (response: iServiceUpdateAllData) => void;
export declare type tServiceDeleteSuccess<T> = (response: iServiceDeleteResponse<T>) => void;
export declare type tServiceDeleteAllSuccess<T> = (response: iServiceDeleteAllResponse<T>) => void;
export declare type tServiceGetSuccess<T> = (response: iServiceGetResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetAllSuccess<T> = (response: iServiceGetAllResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetRelationSuccess<T> = (response: iServiceGetRelationItemResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetRelationItemsSuccess<T> = (response: iServiceGetRelationItemsResponse<T>, fromCache: boolean) => void;
export declare type tServiceFail = (response: iComResponse) => void;
export declare type tServiceRequestOptions = {
    max?: number;
    page?: number;
    filters?: any;
    relations?: string;
    order_by?: string;
};
export default class OWebService<T> {
    protected readonly app_context: OWebApp;
    private readonly _key_store;
    private readonly _base_data;
    constructor(app_context: OWebApp, service_name: string);
    getName(): string;
    getServiceURI(): string;
    getItemURI(id: any): string;
    getItemRelationURI(id: string, relation: string): string;
    getCacheManager(): OWebKeyStorage;
    add(formData: any, success: tServiceAddSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    delete(id: string, success: tServiceDeleteSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    update(id: string, formData: any, success: tServiceUpdateSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    deleteAll(options: tServiceRequestOptions, success: tServiceDeleteAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    updateAll(options: tServiceRequestOptions, formData: any, success: tServiceUpdateAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    get(id: string, relations: string | undefined, success: tServiceGetSuccess<T>, fail: tServiceFail, freeze?: boolean, load_cache_first?: boolean): OWebCom;
    getAll(options: tServiceRequestOptions, success: tServiceGetAllSuccess<T>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    getRelation<R>(id: string, relation: string, success: tServiceGetRelationSuccess<R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    getRelationItems<R>(id: string, relation: string, options: tServiceRequestOptions, success: tServiceGetRelationItemsSuccess<R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
}
