import { cleanRequestOptions, } from './ozone';
export default class OWebService {
    _appContext;
    service;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQVdOLG1CQUFtQixHQUNuQixNQUFNLFNBQVMsQ0FBQztBQUlqQixNQUFNLENBQUMsT0FBTyxPQUFPLFdBQVc7SUFRQTtJQUFnQztJQU4vRDs7Ozs7T0FLRztJQUNILFlBQStCLFdBQW9CLEVBQVksT0FBZTtRQUEvQyxnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUFZLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRWxGOztPQUVHO0lBQ0gsT0FBTztRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUNyQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxRQUF5QjtRQUNuQyxNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBMEIsR0FBRyxFQUFFO1lBQy9DLE1BQU0sRUFBRSxNQUFNO1lBQ2QsSUFBSSxFQUFJLFFBQVE7U0FDaEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxhQUFhLENBQUMsRUFBVTtRQUN2QixNQUFNLEVBQUUsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFDNUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV6QyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQTZCLEdBQUcsRUFBRTtZQUNsRCxNQUFNLEVBQUUsUUFBUTtTQUNoQixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxhQUFhLENBQUMsRUFBVSxFQUFFLFFBQXlCO1FB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NUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUzRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQWtDLEdBQUcsRUFBRTtZQUN2RCxNQUFNLEVBQUUsS0FBSztZQUNiLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7U0FDcEMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCB7XG5cdE9BcGlBZGRSZXNwb25zZSxcblx0T0FwaURlbGV0ZUFsbFJlc3BvbnNlLFxuXHRPQXBpRGVsZXRlUmVzcG9uc2UsXG5cdE9BcGlHZXRBbGxSZXNwb25zZSxcblx0T0FwaUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlLFxuXHRPQXBpR2V0UmVsYXRpb25JdGVtc1Jlc3BvbnNlLFxuXHRPQXBpR2V0UmVzcG9uc2UsXG5cdE9BcGlTZXJ2aWNlUmVxdWVzdE9wdGlvbnMsXG5cdE9BcGlVcGRhdGVBbGxSZXNwb25zZSxcblx0T0FwaVVwZGF0ZVJlc3BvbnNlLFxuXHRjbGVhblJlcXVlc3RPcHRpb25zLFxufSBmcm9tICcuL296b25lJztcbmltcG9ydCBPV2ViWEhSIGZyb20gJy4vT1dlYlhIUic7XG5pbXBvcnQge09OZXRSZXF1ZXN0Qm9keX0gZnJvbSAnLi9PV2ViTmV0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlNlcnZpY2U8RW50aXR5PiB7XG5cblx0LyoqXG5cdCAqIE9XZWJTZXJ2aWNlIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gX2FwcENvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gc2VydmljZSBUaGUgc2VydmljZSBuYW1lLlxuXHQgKi9cblx0Y29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IF9hcHBDb250ZXh0OiBPV2ViQXBwLCBwcm90ZWN0ZWQgc2VydmljZTogc3RyaW5nKSB7fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuc2VydmljZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGVudGl0eS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHRhZGRSZXF1ZXN0KGZvcm1EYXRhOiBPTmV0UmVxdWVzdEJvZHkpOiBPV2ViWEhSPE9BcGlBZGRSZXNwb25zZTxFbnRpdHk+PiB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0U2VydmljZVVSSSh0aGlzLnNlcnZpY2UpO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUFkZFJlc3BvbnNlPEVudGl0eT4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRib2R5ICA6IGZvcm1EYXRhLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGVudGl0eSB3aXRoIHRoZSBnaXZlbiBpZC5cblx0ICpcblx0ICogQHBhcmFtIGlkIFRoZSBlbnRpdHkgaWQuXG5cdCAqL1xuXHRkZWxldGVSZXF1ZXN0KGlkOiBzdHJpbmcpOiBPV2ViWEhSPE9BcGlEZWxldGVSZXNwb25zZTxFbnRpdHk+PiB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0SXRlbVVSSSh0aGlzLnNlcnZpY2UsIGlkKTtcblxuXHRcdHJldHVybiBvei5yZXF1ZXN0PE9BcGlEZWxldGVSZXNwb25zZTxFbnRpdHk+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0RFTEVURScsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIGZvcm1EYXRhXG5cdCAqL1xuXHR1cGRhdGVSZXF1ZXN0KGlkOiBzdHJpbmcsIGZvcm1EYXRhOiBPTmV0UmVxdWVzdEJvZHkpOiBPV2ViWEhSPE9BcGlVcGRhdGVSZXNwb25zZTxFbnRpdHk+PiB7XG5cdFx0Y29uc3Qgb3ogID0gdGhpcy5fYXBwQ29udGV4dC5veixcblx0XHRcdCAgdXJsID0gb3ouZ2V0SXRlbVVSSSh0aGlzLnNlcnZpY2UsIGlkKTtcblxuXHRcdHJldHVybiBvei5yZXF1ZXN0PE9BcGlVcGRhdGVSZXNwb25zZTxFbnRpdHk+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ1BBVENIJyxcblx0XHRcdGJvZHkgIDogZm9ybURhdGEsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBhbGwgZW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRkZWxldGVBbGxSZXF1ZXN0KG9wdGlvbnM6IE9BcGlTZXJ2aWNlUmVxdWVzdE9wdGlvbnMpOiBPV2ViWEhSPE9BcGlEZWxldGVBbGxSZXNwb25zZT4ge1xuXHRcdGNvbnN0IG96ICA9IHRoaXMuX2FwcENvbnRleHQub3osXG5cdFx0XHQgIHVybCA9IG96LmdldFNlcnZpY2VVUkkodGhpcy5zZXJ2aWNlKTtcblxuXHRcdHJldHVybiBvei5yZXF1ZXN0PE9BcGlEZWxldGVBbGxSZXNwb25zZT4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0cGFyYW1zOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYWxsIGVudGl0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0dXBkYXRlQWxsUmVxdWVzdChvcHRpb25zOiBPQXBpU2VydmljZVJlcXVlc3RPcHRpb25zKTogT1dlYlhIUjxPQXBpVXBkYXRlQWxsUmVzcG9uc2U+IHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRTZXJ2aWNlVVJJKHRoaXMuc2VydmljZSk7XG5cblx0XHRyZXR1cm4gb3oucmVxdWVzdDxPQXBpVXBkYXRlQWxsUmVzcG9uc2U+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnUEFUQ0gnLFxuXHRcdFx0Ym9keSAgOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYW4gZW50aXR5IHdpdGggdGhlIGdpdmVuIGlkLlxuXHQgKlxuXHQgKiBBbGwgcmVxdWVzdGVkIHJlbGF0aW9ucyBuYW1lcyBhcmUgam9pbmVkIHdpdGggYHxgLlxuXHQgKiBleGFtcGxlOiBgcmVsYXRpb24xfHJlbGF0aW9uMnxyZWxhdGlvblhgLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGVudGl0eSBpZC5cblx0ICogQHBhcmFtIHJlbGF0aW9ucyBUaGUgcmVsYXRpb25zIHN0cmluZy5cblx0ICovXG5cdGdldFJlcXVlc3QoaWQ6IHN0cmluZywgcmVsYXRpb25zID0gJycpOiBPV2ViWEhSPE9BcGlHZXRSZXNwb25zZTxFbnRpdHk+PiB7XG5cdFx0Y29uc3Qgb3ogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHRoaXMuX2FwcENvbnRleHQub3osXG5cdFx0XHQgIHVybCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBvei5nZXRJdGVtVVJJKHRoaXMuc2VydmljZSwgaWQpLFxuXHRcdFx0ICBvcHRpb25zOiBPQXBpU2VydmljZVJlcXVlc3RPcHRpb25zID0ge307XG5cblx0XHRpZiAocmVsYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0b3B0aW9ucy5yZWxhdGlvbnMgPSByZWxhdGlvbnM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUdldFJlc3BvbnNlPEVudGl0eT4+KHVybCwge1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHBhcmFtczogY2xlYW5SZXF1ZXN0T3B0aW9ucyhvcHRpb25zKSxcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGFsbCBlbnRpdGllcy5cblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGdldEFsbFJlcXVlc3Qob3B0aW9uczogT0FwaVNlcnZpY2VSZXF1ZXN0T3B0aW9ucyk6IE9XZWJYSFI8T0FwaUdldEFsbFJlc3BvbnNlPEVudGl0eT4+IHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRTZXJ2aWNlVVJJKHRoaXMuc2VydmljZSk7XG5cblx0XHRyZXR1cm4gb3oucmVxdWVzdDxPQXBpR2V0QWxsUmVzcG9uc2U8RW50aXR5Pj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0cGFyYW1zOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBzaW5nbGUgaXRlbSByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWVcblx0ICovXG5cdGdldFJlbGF0aW9uUmVxdWVzdDxSPihpZDogc3RyaW5nLCByZWxhdGlvbjogc3RyaW5nKTogT1dlYlhIUjxPQXBpR2V0UmVsYXRpb25JdGVtUmVzcG9uc2U8Uj4+IHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRJdGVtUmVsYXRpb25VUkkodGhpcy5zZXJ2aWNlLCBpZCwgcmVsYXRpb24pO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUdldFJlbGF0aW9uSXRlbVJlc3BvbnNlPFI+Pih1cmwsIHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBtdWx0aXBsZSBpdGVtcyByZWxhdGlvbiBmb3IgYSBnaXZlbiBlbnRpdHkgaWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgZW50aXR5IGlkLlxuXHQgKiBAcGFyYW0gcmVsYXRpb24gVGhlIHJlbGF0aW9uIG5hbWUuXG5cdCAqIEBwYXJhbSBvcHRpb25zXG5cdCAqL1xuXHRnZXRSZWxhdGlvbkl0ZW1zUmVxdWVzdDxSPihcblx0XHRpZDogc3RyaW5nLFxuXHRcdHJlbGF0aW9uOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogT0FwaVNlcnZpY2VSZXF1ZXN0T3B0aW9uc1xuXHQpOiBPV2ViWEhSPE9BcGlHZXRSZWxhdGlvbkl0ZW1zUmVzcG9uc2U8Uj4+IHtcblx0XHRjb25zdCBveiAgPSB0aGlzLl9hcHBDb250ZXh0Lm96LFxuXHRcdFx0ICB1cmwgPSBvei5nZXRJdGVtUmVsYXRpb25VUkkodGhpcy5zZXJ2aWNlLCBpZCwgcmVsYXRpb24pO1xuXG5cdFx0cmV0dXJuIG96LnJlcXVlc3Q8T0FwaUdldFJlbGF0aW9uSXRlbXNSZXNwb25zZTxSPj4odXJsLCB7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0cGFyYW1zOiBjbGVhblJlcXVlc3RPcHRpb25zKG9wdGlvbnMpLFxuXHRcdH0pO1xuXHR9XG59XG4iXX0=