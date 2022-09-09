import { stringPlaceholderReplace } from '../utils';
const SERVICE_URL_FORMAT = ':host/:service', SERVICE_ENTITY_FORMAT = ':host/:service/:id', SERVICE_ENTITY_RELATION_FORMAT = ':host/:service/:id/:relation';
const apiCache = {};
export const getApiForHost = function getApiForHost(url) {
    for (const apiHost in apiCache) {
        if (url.startsWith(apiHost)) {
            return apiCache[apiHost];
        }
    }
    return undefined;
};
export default class OZone {
    _appContext;
    apiHost;
    /**
     * OZone constructor.
     *
     * @param _appContext
     */
    constructor(_appContext) {
        this._appContext = _appContext;
        this.apiHost = _appContext.configs
            .get('OZ_API_BASE_URL')
            .replace(/\/$/g, '');
    }
    /**
     * Create new ozone api instance or get from cache
     *
     */
    static instantiate(_appContext) {
        const apiHost = _appContext.configs.get('OZ_API_BASE_URL');
        if (!(apiHost in apiCache)) {
            apiCache[apiHost] = new OZone(_appContext);
        }
        return apiCache[apiHost];
    }
    /**
     * Makes a request.
     *
     * @param url The request url
     * @param options The request options
     */
    request(url, options = {}) {
        const _this = this, api = getApiForHost(url);
        if (api) {
            if (!options.headers) {
                options.headers = {};
            }
            if (this._appContext.configs.get('OZ_API_ALLOW_REAL_METHOD_HEADER')) {
                const realMethod = (options.method || 'get').toUpperCase(), replaceMethods = ['PATCH', 'PUT', 'DELETE'], realMethodHeader = this._appContext.configs.get('OZ_API_REAL_METHOD_HEADER_NAME');
                // we update request method
                if (~replaceMethods.indexOf(realMethod)) {
                    options.headers[realMethodHeader] = realMethod;
                    options.method = 'POST';
                }
            }
            const headerName = this._appContext.configs.get('OZ_API_KEY_HEADER_NAME');
            if (!options.headers[headerName]) {
                options.headers[headerName] =
                    this._appContext.configs.get('OZ_API_KEY');
            }
            if (!options.isGoodNews) {
                options.isGoodNews = (json) => {
                    return Boolean(json && json.error === 0);
                };
            }
            if (!options.errorResponseToDialog) {
                options.errorResponseToDialog = (response) => {
                    const json = response.json;
                    return json
                        ? { text: json.msg, data: json.data }
                        : { text: 'OZ_ERROR_NETWORK' };
                };
            }
        }
        const o = this._appContext.request(url, options);
        o.onResponse(function responseHandler(response) {
            const { json } = response;
            if (json && json.stime) {
                _this._appContext.user.setSessionExpire(json.stime);
            }
            if (json && json.stoken) {
                _this._appContext.user.setSessionToken(json.stoken);
            }
        });
        return o;
    }
    /**
     * Returns the service URI.
     *
     * @param serviceName The service name.
     */
    getServiceURI(serviceName) {
        return stringPlaceholderReplace(SERVICE_URL_FORMAT, {
            host: this.apiHost,
            service: serviceName,
        });
    }
    /**
     * Returns an absolute uri string.
     *
     * @param serviceName The service name.
     * @param path The path.
     */
    toAbsoluteURI(serviceName, path) {
        return this.getServiceURI(serviceName) + '/' + path.replace(/^\/+/, '');
    }
    /**
     * Returns entity URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     */
    getItemURI(serviceName, id) {
        return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, {
            host: this.apiHost,
            service: serviceName,
            id,
        });
    }
    /**
     * Returns entity relation URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(serviceName, id, relation) {
        return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, {
            host: this.apiHost,
            service: serviceName,
            id,
            relation,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1pvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3pvbmUvT1pvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBTXBELE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLEVBQzFDLHFCQUFxQixHQUFHLG9CQUFvQixFQUM1Qyw4QkFBOEIsR0FBRyw4QkFBOEIsQ0FBQztBQUVqRSxNQUFNLFFBQVEsR0FFVixFQUFFLENBQUM7QUFFUCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsU0FBUyxhQUFhLENBQ2xELEdBQVc7SUFFWCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUMvQixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDekI7S0FDRDtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSztJQVFLO0lBUGIsT0FBTyxDQUFTO0lBRWpDOzs7O09BSUc7SUFDSCxZQUE4QixXQUFvQjtRQUFwQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUNqRCxJQUFJLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPO2FBQ2hDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsV0FBVyxDQUFDLFdBQW9CO1FBQ3RDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxJ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QWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEQ7UUFDRixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxDQUFDO0lBQ1YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsV0FBbUI7UUFDaEMsT0FBTyx3QkFBd0IsQ0FBQyxrQkFBa0IsRUFBRTtZQUNuRCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbEIsT0FBTyxFQUFFLFdBQVc7U0FDcEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsYUFBYSxDQUFDLFdBQW1CLEVBQUUsSUFBWTtRQUM5QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxXQUFtQixFQUFFLEVBQW1CO1FBQ2xELE9BQU8sd0JBQXdCLENBQUMscUJBQXFCLEVBQUU7WUFDdEQsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2xCLE9BQU8sRUFBRSxXQUFXO1lBQ3BCLEVBQUU7U0FDRixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsa0JBQWtCLENBQ2pCLFdBQW1CLEVBQ25CLEVBQVUsRUFDVixRQUFnQjtRQUVoQixPQUFPLHdCQUF3QixDQUFDLDhCQUE4QixFQUFFO1lBQy9ELElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztZQUNsQixPQUFPLEVBQUUsV0FBVztZQUNwQixFQUFFO1lBQ0YsUUFBUTtTQUNSLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IE9OZXRSZXF1ZXN0T3B0aW9ucyB9IGZyb20gJy4uL09XZWJOZXQnO1xuaW1wb3J0IE9XZWJYSFIgZnJvbSAnLi4vT1dlYlhIUic7XG5pbXBvcnQgT1dlYkFwcCBmcm9tICcuLi9PV2ViQXBwJztcbmltcG9ydCB7IE9BcGlSZXNwb25zZSB9IGZyb20gJy4nO1xuXG5jb25zdCBTRVJWSUNFX1VSTF9GT1JNQVQgPSAnOmhvc3QvOnNlcnZpY2UnLFxuXHRTRVJWSUNFX0VOVElUWV9GT1JNQVQgPSAnOmhvc3QvOnNlcnZpY2UvOmlkJyxcblx0U0VSVklDRV9FTlRJVFlfUkVMQVRJT05fRk9STUFUID0gJzpob3N0LzpzZXJ2aWNlLzppZC86cmVsYXRpb24nO1xuXG5jb25zdCBhcGlDYWNoZToge1xuXHRbYXBpSG9zdDogc3RyaW5nXTogT1pvbmU7XG59ID0ge307XG5cbmV4cG9ydCBjb25zdCBnZXRBcGlGb3JIb3N0ID0gZnVuY3Rpb24gZ2V0QXBpRm9ySG9zdChcblx0dXJsOiBzdHJpbmdcbik6IE9ab25lIHwgdW5kZWZpbmVkIHtcblx0Zm9yIChjb25zdCBhcGlIb3N0IGluIGFwaUNhY2hlKSB7XG5cdFx0aWYgKHVybC5zdGFydHNXaXRoKGFwaUhvc3QpKSB7XG5cdFx0XHRyZXR1cm4gYXBpQ2FjaGVbYXBpSG9zdF07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ab25lIHtcblx0cHJpdmF0ZSByZWFkb25seSBhcGlIb3N0OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE9ab25lIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gX2FwcENvbnRleHRcblx0ICovXG5cdHByb3RlY3RlZCBjb25zdHJ1Y3Rvcihwcml2YXRlIF9hcHBDb250ZXh0OiBPV2ViQXBwKSB7XG5cdFx0dGhpcy5hcGlIb3N0ID0gX2FwcENvbnRleHQuY29uZmlnc1xuXHRcdFx0LmdldCgnT1pfQVBJX0JBU0VfVVJMJylcblx0XHRcdC5yZXBsYWNlKC9cXC8kL2csICcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgbmV3IG96b25lIGFwaSBpbnN0YW5jZSBvciBnZXQgZnJvbSBjYWNoZVxuXHQgKlxuXHQgKi9cblx0c3RhdGljIGluc3RhbnRpYXRlKF9hcHBDb250ZXh0OiBPV2ViQXBwKTogT1pvbmUge1xuXHRcdGNvbnN0IGFwaUhvc3QgPSBfYXBwQ29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0JBU0VfVVJMJyk7XG5cblx0XHRpZiAoIShhcGlIb3N0IGluIGFwaUNhY2hlKSkge1xuXHRcdFx0YXBpQ2FjaGVbYXBpSG9zdF0gPSBuZXcgT1pvbmUoX2FwcENvbnRleHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcGlDYWNoZVthcGlIb3N0XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYWtlcyBhIHJlcXVlc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgVGhlIHJlcXVlc3QgdXJsXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSByZXF1ZXN0IG9wdGlvbnNcblx0ICovXG5cdHJlcXVlc3Q8UmVzcG9uc2UgZXh0ZW5kcyBPQXBpUmVzcG9uc2U8YW55Pj4oXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogUGFydGlhbDxPTmV0UmVxdWVzdE9wdGlvbnM8UmVzcG9uc2U+PiA9IHt9XG5cdCk6IE9XZWJYSFI8UmVzcG9uc2U+IHtcblx0XHRjb25zdCBfdGhpcyA9IHRoaXMsXG5cdFx0XHRhcGkgPSBnZXRBcGlGb3JIb3N0KHVybCk7XG5cblx0XHRpZiAoYXBpKSB7XG5cdFx0XHRpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuXHRcdFx0XHRvcHRpb25zLmhlYWRlcnMgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuX2FwcENvbnRleHQuY29uZmlncy5nZXQoJ09aX0FQSV9BTExPV19SRUFMX01FVEhPRF9IRUFERVInKSkge1xuXHRcdFx0XHRjb25zdCByZWFsTWV0aG9kID0gKG9wdGlvbnMubWV0aG9kIHx8ICdnZXQnKS50b1VwcGVyQ2FzZSgpLFxuXHRcdFx0XHRcdHJlcGxhY2VNZXRob2RzID0gWydQQVRDSCcsICdQVVQnLCAnREVMRVRFJ10sXG5cdFx0XHRcdFx0cmVhbE1ldGhvZEhlYWRlciA9IHRoaXMuX2FwcENvbnRleHQuY29uZmlncy5nZXQoXG5cdFx0XHRcdFx0XHQnT1pfQVBJX1JFQUxfTUVUSE9EX0hFQURFUl9OQU1FJ1xuXHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0Ly8gd2UgdXBkYXRlIHJlcXVlc3QgbWV0aG9kXG5cdFx0XHRcdGlmICh+cmVwbGFjZU1ldGhvZHMuaW5kZXhPZihyZWFsTWV0aG9kKSkge1xuXHRcdFx0XHRcdG9wdGlvbnMuaGVhZGVyc1tyZWFsTWV0aG9kSGVhZGVyXSA9IHJlYWxNZXRob2Q7XG5cdFx0XHRcdFx0b3B0aW9ucy5tZXRob2QgPSAnUE9TVCc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgaGVhZGVyTmFtZSA9IHRoaXMuX2FwcENvbnRleHQuY29uZmlncy5nZXQoJ09aX0FQSV9LRVlfSEVBREVSX05BTUUnKTtcblxuXHRcdFx0aWYgKCFvcHRpb25zLmhlYWRlcnNbaGVhZGVyTmFtZV0pIHtcblx0XHRcdFx0b3B0aW9ucy5oZWFkZXJzW2hlYWRlck5hbWVdID1cblx0XHRcdFx0XHR0aGlzLl9hcHBDb250ZXh0LmNvbmZpZ3MuZ2V0KCdPWl9BUElfS0VZJyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghb3B0aW9ucy5pc0dvb2ROZXdzKSB7XG5cdFx0XHRcdG9wdGlvbnMuaXNHb29kTmV3cyA9IChqc29uKTogYm9vbGVhbiA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIEJvb2xlYW4oanNvbiAmJiBqc29uLmVycm9yID09PSAwKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmICghb3B0aW9ucy5lcnJvclJlc3BvbnNlVG9EaWFsb2cpIHtcblx0XHRcdFx0b3B0aW9ucy5lcnJvclJlc3BvbnNlVG9EaWFsb2cgPSAocmVzcG9uc2UpID0+IHtcblx0XHRcdFx0XHRjb25zdCBqc29uID0gcmVzcG9uc2UuanNvbjtcblx0XHRcdFx0XHRyZXR1cm4ganNvblxuXHRcdFx0XHRcdFx0PyB7IHRleHQ6IGpzb24ubXNnLCBkYXRhOiBqc29uLmRhdGEgfVxuXHRcdFx0XHRcdFx0OiB7IHRleHQ6ICdPWl9FUlJPUl9ORVRXT1JLJyB9O1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG8gPSB0aGlzLl9hcHBDb250ZXh0LnJlcXVlc3Q8UmVzcG9uc2U+KHVybCwgb3B0aW9ucyk7XG5cblx0XHRvLm9uUmVzcG9uc2UoZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGVyKHJlc3BvbnNlKSB7XG5cdFx0XHRjb25zdCB7IGpzb24gfSA9IHJlc3BvbnNlO1xuXHRcdFx0aWYgKGpzb24gJiYganNvbi5zdGltZSkge1xuXHRcdFx0XHRfdGhpcy5fYXBwQ29udGV4dC51c2VyLnNldFNlc3Npb25FeHBpcmUoanNvbi5zdGltZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoanNvbiAmJiBqc29uLnN0b2tlbikge1xuXHRcdFx0XHRfdGhpcy5fYXBwQ29udGV4dC51c2VyLnNldFNlc3Npb25Ub2tlbihqc29uLnN0b2tlbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIFVSSS5cblx0ICpcblx0ICogQHBhcmFtIHNlcnZpY2VOYW1lIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXRTZXJ2aWNlVVJJKHNlcnZpY2VOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9VUkxfRk9STUFULCB7XG5cdFx0XHRob3N0OiB0aGlzLmFwaUhvc3QsXG5cdFx0XHRzZXJ2aWNlOiBzZXJ2aWNlTmFtZSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFic29sdXRlIHVyaSBzdHJpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZXJ2aWNlTmFtZSBUaGUgc2VydmljZSBuYW1lLlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aC5cblx0ICovXG5cdHRvQWJzb2x1dGVVUkkoc2VydmljZU5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRTZXJ2aWNlVVJJKHNlcnZpY2VOYW1lKSArICcvJyArIHBhdGgucmVwbGFjZSgvXlxcLysvLCAnJyk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gc2VydmljZU5hbWUgVGhlIHNlcnZpY2UgbmFtZS5cblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRnZXRJdGVtVVJJKHNlcnZpY2VOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9FTlRJVFlfRk9STUFULCB7XG5cdFx0XHRob3N0OiB0aGlzLmFwaUhvc3QsXG5cdFx0XHRzZXJ2aWNlOiBzZXJ2aWNlTmFtZSxcblx0XHRcdGlkLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZW50aXR5IHJlbGF0aW9uIFVSSS5cblx0ICpcblx0ICogQHBhcmFtIHNlcnZpY2VOYW1lIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqL1xuXHRnZXRJdGVtUmVsYXRpb25VUkkoXG5cdFx0c2VydmljZU5hbWU6IHN0cmluZyxcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmdcblx0KTogc3RyaW5nIHtcblx0XHRyZXR1cm4gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKFNFUlZJQ0VfRU5USVRZX1JFTEFUSU9OX0ZPUk1BVCwge1xuXHRcdFx0aG9zdDogdGhpcy5hcGlIb3N0LFxuXHRcdFx0c2VydmljZTogc2VydmljZU5hbWUsXG5cdFx0XHRpZCxcblx0XHRcdHJlbGF0aW9uLFxuXHRcdH0pO1xuXHR9XG59XG4iXX0=