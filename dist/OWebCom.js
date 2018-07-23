"use strict";
import Utils from "./utils/Utils";
import OWebEvent from "./OWebEvent";
import OWebFS from "./OWebFS";
const file_alias_errors = [
    "OZ_FILE_ALIAS_UNKNOWN",
    "OZ_FILE_ALIAS_NOT_FOUND",
    "OZ_FILE_ALIAS_PARSE_ERROR"
], default_options = {
    url: "",
    method: "GET",
    data: {},
    dataType: "json",
    crossDomain: true,
    badNewsShow: false,
    // increase request timeout for mobile device
    // TODO: find a good way to check if mobile device
    timeout: ("cordova" in window ? 10000 : undefined)
};
let searchAndReplaceMarkedFile = function (data) {
    let form_data = new FormData(), has_marked_file = false, check = (value, name) => {
        let v = value;
        if (OWebFS.isMarkedFile(v)) {
            v = OWebFS.createFileAlias(v);
            has_marked_file = true;
        }
        form_data.append(name, v);
    };
    if (data) {
        if (data instanceof FormData) {
            data.forEach(check);
        }
        else if (Utils.isPlainObject(data)) {
            Object.keys(data).forEach(function (key_name) {
                check(data[key_name], key_name);
            });
        }
    }
    return has_marked_file ? form_data : false;
};
export default class OWebCom extends OWebEvent {
    constructor(app_context, options) {
        super();
        this.app_context = app_context;
        this._busy = false;
        if (options && !Utils.isPlainObject(options)) {
            throw new TypeError(`[OWebCom] require an 'object' as options not:  ${typeof options}.`);
        }
        this._options = Utils.assign({}, default_options, options || {});
        this._original_data = options.data || {};
        this._modified_data = searchAndReplaceMarkedFile(options.data);
        if (this._modified_data) {
            this._options.data = this._modified_data;
        }
    }
    _init() {
        let m = this, real_method = m._options.method, replace_methods = ["PATCH", "PUT", "DELETE"], api_key_header = this.app_context.configs.get("OZ_API_KEY_HEADER_NAME"), real_method_header = this.app_context.configs.get("OZ_API_REAL_METHOD_HEADER_NAME");
        let headers = this._options.headers = this._options.headers || {};
        headers[api_key_header] = this.app_context.configs.get("OZ_API_KEY");
        // update request method
        if (~replace_methods.indexOf(real_method)) {
            headers[real_method_header] = real_method;
            this._options.method = "POST";
        }
        if (this._options.data instanceof FormData) {
            this._options.processData = false;
            this._options.contentType = false;
        }
        // workaround because jqXHR does not expose upload property
        this._options.xhr = function () {
            let xhr = $.ajaxSettings.xhr();
            // allow CORS
            xhr.withCredentials = true;
            if (xhr.upload) {
                xhr.upload.addEventListener("progress", (e) => {
                    let percent = 0;
                    let position = e.loaded || e.position; // e.position
                    let total = e.total;
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
    _handleResponse(response) {
        let m = this;
        if (response.stime) {
            m.app_context.user.setSessionExpire(response.stime);
        }
        if (response.error === 0) {
            m.trigger(OWebCom.EVT_COM_REQUEST_SUCCESS, [response, m]);
            m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
        }
        else {
            if (response.msg === "OZ_ERROR_YOU_MUST_LOGIN") {
                m.app_context.forceLogin();
            }
            else if (~file_alias_errors.indexOf(response.msg)) {
                // our attempt to minimize file upload failed
                console.warn("[OWebCom] unable to minimize file upload data ->", response, m._options.data);
                this._modified_data = false;
                this._options.data = this._original_data;
                m._busy = false;
                m.send();
            }
            else {
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
            this._busy = true;
            this._request = $.ajax(m._options)
                .done((response) => {
                m._handleResponse(response);
            })
                .fail((request) => {
                let network_error = !Utils.isPlainObject(request["responseJSON"]);
                if (network_error) {
                    console.error("[OWebCom] request network error ->", request);
                    m.trigger(OWebCom.EVT_COM_NETWORK_ERROR, [request, m]);
                }
                else {
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
OWebCom.EVT_COM_REQUEST_SUCCESS = "OWebCom:success";
OWebCom.EVT_COM_REQUEST_ERROR = "OWebCom:error";
OWebCom.EVT_COM_NETWORK_ERROR = "OWebCom:net_error";
OWebCom.EVT_COM_UPLOAD_PROGRESS = "OWebCom:upload_progress";
OWebCom.EVT_COM_FINISH = "OWebCom:finish";
OWebCom.SELF = "OWebCom";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFFcEMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBeUI5QixNQUFNLGlCQUFpQixHQUFjO0lBQ2pDLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsMkJBQTJCO0NBQzNCLEVBQ0QsZUFBZSxHQUFnQjtJQUM5QixHQUFHLEVBQVUsRUFBRTtJQUNmLE1BQU0sRUFBTyxLQUFLO0lBQ2xCLElBQUksRUFBUyxFQUFFO0lBQ2YsUUFBUSxFQUFLLE1BQU07SUFDbkIsV0FBVyxFQUFFLElBQUk7SUFDakIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsNkNBQTZDO0lBQzdDLGtEQUFrRDtJQUNsRCxPQUFPLEVBQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztDQUN0RCxDQUFDO0FBRUwsSUFBSSwwQkFBMEIsR0FBRyxVQUFVLElBQXdDO0lBQ2xGLElBQUksU0FBUyxHQUFTLElBQUksUUFBUSxFQUFFLEVBQ25DLGVBQWUsR0FBRyxLQUFLLEVBQ3ZCLEtBQUssR0FBYSxDQUFDLEtBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUM5QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFZCxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsQ0FBQyxHQUFpQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDdkI7UUFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUM7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