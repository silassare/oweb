import OWebNet from './OWebNet';
import { buildURL, forEach, isPlainObject } from './utils';
const setOrIgnoreIfExists = function (target, key, value, caseSensitive = false) {
    if (!target[key] && (!caseSensitive || !target[key.toUpperCase()])) {
        target[key] = value;
    }
};
export default class OWebXHR extends OWebNet {
    /**
     * OWebXHR constructor.
     *
     * @param url
     * @param options
     */
    constructor(url, options) {
        super(url, {
            method: 'get',
            timeout: 0,
            withCredentials: false,
            responseType: 'json',
            headers: {},
            isSuccessStatus: (status) => status >= 200 && status < 300,
            isGoodNews: () => {
                return true;
            },
            serverErrorInfo: () => {
                return { text: 'OZ_ERROR_SERVER' };
            },
            ...options,
        });
        this._sent = false;
    }
    /**
     * @inheritDoc
     */
    isSent() {
        return this._sent;
    }
    /**
     * @inheritDoc
     */
    send() {
        this.assertNotSent('[OWebXHR] request is already sent.');
        let x = this, xhr = new XMLHttpRequest();
        const opt = x.options, always = () => {
            x.trigger(OWebNet.EVT_FINISH);
            xhr = x = null;
        }, onerror = (err) => {
            x.trigger(OWebNet.EVT_ERROR, [err]);
            x.trigger(OWebNet.EVT_FAIL, [err]);
            always();
        }, body = this.requestBody(opt.body);
        xhr.timeout = opt.timeout;
        setOrIgnoreIfExists(opt.headers, 'Accept', 'application/json, text/plain, */*');
        xhr.withCredentials = opt.withCredentials;
        xhr.onreadystatechange = function () {
            if (!xhr || xhr.readyState !== 4) {
                return;
            }
            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (xhr.status === 0 &&
                !(xhr.responseURL && xhr.responseURL.indexOf('file:') === 0)) {
                return;
            }
            const responseRaw = xhr[(xhr.responseType || 'text') === 'text'
                ? 'responseText'
                : 'response'];
            let json = null;
            if (typeof responseRaw === 'string') {
                try {
                    json = JSON.parse(responseRaw);
                    // eslint-disable-next-line no-empty
                }
                catch (e) { }
            }
            const response = {
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
                }
                else {
                    x.trigger(OWebNet.EVT_BAD_NEWS, [response]);
                    const err = {
                        type: 'error',
                        errType: 'bad_news',
                        ...x.options.serverErrorInfo(response)
                    };
                    x.trigger(OWebNet.EVT_FAIL, [err]);
                }
            }
            else {
                x.trigger(OWebNet.EVT_HTTP_ERROR, [response]);
                const err = {
                    type: 'error',
                    errType: 'http',
                    ...x.options.serverErrorInfo(response)
                };
                x.trigger(OWebNet.EVT_FAIL, [err]);
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
            onerror({
                type: 'error',
                errType: 'abort',
                text: 'OW_ERROR_REQUEST_ABORTED',
                data: { event },
            });
        };
        xhr.ontimeout = function (event) {
            onerror({
                type: 'error',
                errType: 'timeout',
                text: 'OW_ERROR_REQUEST_TIMED_OUT',
                data: { event },
            });
        };
        xhr.onerror = function (event) {
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
        const url = this.options.params ? buildURL(this.url, this.options.params) : this.url;
        xhr.open(opt.method.toUpperCase(), url, true);
        forEach(opt.headers, function (value, header) {
            xhr.setRequestHeader(header, value);
        });
        return new Promise(function (resolve, reject) {
            x.onGoodNews((response) => resolve(response))
                .onFail((err) => reject(err));
            x._sent = true;
            xhr.send(body);
        });
    }
    /**
     * @inheritDoc
     */
    abort() {
        this._abort && this._abort();
        return this;
    }
    /**
     * Builds the request body.
     *
     * @param body
     * @private
     */
    requestBody(body) {
        if (body === null || typeof body === 'undefined') {
            return null;
        }
        if (body instanceof URLSearchParams) {
            setOrIgnoreIfExists(this.options.headers, 'Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            return body.toString();
        }
        if (isPlainObject(body)) {
            setOrIgnoreIfExists(this.options.headers, 'Content-Type', 'application/json;charset=utf-8');
            return JSON.stringify(body);
        }
        return body;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlhIUi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViWEhSLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FLTixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFekQsTUFBTSxtQkFBbUIsR0FBRyxVQUMzQixNQUFXLEVBQ1gsR0FBVyxFQUNYLEtBQVUsRUFDVixhQUFhLEdBQUcsS0FBSztJQUVyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRTtRQUNuRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQ3BCO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sT0FBTyxPQUF1QixTQUFRLE9BQVU7SUFJN0Q7Ozs7O09BS0c7SUFDSCxZQUFZLEdBQVcsRUFBRSxPQUF1QztRQUMvRCxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxFQUFXLEtBQUs7WUFDdEIsT0FBTyxFQUFVLENBQUM7WUFDbEIsZUFBZSxFQUFFLEtBQUs7WUFDdEIsWUFBWSxFQUFLLE1BQU07WUFDdkIsT0FBTyxFQUFVLEVBQUU7WUFDbkIsZUFBZSxFQUFFLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxHQUFHO1lBQ2xFLFVBQVUsRUFBTyxHQUFHLEVBQUU7Z0JBQ3JCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUNELGVBQWUsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JCLE9BQU8sRUFBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsR0FBRyxPQUFPO1NBQ1YsQ0FBQyxDQUFDO1FB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aUQsQ0FDakQsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEIsbUJBQW1CLENBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUNwQixjQUFjLEVBQ2QsZ0NBQWdDLENBQ2hDLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViTmV0LCB7XG5cdE9OZXRFcnJvcixcblx0T05ldFJlcXVlc3RPcHRpb25zLFxuXHRPTmV0UmVzcG9uc2UsXG5cdE9OZXRSZXF1ZXN0Qm9keSxcbn0gZnJvbSAnLi9PV2ViTmV0JztcbmltcG9ydCB7YnVpbGRVUkwsIGZvckVhY2gsIGlzUGxhaW5PYmplY3R9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBzZXRPcklnbm9yZUlmRXhpc3RzID0gZnVuY3Rpb24gKFxuXHR0YXJnZXQ6IGFueSxcblx0a2V5OiBzdHJpbmcsXG5cdHZhbHVlOiBhbnksXG5cdGNhc2VTZW5zaXRpdmUgPSBmYWxzZSxcbikge1xuXHRpZiAoIXRhcmdldFtrZXldICYmICghY2FzZVNlbnNpdGl2ZSB8fCAhdGFyZ2V0W2tleS50b1VwcGVyQ2FzZSgpXSkpIHtcblx0XHR0YXJnZXRba2V5XSA9IHZhbHVlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViWEhSPFQgZXh0ZW5kcyBhbnk+IGV4dGVuZHMgT1dlYk5ldDxUPiB7XG5cdHByaXZhdGUgX2Fib3J0PzogKCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBfc2VudCA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViWEhSIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgb3B0aW9uczogUGFydGlhbDxPTmV0UmVxdWVzdE9wdGlvbnM8VD4+KSB7XG5cdFx0c3VwZXIodXJsLCB7XG5cdFx0XHRtZXRob2QgICAgICAgICA6ICdnZXQnLFxuXHRcdFx0dGltZW91dCAgICAgICAgOiAwLFxuXHRcdFx0d2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcblx0XHRcdHJlc3BvbnNlVHlwZSAgIDogJ2pzb24nLFxuXHRcdFx0aGVhZGVycyAgICAgICAgOiB7fSxcblx0XHRcdGlzU3VjY2Vzc1N0YXR1czogKHN0YXR1czogbnVtYmVyKSA9PiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMCxcblx0XHRcdGlzR29vZE5ld3MgICAgIDogKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRzZXJ2ZXJFcnJvckluZm86ICgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHt0ZXh0OiAnT1pfRVJST1JfU0VSVkVSJ307XG5cdFx0XHR9LFxuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAaW5oZXJpdERvY1xuXHQgKi9cblx0aXNTZW50KCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9zZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIEBpbmhlcml0RG9jXG5cdCAqL1xuXHRzZW5kKCkge1xuXHRcdHRoaXMuYXNzZXJ0Tm90U2VudCgnW09XZWJYSFJdIHJlcXVlc3QgaXMgYWxyZWFkeSBzZW50LicpO1xuXG5cdFx0bGV0IHggICAgICAgICA9IHRoaXMsXG5cdFx0XHR4aHIgICAgICAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0XHRjb25zdCBvcHQgICAgID0geC5vcHRpb25zLFxuXHRcdFx0ICBhbHdheXMgID0gKCkgPT4ge1xuXHRcdFx0XHQgIHgudHJpZ2dlcihPV2ViTmV0LkVWVF9GSU5JU0gpO1xuXHRcdFx0XHQgIHhociA9IHggPSBudWxsIGFzIGFueTtcblx0XHRcdCAgfSxcblx0XHRcdCAgb25lcnJvciA9IChlcnI6IE9OZXRFcnJvcikgPT4ge1xuXHRcdFx0XHQgIHgudHJpZ2dlcihPV2ViTmV0LkVWVF9FUlJPUiwgW2Vycl0pO1xuXHRcdFx0XHQgIHgudHJpZ2dlcihPV2ViTmV0LkVWVF9GQUlMLCBbZXJyXSk7XG5cdFx0XHRcdCAgYWx3YXlzKCk7XG5cdFx0XHQgIH0sXG5cdFx0XHQgIGJvZHkgICAgPSB0aGlzLnJlcXVlc3RCb2R5KG9wdC5ib2R5KTtcblxuXHRcdHhoci50aW1lb3V0ID0gb3B0LnRpbWVvdXQ7XG5cblx0XHRzZXRPcklnbm9yZUlmRXhpc3RzKFxuXHRcdFx0b3B0LmhlYWRlcnMsXG5cdFx0XHQnQWNjZXB0Jyxcblx0XHRcdCdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonLFxuXHRcdCk7XG5cblx0XHR4aHIud2l0aENyZWRlbnRpYWxzID0gb3B0LndpdGhDcmVkZW50aWFscztcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoIXhociB8fCB4aHIucmVhZHlTdGF0ZSAhPT0gNCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuXHRcdFx0Ly8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcblx0XHRcdC8vIFdpdGggb25lIGV4Y2VwdGlvbjogcmVxdWVzdCB0aGF0IHVzaW5nIGZpbGU6IHByb3RvY29sLCBtb3N0IGJyb3dzZXJzXG5cdFx0XHQvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHhoci5zdGF0dXMgPT09IDAgJiZcblx0XHRcdFx0ISh4aHIucmVzcG9uc2VVUkwgJiYgeGhyLnJlc3BvbnNlVVJMLmluZGV4T2YoJ2ZpbGU6JykgPT09IDApXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCByZXNwb25zZVJhdyA9XG5cdFx0XHRcdFx0ICB4aHJbXG5cdFx0XHRcdFx0XHQgICh4aHIucmVzcG9uc2VUeXBlIHx8ICd0ZXh0JykgPT09ICd0ZXh0J1xuXHRcdFx0XHRcdFx0ICA/ICdyZXNwb25zZVRleHQnXG5cdFx0XHRcdFx0XHQgIDogJ3Jlc3BvbnNlJ1xuXHRcdFx0XHRcdFx0ICBdO1xuXG5cdFx0XHRsZXQganNvbiA9IG51bGwgYXMgYW55O1xuXG5cdFx0XHRpZiAodHlwZW9mIHJlc3BvbnNlUmF3ID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGpzb24gPSBKU09OLnBhcnNlKHJlc3BvbnNlUmF3KTtcblx0XHRcdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZW1wdHlcblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcmVzcG9uc2U6IE9OZXRSZXNwb25zZTxUPiA9IHtcblx0XHRcdFx0aXNTdWNjZXNzU3RhdHVzOiBvcHQuaXNTdWNjZXNzU3RhdHVzKHhoci5zdGF0dXMpLFxuXHRcdFx0XHRpc0dvb2ROZXdzICAgICA6IG9wdC5pc0dvb2ROZXdzKGpzb24pLFxuXHRcdFx0XHRyYXcgICAgICAgICAgICA6IHJlc3BvbnNlUmF3LFxuXHRcdFx0XHRqc29uLFxuXHRcdFx0XHRzdGF0dXMgICAgICAgICA6IHhoci5zdGF0dXMsXG5cdFx0XHRcdHN0YXR1c1RleHQgICAgIDogeGhyLnN0YXR1c1RleHQsXG5cdFx0XHR9O1xuXG5cdFx0XHR4LnRyaWdnZXIoT1dlYk5ldC5FVlRfUkVTUE9OU0UsIFtyZXNwb25zZV0pO1xuXG5cdFx0XHRpZiAocmVzcG9uc2UuaXNTdWNjZXNzU3RhdHVzKSB7XG5cdFx0XHRcdHgudHJpZ2dlcihPV2ViTmV0LkVWVF9IVFRQX1NVQ0NFU1MsIFtyZXNwb25zZV0pO1xuXG5cdFx0XHRcdGlmIChyZXNwb25zZS5pc0dvb2ROZXdzKSB7XG5cdFx0XHRcdFx0eC50cmlnZ2VyKE9XZWJOZXQuRVZUX0dPT0RfTkVXUywgW3Jlc3BvbnNlXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0eC50cmlnZ2VyKE9XZWJOZXQuRVZUX0JBRF9ORVdTLCBbcmVzcG9uc2VdKTtcblx0XHRcdFx0XHRjb25zdCBlcnI6IE9OZXRFcnJvciA9IHtcblx0XHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0XHRlcnJUeXBlOiAnYmFkX25ld3MnLFxuXHRcdFx0XHRcdFx0Li4uIHgub3B0aW9ucy5zZXJ2ZXJFcnJvckluZm8ocmVzcG9uc2UpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR4LnRyaWdnZXIoT1dlYk5ldC5FVlRfRkFJTCwgW2Vycl0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR4LnRyaWdnZXIoT1dlYk5ldC5FVlRfSFRUUF9FUlJPUiwgW3Jlc3BvbnNlXSk7XG5cdFx0XHRcdGNvbnN0IGVycjogT05ldEVycm9yID0ge1xuXHRcdFx0XHRcdHR5cGU6ICdlcnJvcicsXG5cdFx0XHRcdFx0ZXJyVHlwZTogJ2h0dHAnLFxuXHRcdFx0XHRcdC4uLiB4Lm9wdGlvbnMuc2VydmVyRXJyb3JJbmZvKHJlc3BvbnNlKVxuXHRcdFx0XHR9O1xuXHRcdFx0XHR4LnRyaWdnZXIoT1dlYk5ldC5FVlRfRkFJTCwgW2Vycl0pO1xuXHRcdFx0fVxuXG5cdFx0XHRhbHdheXMoKTtcblx0XHR9O1xuXG5cdFx0eGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHQvLyByZXBvcnQgZG93bmxvYWQgcHJvZ3Jlc3Ncblx0XHRcdHgudHJpZ2dlcihPV2ViTmV0LkVWVF9ET1dOTE9BRF9QUk9HUkVTUywgW2V2ZW50XSk7XG5cdFx0fSk7XG5cblx0XHR4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHQvLyByZXBvcnQgdXBsb2FkIHByb2dyZXNzXG5cdFx0XHR4LnRyaWdnZXIoT1dlYk5ldC5FVlRfVVBMT0FEX1BST0dSRVNTLCBbZXZlbnRdKTtcblx0XHR9KTtcblxuXHRcdHhoci5vbmFib3J0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRvbmVycm9yKHtcblx0XHRcdFx0dHlwZSAgIDogJ2Vycm9yJyxcblx0XHRcdFx0ZXJyVHlwZTogJ2Fib3J0Jyxcblx0XHRcdFx0dGV4dCAgIDogJ09XX0VSUk9SX1JFUVVFU1RfQUJPUlRFRCcsXG5cdFx0XHRcdGRhdGEgICA6IHtldmVudH0sXG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0eGhyLm9udGltZW91dCA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0b25lcnJvcih7XG5cdFx0XHRcdHR5cGUgICA6ICdlcnJvcicsXG5cdFx0XHRcdGVyclR5cGU6ICd0aW1lb3V0Jyxcblx0XHRcdFx0dGV4dCAgIDogJ09XX0VSUk9SX1JFUVVFU1RfVElNRURfT1VUJyxcblx0XHRcdFx0ZGF0YSAgIDoge2V2ZW50fSxcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHR4aHIub25lcnJvciA9IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0Ly8gaGFuZGxlIG5vbi1IVFRQIGVycm9yIChlLmcuIG5ldHdvcmsgZG93bilcblx0XHRcdG9uZXJyb3Ioe1xuXHRcdFx0XHR0eXBlICAgOiAnZXJyb3InLFxuXHRcdFx0XHRlcnJUeXBlOiAnbmV0d29yaycsXG5cdFx0XHRcdHRleHQgICA6ICdPWl9FUlJPUl9ORVRXT1JLJyxcblx0XHRcdFx0ZGF0YSAgIDoge2V2ZW50fSxcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHR0aGlzLl9hYm9ydCA9ICgpID0+IHtcblx0XHRcdHhociAmJiB4aHIuYWJvcnQoKTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgdXJsID0gdGhpcy5vcHRpb25zLnBhcmFtcyA/IGJ1aWxkVVJMKHRoaXMudXJsLCB0aGlzLm9wdGlvbnMucGFyYW1zKSA6IHRoaXMudXJsO1xuXG5cdFx0eGhyLm9wZW4ob3B0Lm1ldGhvZC50b1VwcGVyQ2FzZSgpLCB1cmwsIHRydWUpO1xuXG5cdFx0Zm9yRWFjaChvcHQuaGVhZGVycywgZnVuY3Rpb24gKHZhbHVlLCBoZWFkZXIpIHtcblx0XHRcdHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlPE9OZXRSZXNwb25zZTxUPj4oZnVuY3Rpb24gKFxuXHRcdFx0cmVzb2x2ZTogKHJlc3BvbnNlOiBPTmV0UmVzcG9uc2U8VD4pID0+IHZvaWQsXG5cdFx0XHRyZWplY3Q6IChlcnJvcjogT05ldEVycm9yKSA9PiB2b2lkLFxuXHRcdCkge1xuXHRcdFx0eC5vbkdvb2ROZXdzKChyZXNwb25zZSkgPT4gcmVzb2x2ZShyZXNwb25zZSkpXG5cdFx0XHQgLm9uRmFpbCgoZXJyKSA9PiByZWplY3QoZXJyKSk7XG5cblx0XHRcdHguX3NlbnQgPSB0cnVlO1xuXHRcdFx0eGhyLnNlbmQoYm9keSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQGluaGVyaXREb2Ncblx0ICovXG5cdGFib3J0KCkge1xuXHRcdHRoaXMuX2Fib3J0ICYmIHRoaXMuX2Fib3J0KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIHRoZSByZXF1ZXN0IGJvZHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBib2R5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIHJlcXVlc3RCb2R5KGJvZHk6IE9OZXRSZXF1ZXN0Qm9keSk6IGFueSB7XG5cdFx0aWYgKGJvZHkgPT09IG51bGwgfHwgdHlwZW9mIGJvZHkgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRpZiAoYm9keSBpbnN0YW5jZW9mIFVSTFNlYXJjaFBhcmFtcykge1xuXHRcdFx0c2V0T3JJZ25vcmVJZkV4aXN0cyhcblx0XHRcdFx0dGhpcy5vcHRpb25zLmhlYWRlcnMsXG5cdFx0XHRcdCdDb250ZW50LVR5cGUnLFxuXHRcdFx0XHQnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnLFxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuIGJvZHkudG9TdHJpbmcoKTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChib2R5KSkge1xuXHRcdFx0c2V0T3JJZ25vcmVJZkV4aXN0cyhcblx0XHRcdFx0dGhpcy5vcHRpb25zLmhlYWRlcnMsXG5cdFx0XHRcdCdDb250ZW50LVR5cGUnLFxuXHRcdFx0XHQnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04Jyxcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShib2R5KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYm9keTtcblx0fVxufVxuIl19