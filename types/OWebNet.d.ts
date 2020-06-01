import OWebEvent from './OWebEvent';
export declare type tNetRequestBody = undefined | string | object | FormData | URLSearchParams | File | Blob;
export declare type tNetRequestMethod = 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';
export interface INetResponse<T> {
    raw: any;
    json: null | T;
    status: number;
    statusText: string;
}
export interface INetError {
    type: 'network' | 'abort' | 'timeout' | 'unknown';
    event: ProgressEvent;
}
export interface INetRequestOptions<T> {
    method: tNetRequestMethod;
    body?: tNetRequestBody;
    timeout: number;
    withCredentials: boolean;
    responseType: XMLHttpRequestResponseType;
    headers: {
        [key: string]: string;
    };
    isSuccessStatus: (status: number) => boolean;
    isGoodNews: (response: INetResponse<T>) => boolean;
}
export default abstract class OWebNet<T> extends OWebEvent {
    protected url: string;
    protected options: INetRequestOptions<T>;
    static readonly SELF: string;
    static readonly EVT_ERROR: string;
    static readonly EVT_RESPONSE: string;
    static readonly EVT_HTTP_SUCCESS: string;
    static readonly EVT_HTTP_ERROR: string;
    static readonly EVT_FINISHED: string;
    static readonly EVT_GOOD_NEWS: string;
    static readonly EVT_BAD_NEWS: string;
    static readonly EVT_UPLOAD_PROGRESS: string;
    static readonly EVT_DOWNLOAD_PROGRESS: string;
    constructor(url: string, options: INetRequestOptions<T>);
    /**
     * Called on error: abort, timeout, network
     *
     * @param handler
     */
    onError(handler: (this: this, error: INetError) => void): this;
    /**
     * Called when request sent and the server responded.
     *
     * @param handler
     */
    onResponse(handler: (this: this, response: INetResponse<T>) => void): this;
    /**
     * Called when request sent and http response status code is in success range.
     *
     * @param handler
     */
    onHttpSuccess(handler: (this: this, response: INetResponse<T>) => void): this;
    /**
     * Called when request sent and http response status code is in error range.
     *
     * @param handler
     */
    onHttpError(handler: (this: this, response: INetResponse<T>) => void): this;
    /**
     * Always called when the request finished.
     *
     * @param handler
     */
    onFinished(handler: (this: this) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
     *
     * @param handler
     */
    onGoodNews(handler: (this: this, response: INetResponse<T>) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
     *
     * @param handler
     */
    onBadNews(handler: (this: this, response: INetResponse<T>) => void): this;
    /**
     * Listen to download progress event.
     *
     * NOTE: this is not supported by all browser.
     *
     * @param handler
     */
    onUploadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    /**
     * Listen to download progress event.
     *
     * @param handler
     */
    onDownloadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    /**
     * Returns promise from this request.
     */
    abstract promise(): Promise<INetResponse<T>>;
    /**
     * Send the request and return a promise.
     */
    abstract send(): this;
    /**
     * Abort the request
     */
    abstract abort(): this;
}
