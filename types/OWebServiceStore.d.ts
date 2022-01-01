import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { OApiAddResponse, OApiDeleteResponse, OApiUpdateResponse, OApiServiceRequestOptions, OApiGetAllResponse, OApiGetResponse } from './ozone';
import OWebApp from './OWebApp';
import OWebService from './OWebService';
import OWebXHR from './OWebXHR';
import { OWebFormData } from './OWebForm';
export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected items: {
        [key: string]: T;
    };
    protected relations: {
        [key: string]: any;
    };
    constructor(_appContext: OWebApp, entity: typeof GoblSinglePKEntity, service: string);
    getItemRequest(id: string, relations?: string): OWebXHR<OApiGetResponse<T>>;
    getItemsListRequest(options?: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<T>>;
    addItemRequest(data: OWebFormData): OWebXHR<OApiAddResponse<T>>;
    updateItemRequest(item: T): OWebXHR<OApiUpdateResponse<T>>;
    deleteItemRequest(item: T): OWebXHR<OApiDeleteResponse<T>>;
    addItemsToList(items: T[] | {
        [key: string]: T;
    }, relations?: any): void;
    addItemToList(item: T, relations?: any): void;
    private safelyAddItem;
    private setSaved;
    private addCreated;
    private setDeleted;
    itemRelation<Z>(item: T, relation: string): Z | undefined;
    identify(id: string, checkCache?: boolean): T | undefined;
    list(ids?: string[]): T[];
    orderBy(order: (a: T, b: T) => number): T[];
    orderByValueOf(column: string): T[];
    filter(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    select(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    search(list: T[] | undefined, search: string, stringBuilder: (value: T, index: number) => string): T[];
    totalCount(): number;
}
