import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebFS from './OWebFS';
import jqXHR = JQuery.jqXHR;
import { assign, id, isPlainObject, _warn, _error } from './utils/Utils';

export interface IComResponse {
	error: number;
	msg: string;
	data?: any;
	utime: number; // response time
	stime?: number; // session expire time
	stoken?: string; // session token
	neterror?: boolean;
}

export type tComOptions = {
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
const fileAliasErrors = [
	'OZ_FILE_ALIAS_UNKNOWN',
	'OZ_FILE_ALIAS_NOT_FOUND',
	'OZ_FILE_ALIAS_PARSE_ERROR',
];

const searchAndReplaceMarkedFile = function (
	data?: { [key: string]: any } | FormData,
) {
	let hasMarkedFile = false;
	const formData = new FormData(),
		check = (value: any, name: string) => {
			let v = value;

			if (OWebFS.isMarkedFile(v)) {
				v = OWebFS.createFileAlias(v);
				hasMarkedFile = true;
			}

			formData.append(name, v);
		};

	if (data) {
		if (data instanceof FormData) {
			(data as any).forEach(check);
		} else if (isPlainObject(data)) {
			Object.keys(data).forEach(function (keyName) {
				check(data[keyName], keyName);
			});
		}
	}

	return hasMarkedFile ? formData : false;
};

const ajaxTransport = {
	// FOR GOBL JSON HELPER: WE DO NOT TRUST JQUERY JSON.parse
	converters: {
		'text json'(a: string) {
			return JSON.parse(a);
		},
	},
};

export default class OWebCom extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_COM_REQUEST_SUCCESS = id();
	static readonly EVT_COM_REQUEST_ERROR = id();
	static readonly EVT_COM_NETWORK_ERROR = id();
	static readonly EVT_COM_UPLOAD_PROGRESS = id();
	static readonly EVT_COM_FINISH = id();

	private readonly _options: tComOptions;
	private readonly _originalData: any;
	private _modifiedData: FormData | boolean;
	private _busy: boolean = false;
	private _request?: jqXHR;
	private _aborted = false;

	constructor(private readonly appContext: OWebApp, options: tComOptions) {
		super();

		if (options && !isPlainObject(options)) {
			throw new TypeError(
				`[OWebCom] require an 'object' as options not:  ${typeof options}.`,
			);
		}

		const appOptions = this.appContext.getRequestDefaultOptions();

		const defaultOptions = {
			method: 'GET',
			dataType: 'json',
			data: {},
			crossDomain: true,
			badNewsShow: false,
			// increase request timeout for mobile device
			timeout: appContext.isMobileApp() ? 10000 : undefined,
		};

		this._options = {
			...defaultOptions,

			...appOptions,

			...options,
		};

		this._options.headers = assign(
			{},
			appOptions.headers,
			options.headers || {},
		);

		this._originalData = options.data || {};
		this._modifiedData = searchAndReplaceMarkedFile(options.data);

		if (this._modifiedData) {
			this._options.data = this._modifiedData;
		}
	}

	/**
	 * Prepare the request before sending.
	 *
	 * @private
	 */
	private _prepare() {
		const m = this,
			realMethod = m._options.method,
			replaceMethods = ['PATCH', 'PUT', 'DELETE'],
			realMethodHeader = this.appContext.configs.get(
				'OZ_API_REAL_METHOD_HEADER_NAME',
			),
			headers: any = this._options.headers;

		this._aborted = false;

		// we update request method
		if (~replaceMethods.indexOf(realMethod)) {
			headers[realMethodHeader] = realMethod;
			this._options.method = 'POST';
		}

		if (this._options.data instanceof FormData) {
			this._options.processData = false;
			this._options.contentType = false;
		}

		// workaround because jqXHR does not expose upload property
		this._options.xhr = function () {
			const xhr = $.ajaxSetup(ajaxTransport).xhr!();

			// allow CORS
			xhr.withCredentials = true;

			xhr.addEventListener('abort', function () {
				m._aborted = true;
			});

			if (xhr.upload) {
				xhr.upload.addEventListener(
					'progress',
					(e: any) => {
						let percent = 0;
						const position = e.loaded || e.position; // e.position
						const total = e.total;

						if (e.lengthComputable) {
							percent = Math.floor((position / total) * 100);
						}

						m.trigger(OWebCom.EVT_COM_UPLOAD_PROGRESS, [
							e,
							position,
							total,
							percent,
						]);
					},
					false,
				);
			}

			return xhr;
		};
	}

	/**
	 * Handle server response.
	 *
	 * > Called only when the connection to the server was successfully established.
	 *
	 * @param response The server response.
	 * @private
	 */
	private _handleResponse(response: IComResponse) {
		const m = this;

		if (response.stime) {
			m.appContext.user.setSessionExpire(response.stime);
		}
		if (response.stoken) {
			m.appContext.setSessionToken(response.stoken);
		}

		if (response.error === 0) {
			m.trigger(OWebCom.EVT_COM_REQUEST_SUCCESS, [response, m]);
			m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
		} else {
			if (response.msg === 'OZ_ERROR_YOU_MUST_LOGIN') {
				m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
				m.appContext.forceLogin();
			} else if (~fileAliasErrors.indexOf(response.msg)) {
				// our attempt to minimize file upload failed
				_warn(
					'[OWebCom] unable to minimize file upload data ->',
					response,
					m._options.data,
				);
				this._modifiedData = false;
				this._options.data = this._originalData;
				m._busy = false;
				m.send();
			} else {
				if (m._options.badNewsShow) {
					m.appContext.view.dialog({
						type: 'error',
						text: response.msg,
						data: response.data,
					});
				}

				m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
				m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
			}
		}
	}

	/**
	 * Send request.
	 */
	send() {
		const m = this;
		this._prepare();

		if (this._busy) {
			_warn('[OWebCom] instance is busy ->', m);
			return;
		}

		if (this._options) {
			this._busy = true;
			this._request = $.ajax(m._options)
				.done((response: any) => {
					m._handleResponse(response);
				})
				.fail((request: any) => {
					const networkError = !isPlainObject(request.responseJSON);
					if (networkError) {
						_error('[OWebCom] request network error ->', request);
						m.trigger(OWebCom.EVT_COM_NETWORK_ERROR, [request, m]);
					} else {
						_error('[OWebCom] request server error ->', request);
						m._handleResponse(request.responseJSON);
					}
				});
		}
	}

	/**
	 * Checks if the current request has been aborted.
	 */
	isAborted() {
		return this._aborted;
	}

	/**
	 * Try to abort the current request.
	 */
	abort() {
		this._busy = false;
		if (this._request) {
			this._request.abort();
		}
	}
}
