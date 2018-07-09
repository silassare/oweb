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
            throw new TypeError("OWebCom: require an 'object' as options not : " +
                (typeof options));
        }
        this._options = Utils.assign({}, default_options, options || {});
        this._original_data = options.data || {};
        this._modified_data = searchAndReplaceMarkedFile(options.data);
        if (this._modified_data) {
            this._options.data = this._modified_data;
        }
    }
    _init() {
        let m = this, real_method = m._options.method, replace_methods = ["PATCH", "PUT", "DELETE"], api_key_header = this.app_context.configs.get("OZ_APP_API_KEY_HEADER_NAME"), real_method_header = this.app_context.configs.get("OZ_APP_REAL_METHOD_HEADER_NAME");
        let headers = this._options.headers = this._options.headers || {};
        headers[api_key_header] = this.app_context.configs.get("OZ_APP_API_KEY");
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
    send() {
        let m = this;
        this._init();
        if (this._busy) {
            console.warn("OWebCom: instance is busy.", m);
            return false;
        }
        if (this._options) {
            this._busy = true;
            $.ajax(m._options)
                .done((response) => {
                m.handleResponse(response);
            })
                .fail((request) => {
                let network_error = !Utils.isPlainObject(request["responseJSON"]);
                if (network_error) {
                    console.error("OWebCom: request fail network", request);
                    m.trigger(OWebCom.EVT_COM_NETWORK_ERROR, [request, m]);
                }
                else {
                    console.error("OWebCom: request fail", request);
                    m.handleResponse(request["responseJSON"]);
                }
            });
        }
    }
    handleResponse(response) {
        let m = this;
        if (Utils.isPlainObject(response)) {
            // the connection to the server was successfully established
            let error = parseInt(response["error"]);
            if (response["stime"]) {
                this.app_context.user.setSessionExpire(response["stime"]);
            }
            if (error === 0) {
                this.trigger(OWebCom.EVT_COM_REQUEST_SUCCESS, [response, m]);
                this.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
            }
            else {
                if (response["msg"] === "OZ_ERROR_YOU_MUST_LOGIN") {
                    this.app_context.forceLogin();
                }
                else if (~file_alias_errors.indexOf(response["msg"])) {
                    // our attempt to minimize file upload failed
                    console.warn("OWebCom: fails to minimize file upload data :", response, this._options.data);
                    this._modified_data = false;
                    this._options.data = this._original_data;
                    this._busy = false;
                    this.send();
                }
                else {
                    if (m._options.badNewsShow) {
                        m.app_context.view.dialog({
                            type: "error",
                            text: response["msg"],
                            data: response["data"]
                        });
                    }
                    m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
                    m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
                }
            }
        }
    }
}
OWebCom.EVT_COM_REQUEST_SUCCESS = "OWebCom:success";
OWebCom.EVT_COM_REQUEST_ERROR = "OWebCom:error";
OWebCom.EVT_COM_NETWORK_ERROR = "OWebCom:net_error";
OWebCom.EVT_COM_UPLOAD_PROGRESS = "OWebCom:upload_progress";
OWebCom.EVT_COM_FINISH = "OWebCom:finish";
OWebCom.SELF = "OWebCom";
//# sourceMappingURL=OWebCom.js.map