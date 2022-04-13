import OWebApp from './OWebApp';
import {
	OApiAddResponse,
	OApiDeleteAllResponse,
	OApiDeleteResponse,
	OApiGetAllResponse,
	OApiGetRelationItemResponse,
	OApiGetPaginatedRelationItemsResponse,
	OApiGetResponse,
	OApiServiceRequestOptions,
	OApiUpdateAllResponse,
	OApiUpdateResponse,
	cleanRequestOptions,
	OApiResponse,
} from './ozone';
import OWebXHR from './OWebXHR';
import { ONetRequestBody, ONetRequestOptions } from './OWebNet';

export default class OWebService<Entity> {
	/**
	 * OWebService constructor.
	 *
	 * @param _appContext The app context.
	 * @param name The service name.
	 */
	constructor(
		protected readonly _appContext: OWebApp,
		protected name: string
	) {}

	/**
	 * Make request to a specific endpoint using this service as base url.
	 */
	request<Response extends OApiResponse<any>>(
		path: string,
		options?: Partial<ONetRequestOptions<Response>>
	): OWebXHR<Response> {
		const oz = this._appContext.oz,
			url = oz.toAbsoluteURI(this.name, path);

		return oz.request(url, options);
	}

	/**
	 * Returns the service name.
	 */
	getName(): string {
		return this.name;
	}

	/**
	 * Adds an entity.
	 *
	 * @param formData
	 */
	addItem(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.name);

		return oz.request<OApiAddResponse<Entity>>(url, {
			method: 'POST',
			body: formData,
		});
	}

	/**
	 * Deletes the entity with the given id.
	 *
	 * @param id The entity id.
	 */
	deleteItem(id: string): OWebXHR<OApiDeleteResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.name, id);

		return oz.request<OApiDeleteResponse<Entity>>(url, {
			method: 'DELETE',
		});
	}

	/**
	 * Updates the entity with the given id.
	 *
	 * @param id The entity id.
	 * @param formData
	 */
	updateItem(
		id: string,
		formData: ONetRequestBody
	): OWebXHR<OApiUpdateResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.name, id);

		return oz.request<OApiUpdateResponse<Entity>>(url, {
			method: 'PATCH',
			body: formData,
		});
	}

	/**
	 * Deletes all entities.
	 *
	 * @param options
	 */
	deleteItems(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiDeleteAllResponse> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.name);

		return oz.request<OApiDeleteAllResponse>(url, {
			method: 'DELETE',
			params: cleanRequestOptions(options),
		});
	}

	/**
	 * Updates all entities.
	 *
	 * @param options
	 */
	updateItems(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiUpdateAllResponse> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.name);

		return oz.request<OApiUpdateAllResponse>(url, {
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
	getItem(id: string, relations = ''): OWebXHR<OApiGetResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.name, id),
			options: OApiServiceRequestOptions = {};

		if (relations.length) {
			options.relations = relations;
		}

		return oz.request<OApiGetResponse<Entity>>(url, {
			method: 'GET',
			params: cleanRequestOptions(options),
		});
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 */
	getItems(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiGetAllResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.name);

		return oz.request<OApiGetAllResponse<Entity>>(url, {
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
	getRelationItem<R>(
		id: string,
		relation: string
	): OWebXHR<OApiGetRelationItemResponse<R>> {
		const oz = this._appContext.oz,
			url = oz.getItemRelationURI(this.name, id, relation);

		return oz.request<OApiGetRelationItemResponse<R>>(url, {
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
	getRelationItems<R>(
		id: string,
		relation: string,
		options: OApiServiceRequestOptions
	): OWebXHR<OApiGetPaginatedRelationItemsResponse<R>> {
		const oz = this._appContext.oz,
			url = oz.getItemRelationURI(this.name, id, relation);

		return oz.request<OApiGetPaginatedRelationItemsResponse<R>>(url, {
			method: 'GET',
			params: cleanRequestOptions(options),
		});
	}
}
