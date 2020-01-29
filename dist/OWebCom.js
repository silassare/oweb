import OWebEvent from './OWebEvent';
import OWebFS from './OWebFS';
import Utils from './utils/Utils';
const file_alias_errors = [
    'OZ_FILE_ALIAS_UNKNOWN',
    'OZ_FILE_ALIAS_NOT_FOUND',
    'OZ_FILE_ALIAS_PARSE_ERROR',
];
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
const ajaxTransport = {
    // FOR GOBL JSON HELPER: WE DO NOT TRUST JQUERY JSON.parse
    converters: {
        'text json': function (a) {
            return JSON.parse(a);
        },
    },
};
export default class OWebCom extends OWebEvent {
    constructor(app_context, options) {
        super();
        this.app_context = app_context;
        this._busy = false;
        if (options && !Utils.isPlainObject(options)) {
            throw new TypeError(`[OWebCom] require an 'object' as options not:  ${typeof options}.`);
        }
        let appOptions = this.app_context.getRequestDefaultOptions();
        this._options = {
            method: 'GET',
            dataType: 'json',
            data: {},
            crossDomain: true,
            badNewsShow: false,
            // increase request timeout for mobile device
            timeout: app_context.isMobileApp() ? 10000 : undefined,
            ...appOptions,
            ...options,
        };
        this._options.headers = Utils.assign({}, appOptions.headers, options.headers || {});
        this._original_data = options.data || {};
        this._modified_data = searchAndReplaceMarkedFile(options.data);
        if (this._modified_data) {
            this._options.data = this._modified_data;
        }
    }
    /**
     * Prepare the request before sending.
     *
     * @private
     */
    _prepare() {
        let m = this, real_method = m._options.method, replace_methods = ['PATCH', 'PUT', 'DELETE'], real_method_header = this.app_context.configs.get('OZ_API_REAL_METHOD_HEADER_NAME'), headers = this._options.headers;
        // we update request method
        if (~replace_methods.indexOf(real_method)) {
            headers[real_method_header] = real_method;
            this._options.method = 'POST';
        }
        if (this._options.data instanceof FormData) {
            this._options.processData = false;
            this._options.contentType = false;
        }
        // workaround because jqXHR does not expose upload property
        this._options.xhr = function () {
            let xhr = $.ajaxSetup(ajaxTransport).xhr();
            // allow CORS
            xhr.withCredentials = true;
            if (xhr.upload) {
                xhr.upload.addEventListener('progress', (e) => {
                    let percent = 0;
                    let position = e.loaded || e.position; // e.position
                    let total = e.total;
                    if (e.lengthComputable) {
                        percent = Math.floor((position / total) * 100);
                    }
                    m.trigger(OWebCom.EVT_COM_UPLOAD_PROGRESS, [
                        e,
                        position,
                        total,
                        percent,
                    ]);
                }, false);
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
    _handleResponse(response) {
        let m = this;
        if (response.stime) {
            m.app_context.user.setSessionExpire(response.stime);
        }
        if (response.stoken) {
            m.app_context.setSessionToken(response.stoken);
        }
        if (response.error === 0) {
            m.trigger(OWebCom.EVT_COM_REQUEST_SUCCESS, [response, m]);
            m.trigger(OWebCom.EVT_COM_FINISH, [response, m]);
        }
        else {
            if (response.msg === 'OZ_ERROR_YOU_MUST_LOGIN') {
                m.trigger(OWebCom.EVT_COM_REQUEST_ERROR, [response, m]);
                m.app_context.forceLogin();
            }
            else if (~file_alias_errors.indexOf(response.msg)) {
                // our attempt to minimize file upload failed
                console.warn('[OWebCom] unable to minimize file upload data ->', response, m._options.data);
                this._modified_data = false;
                this._options.data = this._original_data;
                m._busy = false;
                m.send();
            }
            else {
                if (m._options.badNewsShow) {
                    m.app_context.view.dialog({
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
        let m = this;
        this._prepare();
        if (this._busy) {
            console.warn('[OWebCom] instance is busy ->', m);
            return;
        }
        if (this._options) {
            this._busy = true;
            this._request = $.ajax(m._options)
                .done((response) => {
                m._handleResponse(response);
            })
                .fail((request) => {
                let network_error = !Utils.isPlainObject(request['responseJSON']);
                if (network_error) {
                    console.error('[OWebCom] request network error ->', request);
                    m.trigger(OWebCom.EVT_COM_NETWORK_ERROR, [request, m]);
                }
                else {
                    console.error('[OWebCom] request server error ->', request);
                    m._handleResponse(request['responseJSON']);
                }
            });
        }
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
OWebCom.SELF = Utils.id();
OWebCom.EVT_COM_REQUEST_SUCCESS = Utils.id();
OWebCom.EVT_COM_REQUEST_ERROR = Utils.id();
OWebCom.EVT_COM_NETWORK_ERROR = Utils.id();
OWebCom.EVT_COM_UPLOAD_PROGRESS = Utils.id();
OWebCom.EVT_COM_FINISH = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFDOUIsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBMEJsQyxNQUFNLGlCQUFpQixHQUFHO0lBQ3pCLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsMkJBQTJCO0NBQzNCLENBQUM7QUFFRixJQUFJLDBCQUEwQixHQUFHLFVBQ2hDLElBQXdDO0lBRXhDLElBQUksU0FBUyxHQUFHLElBQUksUUFBUSxFQUFFLEVBQzdCLGVBQWUsR0FBRyxLQUFLLEVBQ3ZCLEtBQUssR0FBRyxDQUFDLEtBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUNwQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFZCxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsZUFBZSxHQUFHLElBQUksQ0FBQztTQUN2QjtRQUVELFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQztJQUVILElBQUksSUFBSSxFQUFFO1FBQ1QsSUFBSSxJQUFJLFlBQVksUUFBUSxFQUFFO1lBQzVCLElBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7YUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxRQUFRO2dCQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pDLENB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Q0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkQ7cUJBQU07b0JBQ04sT0FBTyxDQUFDLEtBQUssQ0FDWixtQ0FBbUMsRUFDbkMsT0FBTyxDQUNQLENBQUM7b0JBQ0YsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDM0M7WUFDRixDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3RCO0lBQ0YsQ0FBQzs7QUFqTmUsWUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNsQiwrQkFBdUIsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckMsNkJBQXFCLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ25DLDZCQUFxQixHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNuQywrQkFBdUIsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDckMsc0JBQWMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgT1dlYkZTIGZyb20gJy4vT1dlYkZTJztcbmltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzL1V0aWxzJztcbmltcG9ydCBqcVhIUiA9IEpRdWVyeS5qcVhIUjtcblxuZXhwb3J0IGludGVyZmFjZSBpQ29tUmVzcG9uc2Uge1xuXHRlcnJvcjogbnVtYmVyO1xuXHRtc2c6IHN0cmluZztcblx0ZGF0YT86IGFueTtcblx0dXRpbWU6IG51bWJlcjsgLy8gcmVzcG9uc2UgdGltZVxuXHRzdGltZT86IG51bWJlcjsgLy8gc2Vzc2lvbiBleHBpcmUgdGltZVxuXHRzdG9rZW4/OiBzdHJpbmc7IC8vIHNlc3Npb24gdG9rZW5cblx0bmV0ZXJyb3I/OiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSB0Q29tT3B0aW9ucyA9IHtcblx0dXJsOiBzdHJpbmc7XG5cdG1ldGhvZDogc3RyaW5nO1xuXHR4aHI/OiBhbnk7XG5cdGhlYWRlcnM/OiB7fTtcblx0ZGF0YT86IHt9O1xuXHRkYXRhVHlwZT86IHN0cmluZztcblx0Y3Jvc3NEb21haW4/OiBib29sZWFuO1xuXHRwcm9jZXNzRGF0YT86IGJvb2xlYW47XG5cdGNvbnRlbnRUeXBlPzogYW55O1xuXHRiYWROZXdzU2hvdz86IGJvb2xlYW47XG5cdHRpbWVvdXQ/OiBudW1iZXI7XG59O1xuY29uc3QgZmlsZV9hbGlhc19lcnJvcnMgPSBbXG5cdCdPWl9GSUxFX0FMSUFTX1VOS05PV04nLFxuXHQnT1pfRklMRV9BTElBU19OT1RfRk9VTkQnLFxuXHQnT1pfRklMRV9BTElBU19QQVJTRV9FUlJPUicsXG5dO1xuXG5sZXQgc2VhcmNoQW5kUmVwbGFjZU1hcmtlZEZpbGUgPSBmdW5jdGlvbihcblx0ZGF0YT86IHsgW2tleTogc3RyaW5nXTogYW55IH0gfCBGb3JtRGF0YVxuKSB7XG5cdGxldCBmb3JtX2RhdGEgPSBuZXcgRm9ybURhdGEoKSxcblx0XHRoYXNfbWFya2VkX2ZpbGUgPSBmYWxzZSxcblx0XHRjaGVjayA9ICh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdGxldCB2ID0gdmFsdWU7XG5cblx0XHRcdGlmIChPV2ViRlMuaXNNYXJrZWRGaWxlKHYpKSB7XG5cdFx0XHRcdHYgPSBPV2ViRlMuY3JlYXRlRmlsZUFsaWFzKHYpO1xuXHRcdFx0XHRoYXNfbWFya2VkX2ZpbGUgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3JtX2RhdGEuYXBwZW5kKG5hbWUsIHYpO1xuXHRcdH07XG5cblx0aWYgKGRhdGEpIHtcblx0XHRpZiAoZGF0YSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG5cdFx0XHQoZGF0YSBhcyBhbnkpLmZvckVhY2goY2hlY2spO1xuXHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdFx0T2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXlfbmFtZSkge1xuXHRcdFx0XHRjaGVjayhkYXRhW2tleV9uYW1lXSwga2V5X25hbWUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGhhc19tYXJrZWRfZmlsZSA/IGZvcm1fZGF0YSA6IGZhbHNlO1xufTtcblxuY29uc3QgYWpheFRyYW5zcG9ydCA9IHtcblx0Ly8gRk9SIEdPQkwgSlNPTiBIRUxQRVI6IFdFIERPIE5PVCBUUlVTVCBKUVVFUlkgSlNPTi5wYXJzZVxuXHRjb252ZXJ0ZXJzOiB7XG5cdFx0J3RleHQganNvbic6IGZ1bmN0aW9uKGE6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2UoYSk7XG5cdFx0fSxcblx0fSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDb20gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiA9IFV0aWxzLmlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09NX1JFUVVFU1RfU1VDQ0VTUyA9IFV0aWxzLmlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09NX1JFUVVFU1RfRVJST1IgPSBVdGlscy5pZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0NPTV9ORVRXT1JLX0VSUk9SID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9DT01fVVBMT0FEX1BST0dSRVNTID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9DT01fRklOSVNIID0gVXRpbHMuaWQoKTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9vcHRpb25zOiB0Q29tT3B0aW9ucztcblx0cHJpdmF0ZSByZWFkb25seSBfb3JpZ2luYWxfZGF0YTogYW55O1xuXHRwcml2YXRlIF9tb2RpZmllZF9kYXRhOiBGb3JtRGF0YSB8IGJvb2xlYW47XG5cdHByaXZhdGUgX2J1c3k6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfcmVxdWVzdD86IGpxWEhSO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHAsIG9wdGlvbnM6IHRDb21PcHRpb25zKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdGlmIChvcHRpb25zICYmICFVdGlscy5pc1BsYWluT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHRgW09XZWJDb21dIHJlcXVpcmUgYW4gJ29iamVjdCcgYXMgb3B0aW9ucyBub3Q6ICAke3R5cGVvZiBvcHRpb25zfS5gXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGxldCBhcHBPcHRpb25zID0gdGhpcy5hcHBfY29udGV4dC5nZXRSZXF1ZXN0RGVmYXVsdE9wdGlvbnMoKTtcblxuXHRcdHRoaXMuX29wdGlvbnMgPSB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRcdGRhdGE6IHt9LFxuXHRcdFx0Y3Jvc3NEb21haW46IHRydWUsXG5cdFx0XHRiYWROZXdzU2hvdzogZmFsc2UsXG5cdFx0XHQvLyBpbmNyZWFzZSByZXF1ZXN0IHRpbWVvdXQgZm9yIG1vYmlsZSBkZXZpY2Vcblx0XHRcdHRpbWVvdXQ6IGFwcF9jb250ZXh0LmlzTW9iaWxlQXBwKCkgPyAxMDAwMCA6IHVuZGVmaW5lZCxcblxuXHRcdFx0Li4uYXBwT3B0aW9ucyxcblxuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHR9O1xuXG5cdFx0dGhpcy5fb3B0aW9ucy5oZWFkZXJzID0gVXRpbHMuYXNzaWduKFxuXHRcdFx0e30sXG5cdFx0XHRhcHBPcHRpb25zLmhlYWRlcnMsXG5cdFx0XHRvcHRpb25zLmhlYWRlcnMgfHwge31cblx0XHQpO1xuXG5cdFx0dGhpcy5fb3JpZ2luYWxfZGF0YSA9IG9wdGlvbnMuZGF0YSB8fCB7fTtcblx0XHR0aGlzLl9tb2RpZmllZF9kYXRhID0gc2VhcmNoQW5kUmVwbGFjZU1hcmtlZEZpbGUob3B0aW9ucy5kYXRhKTtcblxuXHRcdGlmICh0aGlzLl9tb2RpZmllZF9kYXRhKSB7XG5cdFx0XHR0aGlzLl9vcHRpb25zLmRhdGEgPSB0aGlzLl9tb2RpZmllZF9kYXRhO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQcmVwYXJlIHRoZSByZXF1ZXN0IGJlZm9yZSBzZW5kaW5nLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcHJlcGFyZSgpIHtcblx0XHRsZXQgbSA9IHRoaXMsXG5cdFx0XHRyZWFsX21ldGhvZCA9IG0uX29wdGlvbnMubWV0aG9kLFxuXHRcdFx0cmVwbGFjZV9tZXRob2RzID0gWydQQVRDSCcsICdQVVQnLCAnREVMRVRFJ10sXG5cdFx0XHRyZWFsX21ldGhvZF9oZWFkZXIgPSB0aGlzLmFwcF9jb250ZXh0LmNvbmZpZ3MuZ2V0KFxuXHRcdFx0XHQnT1pfQVBJX1JFQUxfTUVUSE9EX0hFQURFUl9OQU1FJ1xuXHRcdFx0KSxcblx0XHRcdGhlYWRlcnM6IGFueSA9IHRoaXMuX29wdGlvbnMuaGVhZGVycztcblxuXHRcdC8vIHdlIHVwZGF0ZSByZXF1ZXN0IG1ldGhvZFxuXHRcdGlmICh+cmVwbGFjZV9tZXRob2RzLmluZGV4T2YocmVhbF9tZXRob2QpKSB7XG5cdFx0XHRoZWFkZXJzW3JlYWxfbWV0aG9kX2hlYWRlcl0gPSByZWFsX21ldGhvZDtcblx0XHRcdHRoaXMuX29wdGlvbnMubWV0aG9kID0gJ1BPU1QnO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9vcHRpb25zLmRhdGEgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuXHRcdFx0dGhpcy5fb3B0aW9ucy5wcm9jZXNzRGF0YSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5fb3B0aW9ucy5jb250ZW50VHlwZSA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIHdvcmthcm91bmQgYmVjYXVzZSBqcVhIUiBkb2VzIG5vdCBleHBvc2UgdXBsb2FkIHByb3BlcnR5XG5cdFx0dGhpcy5fb3B0aW9ucy54aHIgPSBmdW5jdGlvbigpIHtcblx0XHRcdGxldCB4aHIgPSAkLmFqYXhTZXR1cChhamF4VHJhbnNwb3J0KS54aHIhKCk7XG5cblx0XHRcdC8vIGFsbG93IENPUlNcblx0XHRcdHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG5cdFx0XHRpZiAoeGhyLnVwbG9hZCkge1xuXHRcdFx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdFx0J3Byb2dyZXNzJyxcblx0XHRcdFx0XHQoZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRsZXQgcGVyY2VudCA9IDA7XG5cdFx0XHRcdFx0XHRsZXQgcG9zaXRpb24gPSBlLmxvYWRlZCB8fCBlLnBvc2l0aW9uOyAvLyBlLnBvc2l0aW9uXG5cdFx0XHRcdFx0XHRsZXQgdG90YWwgPSBlLnRvdGFsO1xuXG5cdFx0XHRcdFx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdHBlcmNlbnQgPSBNYXRoLmZsb29yKChwb3NpdGlvbiAvIHRvdGFsKSAqIDEwMCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fVVBMT0FEX1BST0dSRVNTLCBbXG5cdFx0XHRcdFx0XHRcdGUsXG5cdFx0XHRcdFx0XHRcdHBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0XHR0b3RhbCxcblx0XHRcdFx0XHRcdFx0cGVyY2VudCxcblx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmFsc2Vcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHhocjtcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBzZXJ2ZXIgcmVzcG9uc2UuXG5cdCAqXG5cdCAqID4gQ2FsbGVkIG9ubHkgd2hlbiB0aGUgY29ubmVjdGlvbiB0byB0aGUgc2VydmVyIHdhcyBzdWNjZXNzZnVsbHkgZXN0YWJsaXNoZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSByZXNwb25zZSBUaGUgc2VydmVyIHJlc3BvbnNlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfaGFuZGxlUmVzcG9uc2UocmVzcG9uc2U6IGlDb21SZXNwb25zZSkge1xuXHRcdGxldCBtID0gdGhpcztcblxuXHRcdGlmIChyZXNwb25zZS5zdGltZSkge1xuXHRcdFx0bS5hcHBfY29udGV4dC51c2VyLnNldFNlc3Npb25FeHBpcmUocmVzcG9uc2Uuc3RpbWUpO1xuXHRcdH1cblx0XHRpZiAocmVzcG9uc2Uuc3Rva2VuKSB7XG5cdFx0XHRtLmFwcF9jb250ZXh0LnNldFNlc3Npb25Ub2tlbihyZXNwb25zZS5zdG9rZW4pO1xuXHRcdH1cblxuXHRcdGlmIChyZXNwb25zZS5lcnJvciA9PT0gMCkge1xuXHRcdFx0bS50cmlnZ2VyKE9XZWJDb20uRVZUX0NPTV9SRVFVRVNUX1NVQ0NFU1MsIFtyZXNwb25zZSwgbV0pO1xuXHRcdFx0bS50cmlnZ2VyKE9XZWJDb20uRVZUX0NPTV9GSU5JU0gsIFtyZXNwb25zZSwgbV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAocmVzcG9uc2UubXNnID09PSAnT1pfRVJST1JfWU9VX01VU1RfTE9HSU4nKSB7XG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9FUlJPUiwgW3Jlc3BvbnNlLCBtXSk7XG5cdFx0XHRcdG0uYXBwX2NvbnRleHQuZm9yY2VMb2dpbigpO1xuXHRcdFx0fSBlbHNlIGlmICh+ZmlsZV9hbGlhc19lcnJvcnMuaW5kZXhPZihyZXNwb25zZS5tc2cpKSB7XG5cdFx0XHRcdC8vIG91ciBhdHRlbXB0IHRvIG1pbmltaXplIGZpbGUgdXBsb2FkIGZhaWxlZFxuXHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0J1tPV2ViQ29tXSB1bmFibGUgdG8gbWluaW1pemUgZmlsZSB1cGxvYWQgZGF0YSAtPicsXG5cdFx0XHRcdFx0cmVzcG9uc2UsXG5cdFx0XHRcdFx0bS5fb3B0aW9ucy5kYXRhXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRoaXMuX21vZGlmaWVkX2RhdGEgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fb3B0aW9ucy5kYXRhID0gdGhpcy5fb3JpZ2luYWxfZGF0YTtcblx0XHRcdFx0bS5fYnVzeSA9IGZhbHNlO1xuXHRcdFx0XHRtLnNlbmQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChtLl9vcHRpb25zLmJhZE5ld3NTaG93KSB7XG5cdFx0XHRcdFx0bS5hcHBfY29udGV4dC52aWV3LmRpYWxvZyh7XG5cdFx0XHRcdFx0XHR0eXBlOiAnZXJyb3InLFxuXHRcdFx0XHRcdFx0dGV4dDogcmVzcG9uc2UubXNnLFxuXHRcdFx0XHRcdFx0ZGF0YTogcmVzcG9uc2UuZGF0YSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9FUlJPUiwgW3Jlc3BvbnNlLCBtXSk7XG5cdFx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fRklOSVNILCBbcmVzcG9uc2UsIG1dKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCByZXF1ZXN0LlxuXHQgKi9cblx0c2VuZCgpIHtcblx0XHRsZXQgbSA9IHRoaXM7XG5cdFx0dGhpcy5fcHJlcGFyZSgpO1xuXG5cdFx0aWYgKHRoaXMuX2J1c3kpIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJDb21dIGluc3RhbmNlIGlzIGJ1c3kgLT4nLCBtKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fb3B0aW9ucykge1xuXHRcdFx0dGhpcy5fYnVzeSA9IHRydWU7XG5cdFx0XHR0aGlzLl9yZXF1ZXN0ID0gJC5hamF4KG0uX29wdGlvbnMpXG5cdFx0XHRcdC5kb25lKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0bS5faGFuZGxlUmVzcG9uc2UocmVzcG9uc2UpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmFpbCgocmVxdWVzdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IG5ldHdvcmtfZXJyb3IgPSAhVXRpbHMuaXNQbGFpbk9iamVjdChcblx0XHRcdFx0XHRcdHJlcXVlc3RbJ3Jlc3BvbnNlSlNPTiddXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRpZiAobmV0d29ya19lcnJvcikge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XHRcdFx0J1tPV2ViQ29tXSByZXF1ZXN0IG5ldHdvcmsgZXJyb3IgLT4nLFxuXHRcdFx0XHRcdFx0XHRyZXF1ZXN0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0bS50cmlnZ2VyKE9XZWJDb20uRVZUX0NPTV9ORVRXT1JLX0VSUk9SLCBbcmVxdWVzdCwgbV0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcdFx0XHQnW09XZWJDb21dIHJlcXVlc3Qgc2VydmVyIGVycm9yIC0+Jyxcblx0XHRcdFx0XHRcdFx0cmVxdWVzdFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdG0uX2hhbmRsZVJlc3BvbnNlKHJlcXVlc3RbJ3Jlc3BvbnNlSlNPTiddKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUcnkgdG8gYWJvcnQgdGhlIGN1cnJlbnQgcmVxdWVzdC5cblx0ICovXG5cdGFib3J0KCkge1xuXHRcdHRoaXMuX2J1c3kgPSBmYWxzZTtcblx0XHRpZiAodGhpcy5fcmVxdWVzdCkge1xuXHRcdFx0dGhpcy5fcmVxdWVzdC5hYm9ydCgpO1xuXHRcdH1cblx0fVxufVxuIl19