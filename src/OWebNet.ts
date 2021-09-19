import OWebEvent from './OWebEvent';
import { id } from './utils';
import { OViewDialog } from './OWebView';

export type ONetRequestBody =
	| undefined
	| string
	| Record<string, unknown>
	| FormData
	| URLSearchParams
	| File
	| Blob;

export type ONetRequestParams =
	| undefined
	| Record<string, unknown>
	| URLSearchParams;

export type ONetRequestMethod =
	| 'get'
	| 'GET'
	| 'delete'
	| 'DELETE'
	| 'head'
	| 'HEAD'
	| 'options'
	| 'OPTIONS'
	| 'post'
	| 'POST'
	| 'put'
	| 'PUT'
	| 'patch'
	| 'PATCH';

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
	headers: { [key: string]: string };
	isSuccessStatus: (status: number) => boolean;
	isGoodNews: (json: null | T) => boolean;
	errorResponseToDialog: (response: ONetResponse<T>) => {
		text: string;
		data?: Record<string, unknown>;
	};
}

const eventHandlerMessage =
	'[OWebNet] Register event handler before calling send.';

export default abstract class OWebNet<T = null> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_ERROR = id(); // on error: abort, timeout, network
	static readonly EVT_RESPONSE = id(); // request sent and the server responded.
	static readonly EVT_HTTP_SUCCESS = id(); // request sent and http response status code is in success range
	static readonly EVT_HTTP_ERROR = id(); // request sent and http response status code is not in success range
	static readonly EVT_FINISH = id(); // request finished
	static readonly EVT_GOOD_NEWS = id(); // the response is a good news [depends on provided options]
	static readonly EVT_BAD_NEWS = id(); // the response is a bad news [depends on provided options]
	static readonly EVT_FAIL = id(); // the request failed: there is a general error, an http status error or a bad news
	static readonly EVT_UPLOAD_PROGRESS = id(); // on upload progress
	static readonly EVT_DOWNLOAD_PROGRESS = id(); // on download progress

	/**
	 * OWebNet constructor.
	 *
	 * @param url
	 * @param options
	 * @protected
	 */
	protected constructor(
		protected url: string,
		protected options: ONetRequestOptions<T>
	) {
		super();
	}

	/**
	 * Assertion that throws error when request is already sent.
	 *
	 * @param message
	 * @private
	 */
	protected assertNotSent(message: string): void {
		if (this.isSent()) {
			throw Error(message);
		}
	}

	/**
	 * Called when request sent and the server responded.
	 *
	 * @param handler
	 */
	onResponse(handler: (this: this, response: ONetResponse<T>) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_RESPONSE, handler);
	}

	/**
	 * Called when request sent and http response status code is in success range.
	 *
	 * @param handler
	 */
	onHttpSuccess(
		handler: (this: this, response: ONetResponse<T>) => void
	): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_HTTP_SUCCESS, handler);
	}

	/**
	 * Always called when the request finished.
	 *
	 * @param handler
	 */
	onFinish(handler: (this: this) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_FINISH, handler);
	}

	/**
	 * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
	 *
	 * @param handler
	 */
	onGoodNews(handler: (this: this, response: ONetResponse<T>) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_GOOD_NEWS, handler);
	}

	/**
	 * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
	 *
	 * @param handler
	 */
	onBadNews(handler: (this: this, response: ONetResponse<any>) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_BAD_NEWS, handler);
	}

	/**
	 * Called on error: abort, timeout, network
	 *
	 * @param handler
	 */
	onError(handler: (this: this, error: ONetError) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_ERROR, handler);
	}

	/**
	 * Called when request sent and http response status code is in error range.
	 *
	 * @param handler
	 */
	onHttpError(handler: (this: this, response: ONetResponse<T>) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_HTTP_ERROR, handler);
	}

	/**
	 * Called when there is a general error, an http status error or a bad news.
	 *
	 * @param handler
	 */
	onFail(handler: (this: this, raison: ONetError) => void): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_FAIL, handler);
	}

	/**
	 * Listen to download progress event.
	 *
	 * NOTE: this is not supported by all browser.
	 *
	 * @param handler
	 */
	onUploadProgress(
		handler: (this: this, progress: ProgressEvent) => void
	): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_UPLOAD_PROGRESS, handler);
	}

	/**
	 * Listen to download progress event.
	 *
	 * @param handler
	 */
	onDownloadProgress(
		handler: (this: this, progress: ProgressEvent) => void
	): this {
		this.assertNotSent(eventHandlerMessage);
		return this.on(OWebNet.EVT_DOWNLOAD_PROGRESS, handler);
	}

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
