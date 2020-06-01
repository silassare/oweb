import OWebNet, {
	INetError,
	INetResponse,
	INetRequestOptions,
	tNetRequestBody,
} from './OWebNet';
import { forEach, _debug } from './utils/Utils';

const setOrIgnoreIfExists = function (
	target: any,
	key: string,
	value: any,
	caseSensitive: boolean = false,
) {
	if (!target[key] && (!caseSensitive || !target[key.toUpperCase()])) {
		target[key] = value;
	}
};

export default class OWebXHR<T> extends OWebNet<T> {
	private _abort?: () => void;
	private _sent: boolean = false;

	constructor(url: string, options: Partial<INetRequestOptions<T>>) {
		super(url, {
			method: 'get',
			timeout: 0,
			withCredentials: false,
			responseType: 'json',
			headers: {},
			isSuccessStatus: (status: number) => status >= 200 && status < 300,
			isGoodNews: (response: INetResponse<T>) => {
				return true;
			},
			...options,
		});
	}

	private _assertNotSent() {
		if (this._sent) {
			throw Error('[OWebXHR] request is already sent.');
		}
	}

	promise(): Promise<INetResponse<T>> {
		this._assertNotSent();

		const x = this;

		return new Promise<INetResponse<T>>(function (
			resolve: (response: INetResponse<T>) => void,
			reject: (error: INetError) => void,
		) {
			x.onResponse((response) => resolve(response))
				.onError((err) => reject(err))
				.send();
		});
	}

	send() {
		this._assertNotSent();

		this._sent = true;

		let x = this,
			xhr = new XMLHttpRequest();
		const opt = x.options,
			always = () => {
				x.trigger(OWebNet.EVT_FINISHED);
				xhr = x = null as any;
			},
			onerror = (err: INetError) => {
				x.trigger(OWebNet.EVT_ERROR, [err]);
				always();
			},
			body = this.requestBody(opt.body);

		xhr.timeout = opt.timeout;

		setOrIgnoreIfExists(
			opt.headers,
			'Accept',
			'application/json, text/plain, */*',
		);

		forEach(opt.headers, function (value, header) {
			xhr.setRequestHeader(header, value);
		});

		xhr.withCredentials = opt.withCredentials;

		xhr.open(opt.method.toUpperCase(), this.url, true);

		xhr.onreadystatechange = function () {
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
					(xhr.responseType || 'text') === 'text'
						? 'responseText'
						: 'response'
				];
			const response: INetResponse<T> = {
				raw: responseRaw,
				json: null as any,
				status: xhr.status,
				statusText: xhr.statusText,
			};

			if (typeof responseRaw === 'string') {
				try {
					response.json = JSON.parse(responseRaw);
					// tslint:disable-next-line: no-empty
				} catch (e) {}
			}

			x.trigger(OWebNet.EVT_RESPONSE, [response]);

			if (opt.isSuccessStatus(xhr.status)) {
				x.trigger(OWebNet.EVT_HTTP_SUCCESS, [response]);

				if (opt.isGoodNews(response)) {
					x.trigger(OWebNet.EVT_GOOD_NEWS, [response]);
				} else {
					x.trigger(OWebNet.EVT_BAD_NEWS, [response]);
				}
			} else {
				x.trigger(OWebNet.EVT_HTTP_ERROR, [response]);
			}

			always();
		};

		xhr.addEventListener('progress', function (event) {
			// report download progress
			x.trigger(OWebNet.EVT_DOWNLOAD_PROGRESS, [event]);
		});

		xhr.upload.addEventListener('progress', function (event) {
			// report upload progress
			x.trigger(OWebNet.EVT_UPLOAD_PROGRESS, [event]);
		});

		xhr.onabort = function (event) {
			onerror({ type: 'abort', event });
		};

		xhr.ontimeout = function (event) {
			onerror({ type: 'timeout', event });
		};

		xhr.onerror = function (event) {
			// handle non-HTTP error (e.g. network down)
			onerror({ type: 'network', event });
		};

		this._abort = () => {
			xhr && xhr.abort();
		};

		xhr.send(body);

		return this;
	}

	abort() {
		this._abort && this._abort();
		return this;
	}

	private requestBody(body: tNetRequestBody): any {
		let type;
		// tslint:disable-next-line: no-conditional-assignment
		if (body === null || (type = typeof body) === 'undefined') {
			return null;
		}

		if (type === 'object') {
			setOrIgnoreIfExists(
				this.options.headers,
				'Content-Type',
				'application/json;charset=utf-8',
			);

			return JSON.stringify(body);
		}

		if (body instanceof URLSearchParams) {
			setOrIgnoreIfExists(
				this.options.headers,
				'Content-Type',
				'application/x-www-form-urlencoded;charset=utf-8',
			);

			return body.toString();
		}

		return body;
	}
}
