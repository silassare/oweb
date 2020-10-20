import OWebApp from './OWebApp';
import {
	OApiAddJSON,
	OApiDeleteAllJSON,
	OApiDeleteJSON,
	OApiGetAllJSON,
	OApiGetRelationItemJSON,
	OApiGetRelationItemsJSON,
	OApiGetJSON,
	OApiRequestOptions,
	OApiUpdateAllJSON,
	OApiUpdateJSON,
	cleanRequestOptions,
} from './ozone';

export default class OWebService<Entity> {

	/**
	 * OWebService constructor.
	 *
	 * @param _appContext The app context.
	 * @param service The service name.
	 */
	constructor(protected readonly _appContext: OWebApp, protected service: string) {}

	/**
	 * Returns the service name.
	 */
	getName(): string {
		return this.service;
	}

	/**
	 * Adds an entity.
	 *
	 * @param formData
	 */
	addRequest(formData: FormData | object) {
		const oz  = this._appContext.oz,
			  url = oz.getServiceURI(this.service);

		return oz.request<OApiAddJSON<Entity>>(url, {
			method: 'POST',
			body  : formData,
		});
	}

	/**
	 * Deletes the entity with the given id.
	 *
	 * @param id The entity id.
	 */
	deleteRequest(id: string) {
		const oz  = this._appContext.oz,
			  url = oz.getItemURI(this.service, id);

		return oz.request<OApiDeleteJSON<Entity>>(url, {
			method: 'DELETE',
		});
	}

	/**
	 * Updates the entity with the given id.
	 *
	 * @param id The entity id.
	 * @param formData
	 */
	updateRequest(id: string, formData: any) {
		const oz  = this._appContext.oz,
			  url = oz.getItemURI(this.service, id);

		return oz.request<OApiUpdateJSON<Entity>>(url, {
			method: 'PATCH',
			body  : formData,
		});
	}

	/**
	 * Deletes all entities.
	 *
	 * @param options
	 */
	deleteAllRequest(options: OApiRequestOptions) {
		const oz  = this._appContext.oz,
			  url = oz.getServiceURI(this.service);

		return oz.request<OApiDeleteAllJSON>(url, {
			method: 'DELETE',
			params: cleanRequestOptions(options),
		});
	}

	/**
	 * Updates all entities.
	 *
	 * @param options
	 */
	updateAllRequest(options: OApiRequestOptions) {
		const oz  = this._appContext.oz,
			  url = oz.getServiceURI(this.service);

		return oz.request<OApiUpdateAllJSON>(url, {
			method: 'PATCH',
			body  : cleanRequestOptions(options),
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
	getRequest(id: string, relations = '') {
		const oz                          = this._appContext.oz,
			  url                         = oz.getItemURI(this.service, id),
			  options: OApiRequestOptions = {};

		if (relations.length) {
			options.relations = relations;
		}

		return oz.request<OApiGetJSON<Entity>>(url, {
			method: 'GET',
			params: cleanRequestOptions(options),
		});
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 */
	getAllRequest(options: OApiRequestOptions) {
		const oz  = this._appContext.oz,
			  url = oz.getServiceURI(this.service);

		return oz.request<OApiGetAllJSON<Entity>>(url, {
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
	getRelationRequest<R>(id: string, relation: string) {
		const oz  = this._appContext.oz,
			  url = oz.getItemRelationURI(this.service, id, relation);

		return oz.request<OApiGetRelationItemJSON<R>>(url, {
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
	getRelationItemsRequest<R>(
		id: string,
		relation: string,
		options: OApiRequestOptions,
	) {
		const oz  = this._appContext.oz,
			  url = oz.getItemRelationURI(this.service, id, relation);

		return oz.request<OApiGetRelationItemsJSON<R>>(url, {
			method: 'GET',
			params: cleanRequestOptions(options),
		});
	}
}
