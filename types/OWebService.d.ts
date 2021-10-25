import OWebApp from './OWebApp';
import { OApiAddResponse, OApiDeleteAllResponse, OApiDeleteResponse, OApiGetAllResponse, OApiGetRelationItemResponse, OApiGetRelationItemsResponse, OApiGetResponse, OApiServiceRequestOptions, OApiUpdateAllResponse, OApiUpdateResponse } from './ozone';
import OWebXHR from './OWebXHR';
import { ONetRequestBody } from './OWebNet';
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
    addRequest(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteRequest(id: string): OWebXHR<OApiDeleteResponse<Entity>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateRequest(id: string, formData: ONetRequestBody): OWebXHR<OApiUpdateResponse<Entity>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiDeleteAllResponse>;
    /**
     * Updates all entities.
     *
     * @param options
     */
    updateAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiUpdateAllResponse>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getRequest(id: string, relations?: string): OWebXHR<OApiGetResponse<Entity>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<Entity>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest<R>(id: string, relation: string): OWebXHR<OApiGetRelationItemResponse<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItemsRequest<R>(id: string, relation: string, options: OApiServiceRequestOptions): OWebXHR<OApiGetRelationItemsResponse<R>>;
}
