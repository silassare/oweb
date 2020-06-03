import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { IOZoneApiAddResponse, IOZoneApiDeleteResponse, IOZoneApiRequestOptions, IOZoneApiUpdateResponse } from './ozone';
import OWebApp from './OWebApp';
import OWebService from './OWebService';
export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected items: {
        [key: string]: T;
    };
    protected relations: {
        [key: string]: any;
    };
    constructor(appContext: OWebApp, entity: typeof GoblSinglePKEntity, service: string);
    getItem(id: string, relations?: string): import("./OWebXHR").default<import("./ozone").IOZoneApiGetResponse<T>>;
    getAllItems(options?: IOZoneApiRequestOptions): import("./OWebXHR").default<import("./ozone").IOZoneApiGetAllResponse<T>>;
    addItem(data: any): import("./OWebXHR").default<IOZoneApiAddResponse<T>>;
    updateItem(item: T, freeze?: boolean): false | import("./OWebXHR").default<IOZoneApiUpdateResponse<T>>;
    deleteItem(item: T): import("./OWebXHR").default<IOZoneApiDeleteResponse<T>>;
    addItemsToList(items: T[] | {
        [key: string]: T;
    }, relations?: any): void;
    addItemToList(item: T, relations?: any): void;
    private safelyAddItem;
    setSaved(target: T, response: IOZoneApiUpdateResponse<T>): void;
    addCreated(response: IOZoneApiAddResponse<T>): void;
    setDeleted(response: IOZoneApiDeleteResponse<T>): void;
    itemRelation<Z>(item: T, relation: string): Z | undefined;
    identify(id: string, checkCache?: boolean): T | undefined;
    list(ids?: string[]): T[];
    orderBy(order: (a: T, b: T) => number): T[];
    orderByValueOf(column: string): T[];
    select(list: T[] | undefined, predicate: (value: T, index: number) => boolean, max?: number): T[];
    search(list: T[] | undefined, search: string, stringBuilder: (value: T, index: number) => string): T[];
    totalCount(): number;
}
