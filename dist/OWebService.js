import OWebKeyStorage from './OWebKeyStorage';
import Utils from './utils/Utils';
const uri_service = ':api_url/:service_name', uri_entity = ':api_url/:service_name/:id', uri_entity_relation = ':api_url/:service_name/:id/:relation';
let toKey = function (query_params) {
    let key = JSON.stringify(query_params).replace(/[^a-z0-9]/gi, '');
    return key.length ? key : 'no-params';
};
export default class OWebService {
    /**
     * @param app_context The app context.
     * @param service_name The service name.
     * @param persistent_cache To enable persistence data caching.
     */
    constructor(app_context, service_name, persistent_cache = false) {
        this.app_context = app_context;
        let s_url = app_context.configs.get('OZ_API_BASE_URL').replace(/\/$/g, '');
        this._base_data = { api_url: s_url, service_name: service_name };
        this._key_store = new OWebKeyStorage(app_context, 'services:' + service_name, persistent_cache);
    }
    /**
     * Returns the service name.
     */
    getName() {
        return this._base_data.service_name;
    }
    /**
     * Returns the service URI.
     */
    getServiceURI() {
        return Utils.stringKeyReplace(uri_service, this._base_data);
    }
    /**
     * Returns entity URI.
     *
     * @param id The entity id.
     */
    getItemURI(id) {
        let data = Utils.assign({ id: id }, this._base_data);
        return Utils.stringKeyReplace(uri_entity, data);
    }
    /**
     * Returns entity relation URI.
     *
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(id, relation) {
        let data = Utils.assign({ id: id, relation: relation }, this._base_data);
        return Utils.stringKeyReplace(uri_entity_relation, data);
    }
    /**
     * Cache manager getter.
     */
    getCacheManager() {
        return this._key_store;
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
        let url = this.getServiceURI(), req_options = formData;
        return this.app_context.request('POST', url, req_options, (response) => {
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
        let m = this, url = this.getItemURI(id);
        return this.app_context.request('DELETE', url, null, (response) => {
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
        let url = this.getItemURI(id), req_options = formData;
        return this.app_context.request('PATCH', url, req_options, (response) => {
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
        let url = this.getServiceURI(), filters = options.filters, req_options = {};
        if (typeof options['max'] === 'number') {
            // will be ignored by O'Zone
            req_options['max'] = options['max'];
        }
        if (typeof options['page'] === 'number') {
            // will be ignored by O'Zone
            req_options['page'] = options['page'];
        }
        if (Utils.isPlainObject(filters)) {
            req_options['filters'] = filters;
        }
        return this.app_context.request('DELETE', url, req_options, (response) => {
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
        let url = this.getServiceURI(), filters = options.filters, req_options = formData;
        if (typeof options['max'] === 'number') {
            // will be ignored by O'Zone
            req_options['max'] = options['max'];
        }
        if (typeof options['page'] === 'number') {
            // will be ignored by O'Zone
            req_options['page'] = options['page'];
        }
        if (Utils.isPlainObject(filters)) {
            req_options['filters'] = filters;
        }
        return this.app_context.request('PATCH', url, req_options, (response) => {
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
     * @param load_cache_first
     */
    getRequest(id, relations = '', success, fail, freeze = false, load_cache_first = false) {
        let m = this, url = this.getItemURI(id), cache_id = id, data = {}, __cached;
        if (relations.length) {
            data.relations = relations;
        }
        if (load_cache_first) {
            __cached = m.getCacheManager().getItem(cache_id);
            if (__cached) {
                success(__cached, true);
                freeze = false;
            }
        }
        return this.app_context.request('GET', url, data, (response) => {
            m.getCacheManager().setItem(id, response);
            success(response, false);
        }, (response) => {
            if ((__cached = m.getCacheManager().getItem(cache_id))) {
                success(__cached, true);
            }
            else {
                fail(response);
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
     * @param force_cache
     * @param load_cache_first
     */
    getAllRequest(options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getServiceURI(), filters = options['filters'], req_options = {}, __cached;
        if (typeof options['max'] === 'number') {
            req_options['max'] = options['max'];
        }
        if (typeof options['page'] === 'number') {
            req_options['page'] = options['page'];
        }
        if (typeof options.relations === 'string') {
            req_options['relations'] = options.relations;
        }
        if (typeof options.collection === 'string') {
            req_options['collection'] = options.collection;
        }
        if (typeof options.order_by === 'string') {
            req_options['order_by'] = options.order_by;
        }
        if (Utils.isPlainObject(filters)) {
            req_options['filters'] = filters;
        }
        let cache_id = toKey(req_options);
        if (force_cache && load_cache_first) {
            __cached = m.getCacheManager().getItem(cache_id);
            if (__cached) {
                success(__cached, true);
                freeze = false;
            }
        }
        return this.app_context.request('GET', url, req_options, (response) => {
            force_cache && m.getCacheManager().setItem(cache_id, response);
            success(response, false);
        }, (response) => {
            if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
                success(__cached, true);
            }
            else {
                fail(response);
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
     * @param force_cache
     * @param load_cache_first
     */
    getRelationRequest(id, relation, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getItemRelationURI(id, relation), cache_id = toKey({ id, relation }), __cached;
        if (force_cache && load_cache_first) {
            __cached = this.getCacheManager().getItem(cache_id);
            if (__cached) {
                success(__cached, true);
                freeze = false;
            }
        }
        return this.app_context.request('GET', url, {}, function (response) {
            force_cache && m.getCacheManager().setItem(cache_id, response);
            success(response, false);
        }, function (response) {
            if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
                success(__cached, true);
            }
            else {
                fail(response);
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
     * @param force_cache
     * @param load_cache_first
     */
    getRelationItemsRequest(id, relation, options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getItemRelationURI(id, relation), filters = options['filters'], req_options = {};
        if (typeof options['max'] === 'number') {
            req_options['max'] = options['max'];
        }
        if (typeof options['page'] === 'number') {
            req_options['page'] = options['page'];
        }
        if (Utils.isPlainObject(filters)) {
            req_options['filters'] = filters;
        }
        let cache_id = toKey(Utils.assign({ relation: relation }, req_options)), __cached;
        if (force_cache && load_cache_first) {
            __cached = this.getCacheManager().getItem(cache_id);
            if (__cached) {
                success(__cached, true);
                freeze = false;
            }
        }
        return this.app_context.request('GET', url, req_options, function (response) {
            force_cache && m.getCacheManager().setItem(cache_id, response);
            success(response, false);
        }, function (response) {
            if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
                success(__cached, true);
            }
            else {
                fail(response);
            }
        }, freeze);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBeUdsQyxNQUFNLFdBQVcsR0FBVyx3QkFBd0IsRUFDakQsVUFBVSxHQUFZLDRCQUE0QixFQUNsRCxtQkFBbUIsR0FBRyxzQ0FBc0MsQ0FBQztBQUVoRSxJQUFJLEtBQUssR0FBRyxVQUFVLFlBQWlCO0lBQ3RDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBVztJQUkvQjs7OztPQUlHO0lBQ0gsWUFBK0IsV0FBb0IsRUFBRSxZQUFvQixFQUFFLG1CQUE0QixLQUFLO1FBQTdFLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ2xELElBQUksS0FBSyxHQUFTLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxHQUFHLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FB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QyxRQUFRLEVBQUUsUUFBUSxFQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFDcEUsUUFBUSxDQUFDO1FBRVYsSUFBSSxXQUFXLElBQUksZ0JBQWdCLEVBQUU7WUFDcEMsUUFBUSxHQUF3QyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXpGLElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDZjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDOUIsS0FBSyxFQUNMLEdBQUcsRUFDSCxXQUFXLEVBQ1gsVUFBVSxRQUFzQjtZQUMvQixXQUFXLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFL0QsT0FBTyxDQUFDLFFBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDLEVBQ0QsVUFBVSxRQUFzQjtZQUMvQixJQUFJLFdBQVcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2Y7UUFDRixDQUFDLEVBQ0QsTUFBTSxDQUNOLENBQUM7SUFDSCxDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IE9XZWJDb20sIHtpQ29tUmVzcG9uc2V9IGZyb20gJy4vT1dlYkNvbSc7XG5pbXBvcnQgT1dlYktleVN0b3JhZ2UgZnJvbSAnLi9PV2ViS2V5U3RvcmFnZSc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VBZGRSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlR2V0UmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZUdldEFsbFJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW1zOiBUW107XG5cdFx0bWF4PzogbnVtYmVyO1xuXHRcdHBhZ2U/OiBudW1iZXI7XG5cdFx0dG90YWw/OiBudW1iZXI7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VVcGRhdGVSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlVXBkYXRlQWxsRGF0YSBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRhZmZlY3RlZDogbnVtYmVyO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlRGVsZXRlUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZURlbGV0ZUFsbFJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGFmZmVjdGVkOiBudW1iZXI7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbXM6IFRbXTtcblx0XHRtYXg/OiBudW1iZXI7XG5cdFx0cGFnZT86IG51bWJlcjtcblx0XHR0b3RhbD86IG51bWJlcjtcblx0XHRyZWxhdGlvbnM6IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IHR5cGUgdFNlcnZpY2VBZGRTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZUFkZFJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VVcGRhdGVTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZVVwZGF0ZVJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VVcGRhdGVBbGxTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZVVwZGF0ZUFsbERhdGEpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZURlbGV0ZVN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlRGVsZXRlUmVzcG9uc2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZURlbGV0ZUFsbFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlRGVsZXRlQWxsUmVzcG9uc2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlR2V0UmVzcG9uc2U8VD4sIGZyb21DYWNoZTogYm9vbGVhbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0QWxsU3VjY2VzczxUPiA9IChyZXNwb25zZTogaVNlcnZpY2VHZXRBbGxSZXNwb25zZTxUPiwgZnJvbUNhY2hlOiBib29sZWFuKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VHZXRSZWxhdGlvblN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8VD4sIGZyb21DYWNoZTogYm9vbGVhbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1N1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBpU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxUPixcblx0ZnJvbUNhY2hlOiBib29sZWFuXG4pID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIHRTZXJ2aWNlRmFpbCA9IChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSB0U2VydmljZVJlcXVlc3RPcHRpb25zID0ge1xuXHRkYXRhPzogYW55O1xuXHRmaWx0ZXJzPzogYW55O1xuXHRyZWxhdGlvbnM/OiBzdHJpbmc7XG5cdGNvbGxlY3Rpb24/OiBzdHJpbmc7XG5cdG9yZGVyX2J5Pzogc3RyaW5nO1xuXHRtYXg/OiBudW1iZXI7XG5cdHBhZ2U/OiBudW1iZXI7XG59O1xuXG5jb25zdCB1cmlfc2VydmljZSAgICAgICAgID0gJzphcGlfdXJsLzpzZXJ2aWNlX25hbWUnLFxuXHQgIHVyaV9lbnRpdHkgICAgICAgICAgPSAnOmFwaV91cmwvOnNlcnZpY2VfbmFtZS86aWQnLFxuXHQgIHVyaV9lbnRpdHlfcmVsYXRpb24gPSAnOmFwaV91cmwvOnNlcnZpY2VfbmFtZS86aWQvOnJlbGF0aW9uJztcblxubGV0IHRvS2V5ID0gZnVuY3Rpb24gKHF1ZXJ5X3BhcmFtczogYW55KSB7XG5cdGxldCBrZXkgPSBKU09OLnN0cmluZ2lmeShxdWVyeV9wYXJhbXMpLnJlcGxhY2UoL1teYS16MC05XS9naSwgJycpO1xuXHRyZXR1cm4ga2V5Lmxlbmd0aCA/IGtleSA6ICduby1wYXJhbXMnO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlNlcnZpY2U8VD4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9rZXlfc3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlX2RhdGE6IHsgYXBpX3VybDogYW55OyBzZXJ2aWNlX25hbWU6IHN0cmluZyB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwX2NvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gc2VydmljZV9uYW1lIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqIEBwYXJhbSBwZXJzaXN0ZW50X2NhY2hlIFRvIGVuYWJsZSBwZXJzaXN0ZW5jZSBkYXRhIGNhY2hpbmcuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHAsIHNlcnZpY2VfbmFtZTogc3RyaW5nLCBwZXJzaXN0ZW50X2NhY2hlOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRsZXQgc191cmwgICAgICAgPSBhcHBfY29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0JBU0VfVVJMJykucmVwbGFjZSgvXFwvJC9nLCAnJyk7XG5cdFx0dGhpcy5fYmFzZV9kYXRhID0ge2FwaV91cmw6IHNfdXJsLCBzZXJ2aWNlX25hbWU6IHNlcnZpY2VfbmFtZX07XG5cdFx0dGhpcy5fa2V5X3N0b3JlID0gbmV3IE9XZWJLZXlTdG9yYWdlKGFwcF9jb250ZXh0LCAnc2VydmljZXM6JyArIHNlcnZpY2VfbmFtZSwgcGVyc2lzdGVudF9jYWNoZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBuYW1lLlxuXHQgKi9cblx0Z2V0TmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9iYXNlX2RhdGEuc2VydmljZV9uYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlcnZpY2UgVVJJLlxuXHQgKi9cblx0Z2V0U2VydmljZVVSSSgpIHtcblx0XHRyZXR1cm4gVXRpbHMuc3RyaW5nS2V5UmVwbGFjZSh1cmlfc2VydmljZSwgdGhpcy5fYmFzZV9kYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKi9cblx0Z2V0SXRlbVVSSShpZDogYW55KTogc3RyaW5nIHtcblx0XHRsZXQgZGF0YSA9IFV0aWxzLmFzc2lnbih7aWQ6IGlkfSwgdGhpcy5fYmFzZV9kYXRhKTtcblx0XHRyZXR1cm4gVXRpbHMuc3RyaW5nS2V5UmVwbGFjZSh1cmlfZW50aXR5LCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSByZWxhdGlvbiBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqL1xuXHRnZXRJdGVtUmVsYXRpb25VUkkoaWQ6IHN0cmluZywgcmVsYXRpb246IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0bGV0IGRhdGEgPSBVdGlscy5hc3NpZ24oe2lkOiBpZCwgcmVsYXRpb246IHJlbGF0aW9ufSwgdGhpcy5fYmFzZV9kYXRhKTtcblx0XHRyZXR1cm4gVXRpbHMuc3RyaW5nS2V5UmVwbGFjZSh1cmlfZW50aXR5X3JlbGF0aW9uLCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWNoZSBtYW5hZ2VyIGdldHRlci5cblx0ICovXG5cdGdldENhY2hlTWFuYWdlcigpOiBPV2ViS2V5U3RvcmFnZSB7XG5cdFx0cmV0dXJuIHRoaXMuX2tleV9zdG9yZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGFkZFJlcXVlc3QoZm9ybURhdGE6IGFueSwgc3VjY2VzczogdFNlcnZpY2VBZGRTdWNjZXNzPFQ+LCBmYWlsOiB0U2VydmljZUZhaWwsIGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlKTogT1dlYkNvbSB7XG5cdFx0bGV0IHVybCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IGZvcm1EYXRhO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdQT1NUJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGRlbGV0ZVJlcXVlc3QoaWQ6IHN0cmluZywgc3VjY2VzczogdFNlcnZpY2VEZWxldGVTdWNjZXNzPFQ+LCBmYWlsOiB0U2VydmljZUZhaWwsIGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlKTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gICA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdERUxFVEUnLFxuXHRcdFx0dXJsLFxuXHRcdFx0bnVsbCxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdG0uZ2V0Q2FjaGVNYW5hZ2VyKCkucmVtb3ZlSXRlbShpZCk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlUmVxdWVzdChcblx0XHRpZDogc3RyaW5nLFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VVcGRhdGVTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgdXJsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB0aGlzLmdldEl0ZW1VUkkoaWQpLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnUEFUQ0gnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSk7XG5cdFx0XHR9LFxuXHRcdFx0ZmFpbCxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGRlbGV0ZUFsbFJlcXVlc3QoXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRzdWNjZXNzOiB0U2VydmljZURlbGV0ZUFsbFN1Y2Nlc3M8VD4sXG5cdFx0ZmFpbDogdFNlcnZpY2VGYWlsLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IE9XZWJDb20ge1xuXHRcdGxldCB1cmwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBvcHRpb25zLmZpbHRlcnMsXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydtYXgnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdHJlcV9vcHRpb25zWydtYXgnXSA9IG9wdGlvbnNbJ21heCddO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ3BhZ2UnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdHJlcV9vcHRpb25zWydwYWdlJ10gPSBvcHRpb25zWydwYWdlJ107XG5cdFx0fVxuXG5cdFx0aWYgKFV0aWxzLmlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdHJlcV9vcHRpb25zWydmaWx0ZXJzJ10gPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnREVMRVRFJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlQWxsUmVxdWVzdChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VVcGRhdGVBbGxTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgdXJsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1snbWF4J10gPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRyZXFfb3B0aW9uc1snbWF4J10gPSBvcHRpb25zWydtYXgnXTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydwYWdlJ10gPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRyZXFfb3B0aW9uc1sncGFnZSddID0gb3B0aW9uc1sncGFnZSddO1xuXHRcdH1cblxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snZmlsdGVycyddID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J1BBVENIJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYW4gZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBBbGwgcmVxdWVzdGVkIHJlbGF0aW9ucyBuYW1lcyBhcmUgam9pbmVkIHdpdGggYHxgLlxuXHQgKiBleGFtcGxlOiBgcmVsYXRpb24xfHJlbGF0aW9uMnxyZWxhdGlvblhgLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9ucyBUaGUgcmVsYXRpb25zIHN0cmluZy5cblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVxdWVzdChcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uczogc3RyaW5nICAgICAgICAgPSAnJyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFN1Y2Nlc3M8VD4sXG5cdFx0ZmFpbDogdFNlcnZpY2VGYWlsLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiAgICAgICAgICAgPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gICAgICAgICA9IHRoaXMsXG5cdFx0XHR1cmwgICAgICAgPSB0aGlzLmdldEl0ZW1VUkkoaWQpLFxuXHRcdFx0Y2FjaGVfaWQgID0gaWQsXG5cdFx0XHRkYXRhOiBhbnkgPSB7fSxcblx0XHRcdF9fY2FjaGVkO1xuXG5cdFx0aWYgKHJlbGF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGRhdGEucmVsYXRpb25zID0gcmVsYXRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0ZGF0YSxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuc2V0SXRlbShpZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICgoX19jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpKSkge1xuXHRcdFx0XHRcdHN1Y2Nlc3MoX19jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhaWwocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKiBAcGFyYW0gZm9yY2VfY2FjaGVcblx0ICogQHBhcmFtIGxvYWRfY2FjaGVfZmlyc3Rcblx0ICovXG5cdGdldEFsbFJlcXVlc3QoXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldEFsbFN1Y2Nlc3M8VD4sXG5cdFx0ZmFpbDogdFNlcnZpY2VGYWlsLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiAgICAgICAgICAgPSBmYWxzZSxcblx0XHRmb3JjZV9jYWNoZTogYm9vbGVhbiAgICAgID0gZmFsc2UsXG5cdFx0bG9hZF9jYWNoZV9maXJzdDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IE9XZWJDb20ge1xuXHRcdGxldCBtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHRoaXMsXG5cdFx0XHR1cmwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBvcHRpb25zWydmaWx0ZXJzJ10sXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9LFxuXHRcdFx0X19jYWNoZWQ7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucmVsYXRpb25zID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ3JlbGF0aW9ucyddID0gb3B0aW9ucy5yZWxhdGlvbnM7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2NvbGxlY3Rpb24nXSA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMub3JkZXJfYnkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snb3JkZXJfYnknXSA9IG9wdGlvbnMub3JkZXJfYnk7XG5cdFx0fVxuXG5cdFx0aWYgKFV0aWxzLmlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdHJlcV9vcHRpb25zWydmaWx0ZXJzJ10gPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBjYWNoZV9pZCA9IHRvS2V5KHJlcV9vcHRpb25zKTtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRmb3JjZV9jYWNoZSAmJiBtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oY2FjaGVfaWQsIHJlc3BvbnNlKTtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgKF9fY2FjaGVkID0gbS5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlX2lkKSkpIHtcblx0XHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHNpbmdsZSBpdGVtIHJlbGF0aW9uIGZvciBhIGdpdmVuIGVudGl0eSBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZV9jYWNoZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25SZXF1ZXN0PFI+KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb246IHN0cmluZyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuICAgICAgICAgICA9IGZhbHNlLFxuXHRcdGZvcmNlX2NhY2hlOiBib29sZWFuICAgICAgPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gICAgICAgID0gdGhpcyxcblx0XHRcdHVybCAgICAgID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGNhY2hlX2lkID0gdG9LZXkoe2lkLCByZWxhdGlvbn0pLFxuXHRcdFx0X19jYWNoZWQ7XG5cblx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgbG9hZF9jYWNoZV9maXJzdCkge1xuXHRcdFx0X19jYWNoZWQgPSB0aGlzLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpO1xuXG5cdFx0XHRpZiAoX19jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdGZyZWV6ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdHt9LFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0Zm9yY2VfY2FjaGUgJiYgbS5nZXRDYWNoZU1hbmFnZXIoKS5zZXRJdGVtKGNhY2hlX2lkLCByZXNwb25zZSk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55LCBmYWxzZSk7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKGZvcmNlX2NhY2hlICYmIChfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCkpKSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgbXVsdGlwbGUgaXRlbXMgcmVsYXRpb24gZm9yIGEgZ2l2ZW4gZW50aXR5IGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZV9jYWNoZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25JdGVtc1JlcXVlc3Q8Uj4oXG5cdFx0aWQ6IHN0cmluZyxcblx0XHRyZWxhdGlvbjogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuICAgICAgICAgICA9IGZhbHNlLFxuXHRcdGZvcmNlX2NhY2hlOiBib29sZWFuICAgICAgPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdHVybCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGZpbHRlcnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9uc1snZmlsdGVycyddLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1snbWF4J10gPT09ICdudW1iZXInKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snbWF4J10gPSBvcHRpb25zWydtYXgnXTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydwYWdlJ10gPT09ICdudW1iZXInKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1sncGFnZSddID0gb3B0aW9uc1sncGFnZSddO1xuXHRcdH1cblxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snZmlsdGVycyddID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgY2FjaGVfaWQgPSB0b0tleShVdGlscy5hc3NpZ24oe3JlbGF0aW9uOiByZWxhdGlvbn0sIHJlcV9vcHRpb25zKSksXG5cdFx0XHRfX2NhY2hlZDtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IDxpU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxSPj50aGlzLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpO1xuXG5cdFx0XHRpZiAoX19jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdGZyZWV6ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0ZnVuY3Rpb24gKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0Zm9yY2VfY2FjaGUgJiYgbS5nZXRDYWNoZU1hbmFnZXIoKS5zZXRJdGVtKGNhY2hlX2lkLCByZXNwb25zZSk7XG5cblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAocmVzcG9uc2U6IGlDb21SZXNwb25zZSkge1xuXHRcdFx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgKF9fY2FjaGVkID0gbS5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlX2lkKSkpIHtcblx0XHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cbn1cbiJdfQ==