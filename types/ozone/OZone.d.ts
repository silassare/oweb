import { ONetRequestOptions } from '../OWebNet';
import OWebXHR from '../OWebXHR';
import { OApiResponse, OWebApp } from '../oweb';
export declare const getApiForHost: (url: string) => OZone | undefined;
export default class OZone {
    private _appContext;
    private readonly apiHost;
    /**
     * OZone constructor.
     *
     * @param _appContext
     */
    protected constructor(_appContext: OWebApp);
    /**
     * Create new ozone api instance or get from cache
     *
     */
    static instantiate(_appContext: OWebApp): OZone;
    /**
     * Makes a request.
     *
     * @param url The request url
     * @param options The request options
     */
    request<Response extends OApiResponse<any>>(url: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    /**
     * Returns the service URI.
     *
     * @param service The service name.
     */
    getServiceURI(service: string): string;
    /**
     * Returns entity URI.
     *
     * @param service The service name.
     * @param id The entity id.
     */
    getItemURI(service: string, id: string | number): string;
    /**
     * Returns entity relation URI.
     *
     * @param service The service name.
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(service: string, id: string, relation: string): string;
}
