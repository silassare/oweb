import OWebEvent from './OWebEvent';
import { id } from './utils/Utils';
let OWebNet = /** @class */ (() => {
    class OWebNet extends OWebEvent {
        constructor(url, options) {
            super();
            this.url = url;
            this.options = options;
        }
        /**
         * Called on error: abort, timeout, network
         *
         * @param handler
         */
        onError(handler) {
            return this.on(OWebNet.EVT_ERROR, handler);
        }
        /**
         * Called when request sent and the server responded.
         *
         * @param handler
         */
        onResponse(handler) {
            return this.on(OWebNet.EVT_RESPONSE, handler);
        }
        /**
         * Called when request sent and http response status code is in success range.
         *
         * @param handler
         */
        onHttpSuccess(handler) {
            return this.on(OWebNet.EVT_HTTP_SUCCESS, handler);
        }
        /**
         * Called when request sent and http response status code is in error range.
         *
         * @param handler
         */
        onHttpError(handler) {
            return this.on(OWebNet.EVT_HTTP_ERROR, handler);
        }
        /**
         * Always called when the request finished.
         *
         * @param handler
         */
        onFinished(handler) {
            return this.on(OWebNet.EVT_FINISHED, handler);
        }
        /**
         * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
         *
         * @param handler
         */
        onGoodNews(handler) {
            return this.on(OWebNet.EVT_GOOD_NEWS, handler);
        }
        /**
         * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
         *
         * @param handler
         */
        onBadNews(handler) {
            return this.on(OWebNet.EVT_BAD_NEWS, handler);
        }
        /**
         * Listen to download progress event.
         *
         * NOTE: this is not supported by all browser.
         *
         * @param handler
         */
        onUploadProgress(handler) {
            return this.on(OWebNet.EVT_UPLOAD_PROGRESS, handler);
        }
        /**
         * Listen to download progress event.
         *
         * @param handler
         */
        onDownloadProgress(handler) {
            return this.on(OWebNet.EVT_DOWNLOAD_PROGRESS, handler);
        }
    }
    OWebNet.SELF = id();
    OWebNet.EVT_ERROR = id(); // on error: abort, timeout, network
    OWebNet.EVT_RESPONSE = id(); // request sent and the server responded.
    OWebNet.EVT_HTTP_SUCCESS = id(); // request sent and http response status code is in success range
    OWebNet.EVT_HTTP_ERROR = id(); // request sent and http response status code is in error range
    OWebNet.EVT_FINISHED = id(); // request finished
    OWebNet.EVT_GOOD_NEWS = id(); // the response is a good news [depends on provided options]
    OWebNet.EVT_BAD_NEWS = id(); // the response is a bad news [depends on provided options]
    OWebNet.EVT_UPLOAD_PROGRESS = id(); // on upload progress
    OWebNet.EVT_DOWNLOAD_PROGRESS = id(); // on download progress
    return OWebNet;
})();
export default OWebNet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYk5ldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViTmV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBa0RuQztJQUFBLE1BQThCLE9BQVcsU0FBUSxTQUFTO1FBWXpELFlBQ1csR0FBVyxFQUNYLE9BQThCO1lBRXhDLEtBQUssRUFBRSxDQUFDO1lBSEUsUUFBRyxHQUFILEdBQUcsQ0FBUTtZQUNYLFlBQU8sR0FBUCxPQUFPLENBQXVCO1FBR3pDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsT0FBTyxDQUFDLE9BQStDO1lBQ3RELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsVUFBVSxDQUFDLE9BQXdEO1lBQ2xFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsYUFBYSxDQUNaLE9BQXdEO1lBRXhELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxXQUFXLENBQ1YsT0FBd0Q7WUFFeEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxVQUFVLENBQUMsT0FBNkI7WUFDdkMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxVQUFVLENBQUMsT0FBd0Q7WUFDbEUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxTQUFTLENBQUMsT0FBd0Q7WUFDakUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVEOzs7Ozs7V0FNRztRQUNILGdCQUFnQixDQUNmLE9BQXNEO1lBRXRELE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxrQkFBa0IsQ0FDakIsT0FBc0Q7WUFFdEQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RCxDQUFDOztJQTNHZSxZQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWixpQkFBUyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsb0NBQW9DO0lBQ3RELG9CQUFZLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyx5Q0FBeUM7SUFDOUQsd0JBQWdCLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxpRUFBaUU7SUFDMUYsc0JBQWMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLCtEQUErRDtJQUN0RixvQkFBWSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsbUJBQW1CO0lBQ3hDLHFCQUFhLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyw0REFBNEQ7SUFDbEYsb0JBQVksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLDJEQUEyRDtJQUNoRiwyQkFBbUIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQjtJQUNqRCw2QkFBcUIsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtJQWtIdEUsY0FBQztLQUFBO2VBNUg2QixPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgeyBpZCB9IGZyb20gJy4vdXRpbHMvVXRpbHMnO1xuXG5leHBvcnQgdHlwZSB0TmV0UmVxdWVzdEJvZHkgPVxuXHR8IHVuZGVmaW5lZFxuXHR8IHN0cmluZ1xuXHR8IG9iamVjdFxuXHR8IEZvcm1EYXRhXG5cdHwgVVJMU2VhcmNoUGFyYW1zXG5cdHwgRmlsZVxuXHR8IEJsb2I7XG5cbmV4cG9ydCB0eXBlIHROZXRSZXF1ZXN0TWV0aG9kID1cblx0fCAnZ2V0J1xuXHR8ICdHRVQnXG5cdHwgJ2RlbGV0ZSdcblx0fCAnREVMRVRFJ1xuXHR8ICdoZWFkJ1xuXHR8ICdIRUFEJ1xuXHR8ICdvcHRpb25zJ1xuXHR8ICdPUFRJT05TJ1xuXHR8ICdwb3N0J1xuXHR8ICdQT1NUJ1xuXHR8ICdwdXQnXG5cdHwgJ1BVVCdcblx0fCAncGF0Y2gnXG5cdHwgJ1BBVENIJztcblxuZXhwb3J0IGludGVyZmFjZSBJTmV0UmVzcG9uc2U8VD4ge1xuXHRyYXc6IGFueTtcblx0anNvbjogbnVsbCB8IFQ7XG5cdHN0YXR1czogbnVtYmVyO1xuXHRzdGF0dXNUZXh0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5ldEVycm9yIHtcblx0dHlwZTogJ25ldHdvcmsnIHwgJ2Fib3J0JyB8ICd0aW1lb3V0JyB8ICd1bmtub3duJztcblx0ZXZlbnQ6IFByb2dyZXNzRXZlbnQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5ldFJlcXVlc3RPcHRpb25zPFQ+IHtcblx0bWV0aG9kOiB0TmV0UmVxdWVzdE1ldGhvZDtcblx0Ym9keT86IHROZXRSZXF1ZXN0Qm9keTtcblx0dGltZW91dDogbnVtYmVyO1xuXHR3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW47XG5cdHJlc3BvbnNlVHlwZTogWE1MSHR0cFJlcXVlc3RSZXNwb25zZVR5cGU7XG5cdGhlYWRlcnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5cdGlzU3VjY2Vzc1N0YXR1czogKHN0YXR1czogbnVtYmVyKSA9PiBib29sZWFuO1xuXHRpc0dvb2ROZXdzOiAocmVzcG9uc2U6IElOZXRSZXNwb25zZTxUPikgPT4gYm9vbGVhbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgT1dlYk5ldDxUPiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9FUlJPUiA9IGlkKCk7IC8vIG9uIGVycm9yOiBhYm9ydCwgdGltZW91dCwgbmV0d29ya1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX1JFU1BPTlNFID0gaWQoKTsgLy8gcmVxdWVzdCBzZW50IGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZC5cblx0c3RhdGljIHJlYWRvbmx5IEVWVF9IVFRQX1NVQ0NFU1MgPSBpZCgpOyAvLyByZXF1ZXN0IHNlbnQgYW5kIGh0dHAgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgaXMgaW4gc3VjY2VzcyByYW5nZVxuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0hUVFBfRVJST1IgPSBpZCgpOyAvLyByZXF1ZXN0IHNlbnQgYW5kIGh0dHAgcmVzcG9uc2Ugc3RhdHVzIGNvZGUgaXMgaW4gZXJyb3IgcmFuZ2Vcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9GSU5JU0hFRCA9IGlkKCk7IC8vIHJlcXVlc3QgZmluaXNoZWRcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9HT09EX05FV1MgPSBpZCgpOyAvLyB0aGUgcmVzcG9uc2UgaXMgYSBnb29kIG5ld3MgW2RlcGVuZHMgb24gcHJvdmlkZWQgb3B0aW9uc11cblx0c3RhdGljIHJlYWRvbmx5IEVWVF9CQURfTkVXUyA9IGlkKCk7IC8vIHRoZSByZXNwb25zZSBpcyBhIGJhZCBuZXdzIFtkZXBlbmRzIG9uIHByb3ZpZGVkIG9wdGlvbnNdXG5cdHN0YXRpYyByZWFkb25seSBFVlRfVVBMT0FEX1BST0dSRVNTID0gaWQoKTsgLy8gb24gdXBsb2FkIHByb2dyZXNzXG5cdHN0YXRpYyByZWFkb25seSBFVlRfRE9XTkxPQURfUFJPR1JFU1MgPSBpZCgpOyAvLyBvbiBkb3dubG9hZCBwcm9ncmVzc1xuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByb3RlY3RlZCB1cmw6IHN0cmluZyxcblx0XHRwcm90ZWN0ZWQgb3B0aW9uczogSU5ldFJlcXVlc3RPcHRpb25zPFQ+LFxuXHQpIHtcblx0XHRzdXBlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCBvbiBlcnJvcjogYWJvcnQsIHRpbWVvdXQsIG5ldHdvcmtcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uRXJyb3IoaGFuZGxlcjogKHRoaXM6IHRoaXMsIGVycm9yOiBJTmV0RXJyb3IpID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9FUlJPUiwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gcmVxdWVzdCBzZW50IGFuZCB0aGUgc2VydmVyIHJlc3BvbmRlZC5cblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uUmVzcG9uc2UoaGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8VD4pID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9SRVNQT05TRSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gcmVxdWVzdCBzZW50IGFuZCBodHRwIHJlc3BvbnNlIHN0YXR1cyBjb2RlIGlzIGluIHN1Y2Nlc3MgcmFuZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvbkh0dHBTdWNjZXNzKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCByZXNwb25zZTogSU5ldFJlc3BvbnNlPFQ+KSA9PiB2b2lkLFxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9IVFRQX1NVQ0NFU1MsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHJlcXVlc3Qgc2VudCBhbmQgaHR0cCByZXNwb25zZSBzdGF0dXMgY29kZSBpcyBpbiBlcnJvciByYW5nZS5cblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uSHR0cEVycm9yKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCByZXNwb25zZTogSU5ldFJlc3BvbnNlPFQ+KSA9PiB2b2lkLFxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9IVFRQX0VSUk9SLCBoYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBbHdheXMgY2FsbGVkIHdoZW4gdGhlIHJlcXVlc3QgZmluaXNoZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvbkZpbmlzaGVkKGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYk5ldC5FVlRfRklOSVNIRUQsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGBvcHRpb25zLnJlc3BvbnNlVHlwZWAgaXMgYGpzb25gIGFuZCBgb3B0aW9ucy5pc0dvb2ROZXdzYCByZXR1cm5zIGB0cnVlYC5cblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uR29vZE5ld3MoaGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8VD4pID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9HT09EX05FV1MsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGBvcHRpb25zLnJlc3BvbnNlVHlwZWAgaXMgYGpzb25gIGFuZCBgb3B0aW9ucy5pc0dvb2ROZXdzYCByZXR1cm5zIGBmYWxzZWAuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvbkJhZE5ld3MoaGFuZGxlcjogKHRoaXM6IHRoaXMsIHJlc3BvbnNlOiBJTmV0UmVzcG9uc2U8VD4pID0+IHZvaWQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9CQURfTkVXUywgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuIHRvIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50LlxuXHQgKlxuXHQgKiBOT1RFOiB0aGlzIGlzIG5vdCBzdXBwb3J0ZWQgYnkgYWxsIGJyb3dzZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblVwbG9hZFByb2dyZXNzKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBwcm9ncmVzczogUHJvZ3Jlc3NFdmVudCkgPT4gdm9pZCxcblx0KTogdGhpcyB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYk5ldC5FVlRfVVBMT0FEX1BST0dSRVNTLCBoYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMaXN0ZW4gdG8gZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvbkRvd25sb2FkUHJvZ3Jlc3MoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIHByb2dyZXNzOiBQcm9ncmVzc0V2ZW50KSA9PiB2b2lkLFxuXHQpOiB0aGlzIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViTmV0LkVWVF9ET1dOTE9BRF9QUk9HUkVTUywgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBwcm9taXNlIGZyb20gdGhpcyByZXF1ZXN0LlxuXHQgKi9cblx0YWJzdHJhY3QgcHJvbWlzZSgpOiBQcm9taXNlPElOZXRSZXNwb25zZTxUPj47XG5cblx0LyoqXG5cdCAqIFNlbmQgdGhlIHJlcXVlc3QgYW5kIHJldHVybiBhIHByb21pc2UuXG5cdCAqL1xuXHRhYnN0cmFjdCBzZW5kKCk6IHRoaXM7XG5cblx0LyoqXG5cdCAqIEFib3J0IHRoZSByZXF1ZXN0XG5cdCAqL1xuXHRhYnN0cmFjdCBhYm9ydCgpOiB0aGlzO1xufVxuIl19