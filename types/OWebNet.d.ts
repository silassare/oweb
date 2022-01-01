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
    protected constructor(url: string, options: ONetRequestOptions<T>);
    protected assertNotSent(message: string): void;
    onResponse(handler: (this: this, response: ONetResponse<T>) => void): this;
    onHttpSuccess(handler: (this: this, response: ONetResponse<T>) => void): this;
    onFinish(handler: (this: this) => void): this;
    onGoodNews(handler: (this: this, response: ONetResponse<T>) => void): this;
    onBadNews(handler: (this: this, response: ONetResponse<any>) => void): this;
    onError(handler: (this: this, error: ONetError) => void): this;
    onHttpError(handler: (this: this, response: ONetResponse<T>) => void): this;
    onFail(handler: (this: this, raison: ONetError) => void): this;
    onUploadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    onDownloadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    abstract isSent(): boolean;
    abstract send(): Promise<ONetResponse<T>>;
    abstract abort(): this;
}
