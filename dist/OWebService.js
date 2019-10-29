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
     */
    constructor(app_context, service_name) {
        this.app_context = app_context;
        let s_url = app_context.configs.get('OZ_API_BASE_URL').replace(/\/$/g, '');
        this._base_data = { api_url: s_url, service_name: service_name };
        this._key_store = new OWebKeyStorage(app_context, 'services:' + service_name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBeUdsQyxNQUFNLFdBQVcsR0FBRyx3QkFBd0IsRUFDM0MsVUFBVSxHQUFHLDRCQUE0QixFQUN6QyxtQkFBbUIsR0FBRyxzQ0FBc0MsQ0FBQztBQUU5RCxJQUFJLEtBQUssR0FBRyxVQUFTLFlBQWlCO0lBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBVztJQUkvQjs7O09BR0c7SUFDSCxZQUErQixXQUFvQixFQUFFLFlBQW9CO1FBQTFDLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBQ2xELElBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDakUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO0lBQ3JDLENB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RSxRQUFRLENBQUM7UUFFVixJQUFJLFdBQVcsSUFBSSxnQkFBZ0IsRUFBRTtZQUNwQyxRQUFRLEdBQXdDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFekYsSUFBSSxRQUFRLEVBQUU7Z0JBQ2IsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEIsTUFBTSxHQUFHLEtBQUssQ0FBQzthQUNmO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUM5QixLQUFLLEVBQ0wsR0FBRyxFQUNILFdBQVcsRUFDWCxVQUFTLFFBQXNCO1lBQzlCLFdBQVcsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUvRCxPQUFPLENBQUMsUUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFDRCxVQUFTLFFBQXNCO1lBQzlCLElBQUksV0FBVyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDdEUsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN4QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDZjtRQUNGLENBQUMsRUFDRCxNQUFNLENBQ04sQ0FBQztJQUNILENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkNvbSwgeyBpQ29tUmVzcG9uc2UgfSBmcm9tICcuL09XZWJDb20nO1xuaW1wb3J0IE9XZWJLZXlTdG9yYWdlIGZyb20gJy4vT1dlYktleVN0b3JhZ2UnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vdXRpbHMvVXRpbHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlQWRkUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZUdldFJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VHZXRBbGxSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtczogVFtdO1xuXHRcdG1heD86IG51bWJlcjtcblx0XHRwYWdlPzogbnVtYmVyO1xuXHRcdHRvdGFsPzogbnVtYmVyO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlVXBkYXRlUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZVVwZGF0ZUFsbERhdGEgZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0YWZmZWN0ZWQ6IG51bWJlcjtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZURlbGV0ZVJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VEZWxldGVBbGxSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRhZmZlY3RlZDogbnVtYmVyO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1Jlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW1zOiBUW107XG5cdFx0bWF4PzogbnVtYmVyO1xuXHRcdHBhZ2U/OiBudW1iZXI7XG5cdFx0dG90YWw/OiBudW1iZXI7XG5cdFx0cmVsYXRpb25zOiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCB0eXBlIHRTZXJ2aWNlQWRkU3VjY2VzczxUPiA9IChyZXNwb25zZTogaVNlcnZpY2VBZGRSZXNwb25zZTxUPikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlVXBkYXRlU3VjY2VzczxUPiA9IChyZXNwb25zZTogaVNlcnZpY2VVcGRhdGVSZXNwb25zZTxUPikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlVXBkYXRlQWxsU3VjY2VzczxUPiA9IChyZXNwb25zZTogaVNlcnZpY2VVcGRhdGVBbGxEYXRhKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VEZWxldGVTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZURlbGV0ZVJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VEZWxldGVBbGxTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZURlbGV0ZUFsbFJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VHZXRTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZUdldFJlc3BvbnNlPFQ+LCBmcm9tQ2FjaGU6IGJvb2xlYW4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldEFsbFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlR2V0QWxsUmVzcG9uc2U8VD4sIGZyb21DYWNoZTogYm9vbGVhbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0UmVsYXRpb25TdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlPFQ+LCBmcm9tQ2FjaGU6IGJvb2xlYW4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldFJlbGF0aW9uSXRlbXNTdWNjZXNzPFQ+ID0gKFxuXHRyZXNwb25zZTogaVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8VD4sXG5cdGZyb21DYWNoZTogYm9vbGVhblxuKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSB0U2VydmljZUZhaWwgPSAocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZDtcblxuZXhwb3J0IHR5cGUgdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHtcblx0ZGF0YT86IGFueTtcblx0ZmlsdGVycz86IGFueTtcblx0cmVsYXRpb25zPzogc3RyaW5nO1xuXHRjb2xsZWN0aW9uPzogc3RyaW5nO1xuXHRvcmRlcl9ieT86IHN0cmluZztcblx0bWF4PzogbnVtYmVyO1xuXHRwYWdlPzogbnVtYmVyO1xufTtcblxuY29uc3QgdXJpX3NlcnZpY2UgPSAnOmFwaV91cmwvOnNlcnZpY2VfbmFtZScsXG5cdHVyaV9lbnRpdHkgPSAnOmFwaV91cmwvOnNlcnZpY2VfbmFtZS86aWQnLFxuXHR1cmlfZW50aXR5X3JlbGF0aW9uID0gJzphcGlfdXJsLzpzZXJ2aWNlX25hbWUvOmlkLzpyZWxhdGlvbic7XG5cbmxldCB0b0tleSA9IGZ1bmN0aW9uKHF1ZXJ5X3BhcmFtczogYW55KSB7XG5cdGxldCBrZXkgPSBKU09OLnN0cmluZ2lmeShxdWVyeV9wYXJhbXMpLnJlcGxhY2UoL1teYS16MC05XS9naSwgJycpO1xuXHRyZXR1cm4ga2V5Lmxlbmd0aCA/IGtleSA6ICduby1wYXJhbXMnO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlNlcnZpY2U8VD4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9rZXlfc3RvcmU6IE9XZWJLZXlTdG9yYWdlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlX2RhdGE6IHsgYXBpX3VybDogYW55OyBzZXJ2aWNlX25hbWU6IHN0cmluZyB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwX2NvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gc2VydmljZV9uYW1lIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHAsIHNlcnZpY2VfbmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IHNfdXJsID0gYXBwX2NvbnRleHQuY29uZmlncy5nZXQoJ09aX0FQSV9CQVNFX1VSTCcpLnJlcGxhY2UoL1xcLyQvZywgJycpO1xuXHRcdHRoaXMuX2Jhc2VfZGF0YSA9IHsgYXBpX3VybDogc191cmwsIHNlcnZpY2VfbmFtZTogc2VydmljZV9uYW1lIH07XG5cdFx0dGhpcy5fa2V5X3N0b3JlID0gbmV3IE9XZWJLZXlTdG9yYWdlKGFwcF9jb250ZXh0LCAnc2VydmljZXM6JyArIHNlcnZpY2VfbmFtZSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBuYW1lLlxuXHQgKi9cblx0Z2V0TmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9iYXNlX2RhdGEuc2VydmljZV9uYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlcnZpY2UgVVJJLlxuXHQgKi9cblx0Z2V0U2VydmljZVVSSSgpIHtcblx0XHRyZXR1cm4gVXRpbHMuc3RyaW5nS2V5UmVwbGFjZSh1cmlfc2VydmljZSwgdGhpcy5fYmFzZV9kYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKi9cblx0Z2V0SXRlbVVSSShpZDogYW55KTogc3RyaW5nIHtcblx0XHRsZXQgZGF0YSA9IFV0aWxzLmFzc2lnbih7IGlkOiBpZCB9LCB0aGlzLl9iYXNlX2RhdGEpO1xuXHRcdHJldHVybiBVdGlscy5zdHJpbmdLZXlSZXBsYWNlKHVyaV9lbnRpdHksIGRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZW50aXR5IHJlbGF0aW9uIFVSSS5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZS5cblx0ICovXG5cdGdldEl0ZW1SZWxhdGlvblVSSShpZDogc3RyaW5nLCByZWxhdGlvbjogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRsZXQgZGF0YSA9IFV0aWxzLmFzc2lnbih7IGlkOiBpZCwgcmVsYXRpb246IHJlbGF0aW9uIH0sIHRoaXMuX2Jhc2VfZGF0YSk7XG5cdFx0cmV0dXJuIFV0aWxzLnN0cmluZ0tleVJlcGxhY2UodXJpX2VudGl0eV9yZWxhdGlvbiwgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FjaGUgbWFuYWdlciBnZXR0ZXIuXG5cdCAqL1xuXHRnZXRDYWNoZU1hbmFnZXIoKTogT1dlYktleVN0b3JhZ2Uge1xuXHRcdHJldHVybiB0aGlzLl9rZXlfc3RvcmU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhbiBlbnRpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtRGF0YVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqL1xuXHRhZGRSZXF1ZXN0KGZvcm1EYXRhOiBhbnksIHN1Y2Nlc3M6IHRTZXJ2aWNlQWRkU3VjY2VzczxUPiwgZmFpbDogdFNlcnZpY2VGYWlsLCBmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSk6IE9XZWJDb20ge1xuXHRcdGxldCB1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J1BPU1QnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSk7XG5cdFx0XHR9LFxuXHRcdFx0ZmFpbCxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0ZGVsZXRlUmVxdWVzdChpZDogc3RyaW5nLCBzdWNjZXNzOiB0U2VydmljZURlbGV0ZVN1Y2Nlc3M8VD4sIGZhaWw6IHRTZXJ2aWNlRmFpbCwgZnJlZXplOiBib29sZWFuID0gZmFsc2UpOiBPV2ViQ29tIHtcblx0XHRsZXQgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdERUxFVEUnLFxuXHRcdFx0dXJsLFxuXHRcdFx0bnVsbCxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdG0uZ2V0Q2FjaGVNYW5hZ2VyKCkucmVtb3ZlSXRlbShpZCk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlUmVxdWVzdChcblx0XHRpZDogc3RyaW5nLFxuXHRcdGZvcm1EYXRhOiBhbnksXG5cdFx0c3VjY2VzczogdFNlcnZpY2VVcGRhdGVTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgdXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKSxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J1BBVENIJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqL1xuXHRkZWxldGVBbGxSZXF1ZXN0KFxuXHRcdG9wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VEZWxldGVBbGxTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1snbWF4J10gPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRyZXFfb3B0aW9uc1snbWF4J10gPSBvcHRpb25zWydtYXgnXTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydwYWdlJ10gPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRyZXFfb3B0aW9uc1sncGFnZSddID0gb3B0aW9uc1sncGFnZSddO1xuXHRcdH1cblxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snZmlsdGVycyddID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J0RFTEVURScsXG5cdFx0XHR1cmwsXG5cdFx0XHRyZXFfb3B0aW9ucyxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdHVwZGF0ZUFsbFJlcXVlc3QoXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRmb3JtRGF0YTogYW55LFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlVXBkYXRlQWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2ZpbHRlcnMnXSA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdQQVRDSCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRyZXFfb3B0aW9ucyxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQWxsIHJlcXVlc3RlZCByZWxhdGlvbnMgbmFtZXMgYXJlIGpvaW5lZCB3aXRoIGB8YC5cblx0ICogZXhhbXBsZTogYHJlbGF0aW9uMXxyZWxhdGlvbjJ8cmVsYXRpb25YYC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbnMgVGhlIHJlbGF0aW9ucyBzdHJpbmcuXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICogQHBhcmFtIGxvYWRfY2FjaGVfZmlyc3Rcblx0ICovXG5cdGdldFJlcXVlc3QoXG5cdFx0aWQ6IHN0cmluZyxcblx0XHRyZWxhdGlvbnM6IHN0cmluZyA9ICcnLFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlR2V0U3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0bG9hZF9jYWNoZV9maXJzdDogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IE9XZWJDb20ge1xuXHRcdGxldCBtID0gdGhpcyxcblx0XHRcdHVybCA9IHRoaXMuZ2V0SXRlbVVSSShpZCksXG5cdFx0XHRjYWNoZV9pZCA9IGlkLFxuXHRcdFx0ZGF0YTogYW55ID0ge30sXG5cdFx0XHRfX2NhY2hlZDtcblxuXHRcdGlmIChyZWxhdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRkYXRhLnJlbGF0aW9ucyA9IHJlbGF0aW9ucztcblx0XHR9XG5cblx0XHRpZiAobG9hZF9jYWNoZV9maXJzdCkge1xuXHRcdFx0X19jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpO1xuXG5cdFx0XHRpZiAoX19jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdGZyZWV6ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdGRhdGEsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oaWQsIHJlc3BvbnNlKTtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoKF9fY2FjaGVkID0gbS5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlX2lkKSkpIHtcblx0XHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICogQHBhcmFtIGZvcmNlX2NhY2hlXG5cdCAqIEBwYXJhbSBsb2FkX2NhY2hlX2ZpcnN0XG5cdCAqL1xuXHRnZXRBbGxSZXF1ZXN0KFxuXHRcdG9wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VHZXRBbGxTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRmb3JjZV9jYWNoZTogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdGxvYWRfY2FjaGVfZmlyc3Q6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zWydmaWx0ZXJzJ10sXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9LFxuXHRcdFx0X19jYWNoZWQ7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucmVsYXRpb25zID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ3JlbGF0aW9ucyddID0gb3B0aW9ucy5yZWxhdGlvbnM7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2NvbGxlY3Rpb24nXSA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMub3JkZXJfYnkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snb3JkZXJfYnknXSA9IG9wdGlvbnMub3JkZXJfYnk7XG5cdFx0fVxuXG5cdFx0aWYgKFV0aWxzLmlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdHJlcV9vcHRpb25zWydmaWx0ZXJzJ10gPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBjYWNoZV9pZCA9IHRvS2V5KHJlcV9vcHRpb25zKTtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRmb3JjZV9jYWNoZSAmJiBtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oY2FjaGVfaWQsIHJlc3BvbnNlKTtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgKF9fY2FjaGVkID0gbS5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlX2lkKSkpIHtcblx0XHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWlsKHJlc3BvbnNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHNpbmdsZSBpdGVtIHJlbGF0aW9uIGZvciBhIGdpdmVuIGVudGl0eSBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZV9jYWNoZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25SZXF1ZXN0PFI+KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb246IHN0cmluZyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VfY2FjaGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGNhY2hlX2lkID0gdG9LZXkoeyBpZCwgcmVsYXRpb24gfSksXG5cdFx0XHRfX2NhY2hlZDtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IHRoaXMuZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0e30sXG5cdFx0XHRmdW5jdGlvbihyZXNwb25zZTogaUNvbVJlc3BvbnNlKSB7XG5cdFx0XHRcdGZvcmNlX2NhY2hlICYmIG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuc2V0SXRlbShjYWNoZV9pZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKGZvcmNlX2NhY2hlICYmIChfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCkpKSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgbXVsdGlwbGUgaXRlbXMgcmVsYXRpb24gZm9yIGEgZ2l2ZW4gZW50aXR5IGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZV9jYWNoZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25JdGVtc1JlcXVlc3Q8Uj4oXG5cdFx0aWQ6IHN0cmluZyxcblx0XHRyZWxhdGlvbjogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VfY2FjaGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zWydmaWx0ZXJzJ10sXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydtYXgnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdHJlcV9vcHRpb25zWydtYXgnXSA9IG9wdGlvbnNbJ21heCddO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ3BhZ2UnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdHJlcV9vcHRpb25zWydwYWdlJ10gPSBvcHRpb25zWydwYWdlJ107XG5cdFx0fVxuXG5cdFx0aWYgKFV0aWxzLmlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdHJlcV9vcHRpb25zWydmaWx0ZXJzJ10gPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdGxldCBjYWNoZV9pZCA9IHRvS2V5KFV0aWxzLmFzc2lnbih7IHJlbGF0aW9uOiByZWxhdGlvbiB9LCByZXFfb3B0aW9ucykpLFxuXHRcdFx0X19jYWNoZWQ7XG5cblx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgbG9hZF9jYWNoZV9maXJzdCkge1xuXHRcdFx0X19jYWNoZWQgPSA8aVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8Uj4+dGhpcy5nZXRDYWNoZU1hbmFnZXIoKS5nZXRJdGVtKGNhY2hlX2lkKTtcblxuXHRcdFx0aWYgKF9fY2FjaGVkKSB7XG5cdFx0XHRcdHN1Y2Nlc3MoX19jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHRmcmVlemUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBfY29udGV4dC5yZXF1ZXN0KFxuXHRcdFx0J0dFVCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRyZXFfb3B0aW9ucyxcblx0XHRcdGZ1bmN0aW9uKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0Zm9yY2VfY2FjaGUgJiYgbS5nZXRDYWNoZU1hbmFnZXIoKS5zZXRJdGVtKGNhY2hlX2lkLCByZXNwb25zZSk7XG5cblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnksIGZhbHNlKTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbihyZXNwb25zZTogaUNvbVJlc3BvbnNlKSB7XG5cdFx0XHRcdGlmIChmb3JjZV9jYWNoZSAmJiAoX19jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpKSkge1xuXHRcdFx0XHRcdHN1Y2Nlc3MoX19jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhaWwocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxufVxuIl19