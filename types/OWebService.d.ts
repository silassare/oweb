import OWebApp from './OWebApp';
import { IOZoneApiJSON } from './ozone';
export interface IServiceAddResponse<T> extends IOZoneApiJSON<any> {
    data: {
        item: T;
    };
}
export interface IServiceGetResponse<T> extends IOZoneApiJSON<any> {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
export interface IServiceGetAllResponse<T> extends IOZoneApiJSON<any> {
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
export interface IServiceUpdateResponse<T> extends IOZoneApiJSON<any> {
    data: {
        item: T;
    };
}
export interface IServiceUpdateAllResponse extends IOZoneApiJSON<any> {
    data: {
        affected: number;
    };
}
export interface IServiceDeleteResponse<T> extends IOZoneApiJSON<any> {
    data: {
        item: T;
    };
}
export interface IServiceDeleteAllResponse extends IOZoneApiJSON<any> {
    data: {
        affected: number;
    };
}
export interface IServiceGetRelationItemsResponse<T> extends IOZoneApiJSON<any> {
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
export interface IServiceGetRelationItemResponse<T> extends IOZoneApiJSON<any> {
    data: {
        item: T;
        relations?: {
            [key: string]: any;
        };
    };
}
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
export interface IServiceRequestOptions {
    data?: any;
    filters?: tFiltersMap;
    relations?: string | string[];
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
}
export default class OWebService<T> {
    protected readonly appContext: OWebApp;
    private readonly _baseData;
    /**
     * @param appContext The app context.
     * @param service The service name.
     * @param persistentCache To enable persistence data caching.
     */
    constructor(appContext: OWebApp, service: string);
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
     * Adds an entity.
     *
     * @param formData
     */
    addRequest(formData: FormData | object): import("./OWebXHR").default<IServiceAddResponse<T>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteRequest(id: string): import("./OWebXHR").default<IServiceDeleteResponse<T>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateRequest(id: string, formData: any): import("./OWebXHR").default<IServiceUpdateResponse<T>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteAllRequest(options: IServiceRequestOptions): import("./OWebXHR").default<IServiceDeleteAllResponse>;
    /**
     * Updates all entities.
     *
     * @param options
     * @param formData
     */
    updateAllRequest(options: IServiceRequestOptions, formData: any): import("./OWebXHR").default<IServiceUpdateAllResponse>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getRequest(id: string, relations?: string): import("./OWebXHR").default<IServiceGetResponse<T>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options: IServiceRequestOptions): import("./OWebXHR").default<IServiceGetAllResponse<T>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest<R>(id: string, relation: string): import("./OWebXHR").default<IServiceGetRelationItemResponse<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: IServiceRequestOptions): import("./OWebXHR").default<IServiceGetRelationItemsResponse<R>>;
}
