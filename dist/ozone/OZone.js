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
    constructor(_appContext) {
        this._appContext = _appContext;
        this.apiHost = _appContext.configs
            .get('OZ_API_BASE_URL')
            .replace(/\/$/g, '');
    }
    static instantiate(_appContext) {
        const apiHost = _appContext.configs.get('OZ_API_BASE_URL');
        if (!(apiHost in apiCache)) {
            apiCache[apiHost] = new OZone(_appContext);
        }
        return apiCache[apiHost];
    }
    request(url, options = {}) {
        const _this = this, api = getApiForHost(url);
        if (api) {
            if (!options.headers) {
                options.headers = {};
            }
            if (this._appContext.configs.get('OZ_API_ALLOW_REAL_METHOD_HEADER')) {
                const realMethod = (options.method || 'get').toUpperCase(), replaceMethods = ['PATCH', 'PUT', 'DELETE'], realMethodHeader = this._appContext.configs.get('OZ_API_REAL_METHOD_HEADER_NAME');
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
    getServiceURI(service) {
        return stringPlaceholderReplace(SERVICE_URL_FORMAT, {
            host: this.apiHost,
            service,
        });
    }
    getItemURI(service, id) {
        return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, {
            host: this.apiHost,
            service,
            id,
        });
    }
    getItemRelationURI(service, id, relation) {
        return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, {
            host: this.apiHost,
            service,
            id,
            relation,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1pvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvb3pvbmUvT1pvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBS3BELE1BQU0sa0JBQWtCLEdBQUcsZ0JBQWdCLEVBQzFDLHFCQUFxQixHQUFHLG9CQUFvQixFQUM1Qyw4QkFBOEIsR0FBRyw4QkFBOEIsQ0FBQztBQUVqRSxNQUFNLFFBQVEsR0FFVixFQUFFLENBQUM7QUFFUCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsU0FBUyxhQUFhLENBQ2xELEdBQVc7SUFFWCxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtRQUMvQixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDekI7S0FDRDtJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sS0FBSztJQVFLO0lBUGIsT0FBTyxDQUFTO0lBT2pDLFlBQThCLFdBQW9CO1FBQXBCLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ2pELElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU87YUFDaEMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQU1ELE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBb0I7UUFDdEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUUzRCxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksUUFBUSxDQUFDLEVBQUU7WUFDM0IsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxD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LENBQUM7UUFFSCxPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFPRCxhQUFhLENBQUMsT0FBZTtRQUM1QixPQUFPLHdCQUF3QixDQUFDLGtCQUFrQixFQUFFO1lBQ25ELElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztZQUNsQixPQUFPO1NBQ1AsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVFELFVBQVUsQ0FBQyxPQUFlLEVBQUUsRUFBbUI7UUFDOUMsT0FBTyx3QkFBd0IsQ0FBQyxxQkFBcUIsRUFBRTtZQUN0RCxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDbEIsT0FBTztZQUNQLEVBQUU7U0FDRixDQUFDLENBQUM7SUFDSixDQUFDO0lBU0Qsa0JBQWtCLENBQUMsT0FBZSxFQUFFLEVBQVUsRUFBRSxRQUFnQjtRQUMvRCxPQUFPLHdCQUF3QixDQUFDLDhCQUE4QixFQUFFO1lBQy9ELElBQUksRUFBRSxJQUFJLENBQUMsT0FBTztZQUNsQixPQUFPO1lBQ1AsRUFBRTtZQUNGLFFBQVE7U0FDUixDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBPTmV0UmVxdWVzdE9wdGlvbnMgfSBmcm9tICcuLi9PV2ViTmV0JztcbmltcG9ydCBPV2ViWEhSIGZyb20gJy4uL09XZWJYSFInO1xuaW1wb3J0IHsgT0FwaVJlc3BvbnNlLCBPV2ViQXBwIH0gZnJvbSAnLi4vb3dlYic7XG5cbmNvbnN0IFNFUlZJQ0VfVVJMX0ZPUk1BVCA9ICc6aG9zdC86c2VydmljZScsXG5cdFNFUlZJQ0VfRU5USVRZX0ZPUk1BVCA9ICc6aG9zdC86c2VydmljZS86aWQnLFxuXHRTRVJWSUNFX0VOVElUWV9SRUxBVElPTl9GT1JNQVQgPSAnOmhvc3QvOnNlcnZpY2UvOmlkLzpyZWxhdGlvbic7XG5cbmNvbnN0IGFwaUNhY2hlOiB7XG5cdFthcGlIb3N0OiBzdHJpbmddOiBPWm9uZTtcbn0gPSB7fTtcblxuZXhwb3J0IGNvbnN0IGdldEFwaUZvckhvc3QgPSBmdW5jdGlvbiBnZXRBcGlGb3JIb3N0KFxuXHR1cmw6IHN0cmluZ1xuKTogT1pvbmUgfCB1bmRlZmluZWQge1xuXHRmb3IgKGNvbnN0IGFwaUhvc3QgaW4gYXBpQ2FjaGUpIHtcblx0XHRpZiAodXJsLnN0YXJ0c1dpdGgoYXBpSG9zdCkpIHtcblx0XHRcdHJldHVybiBhcGlDYWNoZVthcGlIb3N0XTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1pvbmUge1xuXHRwcml2YXRlIHJlYWRvbmx5IGFwaUhvc3Q6IHN0cmluZztcblxuXHQvKipcblx0ICogT1pvbmUgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dFxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKHByaXZhdGUgX2FwcENvbnRleHQ6IE9XZWJBcHApIHtcblx0XHR0aGlzLmFwaUhvc3QgPSBfYXBwQ29udGV4dC5jb25maWdzXG5cdFx0XHQuZ2V0KCdPWl9BUElfQkFTRV9VUkwnKVxuXHRcdFx0LnJlcGxhY2UoL1xcLyQvZywgJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBuZXcgb3pvbmUgYXBpIGluc3RhbmNlIG9yIGdldCBmcm9tIGNhY2hlXG5cdCAqXG5cdCAqL1xuXHRzdGF0aWMgaW5zdGFudGlhdGUoX2FwcENvbnRleHQ6IE9XZWJBcHApOiBPWm9uZSB7XG5cdFx0Y29uc3QgYXBpSG9zdCA9IF9hcHBDb250ZXh0LmNvbmZpZ3MuZ2V0KCdPWl9BUElfQkFTRV9VUkwnKTtcblxuXHRcdGlmICghKGFwaUhvc3QgaW4gYXBpQ2FjaGUpKSB7XG5cdFx0XHRhcGlDYWNoZVthcGlIb3N0XSA9IG5ldyBPWm9uZShfYXBwQ29udGV4dCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFwaUNhY2hlW2FwaUhvc3RdO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2VzIGEgcmVxdWVzdC5cblx0ICpcblx0ICogQHBhcmFtIHVybCBUaGUgcmVxdWVzdCB1cmxcblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHJlcXVlc3Qgb3B0aW9uc1xuXHQgKi9cblx0cmVxdWVzdDxSZXNwb25zZSBleHRlbmRzIE9BcGlSZXNwb25zZTxhbnk+Pihcblx0XHR1cmw6IHN0cmluZyxcblx0XHRvcHRpb25zOiBQYXJ0aWFsPE9OZXRSZXF1ZXN0T3B0aW9uczxSZXNwb25zZT4+ID0ge31cblx0KTogT1dlYlhIUjxSZXNwb25zZT4ge1xuXHRcdGNvbnN0IF90aGlzID0gdGhpcyxcblx0XHRcdGFwaSA9IGdldEFwaUZvckhvc3QodXJsKTtcblxuXHRcdGlmIChhcGkpIHtcblx0XHRcdGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG5cdFx0XHRcdG9wdGlvbnMuaGVhZGVycyA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5fYXBwQ29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0FMTE9XX1JFQUxfTUVUSE9EX0hFQURFUicpKSB7XG5cdFx0XHRcdGNvbnN0IHJlYWxNZXRob2QgPSAob3B0aW9ucy5tZXRob2QgfHwgJ2dldCcpLnRvVXBwZXJDYXNlKCksXG5cdFx0XHRcdFx0cmVwbGFjZU1ldGhvZHMgPSBbJ1BBVENIJywgJ1BVVCcsICdERUxFVEUnXSxcblx0XHRcdFx0XHRyZWFsTWV0aG9kSGVhZGVyID0gdGhpcy5fYXBwQ29udGV4dC5jb25maWdzLmdldChcblx0XHRcdFx0XHRcdCdPWl9BUElfUkVBTF9NRVRIT0RfSEVBREVSX05BTUUnXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHQvLyB3ZSB1cGRhdGUgcmVxdWVzdCBtZXRob2Rcblx0XHRcdFx0aWYgKH5yZXBsYWNlTWV0aG9kcy5pbmRleE9mKHJlYWxNZXRob2QpKSB7XG5cdFx0XHRcdFx0b3B0aW9ucy5oZWFkZXJzW3JlYWxNZXRob2RIZWFkZXJdID0gcmVhbE1ldGhvZDtcblx0XHRcdFx0XHRvcHRpb25zLm1ldGhvZCA9ICdQT1NUJztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBoZWFkZXJOYW1lID0gdGhpcy5fYXBwQ29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0tFWV9IRUFERVJfTkFNRScpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMuaGVhZGVyc1toZWFkZXJOYW1lXSkge1xuXHRcdFx0XHRvcHRpb25zLmhlYWRlcnNbaGVhZGVyTmFtZV0gPVxuXHRcdFx0XHRcdHRoaXMuX2FwcENvbnRleHQuY29uZmlncy5nZXQoJ09aX0FQSV9LRVknKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFvcHRpb25zLmlzR29vZE5ld3MpIHtcblx0XHRcdFx0b3B0aW9ucy5pc0dvb2ROZXdzID0gKGpzb24pOiBib29sZWFuID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gQm9vbGVhbihqc29uICYmIGpzb24uZXJyb3IgPT09IDApO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFvcHRpb25zLmVycm9yUmVzcG9uc2VUb0RpYWxvZykge1xuXHRcdFx0XHRvcHRpb25zLmVycm9yUmVzcG9uc2VUb0RpYWxvZyA9IChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IGpzb24gPSByZXNwb25zZS5qc29uO1xuXHRcdFx0XHRcdHJldHVybiBqc29uXG5cdFx0XHRcdFx0XHQ/IHsgdGV4dDoganNvbi5tc2csIGRhdGE6IGpzb24uZGF0YSB9XG5cdFx0XHRcdFx0XHQ6IHsgdGV4dDogJ09aX0VSUk9SX05FVFdPUksnIH07XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbyA9IHRoaXMuX2FwcENvbnRleHQucmVxdWVzdDxSZXNwb25zZT4odXJsLCBvcHRpb25zKTtcblxuXHRcdG8ub25SZXNwb25zZShmdW5jdGlvbiByZXNwb25zZUhhbmRsZXIocmVzcG9uc2UpIHtcblx0XHRcdGNvbnN0IHsganNvbiB9ID0gcmVzcG9uc2U7XG5cdFx0XHRpZiAoanNvbiAmJiBqc29uLnN0aW1lKSB7XG5cdFx0XHRcdF90aGlzLl9hcHBDb250ZXh0LnVzZXIuc2V0U2Vzc2lvbkV4cGlyZShqc29uLnN0aW1lKTtcblx0XHRcdH1cblx0XHRcdGlmIChqc29uICYmIGpzb24uc3Rva2VuKSB7XG5cdFx0XHRcdF90aGlzLl9hcHBDb250ZXh0LnVzZXIuc2V0U2Vzc2lvblRva2VuKGpzb24uc3Rva2VuKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlcnZpY2UgVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gc2VydmljZSBUaGUgc2VydmljZSBuYW1lLlxuXHQgKi9cblx0Z2V0U2VydmljZVVSSShzZXJ2aWNlOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9VUkxfRk9STUFULCB7XG5cdFx0XHRob3N0OiB0aGlzLmFwaUhvc3QsXG5cdFx0XHRzZXJ2aWNlLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZW50aXR5IFVSSS5cblx0ICpcblx0ICogQHBhcmFtIHNlcnZpY2UgVGhlIHNlcnZpY2UgbmFtZS5cblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRnZXRJdGVtVVJJKHNlcnZpY2U6IHN0cmluZywgaWQ6IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZShTRVJWSUNFX0VOVElUWV9GT1JNQVQsIHtcblx0XHRcdGhvc3Q6IHRoaXMuYXBpSG9zdCxcblx0XHRcdHNlcnZpY2UsXG5cdFx0XHRpZCxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSByZWxhdGlvbiBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZXJ2aWNlIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqL1xuXHRnZXRJdGVtUmVsYXRpb25VUkkoc2VydmljZTogc3RyaW5nLCBpZDogc3RyaW5nLCByZWxhdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKFNFUlZJQ0VfRU5USVRZX1JFTEFUSU9OX0ZPUk1BVCwge1xuXHRcdFx0aG9zdDogdGhpcy5hcGlIb3N0LFxuXHRcdFx0c2VydmljZSxcblx0XHRcdGlkLFxuXHRcdFx0cmVsYXRpb24sXG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==