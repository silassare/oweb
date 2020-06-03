import OWebEvent from './OWebEvent';
import { id } from './utils';

export type tNetRequestBody =
	| undefined
	| string
	| object
	| FormData
	| URLSearchParams
	| File
	| Blob;

export type tNetRequestMethod =
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
	headers: { [key: string]: string };
	isSuccessStatus: (status: number) => boolean;
	isGoodNews: (response: INetResponse<T>) => boolean;
}

export default abstract class OWebNet<T> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_ERROR = id(); // on error: abort, timeout, network
	static readonly EVT_RESPONSE = id(); // request sent and the server responded.
	static readonly EVT_HTTP_SUCCESS = id(); // request sent and http response status code is in success range
	static readonly EVT_HTTP_ERROR = id(); // request sent and http response status code is in error range
	static readonly EVT_FINISHED = id(); // request finished
	static readonly EVT_GOOD_NEWS = id(); // the response is a good news [depends on provided options]
	static readonly EVT_BAD_NEWS = id(); // the response is a bad news [depends on provided options]
	static readonly EVT_UPLOAD_PROGRESS = id(); // on upload progress
	static readonly EVT_DOWNLOAD_PROGRESS = id(); // on download progress

	constructor(
		protected url: string,
		protected options: INetRequestOptions<T>,
	) {
		super();
	}

	/**
	 * Called on error: abort, timeout, network
	 *
	 * @param handler
	 */
	onError(handler: (this: this, error: INetError) => void): this {
		return this.on(OWebNet.EVT_ERROR, handler);
	}

	/**
	 * Called when request sent and the server responded.
	 *
	 * @param handler
	 */
	onResponse(handler: (this: this, response: INetResponse<T>) => void): this {
		return this.on(OWebNet.EVT_RESPONSE, handler);
	}

	/**
	 * Called when request sent and http response status code is in success range.
	 *
	 * @param handler
	 */
	onHttpSuccess(
		handler: (this: this, response: INetResponse<T>) => void,
	): this {
		return this.on(OWebNet.EVT_HTTP_SUCCESS, handler);
	}

	/**
	 * Called when request sent and http response status code is in error range.
	 *
	 * @param handler
	 */
	onHttpError(
		handler: (this: this, response: INetResponse<T>) => void,
	): this {
		return this.on(OWebNet.EVT_HTTP_ERROR, handler);
	}

	/**
	 * Always called when the request finished.
	 *
	 * @param handler
	 */
	onFinished(handler: (this: this) => void): this {
		return this.on(OWebNet.EVT_FINISHED, handler);
	}

	/**
	 * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
	 *
	 * @param handler
	 */
	onGoodNews(handler: (this: this, response: INetResponse<T>) => void): this {
		return this.on(OWebNet.EVT_GOOD_NEWS, handler);
	}

	/**
	 * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
	 *
	 * @param handler
	 */
	onBadNews(handler: (this: this, response: INetResponse<T>) => void): this {
		return this.on(OWebNet.EVT_BAD_NEWS, handler);
	}

	/**
	 * Listen to download progress event.
	 *
	 * NOTE: this is not supported by all browser.
	 *
	 * @param handler
	 */
	onUploadProgress(
		handler: (this: this, progress: ProgressEvent) => void,
	): this {
		return this.on(OWebNet.EVT_UPLOAD_PROGRESS, handler);
	}

	/**
	 * Listen to download progress event.
	 *
	 * @param handler
	 */
	onDownloadProgress(
		handler: (this: this, progress: ProgressEvent) => void,
	): this {
		return this.on(OWebNet.EVT_DOWNLOAD_PROGRESS, handler);
	}

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
