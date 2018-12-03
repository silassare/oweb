import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import OWebFS from "./OWebFS";
import Utils from "./utils/Utils";
import jqXHR = JQuery.jqXHR;

export interface iComResponse {
	error: number,
	msg: string,
	data?: any,
	utime: number,
	stime?: number,
	neterror?: boolean
}

export type tComOptions = {
	url: string,
	method: string,
	xhr?: any,
	headers?: {},
	data?: {},
	dataType?: string,
	crossDomain?: boolean,
	processData?: boolean,
	contentType?: any,
	badNewsShow?: boolean,
	timeout?: number
};
const file_alias_errors            = [
		  "OZ_FILE_ALIAS_UNKNOWN",
		  "OZ_FILE_ALIAS_NOT_FOUND",
		  "OZ_FILE_ALIAS_PARSE_ERROR"
	  ],
	  default_options: tComOptions = {
		  url        : "",
		  method     : "GET",
		  data       : {},
		  dataType   : "json",
		  crossDomain: true,
		  badNewsShow: false,
		  // increase request timeout for mobile device
		  // TODO: find a good way to check if mobile device
		  timeout    : ("cordova" in window ? 10000 : undefined)
	  };

let searchAndReplaceMarkedFile = function (data?: { [key: string]: any } | FormData) {
	let form_data       = new FormData(),
		has_marked_file = false,
		check           = (value: any, name: string) => {
			let v = value;

			if (OWebFS.isMarkedFile(v)) {
				v               = OWebFS.createFileAlias(v);
				has_marked_file = true;
			}

			form_data.append(name, v);
		};

	if (data) {
		if (data instanceof FormData) {
			(data as any).forEach(check);
		} else if (Utils.isPlainObject(data)) {
			Object.keys(data).forEach(function (key_name) {
				check(data[key_name], key_name);
			});
		}
	}

	return has_marked_file ? form_data : false;
};

export default class OWebCom extends OWebEvent {

	static readonly SELF                    = Utils.id();
	static readonly EVT_COM_REQUEST_SUCCESS = Utils.id();
	static readonly EVT_COM_REQUEST_ERROR   = Utils.id();
	static readonly EVT_COM_NETWORK_ERROR   = Utils.id();
	static readonly EVT_COM_UPLOAD_PROGRESS = Utils.id();
	static readonly EVT_COM_FINISH          = Utils.id();

	private readonly _options: tComOptions;
	private readonly _original_data: any;
	private _modified_data: FormData | boolean;
	private _busy: boolean = false;
	private _request?: jqXHR;

	constructor(private readonly app_context: OWebApp, options: tComOptions) {
		super();

		if (options && !Utils.isPlainObject(options)) {
			throw new TypeError(`[OWebCom] require an 'object' as options not:  ${typeof options}.`);
		}

		this._options       = Utils.assign({}, default_options, options || {});
		this._original_data = options.data || {};
		this._modified_data = searchAndReplaceMarkedFile(options.data);

		if (this._modified_data) {
			this._options.data = this._modified_data;
		}

	}

	private _init() {
		let m                  = this,
			real_method        = m._options.method,
			replace_methods    = ["PATCH", "PUT", "DELETE"],
			api_key_header     = this.app_context.configs.get("OZ_API_KEY_HEADER_NAME"),
			real_method_header = this.app_context.configs.get("OZ_API_REAL_METHOD_HEADER_NAME");

		let headers: any        = this._options.headers = this._options.headers || {};
		headers[api_key_header] = this.app_context.configs.get("OZ_API_KEY");

		// update request method
		if (~replace_methods.indexOf(real_method)) {
			headers[real_method_header] = real_method;
			this._options.method        = "POST";
		}

		if (this._options.data instanceof FormData) {
			this._options.processData = false;
			this._options.contentType = false;
		}

		// workaround because jqXHR does not expose upload property
		this._options.xhr = function () {
			let xhr = $.ajaxSettings.xhr!();

			// allow CORS
			xhr.withCredentials = true;

			if (xhr.upload) {
				xhr.upload.addEventListener("progress", (e: any) => {
					let percent  = 0;
					let position = e.loaded || e.position;// e.position
					let total    = e.total;

					if (e.lengthComputable) {
						percent = Math.floor(position / total * 100);
					}

					m.trigger(OWebCom.EVT_COM_UPLOAD_PROGRESS, [e, position, total, percent]);

				}, false);
			}

			return xhr;
		};
	}

	// the connection to the server was successfully established
	private _handleResponse(response: iComResponse) {
		let m = this;

		if (response.stime) {
			m.app_context.user.setSessionExpire(response.stime);
		}

		if (response.error === 0) {
			m.trigger(OWebCom.EVT_COM_REQUEST_SUCCESS, [response, m]);
			m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
		} else {
			if (response.msg === "OZ_ERROR_YOU_MUST_LOGIN") {
				m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
				m.app_context.forceLogin();
			} else if (~file_alias_errors.indexOf(response.msg)) {
				// our attempt to minimize file upload failed
				console.warn("[OWebCom] unable to minimize file upload data ->", response, m._options.data);
				this._modified_data = false;
				this._options.data  = this._original_data;
				m._busy             = false;
				m.send();
			} else {
				if (m._options.badNewsShow) {
					m.app_context.view.dialog({
						type: "error",
						text: response.msg,
						data: response.data
					});
				}

				m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
				m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
			}
		}
	}

	send() {
		let m = this;
		this._init();

		if (this._busy) {
			console.warn("[OWebCom] instance is busy ->", m);
			return;
		}

		if (this._options) {
			this._busy    = true;
			this._request = $.ajax(m._options)
				.done((response: any) => {
					m._handleResponse(response);
				})
				.fail((request: any) => {
					let network_error = !Utils.isPlainObject(
						request["responseJSON"]);
					if (network_error) {
						console.error("[OWebCom] request network error ->", request);
						m.trigger(OWebCom.EVT_COM_NETWORK_ERROR, [request, m]);
					} else {
						console.error("[OWebCom] request server error ->", request);
						m._handleResponse(request["responseJSON"]);
					}
				});
		}
	}

	abort() {
		this._busy = false;
		if (this._request) {
			this._request.abort();
		}
	}
}