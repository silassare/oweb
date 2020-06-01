import { GoblSinglePKEntity } from 'gobl-utils-ts';
import OWebService, { IServiceAddResponse, IServiceDeleteResponse, IServiceUpdateResponse, IServiceRequestOptions } from './OWebService';
import OWebApp from './OWebApp';
export declare type tEntitiesOrderByCb<T> = (a: T, b: T) => number;
export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected items: {
        [key: string]: T;
    };
    protected relations: {
        [key: string]: any;
    };
    constructor(appContext: OWebApp, entity: typeof GoblSinglePKEntity, service: string);
    getItem(id: string, relations?: string): import("./OWebXHR").default<import("./OWebService").IServiceGetResponse<T>>;
    getAllItems(options?: IServiceRequestOptions): import("./OWebXHR").default<import("./OWebService").IServiceGetAllResponse<T>>;
    addItem(data: any): import("./OWebXHR").default<IServiceAddResponse<T>>;
    updateItem(item: T, freeze?: boolean): false | import("./OWebXHR").default<IServiceUpdateResponse<T>>;
    deleteItem(item: T): import("./OWebXHR").default<IServiceDeleteResponse<T>>;
    addItemsToList(items: T[] | {
        [key: string]: T;
    }, relations?: any): void;
    addItemToList(item: T, relations?: any): void;
    private safelyAddItem;
    setSaved(target: T, response: IServiceUpdateResponse<T>): void;
    addCreated(response: IServiceAddResponse<T>): void;
    setDeleted(response: IServiceDeleteResponse<T>): void;
    itemRelation<Z>(item: T, relation: string): Z | undefined;
    identify(id: string, checkCache?: boolean): T | undefined;
    list(ids?: string[]): T[];
    orderBy(orderFn: tEntitiesOrderByCb<T>): T[];
    orderByValueOf(column: string): T[];
    select(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    search(list: T[] | undefined, search: string, stringBuilder: (value: T, index: number) => string): T[];
    totalCount(): number;
}
