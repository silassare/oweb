import OWebNet, {
	ONetError,
	ONetRequestOptions,
	ONetResponse,
	ONetRequestBody,
} from './OWebNet';
import { buildURL, forEach, isPlainObject } from './utils';

const setOrIgnoreIfExists = function setOrIgnoreIfExists(
	target: any,
	key: string,
	value: any,
	caseSensitive = false
) {
	if (!target[key] && (!caseSensitive || !target[key.toUpperCase()])) {
		target[key] = value;
	}
};

export default class OWebXHR<T> extends OWebNet<T> {
	private _abort?: () => void;
	private _sent = false;

	/**
	 * OWebXHR constructor.
	 *
	 * @param url
	 * @param options
	 */
	constructor(url: string, options: Partial<ONetRequestOptions<T>>) {
		super(url, {
			method: 'get',
			timeout: 0,
			withCredentials: false,
			responseType: 'json',
			headers: {},
			isSuccessStatus: (status: number) => status >= 200 && status < 300,
			isGoodNews: () => {
				return true;
			},
			errorResponseToDialog: () => {
				return { text: 'OW_ERROR_REQUEST_FAILED' };
			},
			...options,
		});
	}

	/**
	 * @inheritDoc
	 */
	isSent(): boolean {
		return this._sent;
	}

	/**
	 * @inheritDoc
	 */
	send(): Promise<ONetResponse<T>> {
		this.assertNotSent('[OWebXHR] request is already sent.');

		let x = this,
			xhr = new XMLHttpRequest();
		const opt = x.options,
			always = () => {
				x.trigger(OWebNet.EVT_FINISH);
				xhr = x = null as any;
			},
			onerror = (err: ONetError) => {
				x.trigger(OWebNet.EVT_ERROR, [err]);
				x.trigger(OWebNet.EVT_FAIL, [err]);
				always();
			},
			body = this.requestBody(opt.body);

		xhr.timeout = opt.timeout;

		setOrIgnoreIfExists(
			opt.headers,
			'Accept',
			'application/json, text/plain, */*'
		);

		xhr.withCredentials = opt.withCredentials;

		xhr.onreadystatechange = function onReadyStateChange() {
			if (!xhr || xhr.readyState !== 4) {
				return;
			}

			// The request errored out and we didn't get a response, this will be
			// handled by onerror instead
			// With one exception: request that using file: protocol, most browsers
			// will return status as 0 even though it's a successful request
			if (
				xhr.status === 0 &&
				!(xhr.responseURL && xhr.responseURL.indexOf('file:') === 0)
			) {
				return;
			}

			const responseRaw =
				xhr[
					(xhr.responseType || 'text') === 'text' ? 'responseText' : 'response'
				];

			let json = null as any;

			if (typeof responseRaw === 'string') {
				try {
					json = JSON.parse(responseRaw);
					// eslint-disable-next-line no-empty
				} catch (e) {}
			}

			const response: ONetResponse<T> = {
				isSuccessStatus: opt.isSuccessStatus(xhr.status),
				isGoodNews: opt.isGoodNews(json),
				raw: responseRaw,
				json,
				status: xhr.status,
				statusText: xhr.statusText,
			};

			x.trigger(OWebNet.EVT_RESPONSE, [response]);

			if (response.isSuccessStatus) {
				x.trigger(OWebNet.EVT_HTTP_SUCCESS, [response]);

				if (response.isGoodNews) {
					x.trigger(OWebNet.EVT_GOOD_NEWS, [response]);
				} else {
					x.trigger(OWebNet.EVT_BAD_NEWS, [response]);
					const err: ONetError = {
						type: 'error',
						errType: 'bad_news',
						...x.options.errorResponseToDialog(response),
					};
					x.trigger(OWebNet.EVT_FAIL, [err]);
				}
			} else {
				x.trigger(OWebNet.EVT_HTTP_ERROR, [response]);
				const err: ONetError = {
					type: 'error',
					errType: 'http',
					...x.options.errorResponseToDialog(response),
				};
				x.trigger(OWebNet.EVT_FAIL, [err]);
			}

			always();
		};

		xhr.addEventListener('progress', function onDownloadProgress(event) {
			// report download progress
			x.trigger(OWebNet.EVT_DOWNLOAD_PROGRESS, [event]);
		});

		xhr.upload.addEventListener('progress', function onUploadProgress(event) {
			// report upload progress
			x.trigger(OWebNet.EVT_UPLOAD_PROGRESS, [event]);
		});

		xhr.onabort = function onAbort(event) {
			onerror({
				type: 'error',
				errType: 'abort',
				text: 'OW_ERROR_REQUEST_ABORTED',
				data: { event },
			});
		};

		xhr.ontimeout = function onTimeout(event) {
			onerror({
				type: 'error',
				errType: 'timeout',
				text: 'OW_ERROR_REQUEST_TIMED_OUT',
				data: { event },
			});
		};

		xhr.onerror = function onError(event) {
			// handle non-HTTP error (e.g. network down)
			onerror({
				type: 'error',
				errType: 'network',
				text: 'OZ_ERROR_NETWORK',
				data: { event },
			});
		};

		this._abort = () => {
			xhr && xhr.abort();
		};

		const url = this.options.params
			? buildURL(this.url, this.options.params)
			: this.url;

		xhr.open(opt.method.toUpperCase(), url, true);

		forEach(opt.headers, function requestHeaderIterator(value, header) {
			xhr.setRequestHeader(header, value);
		});

		return new Promise<ONetResponse<T>>(function xhrPromiseExecutor(
			resolve: (response: ONetResponse<T>) => void,
			reject: (error: ONetError) => void
		) {
			x.onGoodNews((response) => resolve(response)).onFail((err) =>
				reject(err)
			);

			x._sent = true;
			xhr.send(body);
		});
	}

	/**
	 * @inheritDoc
	 */
	abort(): this {
		this._abort && this._abort();
		return this;
	}

	/**
	 * Builds the request body.
	 *
	 * @param body
	 * @private
	 */
	private requestBody(body: ONetRequestBody): any {
		if (body === null || typeof body === 'undefined') {
			return null;
		}

		if (body instanceof URLSearchParams) {
			setOrIgnoreIfExists(
				this.options.headers,
				'Content-Type',
				'application/x-www-form-urlencoded;charset=utf-8'
			);

			return body.toString();
		}

		if (isPlainObject(body)) {
			setOrIgnoreIfExists(
				this.options.headers,
				'Content-Type',
				'application/json;charset=utf-8'
			);

			return JSON.stringify(body);
		}

		return body;
	}
}
