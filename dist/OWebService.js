import { assign, isPlainObject, stringPlaceholderReplace } from './utils/Utils';
const SERVICE_URL_FORMAT = ':api_url/:serviceName', SERVICE_ENTITY_FORMAT = ':api_url/:service/:id', SERVICE_ENTITY_RELATION_FORMAT = ':api_url/:service/:id/:relation';
export default class OWebService {
    /**
     * @param appContext The app context.
     * @param service The service name.
     * @param persistentCache To enable persistence data caching.
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
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
        return this.appContext.net(url, {
            method: 'GET',
            body: _options,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFpSGhGLE1BQU0sa0JBQWtCLEdBQUcsdUJBQXVCLEVBQ2pELHFCQUFxQixHQUFHLHVCQUF1QixFQUMvQyw4QkFBOEIsR0FBRyxpQ0FBaUMsQ0FBQztBQUVwRSxNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVc7SUFHL0I7Ozs7T0FJRztJQUNILFlBQStCLFVBQW1CLEVBQUUsT0FBZTtRQUFwQyxlQUFVLEdBQVYsVUFBVSxDQUFTO1FBQ2pELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPO2FBQ25DLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ25ELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDWixPQUFPLHdCQUF3QixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxFQUFPO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxPQUFPLHdCQUF3QixDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGtCQUFrQixD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U0FDN0I7UUFFRCxJQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUMzQjtRQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQXNDLEdBQUcsRUFBRTtZQUNwRSxNQUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBRSxRQUFRO1NBQ2QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7IGFzc2lnbiwgaXNQbGFpbk9iamVjdCwgc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgeyBJT1pvbmVBcGlKU09OIH0gZnJvbSAnLi9vem9uZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VBZGRSZXNwb25zZTxUPiBleHRlbmRzIElPWm9uZUFwaUpTT048YW55PiB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlR2V0UmVzcG9uc2U8VD4gZXh0ZW5kcyBJT1pvbmVBcGlKU09OPGFueT4ge1xuXHRkYXRhOiB7XG5cdFx0aXRlbTogVDtcblx0XHRyZWxhdGlvbnM/OiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZUdldEFsbFJlc3BvbnNlPFQ+IGV4dGVuZHMgSU9ab25lQXBpSlNPTjxhbnk+IHtcblx0ZGF0YToge1xuXHRcdGl0ZW1zOiBUW107XG5cdFx0bWF4PzogbnVtYmVyO1xuXHRcdHBhZ2U/OiBudW1iZXI7XG5cdFx0dG90YWw/OiBudW1iZXI7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VVcGRhdGVSZXNwb25zZTxUPiBleHRlbmRzIElPWm9uZUFwaUpTT048YW55PiB7XG5cdGRhdGE6IHtcblx0XHRpdGVtOiBUO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlVXBkYXRlQWxsUmVzcG9uc2UgZXh0ZW5kcyBJT1pvbmVBcGlKU09OPGFueT4ge1xuXHRkYXRhOiB7XG5cdFx0YWZmZWN0ZWQ6IG51bWJlcjtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZURlbGV0ZVJlc3BvbnNlPFQ+IGV4dGVuZHMgSU9ab25lQXBpSlNPTjxhbnk+IHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdH07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VEZWxldGVBbGxSZXNwb25zZSBleHRlbmRzIElPWm9uZUFwaUpTT048YW55PiB7XG5cdGRhdGE6IHtcblx0XHRhZmZlY3RlZDogbnVtYmVyO1xuXHR9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJ2aWNlR2V0UmVsYXRpb25JdGVtc1Jlc3BvbnNlPFQ+XG5cdGV4dGVuZHMgSU9ab25lQXBpSlNPTjxhbnk+IHtcblx0ZGF0YToge1xuXHRcdGl0ZW1zOiBUW107XG5cdFx0bWF4PzogbnVtYmVyO1xuXHRcdHBhZ2U/OiBudW1iZXI7XG5cdFx0dG90YWw/OiBudW1iZXI7XG5cdFx0cmVsYXRpb25zOiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBhbnk7XG5cdFx0fTtcblx0fTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU2VydmljZUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlPFQ+IGV4dGVuZHMgSU9ab25lQXBpSlNPTjxhbnk+IHtcblx0ZGF0YToge1xuXHRcdGl0ZW06IFQ7XG5cdFx0cmVsYXRpb25zPzoge1xuXHRcdFx0W2tleTogc3RyaW5nXTogYW55O1xuXHRcdH07XG5cdH07XG59XG5cbmV4cG9ydCB0eXBlIHRGaWx0ZXJDb25kaXRpb24gPVxuXHR8ICdlcSdcblx0fCAnbmVxJ1xuXHR8ICdsdCdcblx0fCAnbHRlJ1xuXHR8ICdndCdcblx0fCAnZ3RlJ1xuXHR8ICdpbidcblx0fCAnbm90X2luJ1xuXHR8ICdpc19udWxsJ1xuXHR8ICdpc19ub3RfbnVsbCdcblx0fCAnbGlrZSdcblx0fCAnbm90X2xpa2UnO1xuXG5leHBvcnQgdHlwZSB0RmlsdGVyID1cblx0fCB7XG5cdFx0XHQwOiB0RmlsdGVyQ29uZGl0aW9uO1xuXHRcdFx0MTogc3RyaW5nIHwgc3RyaW5nW10gfCBudW1iZXI7XG5cdFx0XHQyPzogJ29yJyB8ICdhbmQnO1xuXHQgIH1cblx0fCB7XG5cdFx0XHQwOiAnaXNfbnVsbCcgfCAnaXNfbm90X251bGwnO1xuXHRcdFx0MT86ICdvcicgfCAnYW5kJztcblx0ICB9O1xuXG5leHBvcnQgdHlwZSB0RmlsdGVyc01hcCA9IHsgW2tleTogc3RyaW5nXTogdEZpbHRlcltdIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcnZpY2VSZXF1ZXN0T3B0aW9ucyB7XG5cdGRhdGE/OiBhbnk7XG5cdGZpbHRlcnM/OiB0RmlsdGVyc01hcDtcblx0cmVsYXRpb25zPzogc3RyaW5nIHwgc3RyaW5nW107XG5cdGNvbGxlY3Rpb24/OiBzdHJpbmc7XG5cdG9yZGVyX2J5Pzogc3RyaW5nO1xuXHRtYXg/OiBudW1iZXI7XG5cdHBhZ2U/OiBudW1iZXI7XG59XG5cbmNvbnN0IFNFUlZJQ0VfVVJMX0ZPUk1BVCA9ICc6YXBpX3VybC86c2VydmljZU5hbWUnLFxuXHRTRVJWSUNFX0VOVElUWV9GT1JNQVQgPSAnOmFwaV91cmwvOnNlcnZpY2UvOmlkJyxcblx0U0VSVklDRV9FTlRJVFlfUkVMQVRJT05fRk9STUFUID0gJzphcGlfdXJsLzpzZXJ2aWNlLzppZC86cmVsYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViU2VydmljZTxUPiB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VEYXRhOiB7IGFwaV91cmw6IGFueTsgc2VydmljZTogc3RyaW5nIH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBDb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICogQHBhcmFtIHNlcnZpY2UgVGhlIHNlcnZpY2UgbmFtZS5cblx0ICogQHBhcmFtIHBlcnNpc3RlbnRDYWNoZSBUbyBlbmFibGUgcGVyc2lzdGVuY2UgZGF0YSBjYWNoaW5nLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHAsIHNlcnZpY2U6IHN0cmluZykge1xuXHRcdGNvbnN0IGFwaUJhc2VVcmwgPSBhcHBDb250ZXh0LmNvbmZpZ3Ncblx0XHRcdC5nZXQoJ09aX0FQSV9CQVNFX1VSTCcpXG5cdFx0XHQucmVwbGFjZSgvXFwvJC9nLCAnJyk7XG5cdFx0dGhpcy5fYmFzZURhdGEgPSB7IGFwaV91cmw6IGFwaUJhc2VVcmwsIHNlcnZpY2UgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX2Jhc2VEYXRhLnNlcnZpY2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBVUkkuXG5cdCAqL1xuXHRnZXRTZXJ2aWNlVVJJKCkge1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9VUkxfRk9STUFULCB0aGlzLl9iYXNlRGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICovXG5cdGdldEl0ZW1VUkkoaWQ6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGF0YSA9IGFzc2lnbih7IGlkIH0sIHRoaXMuX2Jhc2VEYXRhKTtcblx0XHRyZXR1cm4gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKFNFUlZJQ0VfRU5USVRZX0ZPUk1BVCwgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgcmVsYXRpb24gVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbVJlbGF0aW9uVVJJKGlkOiBzdHJpbmcsIHJlbGF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRhdGEgPSBhc3NpZ24oeyBpZCwgcmVsYXRpb24gfSwgdGhpcy5fYmFzZURhdGEpO1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9FTlRJVFlfUkVMQVRJT05fRk9STUFULCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHRhZGRSZXF1ZXN0KGZvcm1EYXRhOiBGb3JtRGF0YSB8IG9iamVjdCkge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SVNlcnZpY2VBZGRSZXNwb25zZTxUPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJvZHk6IGZvcm1EYXRhLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRkZWxldGVSZXF1ZXN0KGlkOiBzdHJpbmcpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SVNlcnZpY2VEZWxldGVSZXNwb25zZTxUPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSBmb3JtRGF0YVxuXHQgKi9cblx0dXBkYXRlUmVxdWVzdChpZDogc3RyaW5nLCBmb3JtRGF0YTogYW55KSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKTtcblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElTZXJ2aWNlVXBkYXRlUmVzcG9uc2U8VD4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUEFUQ0gnLFxuXHRcdFx0Ym9keTogZm9ybURhdGEsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRkZWxldGVBbGxSZXF1ZXN0KG9wdGlvbnM6IElTZXJ2aWNlUmVxdWVzdE9wdGlvbnMpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMsXG5cdFx0XHRfb3B0aW9uczogSVNlcnZpY2VSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdF9vcHRpb25zLm1heCA9IG9wdGlvbnMubWF4O1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucGFnZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdC8vIHdpbGwgYmUgaWdub3JlZCBieSBPJ1pvbmVcblx0XHRcdF9vcHRpb25zLnBhZ2UgPSBvcHRpb25zLnBhZ2U7XG5cdFx0fVxuXG5cdFx0aWYgKGlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdF9vcHRpb25zLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElTZXJ2aWNlRGVsZXRlQWxsUmVzcG9uc2U+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdGJvZHk6IF9vcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdHVwZGF0ZUFsbFJlcXVlc3Qob3B0aW9uczogSVNlcnZpY2VSZXF1ZXN0T3B0aW9ucywgZm9ybURhdGE6IGFueSkge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdF9vcHRpb25zOiBJU2VydmljZVJlcXVlc3RPcHRpb25zID0gZm9ybURhdGE7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0X29wdGlvbnMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SVNlcnZpY2VVcGRhdGVBbGxSZXNwb25zZT4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQQVRDSCcsXG5cdFx0XHRib2R5OiBfb3B0aW9ucyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQWxsIHJlcXVlc3RlZCByZWxhdGlvbnMgbmFtZXMgYXJlIGpvaW5lZCB3aXRoIGB8YC5cblx0ICogZXhhbXBsZTogYHJlbGF0aW9uMXxyZWxhdGlvbjJ8cmVsYXRpb25YYC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbnMgVGhlIHJlbGF0aW9ucyBzdHJpbmcuXG5cdCAqL1xuXHRnZXRSZXF1ZXN0KGlkOiBzdHJpbmcsIHJlbGF0aW9uczogc3RyaW5nID0gJycpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpLFxuXHRcdFx0ZGF0YTogYW55ID0ge307XG5cblx0XHRpZiAocmVsYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0ZGF0YS5yZWxhdGlvbnMgPSByZWxhdGlvbnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SVNlcnZpY2VHZXRSZXNwb25zZTxUPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0Ym9keTogZGF0YSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGdldEFsbFJlcXVlc3Qob3B0aW9uczogSVNlcnZpY2VSZXF1ZXN0T3B0aW9ucykge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdF9vcHRpb25zOiBJU2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucmVsYXRpb25zID09PSAnc3RyaW5nJykge1xuXHRcdFx0X29wdGlvbnMucmVsYXRpb25zID0gb3B0aW9ucy5yZWxhdGlvbnM7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uID09PSAnc3RyaW5nJykge1xuXHRcdFx0X29wdGlvbnMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMub3JkZXJfYnkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRfb3B0aW9ucy5vcmRlcl9ieSA9IG9wdGlvbnMub3JkZXJfYnk7XG5cdFx0fVxuXG5cdFx0aWYgKGlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdF9vcHRpb25zLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElTZXJ2aWNlR2V0QWxsUmVzcG9uc2U8VD4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGJvZHk6IF9vcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBzaW5nbGUgaXRlbSByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWVcblx0ICovXG5cdGdldFJlbGF0aW9uUmVxdWVzdDxSPihpZDogc3RyaW5nLCByZWxhdGlvbjogc3RyaW5nKSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRJdGVtUmVsYXRpb25VUkkoaWQsIHJlbGF0aW9uKTtcblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElTZXJ2aWNlR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8Uj4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIG11bHRpcGxlIGl0ZW1zIHJlbGF0aW9uIGZvciBhIGdpdmVuIGVudGl0eSBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbiBUaGUgcmVsYXRpb24gbmFtZS5cblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGdldFJlbGF0aW9uSXRlbXNSZXF1ZXN0PFI+KFxuXHRcdGlkOiBzdHJpbmcsXG5cdFx0cmVsYXRpb246IHN0cmluZyxcblx0XHRvcHRpb25zOiBJU2VydmljZVJlcXVlc3RPcHRpb25zLFxuXHQpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1SZWxhdGlvblVSSShpZCwgcmVsYXRpb24pLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdF9vcHRpb25zOiBJU2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0X29wdGlvbnMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SVNlcnZpY2VHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8Uj4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGJvZHk6IF9vcHRpb25zLFxuXHRcdH0pO1xuXHR9XG59XG4iXX0=