import OWebApp from './OWebApp';
import { OApiAddResponse, OApiDeleteAllResponse, OApiDeleteResponse, OApiGetAllResponse, OApiGetRelationItemResponse, OApiGetPaginatedRelationItemsResponse, OApiGetResponse, OApiServiceRequestOptions, OApiUpdateAllResponse, OApiUpdateResponse, OApiResponse } from './ozone';
import OWebXHR from './OWebXHR';
import { ONetRequestBody, ONetRequestOptions } from './OWebNet';
export default class OWebService<Entity> {
    protected readonly _appContext: OWebApp;
    protected name: string;
    /**
     * OWebService constructor.
     *
     * @param _appContext The app context.
     * @param name The service name.
     */
    constructor(_appContext: OWebApp, name: string);
    /**
     * Make request to a specific endpoint using this service as base url.
     */
    request<Response extends OApiResponse<any>>(path: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    /**
     * Returns the service name.
     */
    getName(): string;
    /**
     * Adds an entity.
     *
     * @param formData
     */
    addItem(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteItem(id: string): OWebXHR<OApiDeleteResponse<Entity>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateItem(id: string, formData: ONetRequestBody): OWebXHR<OApiUpdateResponse<Entity>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteItems(options: OApiServiceRequestOptions): OWebXHR<OApiDeleteAllResponse>;
    /**
     * Updates all entities.
     *
     * @param options
     */
    updateItems(options: OApiServiceRequestOptions): OWebXHR<OApiUpdateAllResponse>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getItem(id: string, relations?: string): OWebXHR<OApiGetResponse<Entity>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getItems(options: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<Entity>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationItem<R>(id: string, relation: string): OWebXHR<OApiGetRelationItemResponse<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItems<R>(id: string, relation: string, options: OApiServiceRequestOptions): OWebXHR<OApiGetPaginatedRelationItemsResponse<R>>;
}
