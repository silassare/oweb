import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
export declare type tComOptions = {
    url: string;
    method: string;
    xhr?: any;
    headers?: {};
    data?: {};
    dataType?: string;
    crossDomain?: boolean;
    processData?: boolean;
    contentType?: any;
    badNewsShow?: boolean;
    timeout?: number;
};
export default class OWebCom extends OWebEvent {
    private readonly app_context;
    static readonly EVT_COM_REQUEST_SUCCESS: string;
    static readonly EVT_COM_REQUEST_ERROR: string;
    static readonly EVT_COM_NETWORK_ERROR: string;
    static readonly EVT_COM_UPLOAD_PROGRESS: string;
    static readonly EVT_COM_FINISH: string;
    static readonly SELF: string;
    private readonly _options;
    private readonly _original_data;
    private _modified_data;
    private _busy;
    constructor(app_context: OWebApp, options: tComOptions);
    _init(): void;
    send(): false | undefined;
    handleResponse(response: any): void;
}
