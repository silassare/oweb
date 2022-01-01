import OWebApp from './OWebApp';
import { OApiAddResponse, OApiDeleteAllResponse, OApiDeleteResponse, OApiGetAllResponse, OApiGetRelationItemResponse, OApiGetRelationItemsResponse, OApiGetResponse, OApiServiceRequestOptions, OApiUpdateAllResponse, OApiUpdateResponse } from './ozone';
import OWebXHR from './OWebXHR';
import { ONetRequestBody } from './OWebNet';
export default class OWebService<Entity> {
    protected readonly _appContext: OWebApp;
    protected service: string;
    constructor(_appContext: OWebApp, service: string);
    getName(): string;
    addRequest(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>>;
    deleteRequest(id: string): OWebXHR<OApiDeleteResponse<Entity>>;
    updateRequest(id: string, formData: ONetRequestBody): OWebXHR<OApiUpdateResponse<Entity>>;
    deleteAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiDeleteAllResponse>;
    updateAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiUpdateAllResponse>;
    getRequest(id: string, relations?: string): OWebXHR<OApiGetResponse<Entity>>;
    getAllRequest(options: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<Entity>>;
    getRelationRequest<R>(id: string, relation: string): OWebXHR<OApiGetRelationItemResponse<R>>;
    getRelationItemsRequest<R>(id: string, relation: string, options: OApiServiceRequestOptions): OWebXHR<OApiGetRelationItemsResponse<R>>;
}
