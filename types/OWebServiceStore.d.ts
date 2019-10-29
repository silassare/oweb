import { GoblSinglePKEntity } from 'gobl-utils-ts';
import OWebService, { tServiceGetSuccess, tServiceFail, tServiceAddSuccess, tServiceRequestOptions, tServiceGetAllSuccess, tServiceUpdateSuccess, tServiceDeleteSuccess, iServiceUpdateResponse, iServiceAddResponse, iServiceDeleteResponse } from './OWebService';
import OWebApp from './OWebApp';
import OWebCom from './OWebCom';
export declare type tEntitiesOrderByCb<T> = (a: T, b: T) => number;
export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected items: {
        [key: string]: T;
    };
    protected relations: {
        [key: string]: any;
    };
    constructor(app_context: OWebApp, entity: typeof GoblSinglePKEntity, service_name: string);
    getItem(id: string, relations?: string, then?: tServiceGetSuccess<T>, fail?: tServiceFail, freeze?: boolean, load_cache_first?: boolean, dialog?: boolean): OWebCom;
    getAllItems(options?: tServiceRequestOptions, then?: tServiceGetAllSuccess<T>, fail?: tServiceFail, freeze?: boolean, force_cache?: boolean, dialog?: boolean): OWebCom;
    addItem(data: any, then?: tServiceAddSuccess<T>, fail?: tServiceFail, freeze?: boolean, dialog?: boolean): OWebCom;
    updateItem(item: T, then?: tServiceUpdateSuccess<T>, fail?: tServiceFail, freeze?: boolean, dialog?: boolean): OWebCom | false;
    deleteItem(item: T, then?: tServiceDeleteSuccess<T>, fail?: tServiceFail, freeze?: boolean, dialog?: boolean): OWebCom;
    addItemsToList(items: T[] | {
        [key: string]: T;
    }, relations?: any): void;
    addItemToList(item: T, relations?: any): void;
    private safelyAddItem;
    setSaved(target: T, response: iServiceUpdateResponse<T>): void;
    addCreated(response: iServiceAddResponse<T>): void;
    setDeleted(response: iServiceDeleteResponse<T>): void;
    itemRelation<Z>(item: T, relation: string): Z | undefined;
    identify(id: string, checkCache?: boolean): T | undefined;
    list(ids?: string[]): T[];
    orderBy(orderFn: tEntitiesOrderByCb<T>): T[];
    orderByValueOf(column: string): T[];
    select(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    search(list: T[] | undefined, search: string, stringBuilder: (value: T, index: number) => string): T[];
    totalCount(): number;
}
