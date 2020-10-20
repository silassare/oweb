import OWebApp from './OWebApp';
import { OApiAddJSON, OApiDeleteAllJSON, OApiDeleteJSON, OApiGetAllJSON, OApiGetRelationItemJSON, OApiGetRelationItemsJSON, OApiGetJSON, OApiRequestOptions, OApiUpdateAllJSON, OApiUpdateJSON } from './ozone';
export default class OWebService<Entity> {
    protected readonly _appContext: OWebApp;
    protected service: string;
    /**
     * OWebService constructor.
     *
     * @param _appContext The app context.
     * @param service The service name.
     */
    constructor(_appContext: OWebApp, service: string);
    /**
     * Returns the service name.
     */
    getName(): string;
    /**
     * Adds an entity.
     *
     * @param formData
     */
    addRequest(formData: FormData | object): import("./OWebXHR").default<OApiAddJSON<Entity>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteRequest(id: string): import("./OWebXHR").default<OApiDeleteJSON<Entity>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateRequest(id: string, formData: any): import("./OWebXHR").default<OApiUpdateJSON<Entity>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteAllRequest(options: OApiRequestOptions): import("./OWebXHR").default<OApiDeleteAllJSON>;
    /**
     * Updates all entities.
     *
     * @param options
     */
    updateAllRequest(options: OApiRequestOptions): import("./OWebXHR").default<OApiUpdateAllJSON>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getRequest(id: string, relations?: string): import("./OWebXHR").default<OApiGetJSON<Entity>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options: OApiRequestOptions): import("./OWebXHR").default<OApiGetAllJSON<Entity>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest<R>(id: string, relation: string): import("./OWebXHR").default<OApiGetRelationItemJSON<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: OApiRequestOptions): import("./OWebXHR").default<OApiGetRelationItemsJSON<R>>;
}
