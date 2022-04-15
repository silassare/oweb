import OWebEvent from './OWebEvent';
import { OViewDialog } from './OWebView';
export declare type ONetRequestBody = undefined | string | Record<string, unknown> | FormData | URLSearchParams | File | Blob;
export declare type ONetRequestParams = undefined | Record<string, unknown> | URLSearchParams;
export declare type ONetRequestMethod = 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';
export interface ONetResponse<T> {
    raw: any;
    json: T;
    status: number;
    statusText: string;
    isGoodNews: boolean;
    isSuccessStatus: boolean;
}
export interface ONetError extends OViewDialog {
    type: 'error';
    errType: 'bad_news' | 'http' | 'network' | 'abort' | 'timeout' | 'unknown';
}
export interface ONetRequestOptions<T> {
    method: ONetRequestMethod;
    body?: ONetRequestBody;
    params?: ONetRequestParams;
    timeout: number;
    withCredentials: boolean;
    responseType: XMLHttpRequest['responseType'];
    headers: {
        [key: string]: string;
    };
    isSuccessStatus: (status: number) => boolean;
    isGoodNews: (json: null | T) => boolean;
    errorResponseToDialog: (response: ONetResponse<T>) => {
        text: string;
        data?: Record<string, unknown>;
    };
}
export default abstract class OWebNet<T = null> extends OWebEvent {
    protected url: string;
    protected options: ONetRequestOptions<T>;
    static readonly SELF: string;
    static readonly EVT_ERROR: string;
    static readonly EVT_RESPONSE: string;
    static readonly EVT_HTTP_SUCCESS: string;
    static readonly EVT_HTTP_ERROR: string;
    static readonly EVT_FINISH: string;
    static readonly EVT_GOOD_NEWS: string;
    static readonly EVT_BAD_NEWS: string;
    static readonly EVT_FAIL: string;
    static readonly EVT_UPLOAD_PROGRESS: string;
    static readonly EVT_DOWNLOAD_PROGRESS: string;
    /**
     * OWebNet constructor.
     *
     * @param url
     * @param options
     * @protected
     */
    protected constructor(url: string, options: ONetRequestOptions<T>);
    /**
     * Assertion that throws error when request is already sent.
     *
     * @param message
     * @private
     */
    protected assertNotSent(message: string): void;
    /**
     * Called when request sent and the server responded.
     *
     * @param handler
     */
    onResponse(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when request sent and http response status code is in success range.
     *
     * @param handler
     */
    onHttpSuccess(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Always called when the request finished.
     *
     * @param handler
     */
    onFinish(handler: (this: this) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
     *
     * @param handler
     */
    onGoodNews(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
     *
     * @param handler
     */
    onBadNews(handler: (this: this, response: ONetResponse<any>) => void): this;
    /**
     * Called on error: abort, timeout, network
     *
     * @param handler
     */
    onError(handler: (this: this, error: ONetError) => void): this;
    /**
     * Called when request sent and http response status code is in error range.
     *
     * @param handler
     */
    onHttpError(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when there is a general error, an http status error or a bad news.
     *
     * @param handler
     */
    onFail(handler: (this: this, raison: ONetError) => void): this;
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
     * Checks if the request is already sent.
     */
    abstract isSent(): boolean;
    /**
     * Send the request and return a promise.
     */
    abstract send(): Promise<ONetResponse<T>>;
    /**
     * Abort the request
     */
    abstract abort(): this;
}
