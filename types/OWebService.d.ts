import OWebApp from './OWebApp';
import { IOZoneApiAddResponse, IOZoneApiDeleteAllResponse, IOZoneApiDeleteResponse, IOZoneApiGetAllResponse, IOZoneApiGetRelationItemResponse, IOZoneApiGetRelationItemsResponse, IOZoneApiGetResponse, IOZoneApiRequestOptions, IOZoneApiUpdateAllResponse, IOZoneApiUpdateResponse } from './ozone';
export default class OWebService<Entity> {
    protected readonly appContext: OWebApp;
    private readonly _baseData;
    /**
     * @param appContext The app context.
     * @param service The service name.
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
    addRequest(formData: FormData | object): import("./OWebXHR").default<IOZoneApiAddResponse<Entity>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteRequest(id: string): import("./OWebXHR").default<IOZoneApiDeleteResponse<Entity>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateRequest(id: string, formData: any): import("./OWebXHR").default<IOZoneApiUpdateResponse<Entity>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteAllRequest(options: IOZoneApiRequestOptions): import("./OWebXHR").default<IOZoneApiDeleteAllResponse>;
    /**
     * Updates all entities.
     *
     * @param options
     * @param formData
     */
    updateAllRequest(options: IOZoneApiRequestOptions, formData: any): import("./OWebXHR").default<IOZoneApiUpdateAllResponse>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getRequest(id: string, relations?: string): import("./OWebXHR").default<IOZoneApiGetResponse<Entity>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options: IOZoneApiRequestOptions): import("./OWebXHR").default<IOZoneApiGetAllResponse<Entity>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest<R>(id: string, relation: string): import("./OWebXHR").default<IOZoneApiGetRelationItemResponse<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: IOZoneApiRequestOptions): import("./OWebXHR").default<IOZoneApiGetRelationItemsResponse<R>>;
}
