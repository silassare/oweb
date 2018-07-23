import OWebApp from "./OWebApp";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebCom, { tComResponse } from "./OWebCom";
export interface iServiceAddData<T> {
    item: T;
    relations?: {
        [key: string]: any;
    };
}
export interface iServiceGetData<T> {
    item: T;
    relations?: {
        [key: string]: any;
    };
}
export interface iServiceGetAllData<T> {
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations?: {
        [key: string]: any;
    };
}
export interface iServiceUpdateData<T> {
    item: T;
    relations?: {
        [key: string]: any;
    };
}
export interface iServiceUpdateAllData {
    affected: number;
}
export interface iServiceDeleteData<T> {
    item: T;
    relations?: {
        [key: string]: any;
    };
}
export interface iServiceDeleteAllData<T> {
    affected: number;
}
export interface iServiceGetRelationItemsData<T, R> {
    target: T;
    items: R[];
    max?: number;
    page?: number;
    total?: number;
}
export interface iServiceGetRelationItemData<T, R> {
    target: T;
    item?: R;
}
export declare type tServiceAddSuccess<T> = (response: iServiceAddData<T>) => void;
export declare type tServiceUpdateSuccess<T> = (response: iServiceUpdateData<T>) => void;
export declare type tServiceUpdateAllSuccess<T> = (response: iServiceUpdateAllData) => void;
export declare type tServiceDeleteSuccess<T> = (response: iServiceDeleteData<T>) => void;
export declare type tServiceDeleteAllSuccess<T> = (response: iServiceDeleteAllData<T>) => void;
export declare type tServiceGetSuccess<T> = (response: iServiceGetData<T>, fromCache: boolean) => void;
export declare type tServiceGetAllSuccess<T> = (response: iServiceGetAllData<T>, fromCache: boolean) => void;
export declare type tServiceGetRelationSuccess<T, R> = (response: iServiceGetRelationItemData<T, R>, fromCache: boolean) => void;
export declare type tServiceGetRelationItemsSuccess<T, R> = (response: iServiceGetRelationItemsData<T, R>, fromCache: boolean) => void;
export declare type tServiceFail = (response: tComResponse) => void;
export declare type tServiceRequestOptions = {
    max?: number;
    page?: number;
    filters?: any;
};
export default class OWebService<T> {
    private readonly app_context;
    private readonly item_id_name;
    private readonly _key_store;
    private readonly _base_data;
    constructor(app_context: OWebApp, service_name: string, item_id_name: string);
    getServiceURI(): string;
    getItemURI(id: any): string;
    getItemRelationURI(id: string, relation: string): string;
    getCacheManager(): OWebKeyStorage;
    add(formData: any, success: tServiceAddSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    delete(id: string, success: tServiceDeleteSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    update(id: string, formData: any, success: tServiceUpdateSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    deleteAll(options: tServiceRequestOptions, success: tServiceDeleteAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    updateAll(options: tServiceRequestOptions, formData: any, success: tServiceUpdateAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    get(id: string, success: tServiceGetSuccess<T>, fail: tServiceFail, freeze?: boolean, load_cache_first?: boolean): OWebCom;
    getAll(options: tServiceRequestOptions, success: tServiceGetAllSuccess<T>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    getRelation<R>(id: string, relation: string, success: tServiceGetRelationSuccess<T, R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    getRelationItems<R>(id: string, relation: string, options: tServiceRequestOptions, success: tServiceGetRelationItemsSuccess<T, R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
}
