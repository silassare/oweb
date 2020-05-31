import OWebApp from './OWebApp';
import OWebCom, { IComResponse } from './OWebCom';
import OWebKeyStorage from './OWebKeyStorage';
export interface IServiceAddResponse<T> extends IComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface IServiceGetResponse<T> extends IComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface IServiceGetAllResponse<T> extends IComResponse {
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
export interface IServiceUpdateResponse<T> extends IComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface IServiceUpdateAllData extends IComResponse {
    data: {
        affected: number;
    };
}
export interface IServiceDeleteResponse<T> extends IComResponse {
    data: {
        item: T;
    };
}
export interface IServiceDeleteAllResponse<T> extends IComResponse {
    data: {
        affected: number;
    };
}
export interface IServiceGetRelationItemsResponse<T> extends IComResponse {
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
export interface IServiceGetRelationItemResponse<T> extends IComResponse {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export declare type tServiceAddSuccess<T> = (response: IServiceAddResponse<T>) => void;
export declare type tServiceUpdateSuccess<T> = (response: IServiceUpdateResponse<T>) => void;
export declare type tServiceUpdateAllSuccess<T> = (response: IServiceUpdateAllData) => void;
export declare type tServiceDeleteSuccess<T> = (response: IServiceDeleteResponse<T>) => void;
export declare type tServiceDeleteAllSuccess<T> = (response: IServiceDeleteAllResponse<T>) => void;
export declare type tServiceGetSuccess<T> = (response: IServiceGetResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetAllSuccess<T> = (response: IServiceGetAllResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetRelationSuccess<T> = (response: IServiceGetRelationItemResponse<T>, fromCache: boolean) => void;
export declare type tServiceGetRelationItemsSuccess<T> = (response: IServiceGetRelationItemsResponse<T>, fromCache: boolean) => void;
export declare type tServiceFail = (response: IComResponse, com: OWebCom) => void;
export declare type tFilterCondition = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'like' | 'not_like';
export declare type tFilter = {
    0: tFilterCondition;
    1: string | string[] | number;
    2?: 'or' | 'and';
} | {
    0: 'is_null' | 'is_not_null';
    1?: 'or' | 'and';
};
export declare type tFiltersMap = {
    [key: string]: tFilter[];
};
export declare type tServiceRequestOptions = {
    data?: any;
    filters?: tFiltersMap;
    relations?: string;
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
};
export default class OWebService<T> {
    protected readonly appContext: OWebApp;
    private readonly _keyStore;
    private readonly _baseData;
    /**
     * @param appContext The app context.
     * @param serviceName The service name.
     * @param persistentCache To enable persistence data caching.
     */
    constructor(appContext: OWebApp, serviceName: string, persistentCache?: boolean);
    /**
     * Returns the service name.
     */
    getName(): string;
    /**
     * Returns the service URI.
     */
    getServiceURI(): string;
    /**
     * Returns entity URI.
     *
     * @param id The entity id.
     */
    getItemURI(id: any): string;
    /**
     * Returns entity relation URI.
     *
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(id: string, relation: string): string;
    /**
     * Cache manager getter.
     */
    getCacheManager(): OWebKeyStorage;
    /**
     * Adds an entity.
     *
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    addRequest(formData: any, success: tServiceAddSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     * @param success
     * @param fail
     * @param freeze
     */
    deleteRequest(id: string, success: tServiceDeleteSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    updateRequest(id: string, formData: any, success: tServiceUpdateSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    /**
     * Deletes all entities.
     *
     * @param options
     * @param success
     * @param fail
     * @param freeze
     */
    deleteAllRequest(options: tServiceRequestOptions, success: tServiceDeleteAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    /**
     * Updates all entities.
     *
     * @param options
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    updateAllRequest(options: tServiceRequestOptions, formData: any, success: tServiceUpdateAllSuccess<T>, fail: tServiceFail, freeze?: boolean): OWebCom;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     * @param success
     * @param fail
     * @param freeze
     * @param loadCacheFirst
     */
    getRequest(id: string, relations: string | undefined, success: tServiceGetSuccess<T>, fail: tServiceFail, freeze?: boolean, loadCacheFirst?: boolean): OWebCom;
    /**
     * Gets all entities.
     *
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getAllRequest(options: tServiceRequestOptions, success: tServiceGetAllSuccess<T>, fail: tServiceFail, freeze?: boolean, forceCache?: boolean, loadCacheFirst?: boolean): OWebCom;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getRelationRequest<R>(id: string, relation: string, success: tServiceGetRelationSuccess<R>, fail: tServiceFail, freeze?: boolean, forceCache?: boolean, loadCacheFirst?: boolean): OWebCom;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: tServiceRequestOptions, success: tServiceGetRelationItemsSuccess<R>, fail: tServiceFail, freeze?: boolean, forceCache?: boolean, loadCacheFirst?: boolean): OWebCom;
}
