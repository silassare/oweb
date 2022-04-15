import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { OApiAddResponse, OApiDeleteResponse, OApiUpdateResponse, OApiServiceRequestOptions, OApiGetAllResponse, OApiGetResponse } from './ozone';
import OWebApp from './OWebApp';
import OWebService from './OWebService';
import OWebXHR from './OWebXHR';
import { OWebFormData } from './OWebForm';
import { ONetRequestBody } from './OWebNet';
export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected items: {
        [key: string]: T;
    };
    protected relations: {
        [key: string]: any;
    };
    /**
     * OWebServiceStore constructor.
     *
     * @param _appContext
     * @param entity
     * @param service
     */
    constructor(_appContext: OWebApp, entity: typeof GoblSinglePKEntity, service: string);
    /**
     * Creates request to get an item by id.
     *
     * @param id The item id.
     * @param relations The relations to retrieve.
     */
    getItem(id: string, relations?: string): OWebXHR<OApiGetResponse<T>>;
    /**
     * Creates request to get items list.
     *
     * @param options
     */
    getItems(options?: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<T>>;
    /**
     * Creates request to add new item.
     *
     * @param data
     */
    addItem(data: OWebFormData): OWebXHR<OApiAddResponse<T>>;
    /**
     * Creates update request for a given item.
     *
     * @param item
     */
    updateItem(item: T | string, formData?: ONetRequestBody | null): OWebXHR<OApiUpdateResponse<T>>;
    /**
     * Creates a delete request for a given item.
     *
     * @param item
     */
    deleteItem(item: T | string): OWebXHR<OApiDeleteResponse<T>>;
    /**
     * Adds a list of items to this store list.
     *
     * @param items
     * @param relations
     */
    addItemsToList(items: T[] | {
        [key: string]: T;
    }, relations?: any): void;
    /**
     * Adds a given item and its relations to this store.
     *
     * @param item
     * @param relations
     */
    addItemToList(item: T, relations?: any): void;
    /**
     * Safely add item to this store.
     *
     * @param item
     * @private
     */
    private safelyAddItem;
    /**
     * Modify successfully saved item state and data.
     *
     * @param target
     * @param response
     * @private
     */
    private setSaved;
    /**
     * Adds a newly created item to this store.
     *
     * @param response
     */
    private addCreated;
    /**
     * Removes a given item from this store when deleted.
     *
     * @param response
     */
    private setDeleted;
    /**
     * Gets a given item relations.
     *
     * @param item
     * @param relation
     */
    itemRelation<Z>(item: T, relation: string): Z | undefined;
    /**
     * Identify a given item in this store by its id.
     *
     * @param id
     * @param checkCache
     */
    identify(id: string, checkCache?: boolean): T | undefined;
    /**
     * Gets this store items list.
     *
     * @param ids
     */
    list(ids?: string[]): T[];
    /**
     * Order items.
     *
     * @param order
     */
    orderBy(order: (a: T, b: T) => number): T[];
    /**
     * Order items by value of a given column.
     *
     * @param column
     */
    orderByValueOf(column: string): T[];
    /**
     * Filter items in this store or in a given list.
     *
     * @param list
     * @param predicate
     * @param max
     */
    filter(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    /**
     * Select some items in this store.
     *
     * @alias filter
     *
     * @param list
     * @param predicate
     * @param max
     */
    select(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    /**
     * Search items in this store or in a given items list.
     *
     * @param list
     * @param search
     * @param stringBuilder
     */
    search(list: T[] | undefined, search: string, stringBuilder: (value: T, index: number) => string): T[];
    /**
     * Count items in this store.
     */
    totalCount(): number;
}
