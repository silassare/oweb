import { cleanRequestOptions, } from './ozone';
export default class OWebService {
    /**
     * OWebService constructor.
     *
     * @param _appContext The app context.
     * @param service The service name.
     */
    constructor(_appContext, service) {
        this._appContext = _appContext;
        this.service = service;
    }
    /**
     * Returns the service name.
     */
    getName() {
        return this.service;
    }
    /**
     * Adds an entity.
     *
     * @param formData
     */
    addRequest(formData) {
        const oz = this._appContext.oz, url = oz.getServiceURI(this.service);
        return oz.request(url, {
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
        const oz = this._appContext.oz, url = oz.getItemURI(this.service, id);
        return oz.request(url, {
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
        const oz = this._appContext.oz, url = oz.getItemURI(this.service, id);
        return oz.request(url, {
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
        const oz = this._appContext.oz, url = oz.getServiceURI(this.service);
        return oz.request(url, {
            method: 'DELETE',
            params: cleanRequestOptions(options),
        });
    }
    /**
     * Updates all entities.
     *
     * @param options
     */
    updateAllRequest(options) {
        const oz = this._appContext.oz, url = oz.getServiceURI(this.service);
        return oz.request(url, {
            method: 'PATCH',
            body: cleanRequestOptions(options),
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
        const oz = this._appContext.oz, url = oz.getItemURI(this.service, id), options = {};
        if (relations.length) {
            options.relations = relations;
        }
        return oz.request(url, {
            method: 'GET',
            params: cleanRequestOptions(options),
        });
    }
    /**
     * Gets all entities.
     *
     * @param options
     */
    getAllRequest(options) {
        const oz = this._appContext.oz, url = oz.getServiceURI(this.service);
        return oz.request(url, {
            method: 'GET',
            params: cleanRequestOptions(options),
        });
    }
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationRequest(id, relation) {
        const oz = this._appContext.oz, url = oz.getItemRelationURI(this.service, id, relation);
        return oz.request(url, {
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
        const oz = this._appContext.oz, url = oz.getItemRelationURI(this.service, id, relation);
        return oz.request(url, {
            method: 'GET',
            params: cleanRequestOptions(options),
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQVdOLG1CQUFtQixHQUNuQixNQUFNLFNBQVMsQ0FBQztBQUVqQixNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVc7SUFFL0I7Ozs7O09BS0c7SUFDSCxZQUErQixXQUFvQixFQUFZLE9BQWU7UUFBL0MsZ0JBQVcsR0FBWCxXQUFXLENBQVM7UUFBWSxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQztJQUVsRjs7T0FFRztJQUNILE9BQU87UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsUUFBMkI7UUFDckMsTUFBTSxFQUFFLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQzVCLEdBQUcsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV4QyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQXNCLEdBQUcsRUFBRTtZQUMzQyxNQUFNLEVBQUUsTUFBTTtZQUNkLElBQUksRUFBSSxRQUFRO1NBQ2hCLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsYUFBYSxDQUFDLEVBQVU7UUFDdkIsTUFBTSxFQUFFLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQzVCLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUF5QixHQUFHLEVBQUU7WUFDOUMsTUFBTSxFQUFFLFFBQVE7U0FDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsYUFBYSxDQUFDLEVBQVUsRUFBRSxRQUFhO1FBQ3RDLE1BQU0sRUFBRSxHQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUM1QixHQUFHLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBeUIsR0FBRyxFQUFFO1lBQzlDLE1BQU0sRUFBRSxPQUFPO1lBQ2YsSUFBSSxFQUFJLFFBQVE7U0FDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBb0IsR0FBRyxFQUFFO1lBQ3pDLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7U0FDcEMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQkFBZ0IsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBb0IsR0FBRyxFQUFFO1lBQ3pDLE1BQU0sRUFBRSxPQUFPO1lBQ2YsSUFBSSxFQUFJLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxVQUFVLENBQUMsRUFBVSxFQUFFLFNBQVMsR0FBRyxFQUFFO1FBQ3BDLE1BQU0sRUFBRSxHQUE0QixJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDcEQsR0FBRyxHQUEyQixFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQzdELE9BQU8sR0FBdUIsRUFBRSxDQUFDO1FBRXBDLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNyQixPQUFPLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUM5QjtRQUVELE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBc0IsR0FBRyxFQUFFO1lBQzNDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxPQUEyQjtRQUN4QyxNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBeUIsR0FBRyxFQUFFO1lBQzlDLE1BQU0sRUFBRSxLQUFLO1lBQ2IsTUFBTSxFQUFFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztTQUNwQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxrQkFBa0IsQ0FBSSxFQUFVLEVBQUUsUUFBZ0I7UUFDakQsTUFBTSxFQUFFLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQzVCLEdBQUcsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFM0QsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUE2QixHQUFHLEVBQUU7WUFDbEQsTUFBTSxFQUFFLEtBQUs7U0FDYixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsdUJBQXVCLENBQ3RCLEVBQVUsRUFDVixRQUFnQixFQUNoQixPQUEyQjtRQUUzQixNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUzRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQThCLEdBQUcsRUFBRTtZQUNuRCxNQUFNLEVBQUUsS0FBSztZQUNiLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7U0FDcEMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7XG5cdE9BcGlBZGRKU09OLFxuXHRPQXBpRGVsZXRlQWxsSlNPTixcblx0T0FwaURlbGV0ZUpTT04sXG5cdE9BcGlHZXRBbGxKU09OLFxuXHRPQXBpR2V0UmVsYXRpb25JdGVtSlNPTixcblx0T0FwaUdldFJlbGF0aW9uSXRlbXNKU09OLFxuXHRPQXBpR2V0SlNPTixcblx0T0FwaVJlcXVlc3RPcHRpb25zLFxuXHRPQXBpVXBkYXRlQWxsSlNPTixcblx0T0FwaVVwZGF0ZUpTT04sXG5cdGNsZWFuUmVxdWVzdE9wdGlvbnMsXG59IGZyb20gJy4vb3pvbmUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViU2VydmljZTxFbnRpdHk+IHtcblxuXHQvKipcblx0ICogT1dlYlNlcnZpY2UgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBfYXBwQ29udGV4dCBUaGUgYXBwIGNvbnRleHQuXG5cdCAqIEBwYXJhbSBzZXJ2aWNlIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgX2FwcENvbnRleHQ6IE9XZWJBcHAsIHByb3RlY3RlZCBzZXJ2aWNlOiBzdHJpbmcpIHt9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlcnZpY2UgbmFtZS5cblx0ICovXG5cdGdldE5hbWUoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5zZXJ2aWNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYW4gZW50aXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybURhdGFcblx0ICovXG5cdGFkZFJlcXVlc3QoZm9ybURhdGE6IEZvcm1EYXRhIHwgb2JqZWN0KSB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0U2VydmljZVVSSSh0aGlzLnNlcnZpY2UpO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUFkZEpTT048RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdGJvZHkgIDogZm9ybURhdGEsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICovXG5cdGRlbGV0ZVJlcXVlc3QoaWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG96ICA9IHRoaXMuX2FwcENvbnRleHQub3osXG5cdFx0XHQgIHVybCA9IG96LmdldEl0ZW1VUkkodGhpcy5zZXJ2aWNlLCBpZCk7XG5cblx0XHRyZXR1cm4gb3oucmVxdWVzdDxPQXBpRGVsZXRlSlNPTjxFbnRpdHk+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0RFTEVURScsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHR1cGRhdGVSZXF1ZXN0KGlkOiBzdHJpbmcsIGZvcm1EYXRhOiBhbnkpIHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRJdGVtVVJJKHRoaXMuc2VydmljZSwgaWQpO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaVVwZGF0ZUpTT048RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQQVRDSCcsXG5cdFx0XHRib2R5ICA6IGZvcm1EYXRhLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0ZGVsZXRlQWxsUmVxdWVzdChvcHRpb25zOiBPQXBpUmVxdWVzdE9wdGlvbnMpIHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRTZXJ2aWNlVVJJKHRoaXMuc2VydmljZSk7XG5cblx0XHRyZXR1cm4gb3oucmVxdWVzdDxPQXBpRGVsZXRlQWxsSlNPTj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0cGFyYW1zOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0dXBkYXRlQWxsUmVxdWVzdChvcHRpb25zOiBPQXBpUmVxdWVzdE9wdGlvbnMpIHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRTZXJ2aWNlVVJJKHRoaXMuc2VydmljZSk7XG5cblx0XHRyZXR1cm4gb3oucmVxdWVzdDxPQXBpVXBkYXRlQWxsSlNPTj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdQQVRDSCcsXG5cdFx0XHRib2R5ICA6IGNsZWFuUmVxdWVzdE9wdGlvbnMob3B0aW9ucyksXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhbiBlbnRpdHkgd2l0aCB0aGUgZ2l2ZW4gaWQuXG5cdCAqXG5cdCAqIEFsbCByZXF1ZXN0ZWQgcmVsYXRpb25zIG5hbWVzIGFyZSBqb2luZWQgd2l0aCBgfGAuXG5cdCAqIGV4YW1wbGU6IGByZWxhdGlvbjF8cmVsYXRpb24yfHJlbGF0aW9uWGAuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb25zIFRoZSByZWxhdGlvbnMgc3RyaW5nLlxuXHQgKi9cblx0Z2V0UmVxdWVzdChpZDogc3RyaW5nLCByZWxhdGlvbnMgPSAnJykge1xuXHRcdGNvbnN0IG96ICAgICAgICAgICAgICAgICAgICAgICAgICA9IHRoaXMuX2FwcENvbnRleHQub3osXG5cdFx0XHQgIHVybCAgICAgICAgICAgICAgICAgICAgICAgICA9IG96LmdldEl0ZW1VUkkodGhpcy5zZXJ2aWNlLCBpZCksXG5cdFx0XHQgIG9wdGlvbnM6IE9BcGlSZXF1ZXN0T3B0aW9ucyA9IHt9O1xuXG5cdFx0aWYgKHJlbGF0aW9ucy5sZW5ndGgpIHtcblx0XHRcdG9wdGlvbnMucmVsYXRpb25zID0gcmVsYXRpb25zO1xuXHRcdH1cblxuXHRcdHJldHVybiBvei5yZXF1ZXN0PE9BcGlHZXRKU09OPEVudGl0eT4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHBhcmFtczogY2xlYW5SZXF1ZXN0T3B0aW9ucyhvcHRpb25zKSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGdldEFsbFJlcXVlc3Qob3B0aW9uczogT0FwaVJlcXVlc3RPcHRpb25zKSB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0U2VydmljZVVSSSh0aGlzLnNlcnZpY2UpO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUdldEFsbEpTT048RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0cGFyYW1zOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBzaW5nbGUgaXRlbSByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWVcblx0ICovXG5cdGdldFJlbGF0aW9uUmVxdWVzdDxSPihpZDogc3RyaW5nLCByZWxhdGlvbjogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0SXRlbVJlbGF0aW9uVVJJKHRoaXMuc2VydmljZSwgaWQsIHJlbGF0aW9uKTtcblxuXHRcdHJldHVybiBvei5yZXF1ZXN0PE9BcGlHZXRSZWxhdGlvbkl0ZW1KU09OPFI+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBtdWx0aXBsZSBpdGVtcyByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRnZXRSZWxhdGlvbkl0ZW1zUmVxdWVzdDxSPihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogT0FwaVJlcXVlc3RPcHRpb25zLFxuXHQpIHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRJdGVtUmVsYXRpb25VUkkodGhpcy5zZXJ2aWNlLCBpZCwgcmVsYXRpb24pO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUdldFJlbGF0aW9uSXRlbXNKU09OPFI+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRwYXJhbXM6IGNsZWFuUmVxdWVzdE9wdGlvbnMob3B0aW9ucyksXG5cdFx0fSk7XG5cdH1cbn1cbiJdfQ==