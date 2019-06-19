import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export interface iComResponse {
    error: number;
    msg: string;
    data?: any;
    utime: number;
    stime?: number;
    neterror?: boolean;
}
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
    static readonly SELF: string;
    static readonly EVT_COM_REQUEST_SUCCESS: string;
    static readonly EVT_COM_REQUEST_ERROR: string;
    static readonly EVT_COM_NETWORK_ERROR: string;
    static readonly EVT_COM_UPLOAD_PROGRESS: string;
    static readonly EVT_COM_FINISH: string;
    private readonly _options;
    private readonly _original_data;
    private _modified_data;
    private _busy;
    private _request?;
    constructor(app_context: OWebApp, options: tComOptions);
    /**
     * Prepare the request before sending.
     *
     * @private
     */
    private _prepare;
    /**
     * Handle server response.
     *
     * > Called only when the connection to the server was successfully established.
     *
     * @param response The server response.
     * @private
     */
    private _handleResponse;
    /**
     * Send request.
     */
    send(): void;
    /**
     * Try to abort the current request.
     */
    abort(): void;
}
