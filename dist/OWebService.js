import OWebKeyStorage from './OWebKeyStorage';
import { assign, isPlainObject, stringPlaceholderReplace } from './utils/Utils';
const urIService = ':apiUrl/:serviceName', uriEntity = ':apiUrl/:serviceName/:id', uriEntityRelation = ':apiUrl/:serviceName/:id/:relation', toKey = function (query) {
    const key = JSON.stringify(query).replace(/[^a-z0-9]/gi, '');
    return key.length ? key : 'no-params';
};
export default class OWebService {
    /**
     * @param appContext The app context.
     * @param serviceName The service name.
     * @param persistentCache To enable persistence data caching.
     */
    constructor(appContext, serviceName, persistentCache = false) {
        this.appContext = appContext;
        const apiUrl = appContext.configs
            .get('OZ_API_BASE_URL')
            .replace(/\/$/g, '');
        this._baseData = { apiUrl, serviceName };
        this._keyStore = new OWebKeyStorage(appContext, 'services:' + serviceName, persistentCache);
    }
    /**
     * Returns the service name.
     */
    getName() {
        return this._baseData.serviceName;
    }
    /**
     * Returns the service URI.
     */
    getServiceURI() {
        return stringPlaceholderReplace(urIService, this._baseData);
    }
    /**
     * Returns entity URI.
     *
     * @param id The entity id.
     */
    getItemURI(id) {
        const data = assign({ id }, this._baseData);
        return stringPlaceholderReplace(uriEntity, data);
    }
    /**
     * Returns entity relation URI.
     *
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(id, relation) {
        const data = assign({ id, relation }, this._baseData);
        return stringPlaceholderReplace(uriEntityRelation, data);
    }
    /**
     * Cache manager getter.
     */
    getCacheManager() {
        return this._keyStore;
    }
    /**
     * Adds an entity.
     *
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    addRequest(formData, success, fail, freeze = false) {
        const url = this.getServiceURI(), newOptions = formData;
        return this.appContext.request('POST', url, newOptions, (response) => {
            success(response);
        }, fail, freeze);
    }
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     * @param success
     * @param fail
     * @param freeze
     */
    deleteRequest(id, success, fail, freeze = false) {
        const m = this, url = this.getItemURI(id);
        return this.appContext.request('DELETE', url, null, (response) => {
            m.getCacheManager().removeItem(id);
            success(response);
        }, fail, freeze);
    }
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    updateRequest(id, formData, success, fail, freeze = false) {
        const url = this.getItemURI(id), newOptions = formData;
        return this.appContext.request('PATCH', url, newOptions, (response) => {
            success(response);
        }, fail, freeze);
    }
    /**
     * Deletes all entities.
     *
     * @param options
     * @param success
     * @param fail
     * @param freeze
     */
    deleteAllRequest(options, success, fail, freeze = false) {
        const url = this.getServiceURI(), filters = options.filters, newOptions = {};
        if (typeof options.max === 'number') {
            // will be ignored by O'Zone
            newOptions.max = options.max;
        }
        if (typeof options.page === 'number') {
            // will be ignored by O'Zone
            newOptions.page = options.page;
        }
        if (isPlainObject(filters)) {
            newOptions.filters = filters;
        }
        return this.appContext.request('DELETE', url, newOptions, (response) => {
            success(response);
        }, fail, freeze);
    }
    /**
     * Updates all entities.
     *
     * @param options
     * @param formData
     * @param success
     * @param fail
     * @param freeze
     */
    updateAllRequest(options, formData, success, fail, freeze = false) {
        const url = this.getServiceURI(), filters = options.filters, newOptions = formData;
        if (typeof options.max === 'number') {
            // will be ignored by O'Zone
            newOptions.max = options.max;
        }
        if (typeof options.page === 'number') {
            // will be ignored by O'Zone
            newOptions.page = options.page;
        }
        if (isPlainObject(filters)) {
            newOptions.filters = filters;
        }
        return this.appContext.request('PATCH', url, newOptions, (response) => {
            success(response);
        }, fail, freeze);
    }
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     * @param success
     * @param fail
     * @param freeze
     * @param loadCacheFirst
     */
    getRequest(id, relations = '', success, fail, freeze = false, loadCacheFirst = false) {
        const m = this, url = this.getItemURI(id), cacheId = id, data = {};
        let _cached;
        if (relations.length) {
            data.relations = relations;
        }
        if (loadCacheFirst) {
            _cached = m.getCacheManager().getItem(cacheId);
            if (_cached) {
                success(_cached, true);
                freeze = false;
            }
        }
        return this.appContext.request('GET', url, data, (response) => {
            m.getCacheManager().setItem(id, response);
            success(response, false);
        }, (response, com) => {
            // tslint:disable-next-line: no-conditional-assignment
            if ((_cached = m.getCacheManager().getItem(cacheId))) {
                success(_cached, true);
            }
            else {
                fail(response, com);
            }
        }, freeze);
    }
    /**
     * Gets all entities.
     *
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getAllRequest(options, success, fail, freeze = false, forceCache = false, loadCacheFirst = false) {
        const m = this, url = this.getServiceURI(), filters = options.filters, newOptions = {};
        let _cached;
        if (typeof options.max === 'number') {
            newOptions.max = options.max;
        }
        if (typeof options.page === 'number') {
            newOptions.page = options.page;
        }
        if (typeof options.relations === 'string') {
            newOptions.relations = options.relations;
        }
        if (typeof options.collection === 'string') {
            newOptions.collection = options.collection;
        }
        if (typeof options.order_by === 'string') {
            newOptions.order_by = options.order_by;
        }
        if (isPlainObject(filters)) {
            newOptions.filters = filters;
        }
        const cacheId = toKey(newOptions);
        if (forceCache && loadCacheFirst) {
            _cached = m.getCacheManager().getItem(cacheId);
            if (_cached) {
                success(_cached, true);
                freeze = false;
            }
        }
        return this.appContext.request('GET', url, newOptions, (response) => {
            forceCache && m.getCacheManager().setItem(cacheId, response);
            success(response, false);
        }, (response, com) => {
            if (forceCache &&
                // tslint:disable-next-line: no-conditional-assignment
                (_cached = m.getCacheManager().getItem(cacheId))) {
                success(_cached, true);
            }
            else {
                fail(response, com);
            }
        }, freeze);
    }
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getRelationRequest(id, relation, success, fail, freeze = false, forceCache = false, loadCacheFirst = false) {
        const m = this, url = this.getItemRelationURI(id, relation), cacheId = toKey({ id, relation });
        let _cached;
        if (forceCache && loadCacheFirst) {
            _cached = this.getCacheManager().getItem(cacheId);
            if (_cached) {
                success(_cached, true);
                freeze = false;
            }
        }
        return this.appContext.request('GET', url, {}, function (response) {
            forceCache && m.getCacheManager().setItem(cacheId, response);
            success(response, false);
        }, function (response, com) {
            if (forceCache &&
                // tslint:disable-next-line: no-conditional-assignment
                (_cached = m.getCacheManager().getItem(cacheId))) {
                success(_cached, true);
            }
            else {
                fail(response, com);
            }
        }, freeze);
    }
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     * @param success
     * @param fail
     * @param freeze
     * @param forceCache
     * @param loadCacheFirst
     */
    getRelationItemsRequest(id, relation, options, success, fail, freeze = false, forceCache = false, loadCacheFirst = false) {
        const m = this, url = this.getItemRelationURI(id, relation), filters = options.filters, newOptions = {};
        if (typeof options.max === 'number') {
            newOptions.max = options.max;
        }
        if (typeof options.page === 'number') {
            newOptions.page = options.page;
        }
        if (isPlainObject(filters)) {
            newOptions.filters = filters;
        }
        const cacheId = toKey(assign({ relation }, newOptions));
        let _cached;
        if (forceCache && loadCacheFirst) {
            _cached = this.getCacheManager().getItem(cacheId);
            if (_cached) {
                success(_cached, true);
                freeze = false;
            }
        }
        return this.appContext.request('GET', url, newOptions, function (response) {
            forceCache && m.getCacheManager().setItem(cacheId, response);
            success(response, false);
        }, function (response, com) {
            if (forceCache &&
                // tslint:disable-next-line: no-conditional-assignment
                (_cached = m.getCacheManager().getItem(cacheId))) {
                success(_cached, true);
            }
            else {
                fail(response, com);
            }
        }, freeze);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFvSmhGLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixFQUN4QyxTQUFTLEdBQUcsMEJBQTBCLEVBQ3RDLGlCQUFpQixHQUFHLG9DQUFvQyxFQUN4RCxLQUFLLEdBQUcsVUFBVSxLQUFVO0lBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVILE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBVztJQUkvQjs7OztPQUlHO0lBQ0gsWUFDb0IsVUFBbUIsRUFDdEMsV0FBbUIsRUFDbkIsa0JBQTJCLEtBQUs7UUFGYixlQUFVLEdBQVYsVUFBVSxDQUFTO1FBSXRDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPO2FBQy9CLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FDbEMsVUFBVSxFQUNWLFdBQVcsR0FBRyxXQUFXLEVBQ3pCLGVBQWUsQ0FDZixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxD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QUU7Z0JBQ1osT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdkIsTUFBTSxHQUFHLEtBQUssQ0FBQzthQUNmO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUM3QixLQUFLLEVBQ0wsR0FBRyxFQUNILFVBQVUsRUFDVixVQUFVLFFBQXNCO1lBQy9CLFVBQVUsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUU3RCxPQUFPLENBQUMsUUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFDRCxVQUFVLFFBQXNCLEVBQUUsR0FBWTtZQUM3QyxJQUNDLFVBQVU7Z0JBQ1Ysc0RBQXNEO2dCQUN0RCxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQy9DO2dCQUNELE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNwQjtRQUNGLENBQUMsRUFDRCxNQUFNLENBQ04sQ0FBQztJQUNILENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkNvbSwgeyBJQ29tUmVzcG9uc2UgfSBmcm9tICcuL09XZWJDb20nO1xuaW1wb3J0IE9XZWJLZXlTdG9yYWdlIGZyb20gJy4vT1dlYktleVN0b3JhZ2UnO1xuaW1wb3J0IHsgYXNzaWduLCBpc1BsYWluT2JqZWN0LCBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZUFkZFJlc3BvbnNlPFQ+IGV4dGVuZHMgSUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VHZXRSZXNwb25zZTxUPiBleHRlbmRzIElDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlR2V0QWxsUmVzcG9uc2U8VD4gZXh0ZW5kcyBJQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbXM6IFRbXTtcblx0XHRtYXg/OiBudW1iZXI7XG5cdFx0cGFnZT86IG51bWJlcjtcblx0XHR0b3RhbD86IG51bWJlcjtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZVVwZGF0ZVJlc3BvbnNlPFQ+IGV4dGVuZHMgSUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VVcGRhdGVBbGxEYXRhIGV4dGVuZHMgSUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGFmZmVjdGVkOiBudW1iZXI7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VEZWxldGVSZXNwb25zZTxUPiBleHRlbmRzIElDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlRGVsZXRlQWxsUmVzcG9uc2U8VD4gZXh0ZW5kcyBJQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0YWZmZWN0ZWQ6IG51bWJlcjtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxUPiBleHRlbmRzIElDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtczogVFtdO1xuXHRcdG1heD86IG51bWJlcjtcblx0XHRwYWdlPzogbnVtYmVyO1xuXHRcdHRvdGFsPzogbnVtYmVyO1xuXHRcdHJlbGF0aW9uczoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1SZXNwb25zZTxUPiBleHRlbmRzIElDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgdHlwZSB0U2VydmljZUFkZFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IElTZXJ2aWNlQWRkUmVzcG9uc2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZVVwZGF0ZVN1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBJU2VydmljZVVwZGF0ZVJlc3BvbnNlPFQ+LFxuKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VVcGRhdGVBbGxTdWNjZXNzPFQ+ID0gKFxuXHRyZXNwb25zZTogSVNlcnZpY2VVcGRhdGVBbGxEYXRhLFxuKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VEZWxldGVTdWNjZXNzPFQ+ID0gKFxuXHRyZXNwb25zZTogSVNlcnZpY2VEZWxldGVSZXNwb25zZTxUPixcbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlRGVsZXRlQWxsU3VjY2VzczxUPiA9IChcblx0cmVzcG9uc2U6IElTZXJ2aWNlRGVsZXRlQWxsUmVzcG9uc2U8VD4sXG4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldFN1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBJU2VydmljZUdldFJlc3BvbnNlPFQ+LFxuXHRmcm9tQ2FjaGU6IGJvb2xlYW4sXG4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldEFsbFN1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBJU2VydmljZUdldEFsbFJlc3BvbnNlPFQ+LFxuXHRmcm9tQ2FjaGU6IGJvb2xlYW4sXG4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldFJlbGF0aW9uU3VjY2VzczxUPiA9IChcblx0cmVzcG9uc2U6IElTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8VD4sXG5cdGZyb21DYWNoZTogYm9vbGVhbixcbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1N1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBJU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxUPixcblx0ZnJvbUNhY2hlOiBib29sZWFuLFxuKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSB0U2VydmljZUZhaWwgPSAocmVzcG9uc2U6IElDb21SZXNwb25zZSwgY29tOiBPV2ViQ29tKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdEZpbHRlckNvbmRpdGlvbiA9XG5cdHwgJ2VxJ1xuXHR8ICduZXEnXG5cdHwgJ2x0J1xuXHR8ICdsdGUnXG5cdHwgJ2d0J1xuXHR8ICdndGUnXG5cdHwgJ2luJ1xuXHR8ICdub3RfaW4nXG5cdHwgJ2lzX251bGwnXG5cdHwgJ2lzX25vdF9udWxsJ1xuXHR8ICdsaWtlJ1xuXHR8ICdub3RfbGlrZSc7XG5cbmV4cG9ydCB0eXBlIHRGaWx0ZXIgPVxuXHR8IHtcblx0XHRcdDA6IHRGaWx0ZXJDb25kaXRpb247XG5cdFx0XHQxOiBzdHJpbmcgfCBzdHJpbmdbXSB8IG51bWJlcjtcblx0XHRcdDI/OiAnb3InIHwgJ2FuZCc7XG5cdCAgfVxuXHR8IHtcblx0XHRcdDA6ICdpc19udWxsJyB8ICdpc19ub3RfbnVsbCc7XG5cdFx0XHQxPzogJ29yJyB8ICdhbmQnO1xuXHQgIH07XG5cbmV4cG9ydCB0eXBlIHRGaWx0ZXJzTWFwID0geyBba2V5OiBzdHJpbmddOiB0RmlsdGVyW10gfTtcblxuZXhwb3J0IHR5cGUgdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHtcblx0ZGF0YT86IGFueTtcblx0ZmlsdGVycz86IHRGaWx0ZXJzTWFwO1xuXHRyZWxhdGlvbnM/OiBzdHJpbmc7XG5cdGNvbGxlY3Rpb24/OiBzdHJpbmc7XG5cdG9yZGVyX2J5Pzogc3RyaW5nO1xuXHRtYXg/OiBudW1iZXI7XG5cdHBhZ2U/OiBudW1iZXI7XG59O1xuXG5jb25zdCB1cklTZXJ2aWNlID0gJzphcGlVcmwvOnNlcnZpY2VOYW1lJyxcblx0dXJpRW50aXR5ID0gJzphcGlVcmwvOnNlcnZpY2VOYW1lLzppZCcsXG5cdHVyaUVudGl0eVJlbGF0aW9uID0gJzphcGlVcmwvOnNlcnZpY2VOYW1lLzppZC86cmVsYXRpb24nLFxuXHR0b0tleSA9IGZ1bmN0aW9uIChxdWVyeTogYW55KSB7XG5cdFx0Y29uc3Qga2V5ID0gSlNPTi5zdHJpbmdpZnkocXVlcnkpLnJlcGxhY2UoL1teYS16MC05XS9naSwgJycpO1xuXHRcdHJldHVybiBrZXkubGVuZ3RoID8ga2V5IDogJ25vLXBhcmFtcyc7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJTZXJ2aWNlPFQ+IHtcblx0cHJpdmF0ZSByZWFkb25seSBfa2V5U3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlRGF0YTogeyBhcGlVcmw6IGFueTsgc2VydmljZU5hbWU6IHN0cmluZyB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBzZXJ2aWNlTmFtZSBUaGUgc2VydmljZSBuYW1lLlxuXHQgKiBAcGFyYW0gcGVyc2lzdGVudENhY2hlIFRvIGVuYWJsZSBwZXJzaXN0ZW5jZSBkYXRhIGNhY2hpbmcuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcm90ZWN0ZWQgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCxcblx0XHRzZXJ2aWNlTmFtZTogc3RyaW5nLFxuXHRcdHBlcnNpc3RlbnRDYWNoZTogYm9vbGVhbiA9IGZhbHNlLFxuXHQpIHtcblx0XHRjb25zdCBhcGlVcmwgPSBhcHBDb250ZXh0LmNvbmZpZ3Ncblx0XHRcdC5nZXQoJ09aX0FQSV9CQVNFX1VSTCcpXG5cdFx0XHQucmVwbGFjZSgvXFwvJC9nLCAnJyk7XG5cdFx0dGhpcy5fYmFzZURhdGEgPSB7IGFwaVVybCwgc2VydmljZU5hbWUgfTtcblx0XHR0aGlzLl9rZXlTdG9yZSA9IG5ldyBPV2ViS2V5U3RvcmFnZShcblx0XHRcdGFwcENvbnRleHQsXG5cdFx0XHQnc2VydmljZXM6JyArIHNlcnZpY2VOYW1lLFxuXHRcdFx0cGVyc2lzdGVudENhY2hlLFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBuYW1lLlxuXHQgKi9cblx0Z2V0TmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9iYXNlRGF0YS5zZXJ2aWNlTmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIFVSSS5cblx0ICovXG5cdGdldFNlcnZpY2VVUkkoKSB7XG5cdFx0cmV0dXJuIHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZSh1cklTZXJ2aWNlLCB0aGlzLl9iYXNlRGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICovXG5cdGdldEl0ZW1VUkkoaWQ6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGF0YSA9IGFzc2lnbih7IGlkIH0sIHRoaXMuX2Jhc2VEYXRhKTtcblx0XHRyZXR1cm4gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKHVyaUVudGl0eSwgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgcmVsYXRpb24gVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbVJlbGF0aW9uVVJJKGlkOiBzdHJpbmcsIHJlbGF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRhdGEgPSBhc3NpZ24oeyBpZCwgcmVsYXRpb24gfSwgdGhpcy5fYmFzZURhdGEpO1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UodXJpRW50aXR5UmVsYXRpb24sIGRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhY2hlIG1hbmFnZXIgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0Q2FjaGVNYW5hZ2VyKCk6IE9XZWJLZXlTdG9yYWdlIHtcblx0XHRyZXR1cm4gdGhpcy5fa2V5U3RvcmU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhbiBlbnRpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtRGF0YVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqL1xuXHRhZGRSZXF1ZXN0KFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VBZGRTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogT1dlYkNvbSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRuZXdPcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnUE9TVCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRuZXdPcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemUsXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqL1xuXHRkZWxldGVSZXF1ZXN0KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VEZWxldGVTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogT1dlYkNvbSB7XG5cdFx0Y29uc3QgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J0RFTEVURScsXG5cdFx0XHR1cmwsXG5cdFx0XHRudWxsLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0bS5nZXRDYWNoZU1hbmFnZXIoKS5yZW1vdmVJdGVtKGlkKTtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemUsXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlUmVxdWVzdChcblx0XHRpZDogc3RyaW5nLFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VVcGRhdGVTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogT1dlYkNvbSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKSxcblx0XHRcdG5ld09wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQucmVxdWVzdChcblx0XHRcdCdQQVRDSCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRuZXdPcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemUsXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0ZGVsZXRlQWxsUmVxdWVzdChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlRGVsZXRlQWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdCk6IE9XZWJDb20ge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdG5ld09wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRuZXdPcHRpb25zLm1heCA9IG9wdGlvbnMubWF4O1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucGFnZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdG5ld09wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0bmV3T3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnREVMRVRFJyxcblx0XHRcdHVybCxcblx0XHRcdG5ld09wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IElDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSk7XG5cdFx0XHR9LFxuXHRcdFx0ZmFpbCxcblx0XHRcdGZyZWV6ZSxcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlQWxsUmVxdWVzdChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VVcGRhdGVBbGxTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogT1dlYkNvbSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0bmV3T3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IGZvcm1EYXRhO1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdG5ld09wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0bmV3T3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlO1xuXHRcdH1cblxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRuZXdPcHRpb25zLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQucmVxdWVzdChcblx0XHRcdCdQQVRDSCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRuZXdPcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemUsXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQWxsIHJlcXVlc3RlZCByZWxhdGlvbnMgbmFtZXMgYXJlIGpvaW5lZCB3aXRoIGB8YC5cblx0ICogZXhhbXBsZTogYHJlbGF0aW9uMXxyZWxhdGlvbjJ8cmVsYXRpb25YYC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbnMgVGhlIHJlbGF0aW9ucyBzdHJpbmcuXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICogQHBhcmFtIGxvYWRDYWNoZUZpcnN0XG5cdCAqL1xuXHRnZXRSZXF1ZXN0KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb25zOiBzdHJpbmcgPSAnJyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFN1Y2Nlc3M8VD4sXG5cdFx0ZmFpbDogdFNlcnZpY2VGYWlsLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdGxvYWRDYWNoZUZpcnN0OiBib29sZWFuID0gZmFsc2UsXG5cdCk6IE9XZWJDb20ge1xuXHRcdGNvbnN0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKSxcblx0XHRcdGNhY2hlSWQgPSBpZCxcblx0XHRcdGRhdGE6IGFueSA9IHt9O1xuXHRcdGxldCBfY2FjaGVkO1xuXG5cdFx0aWYgKHJlbGF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGRhdGEucmVsYXRpb25zID0gcmVsYXRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChsb2FkQ2FjaGVGaXJzdCkge1xuXHRcdFx0X2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZUlkKTtcblxuXHRcdFx0aWYgKF9jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J0dFVCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRkYXRhLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0bS5nZXRDYWNoZU1hbmFnZXIoKS5zZXRJdGVtKGlkLCByZXNwb25zZSk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55LCBmYWxzZSk7XG5cdFx0XHR9LFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UsIGNvbTogT1dlYkNvbSkgPT4ge1xuXHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0aWYgKChfY2FjaGVkID0gbS5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlSWQpKSkge1xuXHRcdFx0XHRcdHN1Y2Nlc3MoX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSwgY29tKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZSxcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZUNhY2hlXG5cdCAqIEBwYXJhbSBsb2FkQ2FjaGVGaXJzdFxuXHQgKi9cblx0Z2V0QWxsUmVxdWVzdChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlR2V0QWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VDYWNoZTogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdGxvYWRDYWNoZUZpcnN0OiBib29sZWFuID0gZmFsc2UsXG5cdCk6IE9XZWJDb20ge1xuXHRcdGNvbnN0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0bmV3T3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXHRcdGxldCBfY2FjaGVkO1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicpIHtcblx0XHRcdG5ld09wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0bmV3T3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5yZWxhdGlvbnMgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRuZXdPcHRpb25zLnJlbGF0aW9ucyA9IG9wdGlvbnMucmVsYXRpb25zO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ3N0cmluZycpIHtcblx0XHRcdG5ld09wdGlvbnMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMub3JkZXJfYnkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRuZXdPcHRpb25zLm9yZGVyX2J5ID0gb3B0aW9ucy5vcmRlcl9ieTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0bmV3T3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRjb25zdCBjYWNoZUlkID0gdG9LZXkobmV3T3B0aW9ucyk7XG5cblx0XHRpZiAoZm9yY2VDYWNoZSAmJiBsb2FkQ2FjaGVGaXJzdCkge1xuXHRcdFx0X2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZUlkKTtcblxuXHRcdFx0aWYgKF9jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J0dFVCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRuZXdPcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0Zm9yY2VDYWNoZSAmJiBtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oY2FjaGVJZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdChyZXNwb25zZTogSUNvbVJlc3BvbnNlLCBjb206IE9XZWJDb20pID0+IHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGZvcmNlQ2FjaGUgJiZcblx0XHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0XHQoX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZUlkKSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlLCBjb20pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZnJlZXplLFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHNpbmdsZSBpdGVtIHJlbGF0aW9uIGZvciBhIGdpdmVuIGVudGl0eSBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZUNhY2hlXG5cdCAqIEBwYXJhbSBsb2FkQ2FjaGVGaXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25SZXF1ZXN0PFI+KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb246IHN0cmluZyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VDYWNoZTogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdGxvYWRDYWNoZUZpcnN0OiBib29sZWFuID0gZmFsc2UsXG5cdCk6IE9XZWJDb20ge1xuXHRcdGNvbnN0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGNhY2hlSWQgPSB0b0tleSh7IGlkLCByZWxhdGlvbiB9KTtcblx0XHRsZXQgX2NhY2hlZDtcblxuXHRcdGlmIChmb3JjZUNhY2hlICYmIGxvYWRDYWNoZUZpcnN0KSB7XG5cdFx0XHRfY2FjaGVkID0gdGhpcy5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlSWQpO1xuXG5cdFx0XHRpZiAoX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHRmcmVlemUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdHt9LFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBJQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0Zm9yY2VDYWNoZSAmJiBtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oY2FjaGVJZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uIChyZXNwb25zZTogSUNvbVJlc3BvbnNlLCBjb206IE9XZWJDb20pIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGZvcmNlQ2FjaGUgJiZcblx0XHRcdFx0XHQvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG5vLWNvbmRpdGlvbmFsLWFzc2lnbm1lbnRcblx0XHRcdFx0XHQoX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZUlkKSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlLCBjb20pO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZnJlZXplLFxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBtdWx0aXBsZSBpdGVtcyByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICogQHBhcmFtIGZvcmNlQ2FjaGVcblx0ICogQHBhcmFtIGxvYWRDYWNoZUZpcnN0XG5cdCAqL1xuXHRnZXRSZWxhdGlvbkl0ZW1zUmVxdWVzdDxSPihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uSXRlbXNTdWNjZXNzPFI+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRmb3JjZUNhY2hlOiBib29sZWFuID0gZmFsc2UsXG5cdFx0bG9hZENhY2hlRmlyc3Q6IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogT1dlYkNvbSB7XG5cdFx0Y29uc3QgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1SZWxhdGlvblVSSShpZCwgcmVsYXRpb24pLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdG5ld09wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0XHRuZXdPcHRpb25zLm1heCA9IG9wdGlvbnMubWF4O1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucGFnZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdG5ld09wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0bmV3T3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRjb25zdCBjYWNoZUlkID0gdG9LZXkoYXNzaWduKHsgcmVsYXRpb24gfSwgbmV3T3B0aW9ucykpO1xuXHRcdGxldCBfY2FjaGVkO1xuXG5cdFx0aWYgKGZvcmNlQ2FjaGUgJiYgbG9hZENhY2hlRmlyc3QpIHtcblx0XHRcdF9jYWNoZWQgPSB0aGlzLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oXG5cdFx0XHRcdGNhY2hlSWQsXG5cdFx0XHQpIGFzIElTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1Jlc3BvbnNlPFI+O1xuXG5cdFx0XHRpZiAoX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHRmcmVlemUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdG5ld09wdGlvbnMsXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2U6IElDb21SZXNwb25zZSkge1xuXHRcdFx0XHRmb3JjZUNhY2hlICYmIG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuc2V0SXRlbShjYWNoZUlkLCByZXNwb25zZSk7XG5cblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2U6IElDb21SZXNwb25zZSwgY29tOiBPV2ViQ29tKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRmb3JjZUNhY2hlICYmXG5cdFx0XHRcdFx0Ly8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25kaXRpb25hbC1hc3NpZ25tZW50XG5cdFx0XHRcdFx0KF9jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVJZCkpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHN1Y2Nlc3MoX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSwgY29tKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZSxcblx0XHQpO1xuXHR9XG59XG4iXX0=