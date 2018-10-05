import OWebEvent from "./OWebEvent";
import OWebFS from "./OWebFS";
import Utils from "./utils/Utils";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkNvbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQ29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFDOUIsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBeUJsQyxNQUFNLGlCQUFpQixHQUFjO0lBQ2pDLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsMkJBQTJCO0NBQzNCLEVBQ0QsZUFBZSxHQUFnQjtJQUM5QixHQUFHLEVBQVUsRUFBRTtJQUNmLE1BQU0sRUFBTyxLQUFLO0lBQ2xCLElBQUksRUFBUyxFQUFFO0lBQ2YsUUFBUSxFQUFLLE1BQU07SUFDbkIsV0FBVyxFQUFFLElBQUk7SUFDakIsV0FBVyxFQUFFLEtBQUs7SUFDbEIsNkNBQTZDO0lBQzdDLGtEQUFrRDtJQUNsRCxPQUFPLEVBQU0sQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztDQUN0RCxDQUFDO0FBRUwsSUFBSSwwQkFBMEIsR0FBRyxVQUFVLElBQXdDO0lBQ2xGLElBQUksU0FBUyxHQUFTLElBQUksUUFBUSxFQUFFLEVBQ25DLGVBQWUsR0FBRyxLQUFLLEVBQ3ZCLEtBQUssR0FBYSxDQUFDLEtBQVUsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUM5QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFZCxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsQ0FBQyxHQUFpQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLGVBQWUsR0FBRyxJQUFJLENBQUM7U0FDdkI7UUFFRCxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUM7SUFFSCxJQUFJLElBQUks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USxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3RCO0lBQ0YsQ0FBQzs7QUFuSmUsK0JBQXVCLEdBQUcsaUJBQWlCLENBQUM7QUFDNUMsNkJBQXFCLEdBQUssZUFBZSxDQUFDO0FBQzFDLDZCQUFxQixHQUFLLG1CQUFtQixDQUFDO0FBQzlDLCtCQUF1QixHQUFHLHlCQUF5QixDQUFDO0FBQ3BELHNCQUFjLEdBQVksZ0JBQWdCLENBQUM7QUFDM0MsWUFBSSxHQUFzQixTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tIFwiLi9PV2ViQXBwXCI7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xuaW1wb3J0IE9XZWJGUyBmcm9tIFwiLi9PV2ViRlNcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuaW1wb3J0IGpxWEhSID0gSlF1ZXJ5LmpxWEhSO1xuXG5leHBvcnQgaW50ZXJmYWNlIGlDb21SZXNwb25zZSB7XG5cdGVycm9yOiBudW1iZXIsXG5cdG1zZzogc3RyaW5nLFxuXHRkYXRhPzogYW55LFxuXHR1dGltZTogbnVtYmVyLFxuXHRzdGltZT86IG51bWJlcixcblx0bmV0ZXJyb3I/OiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIHRDb21PcHRpb25zID0ge1xuXHR1cmw6IHN0cmluZyxcblx0bWV0aG9kOiBzdHJpbmcsXG5cdHhocj86IGFueSxcblx0aGVhZGVycz86IHt9LFxuXHRkYXRhPzoge30sXG5cdGRhdGFUeXBlPzogc3RyaW5nLFxuXHRjcm9zc0RvbWFpbj86IGJvb2xlYW4sXG5cdHByb2Nlc3NEYXRhPzogYm9vbGVhbixcblx0Y29udGVudFR5cGU/OiBhbnksXG5cdGJhZE5ld3NTaG93PzogYm9vbGVhbixcblx0dGltZW91dD86IG51bWJlclxufTtcbmNvbnN0IGZpbGVfYWxpYXNfZXJyb3JzICAgICAgICAgICAgPSBbXG5cdFx0ICBcIk9aX0ZJTEVfQUxJQVNfVU5LTk9XTlwiLFxuXHRcdCAgXCJPWl9GSUxFX0FMSUFTX05PVF9GT1VORFwiLFxuXHRcdCAgXCJPWl9GSUxFX0FMSUFTX1BBUlNFX0VSUk9SXCJcblx0ICBdLFxuXHQgIGRlZmF1bHRfb3B0aW9uczogdENvbU9wdGlvbnMgPSB7XG5cdFx0ICB1cmwgICAgICAgIDogXCJcIixcblx0XHQgIG1ldGhvZCAgICAgOiBcIkdFVFwiLFxuXHRcdCAgZGF0YSAgICAgICA6IHt9LFxuXHRcdCAgZGF0YVR5cGUgICA6IFwianNvblwiLFxuXHRcdCAgY3Jvc3NEb21haW46IHRydWUsXG5cdFx0ICBiYWROZXdzU2hvdzogZmFsc2UsXG5cdFx0ICAvLyBpbmNyZWFzZSByZXF1ZXN0IHRpbWVvdXQgZm9yIG1vYmlsZSBkZXZpY2Vcblx0XHQgIC8vIFRPRE86IGZpbmQgYSBnb29kIHdheSB0byBjaGVjayBpZiBtb2JpbGUgZGV2aWNlXG5cdFx0ICB0aW1lb3V0ICAgIDogKFwiY29yZG92YVwiIGluIHdpbmRvdyA/IDEwMDAwIDogdW5kZWZpbmVkKVxuXHQgIH07XG5cbmxldCBzZWFyY2hBbmRSZXBsYWNlTWFya2VkRmlsZSA9IGZ1bmN0aW9uIChkYXRhPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB8IEZvcm1EYXRhKSB7XG5cdGxldCBmb3JtX2RhdGEgICAgICAgPSBuZXcgRm9ybURhdGEoKSxcblx0XHRoYXNfbWFya2VkX2ZpbGUgPSBmYWxzZSxcblx0XHRjaGVjayAgICAgICAgICAgPSAodmFsdWU6IGFueSwgbmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRsZXQgdiA9IHZhbHVlO1xuXG5cdFx0XHRpZiAoT1dlYkZTLmlzTWFya2VkRmlsZSh2KSkge1xuXHRcdFx0XHR2ICAgICAgICAgICAgICAgPSBPV2ViRlMuY3JlYXRlRmlsZUFsaWFzKHYpO1xuXHRcdFx0XHRoYXNfbWFya2VkX2ZpbGUgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3JtX2RhdGEuYXBwZW5kKG5hbWUsIHYpO1xuXHRcdH07XG5cblx0aWYgKGRhdGEpIHtcblx0XHRpZiAoZGF0YSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG5cdFx0XHQoZGF0YSBhcyBhbnkpLmZvckVhY2goY2hlY2spO1xuXHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdFx0T2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5X25hbWUpIHtcblx0XHRcdFx0Y2hlY2soZGF0YVtrZXlfbmFtZV0sIGtleV9uYW1lKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBoYXNfbWFya2VkX2ZpbGUgPyBmb3JtX2RhdGEgOiBmYWxzZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJDb20gZXh0ZW5kcyBPV2ViRXZlbnQge1xuXG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09NX1JFUVVFU1RfU1VDQ0VTUyA9IFwiT1dlYkNvbTpzdWNjZXNzXCI7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09NX1JFUVVFU1RfRVJST1IgICA9IFwiT1dlYkNvbTplcnJvclwiO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0NPTV9ORVRXT1JLX0VSUk9SICAgPSBcIk9XZWJDb206bmV0X2Vycm9yXCI7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfQ09NX1VQTE9BRF9QUk9HUkVTUyA9IFwiT1dlYkNvbTp1cGxvYWRfcHJvZ3Jlc3NcIjtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9DT01fRklOSVNIICAgICAgICAgID0gXCJPV2ViQ29tOmZpbmlzaFwiO1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgICAgICAgICAgPSBcIk9XZWJDb21cIjtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9vcHRpb25zOiB0Q29tT3B0aW9ucztcblx0cHJpdmF0ZSByZWFkb25seSBfb3JpZ2luYWxfZGF0YTogYW55O1xuXHRwcml2YXRlIF9tb2RpZmllZF9kYXRhOiBGb3JtRGF0YSB8IGJvb2xlYW47XG5cdHByaXZhdGUgX2J1c3k6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfcmVxdWVzdD86IGpxWEhSO1xuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHAsIG9wdGlvbnM6IHRDb21PcHRpb25zKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdGlmIChvcHRpb25zICYmICFVdGlscy5pc1BsYWluT2JqZWN0KG9wdGlvbnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBbT1dlYkNvbV0gcmVxdWlyZSBhbiAnb2JqZWN0JyBhcyBvcHRpb25zIG5vdDogICR7dHlwZW9mIG9wdGlvbnN9LmApO1xuXHRcdH1cblxuXHRcdHRoaXMuX29wdGlvbnMgICAgICAgPSBVdGlscy5hc3NpZ24oe30sIGRlZmF1bHRfb3B0aW9ucywgb3B0aW9ucyB8fCB7fSk7XG5cdFx0dGhpcy5fb3JpZ2luYWxfZGF0YSA9IG9wdGlvbnMuZGF0YSB8fCB7fTtcblx0XHR0aGlzLl9tb2RpZmllZF9kYXRhID0gc2VhcmNoQW5kUmVwbGFjZU1hcmtlZEZpbGUob3B0aW9ucy5kYXRhKTtcblxuXHRcdGlmICh0aGlzLl9tb2RpZmllZF9kYXRhKSB7XG5cdFx0XHR0aGlzLl9vcHRpb25zLmRhdGEgPSB0aGlzLl9tb2RpZmllZF9kYXRhO1xuXHRcdH1cblxuXHR9XG5cblx0cHJpdmF0ZSBfaW5pdCgpIHtcblx0XHRsZXQgbSAgICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdHJlYWxfbWV0aG9kICAgICAgICA9IG0uX29wdGlvbnMubWV0aG9kLFxuXHRcdFx0cmVwbGFjZV9tZXRob2RzICAgID0gW1wiUEFUQ0hcIiwgXCJQVVRcIiwgXCJERUxFVEVcIl0sXG5cdFx0XHRhcGlfa2V5X2hlYWRlciAgICAgPSB0aGlzLmFwcF9jb250ZXh0LmNvbmZpZ3MuZ2V0KFwiT1pfQVBJX0tFWV9IRUFERVJfTkFNRVwiKSxcblx0XHRcdHJlYWxfbWV0aG9kX2hlYWRlciA9IHRoaXMuYXBwX2NvbnRleHQuY29uZmlncy5nZXQoXCJPWl9BUElfUkVBTF9NRVRIT0RfSEVBREVSX05BTUVcIik7XG5cblx0XHRsZXQgaGVhZGVyczogYW55ID0gdGhpcy5fb3B0aW9ucy5oZWFkZXJzID0gdGhpcy5fb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuXHRcdGhlYWRlcnNbYXBpX2tleV9oZWFkZXJdID0gdGhpcy5hcHBfY29udGV4dC5jb25maWdzLmdldChcIk9aX0FQSV9LRVlcIik7XG5cblx0XHQvLyB1cGRhdGUgcmVxdWVzdCBtZXRob2Rcblx0XHRpZiAofnJlcGxhY2VfbWV0aG9kcy5pbmRleE9mKHJlYWxfbWV0aG9kKSkge1xuXHRcdFx0aGVhZGVyc1tyZWFsX21ldGhvZF9oZWFkZXJdID0gcmVhbF9tZXRob2Q7XG5cdFx0XHR0aGlzLl9vcHRpb25zLm1ldGhvZCAgICAgICAgPSBcIlBPU1RcIjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fb3B0aW9ucy5kYXRhIGluc3RhbmNlb2YgRm9ybURhdGEpIHtcblx0XHRcdHRoaXMuX29wdGlvbnMucHJvY2Vzc0RhdGEgPSBmYWxzZTtcblx0XHRcdHRoaXMuX29wdGlvbnMuY29udGVudFR5cGUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyB3b3JrYXJvdW5kIGJlY2F1c2UganFYSFIgZG9lcyBub3QgZXhwb3NlIHVwbG9hZCBwcm9wZXJ0eVxuXHRcdHRoaXMuX29wdGlvbnMueGhyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0bGV0IHhociA9ICQuYWpheFNldHRpbmdzLnhociEoKTtcblxuXHRcdFx0Ly8gYWxsb3cgQ09SU1xuXHRcdFx0eGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cblx0XHRcdGlmICh4aHIudXBsb2FkKSB7XG5cdFx0XHRcdHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIChlOiBhbnkpID0+IHtcblx0XHRcdFx0XHRsZXQgcGVyY2VudCAgPSAwO1xuXHRcdFx0XHRcdGxldCBwb3NpdGlvbiA9IGUubG9hZGVkIHx8IGUucG9zaXRpb247Ly8gZS5wb3NpdGlvblxuXHRcdFx0XHRcdGxldCB0b3RhbCAgICA9IGUudG90YWw7XG5cblx0XHRcdFx0XHRpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG5cdFx0XHRcdFx0XHRwZXJjZW50ID0gTWF0aC5mbG9vcihwb3NpdGlvbiAvIHRvdGFsICogMTAwKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRtLnRyaWdnZXIoT1dlYkNvbS5FVlRfQ09NX1VQTE9BRF9QUk9HUkVTUywgW2UsIHBvc2l0aW9uLCB0b3RhbCwgcGVyY2VudF0pO1xuXG5cdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHhocjtcblx0XHR9O1xuXHR9XG5cblx0Ly8gdGhlIGNvbm5lY3Rpb24gdG8gdGhlIHNlcnZlciB3YXMgc3VjY2Vzc2Z1bGx5IGVzdGFibGlzaGVkXG5cdHByaXZhdGUgX2hhbmRsZVJlc3BvbnNlKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRsZXQgbSA9IHRoaXM7XG5cblx0XHRpZiAocmVzcG9uc2Uuc3RpbWUpIHtcblx0XHRcdG0uYXBwX2NvbnRleHQudXNlci5zZXRTZXNzaW9uRXhwaXJlKHJlc3BvbnNlLnN0aW1lKTtcblx0XHR9XG5cblx0XHRpZiAocmVzcG9uc2UuZXJyb3IgPT09IDApIHtcblx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9TVUNDRVNTLCBbcmVzcG9uc2UsIG1dKTtcblx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fRklOSVNILCBbcmVzcG9uc2UsIG1dKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHJlc3BvbnNlLm1zZyA9PT0gXCJPWl9FUlJPUl9ZT1VfTVVTVF9MT0dJTlwiKSB7XG5cdFx0XHRcdG0uYXBwX2NvbnRleHQuZm9yY2VMb2dpbigpO1xuXHRcdFx0fSBlbHNlIGlmICh+ZmlsZV9hbGlhc19lcnJvcnMuaW5kZXhPZihyZXNwb25zZS5tc2cpKSB7XG5cdFx0XHRcdC8vIG91ciBhdHRlbXB0IHRvIG1pbmltaXplIGZpbGUgdXBsb2FkIGZhaWxlZFxuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkNvbV0gdW5hYmxlIHRvIG1pbmltaXplIGZpbGUgdXBsb2FkIGRhdGEgLT5cIiwgcmVzcG9uc2UsIG0uX29wdGlvbnMuZGF0YSk7XG5cdFx0XHRcdHRoaXMuX21vZGlmaWVkX2RhdGEgPSBmYWxzZTtcblx0XHRcdFx0dGhpcy5fb3B0aW9ucy5kYXRhICA9IHRoaXMuX29yaWdpbmFsX2RhdGE7XG5cdFx0XHRcdG0uX2J1c3kgICAgICAgICAgICAgPSBmYWxzZTtcblx0XHRcdFx0bS5zZW5kKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAobS5fb3B0aW9ucy5iYWROZXdzU2hvdykge1xuXHRcdFx0XHRcdG0uYXBwX2NvbnRleHQudmlldy5kaWFsb2coe1xuXHRcdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdFx0dGV4dDogcmVzcG9uc2UubXNnLFxuXHRcdFx0XHRcdFx0ZGF0YTogcmVzcG9uc2UuZGF0YVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJDb20uRVZUX0NPTV9SRVFVRVNUX0VSUk9SLCBbcmVzcG9uc2UsIG1dKTtcblx0XHRcdFx0bS50cmlnZ2VyKE9XZWJDb20uRVZUX0NPTV9GSU5JU0gsIFtyZXNwb25zZSwgbV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNlbmQoKSB7XG5cdFx0bGV0IG0gPSB0aGlzO1xuXHRcdHRoaXMuX2luaXQoKTtcblxuXHRcdGlmICh0aGlzLl9idXN5KSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkNvbV0gaW5zdGFuY2UgaXMgYnVzeSAtPlwiLCBtKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fb3B0aW9ucykge1xuXHRcdFx0dGhpcy5fYnVzeSAgICA9IHRydWU7XG5cdFx0XHR0aGlzLl9yZXF1ZXN0ID0gJC5hamF4KG0uX29wdGlvbnMpXG5cdFx0XHRcdC5kb25lKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0bS5faGFuZGxlUmVzcG9uc2UocmVzcG9uc2UpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmFpbCgocmVxdWVzdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0bGV0IG5ldHdvcmtfZXJyb3IgPSAhVXRpbHMuaXNQbGFpbk9iamVjdChcblx0XHRcdFx0XHRcdHJlcXVlc3RbXCJyZXNwb25zZUpTT05cIl0pO1xuXHRcdFx0XHRcdGlmIChuZXR3b3JrX2Vycm9yKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFwiW09XZWJDb21dIHJlcXVlc3QgbmV0d29yayBlcnJvciAtPlwiLCByZXF1ZXN0KTtcblx0XHRcdFx0XHRcdG0udHJpZ2dlcihPV2ViQ29tLkVWVF9DT01fTkVUV09SS19FUlJPUiwgW3JlcXVlc3QsIG1dKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcIltPV2ViQ29tXSByZXF1ZXN0IHNlcnZlciBlcnJvciAtPlwiLCByZXF1ZXN0KTtcblx0XHRcdFx0XHRcdG0uX2hhbmRsZVJlc3BvbnNlKHJlcXVlc3RbXCJyZXNwb25zZUpTT05cIl0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0YWJvcnQoKSB7XG5cdFx0dGhpcy5fYnVzeSA9IGZhbHNlO1xuXHRcdGlmICh0aGlzLl9yZXF1ZXN0KSB7XG5cdFx0XHR0aGlzLl9yZXF1ZXN0LmFib3J0KCk7XG5cdFx0fVxuXHR9XG59Il19