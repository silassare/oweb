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
     * @param serviceName The service name.
     */
    getServiceURI(serviceName: string): string;
    /**
     * Returns an absolute uri string.
     *
     * @param serviceName The service name.
     * @param path The path.
     */
    toAbsoluteURI(serviceName: string, path: string): string;
    /**
     * Returns entity URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     */
    getItemURI(serviceName: string, id: string | number): string;
    /**
     * Returns entity relation URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(serviceName: string, id: string, relation: string): string;
}
