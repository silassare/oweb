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
    add(formData, success, fail, freeze = false) {
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
    delete(id, success, fail, freeze = false) {
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
    update(id, formData, success, fail, freeze = false) {
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
    deleteAll(options, success, fail, freeze = false) {
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
    updateAll(options, formData, success, fail, freeze = false) {
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
    get(id, relations = '', success, fail, freeze = false, load_cache_first = false) {
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
    getAll(options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
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
    getRelation(id, relation, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
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
    getRelationItems(id, relation, options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxjQUFjLE1BQU0sa0JBQWtCLENBQUM7QUFDOUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBeUdsQyxNQUFNLFdBQVcsR0FBRyx3QkFBd0IsRUFDM0MsVUFBVSxHQUFHLDRCQUE0QixFQUN6QyxtQkFBbUIsR0FBRyxzQ0FBc0MsQ0FBQztBQUU5RCxJQUFJLEtBQUssR0FBRyxVQUFTLFlBQWlCO0lBQ3JDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPO0lBSWI7OztPQUdHO0lBQ0gsWUFBK0IsV0FBb0IsRUFBRSxZQUFvQjtRQUExQyxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUNsRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxDQUFDO1FBQ2pFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxjQUFjLENBQUMsV0FBVyxFQUFFLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPO1FBQ04sT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxhQUFhO1FBQ1osT0FBTyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxFQUFPO1FBQ2pCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxrQkFBa0IsQ0FBQyxFQUFVLEVBQUUsUUFBZ0I7UUFDOUMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6RSxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlO1FBQ2QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3hCLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsR0FBRyxDQUFDLFFBQWEsRUFBRSxPQUE4QixFQUFFLElBQWtCLEVBQUUsU0FBa0IsS0FBSztRQUM3RixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQzdCLFdBQVcsR0FBMkIsUUFBUSxDQUFDO1FBRWhELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQzlCLE1BQU0sRUFDTixHQUFHLEVBQ0gsV0FBVyxFQUNYLENBQUMsUUFBc0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sQ0FBQyxRQUFlLENBQUMsQ0FBQztRQUMxQixDQUFDLEVBQ0QsSUFBSSxFQUNKLE1BQU0sQ0FDTixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxNQUFNLENBQUMsRUFBVSxFQUFFLE9BQWlDLEVBQUUsSUFBa0IsRUFBRSxTQUFrQixLQUFLO1FBQ2hHLElBQUksQ0FBQyxHQUFHLElBQUksRUFDWCxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUzQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUM5QixRQUFRLEVBQ1IsR0FBRyxFQUNILElBQUksRUFDSixDQUFDLFFBQXNCLEVBQUUsRUFBRTtZQUMxQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxRQUFlLENBQUMsQ0FBQztRQUMxQixDQUFDLEVBQ0QsSUFBSSxFQUNKLE1BQU0sQ0FDTixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsTUFBTSxDQUNMLEVBQVUsRUFDVixRQUFhLEVBQ2IsT0FBaUMsRUFDakMsSUFBa0IsRUFDbEIsU0FBa0IsS0FBSztRQUV2QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUM1QixXQUFXLEdBQTJCLFFBQVEsQ0FBQztRQUVoRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUM5QixPQUFPLEVBQ1AsR0FBRyxFQUNILFdBQVcsRUFDWCxDQUFDLFFBQXNCLEVBQUUsRUFBRTtZQUMxQixPQUFPLENBQUMsUUFBZSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxFQUNELElBQUksRUFDSixNQUFNLENBQ04sQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxDQUNSLE9BQStCLEVBQy9CLE9BQW9DLEVBQ3BDLElBQWtCLEVBQ2xCLFNBQWtCLEtBQUs7UUFFdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUM3QixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFDekIsV0FBVyxHQUEyQixFQUFFLENBQUM7UUFFMUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDdkMsNEJBQTRCO1lBQzVCLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUN4Qyw0QkFBNEI7WUFDNUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDOUIsUUFBUSxFQUNSLEdBQUcsRUFDSCxXQUFXLEVBQ1gsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDMUIsT0FBTyxDQUFDLFFBQWUsQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFDRCxJQUFJLEVBQ0osTUFBTSxDQUNOLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxTQUFTLENBQ1IsT0FBK0IsRUFDL0IsUUFBYSxFQUNiLE9BQW9DLEVBQ3BDLElBQWtCLEVBQ2xCLFNBQWtCLEtBQUs7UUFFdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUM3QixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFDekIsV0FBVyxHQUEyQixRQUFRLENBQUM7UUFFaEQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDdkMsNEJBQTRCO1lBQzVCLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUN4Qyw0QkFBNEI7WUFDNUIsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDOUIsT0FBTyxFQUNQLEdBQUcsRUFDSCxXQUFXLEVBQ1gsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDMUIsT0FBTyxDQUFDLFFBQWUsQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFDRCxJQUFJLEVBQ0osTUFBTSxDQUNOLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsR0FBRyxDQUNGLEVBQVUsRUFDVixZQUFvQixFQUFFLEVBQ3RCLE9BQThCLEVBQzlCLElBQWtCLEVBQ2xCLFNBQWtCLEtBQUssRUFDdkIsbUJBQTRCLEtBQUs7UUFFakMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNYLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUN6QixRQUFRLEdBQUcsRUFBRSxFQUNiLElBQUksR0FBUSxFQUFFLEVBQ2QsUUFBUSxDQUFDO1FBRVYsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxnQkFBZ0IsRUFBRTtZQUNyQixRQUFRLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVqRCxJQUFJLFFBQVEsRUFBRTtnQkFDYixPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4QixNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2Y7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQzlCLEtBQUssRUFDTCxHQUFHLEVBQ0gsSUFBSSxFQUNKLENBQUMsUUFBc0IsRUFBRSxFQUFFO1lBQzFCLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxRQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxFQUNELENBQUMsUUFBc0IsRUFBRSxFQUFFO1lBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUN2RCxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNmO1FBQ0YsQ0FBQyxFQUNELE1BQU0sQ0FDTixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FDTCxPQUErQixFQUMvQixPQUFpQyxFQUNqQyxJQUFrQixFQUNsQixTQUFrQixLQUFLLEVBQ3ZCLGNBQXVCLEtBQUssRUFDNUIsbUJBQTRCLEtBQUs7UUFFakMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNYLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQzFCLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQzVCLFdBQVcsR0FBMkIsRUFBRSxFQUN4QyxRQUFRLENBQUM7UUFFVixJQUFJLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUN2QyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDeEMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN0QztRQUVELElBQUksT0FBTyxPQUFPLENBQUMsU0FBUyxLQUFLLFFBQVEsRUFBRTtZQUMxQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUM3QztRQUNELElBQUksT0FBTyxPQUFPLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRTtZQUMzQyxXQUFXLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUMvQztRQUVELElBQUksT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtZQUN6QyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUMzQztRQUVELElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO1NBQ2pDO1FBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWxDLElBQUksV0FBVyxJQUFJLGdCQUFnQixFQUFFO1lBQ3BDLFFBQVEsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRWpELElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDZjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDOUIsS0FBSyxFQUNMLEdBQUcsRUFDSCxXQUFXLEVBQ1gsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDMUIsV0FBVyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sQ0FBQyxRQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxFQUNELENBQUMsUUFBc0IsRUFBRSxFQUFFO1lBQzFCLElBQUksV0FBVyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDdEUsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN4QjtpQkFBTTtnQkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDZjtRQUNGLENBQUMsRUFDRCxNQUFNLENBQ04sQ0FBQztJQUNILENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0gsV0FBVyxDQUNWLEVBQVUsRUFDVixRQUFnQixFQUNoQixPQUFzQyxFQUN0QyxJQUFrQixFQUNsQixTQUFrQixLQUFLLEVBQ3ZCLGNBQXVCLEtBQUssRUFDNUIsbUJBQTRCLEtBQUs7UUFFakMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNYLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUMzQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQ2xDLFFBQVEsQ0FBQztRQUVWLElBQUksV0FBVyxJQUFJLGdCQUFnQixFQUFFO1lBQ3BDLFFBQVEsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBELElBQUksUUFBUSxFQUFFO2dCQUNiLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDZjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FDOUIsS0FBSyxFQUNMLEdBQUcsRUFDSCxFQUFFLEVBQ0YsVUFBUyxRQUFzQjtZQUM5QixXQUFXLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0QsT0FBTyxDQUFDLFFBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDLEVBQ0QsVUFBUyxRQUFzQjtZQUM5QixJQUFJLFdBQVcsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDeEI7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2Y7UUFDRixDQUFDLEVBQ0QsTUFBTSxDQUNOLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxnQkFBZ0IsQ0FDZixFQUFVLEVBQ1YsUUFBZ0IsRUFDaEIsT0FBK0IsRUFDL0IsT0FBMkMsRUFDM0MsSUFBa0IsRUFDbEIsU0FBa0IsS0FBSyxFQUN2QixjQUF1QixLQUFLLEVBQzVCLG1CQUE0QixLQUFLO1FBRWpDLElBQUksQ0FBQyxHQUFHLElBQUksRUFDWCxHQUFHLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFDM0MsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFDNUIsV0FBVyxHQUEyQixFQUFFLENBQUM7UUFFMUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDdkMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNwQztRQUNELElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3hDLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdEM7UUFFRCxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDakMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztTQUNqQztRQUVELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQ3RFLFFBQVEsQ0FBQztRQUVWLElBQUksV0FBVyxJQUFJLGdCQUFnQixFQUFFO1lBQ3BDLFFBQVEsR0FBd0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV6RixJQUFJLFFBQVEsRUFBRTtnQkFDYixPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4QixNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQ2Y7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQzlCLEtBQUssRUFDTCxHQUFHLEVBQ0gsV0FBVyxFQUNYLFVBQVMsUUFBc0I7WUFDOUIsV0FBVyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRS9ELE9BQU8sQ0FBQyxRQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxFQUNELFVBQVMsUUFBc0I7WUFDOUIsSUFBSSxXQUFXLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO2dCQUN0RSxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNmO1FBQ0YsQ0FBQyxFQUNELE1BQU0sQ0FDTixDQUFDO0lBQ0gsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViQ29tLCB7IGlDb21SZXNwb25zZSB9IGZyb20gJy4vT1dlYkNvbSc7XG5pbXBvcnQgT1dlYktleVN0b3JhZ2UgZnJvbSAnLi9PV2ViS2V5U3RvcmFnZSc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VBZGRSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlR2V0UmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZUdldEFsbFJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGl0ZW1zOiBUW107XG5cdFx0bWF4PzogbnVtYmVyO1xuXHRcdHBhZ2U/OiBudW1iZXI7XG5cdFx0dG90YWw/OiBudW1iZXI7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VVcGRhdGVSZXNwb25zZTxUPiBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHRcdHJlbGF0aW9ucz86IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlVXBkYXRlQWxsRGF0YSBleHRlbmRzIGlDb21SZXNwb25zZSB7XG5cdGRhdGE6IHtcblx0XHRhZmZlY3RlZDogbnVtYmVyO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlRGVsZXRlUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBpU2VydmljZURlbGV0ZUFsbFJlc3BvbnNlPFQ+IGV4dGVuZHMgaUNvbVJlc3BvbnNlIHtcblx0ZGF0YToge1xuXHRcdGFmZmVjdGVkOiBudW1iZXI7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbXM6IFRbXTtcblx0XHRtYXg/OiBudW1iZXI7XG5cdFx0cGFnZT86IG51bWJlcjtcblx0XHR0b3RhbD86IG51bWJlcjtcblx0XHRyZWxhdGlvbnM6IHtcblx0XHRcdFtrZXk6IHN0cmluZ106IGFueTtcblx0XHR9O1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIGlTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8VD4gZXh0ZW5kcyBpQ29tUmVzcG9uc2Uge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IHR5cGUgdFNlcnZpY2VBZGRTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZUFkZFJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VVcGRhdGVTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZVVwZGF0ZVJlc3BvbnNlPFQ+KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VVcGRhdGVBbGxTdWNjZXNzPFQ+ID0gKHJlc3BvbnNlOiBpU2VydmljZVVwZGF0ZUFsbERhdGEpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZURlbGV0ZVN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlRGVsZXRlUmVzcG9uc2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZURlbGV0ZUFsbFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlRGVsZXRlQWxsUmVzcG9uc2U8VD4pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0U2VydmljZUdldFN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlR2V0UmVzcG9uc2U8VD4sIGZyb21DYWNoZTogYm9vbGVhbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0QWxsU3VjY2VzczxUPiA9IChyZXNwb25zZTogaVNlcnZpY2VHZXRBbGxSZXNwb25zZTxUPiwgZnJvbUNhY2hlOiBib29sZWFuKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFNlcnZpY2VHZXRSZWxhdGlvblN1Y2Nlc3M8VD4gPSAocmVzcG9uc2U6IGlTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8VD4sIGZyb21DYWNoZTogYm9vbGVhbikgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1N1Y2Nlc3M8VD4gPSAoXG5cdHJlc3BvbnNlOiBpU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxUPixcblx0ZnJvbUNhY2hlOiBib29sZWFuXG4pID0+IHZvaWQ7XG5cbmV4cG9ydCB0eXBlIHRTZXJ2aWNlRmFpbCA9IChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkO1xuXG5leHBvcnQgdHlwZSB0U2VydmljZVJlcXVlc3RPcHRpb25zID0ge1xuXHRkYXRhPzogYW55O1xuXHRmaWx0ZXJzPzogYW55O1xuXHRyZWxhdGlvbnM/OiBzdHJpbmc7XG5cdGNvbGxlY3Rpb24/OiBzdHJpbmc7XG5cdG9yZGVyX2J5Pzogc3RyaW5nO1xuXHRtYXg/OiBudW1iZXI7XG5cdHBhZ2U/OiBudW1iZXI7XG59O1xuXG5jb25zdCB1cmlfc2VydmljZSA9ICc6YXBpX3VybC86c2VydmljZV9uYW1lJyxcblx0dXJpX2VudGl0eSA9ICc6YXBpX3VybC86c2VydmljZV9uYW1lLzppZCcsXG5cdHVyaV9lbnRpdHlfcmVsYXRpb24gPSAnOmFwaV91cmwvOnNlcnZpY2VfbmFtZS86aWQvOnJlbGF0aW9uJztcblxubGV0IHRvS2V5ID0gZnVuY3Rpb24ocXVlcnlfcGFyYW1zOiBhbnkpIHtcblx0bGV0IGtleSA9IEpTT04uc3RyaW5naWZ5KHF1ZXJ5X3BhcmFtcykucmVwbGFjZSgvW15hLXowLTldL2dpLCAnJyk7XG5cdHJldHVybiBrZXkubGVuZ3RoID8ga2V5IDogJ25vLXBhcmFtcyc7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViU2VydmljZTxUPiB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2tleV9zdG9yZTogT1dlYktleVN0b3JhZ2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VfZGF0YTogeyBhcGlfdXJsOiBhbnk7IHNlcnZpY2VfbmFtZTogc3RyaW5nIH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBfY29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBzZXJ2aWNlX25hbWUgVGhlIHNlcnZpY2UgbmFtZS5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHByb3RlY3RlZCByZWFkb25seSBhcHBfY29udGV4dDogT1dlYkFwcCwgc2VydmljZV9uYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgc191cmwgPSBhcHBfY29udGV4dC5jb25maWdzLmdldCgnT1pfQVBJX0JBU0VfVVJMJykucmVwbGFjZSgvXFwvJC9nLCAnJyk7XG5cdFx0dGhpcy5fYmFzZV9kYXRhID0geyBhcGlfdXJsOiBzX3VybCwgc2VydmljZV9uYW1lOiBzZXJ2aWNlX25hbWUgfTtcblx0XHR0aGlzLl9rZXlfc3RvcmUgPSBuZXcgT1dlYktleVN0b3JhZ2UoYXBwX2NvbnRleHQsICdzZXJ2aWNlczonICsgc2VydmljZV9uYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX2Jhc2VfZGF0YS5zZXJ2aWNlX25hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBVUkkuXG5cdCAqL1xuXHRnZXRTZXJ2aWNlVVJJKCkge1xuXHRcdHJldHVybiBVdGlscy5zdHJpbmdLZXlSZXBsYWNlKHVyaV9zZXJ2aWNlLCB0aGlzLl9iYXNlX2RhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgZW50aXR5IFVSSS5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRnZXRJdGVtVVJJKGlkOiBhbnkpOiBzdHJpbmcge1xuXHRcdGxldCBkYXRhID0gVXRpbHMuYXNzaWduKHsgaWQ6IGlkIH0sIHRoaXMuX2Jhc2VfZGF0YSk7XG5cdFx0cmV0dXJuIFV0aWxzLnN0cmluZ0tleVJlcGxhY2UodXJpX2VudGl0eSwgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgcmVsYXRpb24gVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbVJlbGF0aW9uVVJJKGlkOiBzdHJpbmcsIHJlbGF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGxldCBkYXRhID0gVXRpbHMuYXNzaWduKHsgaWQ6IGlkLCByZWxhdGlvbjogcmVsYXRpb24gfSwgdGhpcy5fYmFzZV9kYXRhKTtcblx0XHRyZXR1cm4gVXRpbHMuc3RyaW5nS2V5UmVwbGFjZSh1cmlfZW50aXR5X3JlbGF0aW9uLCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWNoZSBtYW5hZ2VyIGdldHRlci5cblx0ICovXG5cdGdldENhY2hlTWFuYWdlcigpOiBPV2ViS2V5U3RvcmFnZSB7XG5cdFx0cmV0dXJuIHRoaXMuX2tleV9zdG9yZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGFkZChmb3JtRGF0YTogYW55LCBzdWNjZXNzOiB0U2VydmljZUFkZFN1Y2Nlc3M8VD4sIGZhaWw6IHRTZXJ2aWNlRmFpbCwgZnJlZXplOiBib29sZWFuID0gZmFsc2UpOiBPV2ViQ29tIHtcblx0XHRsZXQgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRyZXFfb3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IGZvcm1EYXRhO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdQT1NUJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0c3VjY2VzcyhyZXNwb25zZSBhcyBhbnkpO1xuXHRcdFx0fSxcblx0XHRcdGZhaWwsXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGRlbGV0ZShpZDogc3RyaW5nLCBzdWNjZXNzOiB0U2VydmljZURlbGV0ZVN1Y2Nlc3M8VD4sIGZhaWw6IHRTZXJ2aWNlRmFpbCwgZnJlZXplOiBib29sZWFuID0gZmFsc2UpOiBPV2ViQ29tIHtcblx0XHRsZXQgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdERUxFVEUnLFxuXHRcdFx0dXJsLFxuXHRcdFx0bnVsbCxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdG0uZ2V0Q2FjaGVNYW5hZ2VyKCkucmVtb3ZlSXRlbShpZCk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKi9cblx0dXBkYXRlKFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0Zm9ybURhdGE6IGFueSxcblx0XHRzdWNjZXNzOiB0U2VydmljZVVwZGF0ZVN1Y2Nlc3M8VD4sXG5cdFx0ZmFpbDogdFNlcnZpY2VGYWlsLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IE9XZWJDb20ge1xuXHRcdGxldCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnUEFUQ0gnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSk7XG5cdFx0XHR9LFxuXHRcdFx0ZmFpbCxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICovXG5cdGRlbGV0ZUFsbChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlRGVsZXRlQWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2ZpbHRlcnMnXSA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdERUxFVEUnLFxuXHRcdFx0dXJsLFxuXHRcdFx0cmVxX29wdGlvbnMsXG5cdFx0XHQocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSk7XG5cdFx0XHR9LFxuXHRcdFx0ZmFpbCxcblx0XHRcdGZyZWV6ZVxuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqIEBwYXJhbSBmb3JtRGF0YVxuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqL1xuXHR1cGRhdGVBbGwoXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRmb3JtRGF0YTogYW55LFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlVXBkYXRlQWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2ZpbHRlcnMnXSA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdQQVRDSCcsXG5cdFx0XHR1cmwsXG5cdFx0XHRyZXFfb3B0aW9ucyxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55KTtcblx0XHRcdH0sXG5cdFx0XHRmYWlsLFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQWxsIHJlcXVlc3RlZCByZWxhdGlvbnMgbmFtZXMgYXJlIGpvaW5lZCB3aXRoIGB8YC5cblx0ICogZXhhbXBsZTogYHJlbGF0aW9uMXxyZWxhdGlvbjJ8cmVsYXRpb25YYC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbnMgVGhlIHJlbGF0aW9ucyBzdHJpbmcuXG5cdCAqIEBwYXJhbSBzdWNjZXNzXG5cdCAqIEBwYXJhbSBmYWlsXG5cdCAqIEBwYXJhbSBmcmVlemVcblx0ICogQHBhcmFtIGxvYWRfY2FjaGVfZmlyc3Rcblx0ICovXG5cdGdldChcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uczogc3RyaW5nID0gJycsXG5cdFx0c3VjY2VzczogdFNlcnZpY2VHZXRTdWNjZXNzPFQ+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKSxcblx0XHRcdGNhY2hlX2lkID0gaWQsXG5cdFx0XHRkYXRhOiBhbnkgPSB7fSxcblx0XHRcdF9fY2FjaGVkO1xuXG5cdFx0aWYgKHJlbGF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGRhdGEucmVsYXRpb25zID0gcmVsYXRpb25zO1xuXHRcdH1cblxuXHRcdGlmIChsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0ZGF0YSxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuc2V0SXRlbShpZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmICgoX19jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpKSkge1xuXHRcdFx0XHRcdHN1Y2Nlc3MoX19jYWNoZWQsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhaWwocmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZnJlZXplXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKiBAcGFyYW0gZm9yY2VfY2FjaGVcblx0ICogQHBhcmFtIGxvYWRfY2FjaGVfZmlyc3Rcblx0ICovXG5cdGdldEFsbChcblx0XHRvcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHRcdHN1Y2Nlc3M6IHRTZXJ2aWNlR2V0QWxsU3VjY2VzczxUPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VfY2FjaGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9uc1snZmlsdGVycyddLFxuXHRcdFx0cmVxX29wdGlvbnM6IHRTZXJ2aWNlUmVxdWVzdE9wdGlvbnMgPSB7fSxcblx0XHRcdF9fY2FjaGVkO1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zWydtYXgnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdHJlcV9vcHRpb25zWydtYXgnXSA9IG9wdGlvbnNbJ21heCddO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ3BhZ2UnXSA9PT0gJ251bWJlcicpIHtcblx0XHRcdHJlcV9vcHRpb25zWydwYWdlJ10gPSBvcHRpb25zWydwYWdlJ107XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnJlbGF0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHJlcV9vcHRpb25zWydyZWxhdGlvbnMnXSA9IG9wdGlvbnMucmVsYXRpb25zO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHJlcV9vcHRpb25zWydjb2xsZWN0aW9uJ10gPSBvcHRpb25zLmNvbGxlY3Rpb247XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm9yZGVyX2J5ID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ29yZGVyX2J5J10gPSBvcHRpb25zLm9yZGVyX2J5O1xuXHRcdH1cblxuXHRcdGlmIChVdGlscy5pc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRyZXFfb3B0aW9uc1snZmlsdGVycyddID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRsZXQgY2FjaGVfaWQgPSB0b0tleShyZXFfb3B0aW9ucyk7XG5cblx0XHRpZiAoZm9yY2VfY2FjaGUgJiYgbG9hZF9jYWNoZV9maXJzdCkge1xuXHRcdFx0X19jYWNoZWQgPSBtLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpO1xuXG5cdFx0XHRpZiAoX19jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdGZyZWV6ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0Zm9yY2VfY2FjaGUgJiYgbS5nZXRDYWNoZU1hbmFnZXIoKS5zZXRJdGVtKGNhY2hlX2lkLCByZXNwb25zZSk7XG5cdFx0XHRcdHN1Y2Nlc3MocmVzcG9uc2UgYXMgYW55LCBmYWxzZSk7XG5cdFx0XHR9LFxuXHRcdFx0KHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKGZvcmNlX2NhY2hlICYmIChfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCkpKSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBzaW5nbGUgaXRlbSByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWVcblx0ICogQHBhcmFtIHN1Y2Nlc3Ncblx0ICogQHBhcmFtIGZhaWxcblx0ICogQHBhcmFtIGZyZWV6ZVxuXHQgKiBAcGFyYW0gZm9yY2VfY2FjaGVcblx0ICogQHBhcmFtIGxvYWRfY2FjaGVfZmlyc3Rcblx0ICovXG5cdGdldFJlbGF0aW9uPFI+KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb246IHN0cmluZyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uU3VjY2VzczxSPixcblx0XHRmYWlsOiB0U2VydmljZUZhaWwsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2UsXG5cdFx0Zm9yY2VfY2FjaGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRsb2FkX2NhY2hlX2ZpcnN0OiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IG0gPSB0aGlzLFxuXHRcdFx0dXJsID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKSxcblx0XHRcdGNhY2hlX2lkID0gdG9LZXkoeyBpZCwgcmVsYXRpb24gfSksXG5cdFx0XHRfX2NhY2hlZDtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IHRoaXMuZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCk7XG5cblx0XHRcdGlmIChfX2NhY2hlZCkge1xuXHRcdFx0XHRzdWNjZXNzKF9fY2FjaGVkLCB0cnVlKTtcblx0XHRcdFx0ZnJlZXplID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwX2NvbnRleHQucmVxdWVzdChcblx0XHRcdCdHRVQnLFxuXHRcdFx0dXJsLFxuXHRcdFx0e30sXG5cdFx0XHRmdW5jdGlvbihyZXNwb25zZTogaUNvbVJlc3BvbnNlKSB7XG5cdFx0XHRcdGZvcmNlX2NhY2hlICYmIG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuc2V0SXRlbShjYWNoZV9pZCwgcmVzcG9uc2UpO1xuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKGZvcmNlX2NhY2hlICYmIChfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCkpKSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgbXVsdGlwbGUgaXRlbXMgcmVsYXRpb24gZm9yIGEgZ2l2ZW4gZW50aXR5IGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gc3VjY2Vzc1xuXHQgKiBAcGFyYW0gZmFpbFxuXHQgKiBAcGFyYW0gZnJlZXplXG5cdCAqIEBwYXJhbSBmb3JjZV9jYWNoZVxuXHQgKiBAcGFyYW0gbG9hZF9jYWNoZV9maXJzdFxuXHQgKi9cblx0Z2V0UmVsYXRpb25JdGVtczxSPihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogdFNlcnZpY2VSZXF1ZXN0T3B0aW9ucyxcblx0XHRzdWNjZXNzOiB0U2VydmljZUdldFJlbGF0aW9uSXRlbXNTdWNjZXNzPFI+LFxuXHRcdGZhaWw6IHRTZXJ2aWNlRmFpbCxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSxcblx0XHRmb3JjZV9jYWNoZTogYm9vbGVhbiA9IGZhbHNlLFxuXHRcdGxvYWRfY2FjaGVfZmlyc3Q6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBPV2ViQ29tIHtcblx0XHRsZXQgbSA9IHRoaXMsXG5cdFx0XHR1cmwgPSB0aGlzLmdldEl0ZW1SZWxhdGlvblVSSShpZCwgcmVsYXRpb24pLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnNbJ2ZpbHRlcnMnXSxcblx0XHRcdHJlcV9vcHRpb25zOiB0U2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnNbJ21heCddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ21heCddID0gb3B0aW9uc1snbWF4J107XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9uc1sncGFnZSddID09PSAnbnVtYmVyJykge1xuXHRcdFx0cmVxX29wdGlvbnNbJ3BhZ2UnXSA9IG9wdGlvbnNbJ3BhZ2UnXTtcblx0XHR9XG5cblx0XHRpZiAoVXRpbHMuaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0cmVxX29wdGlvbnNbJ2ZpbHRlcnMnXSA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0bGV0IGNhY2hlX2lkID0gdG9LZXkoVXRpbHMuYXNzaWduKHsgcmVsYXRpb246IHJlbGF0aW9uIH0sIHJlcV9vcHRpb25zKSksXG5cdFx0XHRfX2NhY2hlZDtcblxuXHRcdGlmIChmb3JjZV9jYWNoZSAmJiBsb2FkX2NhY2hlX2ZpcnN0KSB7XG5cdFx0XHRfX2NhY2hlZCA9IDxpU2VydmljZUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxSPj50aGlzLmdldENhY2hlTWFuYWdlcigpLmdldEl0ZW0oY2FjaGVfaWQpO1xuXG5cdFx0XHRpZiAoX19jYWNoZWQpIHtcblx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdGZyZWV6ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcF9jb250ZXh0LnJlcXVlc3QoXG5cdFx0XHQnR0VUJyxcblx0XHRcdHVybCxcblx0XHRcdHJlcV9vcHRpb25zLFxuXHRcdFx0ZnVuY3Rpb24ocmVzcG9uc2U6IGlDb21SZXNwb25zZSkge1xuXHRcdFx0XHRmb3JjZV9jYWNoZSAmJiBtLmdldENhY2hlTWFuYWdlcigpLnNldEl0ZW0oY2FjaGVfaWQsIHJlc3BvbnNlKTtcblxuXHRcdFx0XHRzdWNjZXNzKHJlc3BvbnNlIGFzIGFueSwgZmFsc2UpO1xuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpIHtcblx0XHRcdFx0aWYgKGZvcmNlX2NhY2hlICYmIChfX2NhY2hlZCA9IG0uZ2V0Q2FjaGVNYW5hZ2VyKCkuZ2V0SXRlbShjYWNoZV9pZCkpKSB7XG5cdFx0XHRcdFx0c3VjY2VzcyhfX2NhY2hlZCwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRmcmVlemVcblx0XHQpO1xuXHR9XG59XG4iXX0=