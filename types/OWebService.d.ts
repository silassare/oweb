import OWebApp from './OWebApp';
import OWebCom, { iComResponse } from './OWebCom';
import OWebKeyStorage from './OWebKeyStorage';
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
    data?: any;
    filters?: any;
    relations?: string;
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
};
export default class OWebService<T> {
    protected readonly app_context: OWebApp;
    private readonly _key_store;
    private readonly _base_data;
    /**
     * @param app_context The app context.
     * @param service_name The service name.
     * @param persistent_cache To enable persistence data caching.
     */
    constructor(app_context: OWebApp, service_name: string, persistent_cache?: boolean);
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
     * @param load_cache_first
     */
    getRequest(id: string, relations: string | undefined, success: tServiceGetSuccess<T>, fail: tServiceFail, freeze?: boolean, load_cache_first?: boolean): OWebCom;
    /**
     * Gets all entities.
     *
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param force_cache
     * @param load_cache_first
     */
    getAllRequest(options: tServiceRequestOptions, success: tServiceGetAllSuccess<T>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     * @param success
     * @param fail
     * @param freeze
     * @param force_cache
     * @param load_cache_first
     */
    getRelationRequest<R>(id: string, relation: string, success: tServiceGetRelationSuccess<R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param force_cache
     * @param load_cache_first
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: tServiceRequestOptions, success: tServiceGetRelationItemsSuccess<R>, fail: tServiceFail, freeze?: boolean, force_cache?: boolean, load_cache_first?: boolean): OWebCom;
}
