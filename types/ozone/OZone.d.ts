import { ONetRequestOptions } from '../OWebNet';
import OWebXHR from '../OWebXHR';
import { OApiResponse, OWebApp } from '../oweb';
export declare const getApiForHost: (url: string) => OZone | undefined;
export default class OZone {
    private _appContext;
    private readonly apiHost;
    protected constructor(_appContext: OWebApp);
    static instantiate(_appContext: OWebApp): OZone;
    request<Response extends OApiResponse<any>>(url: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    getServiceURI(service: string): string;
    getItemURI(service: string, id: string | number): string;
    getItemRelationURI(service: string, id: string, relation: string): string;
}
