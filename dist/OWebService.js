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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFjaEYsTUFBTSxrQkFBa0IsR0FBRyx1QkFBdUIsRUFDakQscUJBQXFCLEdBQUcsdUJBQXVCLEVBQy9DLDhCQUE4QixHQUFHLGlDQUFpQyxDQUFDO0FBRXBFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBVztJQUcvQjs7OztPQUlHO0lBQ0gsWUFBK0IsVUFBbUIsRUFBRSxPQUFlO1FBQXBDLGVBQVUsR0FBVixVQUFVLENBQVM7UUFDakQsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU87YUFDbkMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO2FBQ3RCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLE9BQU8sd0JBQXdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFDLEVBQU87UUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sd0JBQXdCLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCLENBQUMsRUFBVSxFQUFFLFFBQWdCO1FBQzlDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsT0FBTyx3QkFBd0IsQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxRQUEyQjtRQUNyQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFakMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBMEIsR0FBRyxFQUFFO1lBQ3hELE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFFLFFBQVE7U0FDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxFQUFVO1FBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFaEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBNkIsR0FBRyxFQUFFO1lBQzNELE1BQU0sRUFBRSxRQUFRO1NBQ2hCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGFBQWEsQ0FBQyxFQUFVLEVBQUUsUUFBYTtRQUN0QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWhDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQTZCLEdBQUcsRUFBRTtZQUMzRCxNQUFNLEVBQUUsT0FBTztZQUNmLElBQUksRUFBRSxRQUFRO1NBQ2QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxPQUFnQztRQUNoRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQy9CLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxFQUN6QixRQUFRLEdBQTRCLEVBQUUsQ0FBQztRQUV4QyxJQUFJLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDcEMsNEJBQTRCO1lBQzVCLFFBQVEsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztTQUMzQjtRQUNELElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUNyQyw0QkFBNEI7WUFDNUIsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDM0I7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUE2QixHQUFHLEVBQUU7WUFDM0QsTUFBTSxFQUFFLFFBQVE7WUFDaEIsSUFBSSxFQUFFLFFBQVE7U0FDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxnQkFBZ0IsQ0FBQyxPQUFnQyxFQUFFLFFBQWE7UUFDL0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUMvQixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFDekIsUUFBUSxHQUE0QixRQUFRLENBQUM7UUFFOUMsSUFBSSxPQUFPLE9BQU8sQ0FBQyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3BDLDRCQUE0QjtZQUM1QixRQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7U0FDM0I7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDckMsNEJBQTRCO1lBQzVCLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztTQUM3QjtRQUVELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzNCO1FBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBNkIsR0FBRyxFQUFFO1lBQzNELE1BQU0sRUFBRSxPQUFPO1lBQ2YsSUFBSSxFQUFFLFFBQVE7U0FDZCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxVQUFVLENBQUMsRUFBVSxFQUFFLFlBQW9CLEVBQUU7UUFDNUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFDOUIsSUFBSSxHQUFRLEVBQUUsQ0FBQztRQUVoQixJQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDM0I7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUEwQixHQUFHLEVBQUU7WUFDeEQsTUFBTSxFQUFFLEtBQUs7WUFDYixJQUFJLEVBQUUsSUFBSTtTQUNWLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLE9BQWdDO1FBQzdDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFDL0IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQ3pCLFFBQVEsR0FBNEIsRUFBRSxDQUFDO1FBRXhDLElBQUksT0FBTyxPQUFPLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUNwQyxRQUFRLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7U0FDM0I7UUFDRCxJQUFJLE9BQU8sT0FBTyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDckMsUUFBUSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQzdCO1FBRUQsSUFBSSxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssUUFBUSxFQUFFO1lBQzFDLFFBQVEsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUN2QztRQUNELElBQUksT0FBTyxPQUFPLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRTtZQUMzQyxRQUFRLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7U0FDekM7UUFFRCxJQUFJLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDekMsUUFBUSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1NBQ3JDO1FBRUQsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDM0I7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUE2QixHQUFHLEVBQUU7WUFDM0QsTUFBTSxFQUFFLEtBQUs7WUFDYixJQUFJLEVBQUUsUUFBUTtTQUNkLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGtCQUFrQixDQUFJLEVBQVUsRUFBRSxRQUFnQjtRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRWxELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQXNDLEdBQUcsRUFBRTtZQUNwRSxNQUFNLEVBQUUsS0FBSztTQUNiLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCx1QkFBdUIsQ0FDdEIsRUFBVSxFQUNWLFFBQWdCLEVBQ2hCLE9BQWdDO1FBRWhDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQ2hELE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxFQUN6QixRQUFRLEdBQTRCLEVBQUUsQ0FBQztRQUV4QyxJQUFJLE9BQU8sT0FBTyxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7WUFDcEMsUUFBUSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1NBQzNCO1FBQ0QsSUFBSSxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ3JDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztTQUM3QjtRQUVELElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzNCLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzNCO1FBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBdUMsR0FBRyxFQUFFO1lBQ3JFLE1BQU0sRUFBRSxLQUFLO1lBQ2IsSUFBSSxFQUFFLFFBQVE7U0FDZCxDQUFDLENBQUM7SUFDSixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkFwcCBmcm9tICcuL09XZWJBcHAnO1xuaW1wb3J0IHsgYXNzaWduLCBpc1BsYWluT2JqZWN0LCBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UgfSBmcm9tICcuL3V0aWxzL1V0aWxzJztcbmltcG9ydCB7XG5cdElPWm9uZUFwaUFkZFJlc3BvbnNlLFxuXHRJT1pvbmVBcGlEZWxldGVSZXNwb25zZSxcblx0SU9ab25lQXBpVXBkYXRlUmVzcG9uc2UsXG5cdElPWm9uZUFwaURlbGV0ZUFsbFJlc3BvbnNlLFxuXHRJT1pvbmVBcGlVcGRhdGVBbGxSZXNwb25zZSxcblx0SU9ab25lQXBpR2V0UmVzcG9uc2UsXG5cdElPWm9uZUFwaUdldEFsbFJlc3BvbnNlLFxuXHRJT1pvbmVBcGlHZXRSZWxhdGlvbkl0ZW1SZXNwb25zZSxcblx0SU9ab25lQXBpR2V0UmVsYXRpb25JdGVtc1Jlc3BvbnNlLFxuXHRJT1pvbmVBcGlSZXF1ZXN0T3B0aW9ucyxcbn0gZnJvbSAnLi9vem9uZSc7XG5cbmNvbnN0IFNFUlZJQ0VfVVJMX0ZPUk1BVCA9ICc6YXBpX3VybC86c2VydmljZU5hbWUnLFxuXHRTRVJWSUNFX0VOVElUWV9GT1JNQVQgPSAnOmFwaV91cmwvOnNlcnZpY2UvOmlkJyxcblx0U0VSVklDRV9FTlRJVFlfUkVMQVRJT05fRk9STUFUID0gJzphcGlfdXJsLzpzZXJ2aWNlLzppZC86cmVsYXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViU2VydmljZTxUPiB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VEYXRhOiB7IGFwaV91cmw6IGFueTsgc2VydmljZTogc3RyaW5nIH07XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBDb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICogQHBhcmFtIHNlcnZpY2UgVGhlIHNlcnZpY2UgbmFtZS5cblx0ICogQHBhcmFtIHBlcnNpc3RlbnRDYWNoZSBUbyBlbmFibGUgcGVyc2lzdGVuY2UgZGF0YSBjYWNoaW5nLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGFwcENvbnRleHQ6IE9XZWJBcHAsIHNlcnZpY2U6IHN0cmluZykge1xuXHRcdGNvbnN0IGFwaUJhc2VVcmwgPSBhcHBDb250ZXh0LmNvbmZpZ3Ncblx0XHRcdC5nZXQoJ09aX0FQSV9CQVNFX1VSTCcpXG5cdFx0XHQucmVwbGFjZSgvXFwvJC9nLCAnJyk7XG5cdFx0dGhpcy5fYmFzZURhdGEgPSB7IGFwaV91cmw6IGFwaUJhc2VVcmwsIHNlcnZpY2UgfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX2Jhc2VEYXRhLnNlcnZpY2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VydmljZSBVUkkuXG5cdCAqL1xuXHRnZXRTZXJ2aWNlVVJJKCkge1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9VUkxfRk9STUFULCB0aGlzLl9iYXNlRGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICovXG5cdGdldEl0ZW1VUkkoaWQ6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgZGF0YSA9IGFzc2lnbih7IGlkIH0sIHRoaXMuX2Jhc2VEYXRhKTtcblx0XHRyZXR1cm4gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKFNFUlZJQ0VfRU5USVRZX0ZPUk1BVCwgZGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBlbnRpdHkgcmVsYXRpb24gVVJJLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKi9cblx0Z2V0SXRlbVJlbGF0aW9uVVJJKGlkOiBzdHJpbmcsIHJlbGF0aW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRhdGEgPSBhc3NpZ24oeyBpZCwgcmVsYXRpb24gfSwgdGhpcy5fYmFzZURhdGEpO1xuXHRcdHJldHVybiBzdHJpbmdQbGFjZWhvbGRlclJlcGxhY2UoU0VSVklDRV9FTlRJVFlfUkVMQVRJT05fRk9STUFULCBkYXRhKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHRhZGRSZXF1ZXN0KGZvcm1EYXRhOiBGb3JtRGF0YSB8IG9iamVjdCkge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0U2VydmljZVVSSSgpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SU9ab25lQXBpQWRkUmVzcG9uc2U8VD4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRib2R5OiBmb3JtRGF0YSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHRoZSBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKi9cblx0ZGVsZXRlUmVxdWVzdChpZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRJdGVtVVJJKGlkKTtcblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElPWm9uZUFwaURlbGV0ZVJlc3BvbnNlPFQ+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0RFTEVURScsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHR1cGRhdGVSZXF1ZXN0KGlkOiBzdHJpbmcsIGZvcm1EYXRhOiBhbnkpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpO1xuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SU9ab25lQXBpVXBkYXRlUmVzcG9uc2U8VD4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUEFUQ0gnLFxuXHRcdFx0Ym9keTogZm9ybURhdGEsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRkZWxldGVBbGxSZXF1ZXN0KG9wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zKSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0X29wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0Ly8gd2lsbCBiZSBpZ25vcmVkIGJ5IE8nWm9uZVxuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAoaXNQbGFpbk9iamVjdChmaWx0ZXJzKSkge1xuXHRcdFx0X29wdGlvbnMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SU9ab25lQXBpRGVsZXRlQWxsUmVzcG9uc2U+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcblx0XHRcdGJvZHk6IF9vcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdHVwZGF0ZUFsbFJlcXVlc3Qob3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMsIGZvcm1EYXRhOiBhbnkpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldFNlcnZpY2VVUkkoKSxcblx0XHRcdGZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMsXG5cdFx0XHRfb3B0aW9uczogSU9ab25lQXBpUmVxdWVzdE9wdGlvbnMgPSBmb3JtRGF0YTtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5tYXggPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5tYXggPSBvcHRpb25zLm1heDtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLnBhZ2UgPT09ICdudW1iZXInKSB7XG5cdFx0XHQvLyB3aWxsIGJlIGlnbm9yZWQgYnkgTydab25lXG5cdFx0XHRfb3B0aW9ucy5wYWdlID0gb3B0aW9ucy5wYWdlO1xuXHRcdH1cblxuXHRcdGlmIChpc1BsYWluT2JqZWN0KGZpbHRlcnMpKSB7XG5cdFx0XHRfb3B0aW9ucy5maWx0ZXJzID0gZmlsdGVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0Lm5ldDxJT1pvbmVBcGlVcGRhdGVBbGxSZXNwb25zZT4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQQVRDSCcsXG5cdFx0XHRib2R5OiBfb3B0aW9ucyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFuIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQWxsIHJlcXVlc3RlZCByZWxhdGlvbnMgbmFtZXMgYXJlIGpvaW5lZCB3aXRoIGB8YC5cblx0ICogZXhhbXBsZTogYHJlbGF0aW9uMXxyZWxhdGlvbjJ8cmVsYXRpb25YYC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqIEBwYXJhbSByZWxhdGlvbnMgVGhlIHJlbGF0aW9ucyBzdHJpbmcuXG5cdCAqL1xuXHRnZXRSZXF1ZXN0KGlkOiBzdHJpbmcsIHJlbGF0aW9uczogc3RyaW5nID0gJycpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1VUkkoaWQpLFxuXHRcdFx0ZGF0YTogYW55ID0ge307XG5cblx0XHRpZiAocmVsYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0ZGF0YS5yZWxhdGlvbnMgPSByZWxhdGlvbnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuYXBwQ29udGV4dC5uZXQ8SU9ab25lQXBpR2V0UmVzcG9uc2U8VD4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdGJvZHk6IGRhdGEsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRnZXRBbGxSZXF1ZXN0KG9wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zKSB7XG5cdFx0Y29uc3QgdXJsID0gdGhpcy5nZXRTZXJ2aWNlVVJJKCksXG5cdFx0XHRmaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLFxuXHRcdFx0X29wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMubWF4ID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMubWF4ID0gb3B0aW9ucy5tYXg7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5wYWdlID09PSAnbnVtYmVyJykge1xuXHRcdFx0X29wdGlvbnMucGFnZSA9IG9wdGlvbnMucGFnZTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucmVsYXRpb25zID09PSAnc3RyaW5nJykge1xuXHRcdFx0X29wdGlvbnMucmVsYXRpb25zID0gb3B0aW9ucy5yZWxhdGlvbnM7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5jb2xsZWN0aW9uID09PSAnc3RyaW5nJykge1xuXHRcdFx0X29wdGlvbnMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMub3JkZXJfYnkgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRfb3B0aW9ucy5vcmRlcl9ieSA9IG9wdGlvbnMub3JkZXJfYnk7XG5cdFx0fVxuXG5cdFx0aWYgKGlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdF9vcHRpb25zLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElPWm9uZUFwaUdldEFsbFJlc3BvbnNlPFQ+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRib2R5OiBfb3B0aW9ucyxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgc2luZ2xlIGl0ZW0gcmVsYXRpb24gZm9yIGEgZ2l2ZW4gZW50aXR5IGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lXG5cdCAqL1xuXHRnZXRSZWxhdGlvblJlcXVlc3Q8Uj4oaWQ6IHN0cmluZywgcmVsYXRpb246IHN0cmluZykge1xuXHRcdGNvbnN0IHVybCA9IHRoaXMuZ2V0SXRlbVJlbGF0aW9uVVJJKGlkLCByZWxhdGlvbik7XG5cblx0XHRyZXR1cm4gdGhpcy5hcHBDb250ZXh0Lm5ldDxJT1pvbmVBcGlHZXRSZWxhdGlvbkl0ZW1SZXNwb25zZTxSPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgbXVsdGlwbGUgaXRlbXMgcmVsYXRpb24gZm9yIGEgZ2l2ZW4gZW50aXR5IGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9uIFRoZSByZWxhdGlvbiBuYW1lLlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0Z2V0UmVsYXRpb25JdGVtc1JlcXVlc3Q8Uj4oXG5cdFx0aWQ6IHN0cmluZyxcblx0XHRyZWxhdGlvbjogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IElPWm9uZUFwaVJlcXVlc3RPcHRpb25zLFxuXHQpIHtcblx0XHRjb25zdCB1cmwgPSB0aGlzLmdldEl0ZW1SZWxhdGlvblVSSShpZCwgcmVsYXRpb24pLFxuXHRcdFx0ZmlsdGVycyA9IG9wdGlvbnMuZmlsdGVycyxcblx0XHRcdF9vcHRpb25zOiBJT1pvbmVBcGlSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zLm1heCA9PT0gJ251bWJlcicpIHtcblx0XHRcdF9vcHRpb25zLm1heCA9IG9wdGlvbnMubWF4O1xuXHRcdH1cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMucGFnZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdF9vcHRpb25zLnBhZ2UgPSBvcHRpb25zLnBhZ2U7XG5cdFx0fVxuXG5cdFx0aWYgKGlzUGxhaW5PYmplY3QoZmlsdGVycykpIHtcblx0XHRcdF9vcHRpb25zLmZpbHRlcnMgPSBmaWx0ZXJzO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmFwcENvbnRleHQubmV0PElPWm9uZUFwaUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxSPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0Ym9keTogX29wdGlvbnMsXG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==