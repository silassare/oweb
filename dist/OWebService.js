import { assign, isPlainObject, stringPlaceholderReplace } from './utils';
import { ozNet, } from './ozone';
const SERVICE_URL_FORMAT = ':api_url/:serviceName', SERVICE_ENTITY_FORMAT = ':api_url/:service/:id', SERVICE_ENTITY_RELATION_FORMAT = ':api_url/:service/:id/:relation';
export default class OWebService {
    /**
     * @param appContext The app context.
     * @param service The service name.
     */
    constructor(appContext, service) {
        this.appContext = appContext;
        const apiBaseUrl = appContext.configs
            .get('OZ_API_BASE_URL')
            .replace(/\/$/g, '');
        this._baseData = { api_url: apiBaseUrl, service };
    }
    /**
     * Returns the service name.
     */
    getName() {
        return this._baseData.service;
    }
    /**
     * Returns the service URI.
     */
    getServiceURI() {
        return stringPlaceholderReplace(SERVICE_URL_FORMAT, this._baseData);
    }
    /**
     * Returns entity URI.
     *
     * @param id The entity id.
     */
    getItemURI(id) {
        const data = assign({ id }, this._baseData);
        return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, data);
    }
    /**
     * Returns entity relation URI.
     *
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(id, relation) {
        const data = assign({ id, relation }, this._baseData);
        return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, data);
    }
    /**
     * Adds an entity.
     *
     * @param formData
     */
    addRequest(formData) {
        const url = this.getServiceURI();
        return ozNet(url, {
            method: 'POST',
            body: formData,
        });
    }
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteRequest(id) {
        const url = this.getItemURI(id);
        return ozNet(url, {
            method: 'DELETE',
        });
    }
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateRequest(id, formData) {
        const url = this.getItemURI(id);
        return ozNet(url, {
            method: 'PATCH',
            body: formData,
        });
    }
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteAllRequest(options) {
        const url = this.getServiceURI(), filters = options.filters, _options = {};
        if (typeof options.max === 'number') {
            // will be ignored by O'Zone
            _options.max = options.max;
        }
        if (typeof options.page === 'number') {
            // will be ignored by O'Zone
            _options.page = options.page;
        }
        if (isPlainObject(filters)) {
            _options.filters = filters;
        }
        return ozNet(url, {
            method: 'DELETE',
            body: _options,
        });
    }
    /**
     * Updates all entities.
     *
     * @param options
     * @param formData
     */
    updateAllRequest(options, formData) {
        const url = this.getServiceURI(), filters = options.filters, _options = formData;
        if (typeof options.max === 'number') {
            // will be ignored by O'Zone
            _options.max = options.max;
        }
        if (typeof options.page === 'number') {
            // will be ignored by O'Zone
            _options.page = options.page;
        }
        if (isPlainObject(filters)) {
            _options.filters = filters;
        }
        return ozNet(url, {
            method: 'PATCH',
            body: _options,
        });
    }
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getRequest(id, relations = '') {
        const url = this.getItemURI(id), data = {};
        if (relations.length) {
            data.relations = relations;
        }
        return ozNet(url, {
            method: 'GET',
            body: data,
        });
    }
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options) {
        const url = this.getServiceURI(), filters = options.filters, _options = {};
        if (typeof options.max === 'number') {
            _options.max = options.max;
        }
        if (typeof options.page === 'number') {
            _options.page = options.page;
        }
        if (typeof options.relations === 'string') {
            _options.relations = options.relations;
        }
        if (typeof options.collection === 'string') {
            _options.collection = options.collection;
        }
        if (typeof options.order_by === 'string') {
            _options.order_by = options.order_by;
        }
        if (isPlainObject(filters)) {
            _options.filters = filters;
        }
        return ozNet(url, {
            method: 'GET',
            body: _options,
        });
    }
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest(id, relation) {
        const url = this.getItemRelationURI(id, relation);
        return ozNet(url, {
            method: 'GET',
        });
    }
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItemsRequest(id, relation, options) {
        const url = this.getItemRelationURI(id, relation), filters = options.filters, _options = {};
        if (typeof options.max === 'number') {
            _options.max = options.max;
        }
        if (typeof options.page === 'number') {
            _options.page = options.page;
        }
        if (isPlainObject(filters)) {
            _options.filters = filters;
        }
        return ozNet(url, {
            method: 'GET',
            body: _options,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDMUUsT0FBTyxFQVdOLEtBQUssR0FDTCxNQUFNLFNBQVMsQ0FBQztBQUVqQixNQUFNLGtCQUFrQixHQUFHLHVCQUF1QixFQUNqRCxxQkFBcUIsR0FBRyx1QkFBdUIsRUFDL0MsOEJBQThCLEdBQUcsaUNBQWlDLENBQUM7QUFFcEUsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFXO0lBRy9COzs7T0FHRztJQUNILFlBQStCLFVBQW1CLEVBQUUsT0FBZTtRQUFwQyxlQUFVLEdBQVYsVUFBVSxDQUFTO1FBQ2pELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPO2FBQ25DLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDWixPQUFPLHdCQUF3QixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxFQUFPO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxPQUFPLHdCQUF3QixDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFD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QUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBRSxRQUFRO1NBQ2QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7IGFzc2lnbiwgaXNQbGFpbk9iamVjdCwgc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuXHRJT1pvbmVBcGlBZGRSZXNwb25zZSxcblx0SU9ab25lQXBpRGVsZXRlQWxsUmVzcG9uc2UsXG5cdElPWm9uZUFwaURlbGV0ZVJlc3BvbnNlLFxuXHRJT1pvbmVBcGlHZXRBbGxSZXNwb25zZSxcblx0SU9ab25lQXBpR2V0UmVsYXRpb25JdGVtUmVzcG9uc2UsXG5cdElPWm9uZUFwaUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZSxcblx0SU9ab25lQXBpR2V0UmVzcG9uc2UsXG5cdElPWm9uZUFwaVJlcXVlc3RPcHRpb25zLFxuXHRJT1pvbmVBcGlVcGRhdGVBbGxSZXNwb25zZSxcblx0SU9ab25lQXBpVXBkYXRlUmVzcG9uc2UsXG5cdG96TmV0LFxufSBmcm9tICcuL296b25lJztcblxuY29uc3QgU0VSVklDRV9VUkxfRk9STUFUID0gJzphcGlfdXJsLzpzZXJ2aWNlTmFtZScsXG5cdFNFUlZJQ0VfRU5USVRZX0ZPUk1BVCA9ICc6YXBpX3VybC86c2VydmljZS86aWQnLFxuXHRTRVJWSUNFX0VOVElUWV9SRUxBVElPTl9GT1JNQVQgPSAnOmFwaV91cmwvOnNlcnZpY2UvOmlkLzpyZWxhdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJTZXJ2aWNlPEVudGl0eT4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlRGF0YTogeyBhcGlfdXJsOiBhbnk7IHNlcnZpY2U6IHN0cmluZyB9O1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBzZXJ2aWNlIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCwgc2VydmljZTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYXBpQmFzZVVybCA9IGFwcENvbnRleHQuY29uZmlnc1xuXHRcdFx0LmdldCgnT1pfQVBJX0JBU0VfVVJMJylcblx0XHRcdC5yZXBsYWNlKC9cXC8kL2csICcnKTtcblx0XHR0aGlzLl9iYXNlRGF0YSA9IHsgYXBpX3VybDogYXBpQmFzZVVybCwgc2VydmljZSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlcnZpY2UgbmFtZS5cblx0ICovXG5cdGdldE5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fYmFzZURhdGEuc2VydmljZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIFVSSS5cblx0ICovXG5cdGdldFNlcnZpY2VVUkkoKSB7XG5cdFx0cmV0dXJuIHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZShTRVJWSUNFX1VSTF9GT1JNQVQsIHRoaXMuX2Jhc2VEYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKi9cblx0Z2V0SXRlbVVSSShpZDogYW55KTogc3RyaW5nIHtcblx0XHRjb25zdCBkYXRhID0gYXNzaWduKHsgaWQgfSwgdGhpcy5fYmFzZURhdGEpO1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9FTlRJVFlfRk9STUFULCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGVudGl0eSByZWxhdGlvbiBVUkkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqL1xuXHRnZXRJdGVtUmVsYXRpb25VUkkoaWQ6IHN0cmluZywgcmVsYXRpb246IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGF0YSA9IGFzc2lnbih7IGlkLCByZWxhdGlvbiB9LCB0aGlzLl9iYXNlRGF0YSk7XG5cdFx0cmV0dXJuIHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZShTRVJWSUNFX0VOVElUWV9SRUxBVElPTl9GT1JNQVQsIGRhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gZW50aXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdGFkZFJlcXVlc3QoZm9ybURhdGE6IEZvcm1EYXRhIHwgb2JqZWN0KSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCk7XG5cblx0XHRyZXR1cm4gb3pOZXQ8SU9ab25lQXBpQWRkUmVzcG9uc2U8RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJvZHk6IGZvcm1EYXRhLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRkZWxldGVSZXF1ZXN0KGlkOiBzdHJpbmcpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIG96TmV0PElPWm9uZUFwaURlbGV0ZVJlc3BvbnNlPEVudGl0eT4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdHVwZGF0ZVJlcXVlc3QoaWQ6IHN0cmluZywgZm9ybURhdGE6IGFueSkge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0SXRlbVVSSShpZCk7XG5cblx0XHRyZXR1cm4gb3pOZXQ8SU9ab25lQXBpVXBkYXRlUmVzcG9uc2U8RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQQVRDSCcsXG5cdFx0XHRib2R5OiBmb3JtRGF0YSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGRlbGV0ZUFsbFJlcXVlc3Qob3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMsXG5cdFx0XHRfb3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMgPSB7fTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5tYXggPSBvcHRpb25zLm1heDtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnBhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlO1xuXHRcdH1cblxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRfb3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gb3pOZXQ8SU9ab25lQXBpRGVsZXRlQWxsUmVzcG9uc2U+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdGJvZHk6IF9vcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdHVwZGF0ZUFsbFJlcXVlc3Qob3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMsIGZvcm1EYXRhOiBhbnkpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMsXG5cdFx0XHRfb3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5tYXggPSBvcHRpb25zLm1heDtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnBhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlO1xuXHRcdH1cblxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRfb3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gb3pOZXQ8SU9ab25lQXBpVXBkYXRlQWxsUmVzcG9uc2U+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUEFUQ0gnLFxuXHRcdFx0Ym9keTogX29wdGlvbnMsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbiBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEFsbCByZXF1ZXN0ZWQgcmVsYXRpb25zIG5hbWVzIGFyZSBqb2luZWQgd2l0aCBgfGAuXG5cdCAqIGV4YW1wbGU6IGByZWxhdGlvbjF8cmVsYXRpb24yfHJlbGF0aW9uWGAuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb25zIFRoZSByZWxhdGlvbnMgc3RyaW5nLlxuXHQgKi9cblx0Z2V0UmVxdWVzdChpZDogc3RyaW5nLCByZWxhdGlvbnM6IHN0cmluZyA9ICcnKSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKSxcblx0XHRcdGRhdGE6IGFueSA9IHt9O1xuXG5cdFx0aWYgKHJlbGF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGRhdGEucmVsYXRpb25zID0gcmVsYXRpb25zO1xuXHRcdH1cblxuXHRcdHJldHVybiBvek5ldDxJT1pvbmVBcGlHZXRSZXNwb25zZTxFbnRpdHk+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRib2R5OiBkYXRhLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0Z2V0QWxsUmVxdWVzdChvcHRpb25zOiBJT1pvbmVBcGlSZXF1ZXN0T3B0aW9ucykge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdF9vcHRpb25zOiBJT1pvbmVBcGlSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicpIHtcblx0XHRcdF9vcHRpb25zLm1heCA9IG9wdGlvbnMubWF4O1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucGFnZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdF9vcHRpb25zLnBhZ2UgPSBvcHRpb25zLnBhZ2U7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnJlbGF0aW9ucyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdF9vcHRpb25zLnJlbGF0aW9ucyA9IG9wdGlvbnMucmVsYXRpb25zO1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuY29sbGVjdGlvbiA9PT0gJ3N0cmluZycpIHtcblx0XHRcdF9vcHRpb25zLmNvbGxlY3Rpb24gPSBvcHRpb25zLmNvbGxlY3Rpb247XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm9yZGVyX2J5ID09PSAnc3RyaW5nJykge1xuXHRcdFx0X29wdGlvbnMub3JkZXJfYnkgPSBvcHRpb25zLm9yZGVyX2J5O1xuXHRcdH1cblxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRfb3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gb3pOZXQ8SU9ab25lQXBpR2V0QWxsUmVzcG9uc2U8RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0Ym9keTogX29wdGlvbnMsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIHNpbmdsZSBpdGVtIHJlbGF0aW9uIGZvciBhIGdpdmVuIGVudGl0eSBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZVxuXHQgKi9cblx0Z2V0UmVsYXRpb25SZXF1ZXN0PFI+KGlkOiBzdHJpbmcsIHJlbGF0aW9uOiBzdHJpbmcpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1SZWxhdGlvblVSSShpZCwgcmVsYXRpb24pO1xuXG5cdFx0cmV0dXJuIG96TmV0PElPWm9uZUFwaUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlPFI+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBtdWx0aXBsZSBpdGVtcyByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRnZXRSZWxhdGlvbkl0ZW1zUmVxdWVzdDxSPihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMsXG5cdCkge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0SXRlbVJlbGF0aW9uVVJJKGlkLCByZWxhdGlvbiksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0X29wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0X29wdGlvbnMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG96TmV0PElPWm9uZUFwaUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxSPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0Ym9keTogX29wdGlvbnMsXG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==