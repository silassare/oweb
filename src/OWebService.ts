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
} from './ozone';
import OWebXHR from './OWebXHR';
import { ONetRequestBody } from './OWebNet';

export default class OWebService<Entity> {
	/**
	 * OWebService constructor.
	 *
	 * @param _appContext The app context.
	 * @param service The service name.
	 */
	constructor(
		protected readonly _appContext: OWebApp,
		protected service: string
	) {}

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
	addRequest(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.service);

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
	deleteRequest(id: string): OWebXHR<OApiDeleteResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.service, id);

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
	updateRequest(
		id: string,
		formData: ONetRequestBody
	): OWebXHR<OApiUpdateResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.service, id);

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
	deleteAllRequest(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiDeleteAllResponse> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.service);

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
	updateAllRequest(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiUpdateAllResponse> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.service);

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
	getRequest(id: string, relations = ''): OWebXHR<OApiGetResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getItemURI(this.service, id),
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
	getAllRequest(
		options: OApiServiceRequestOptions
	): OWebXHR<OApiGetAllResponse<Entity>> {
		const oz = this._appContext.oz,
			url = oz.getServiceURI(this.service);

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
	getRelationRequest<R>(
		id: string,
		relation: string
	): OWebXHR<OApiGetRelationItemResponse<R>> {
		const oz = this._appContext.oz,
			url = oz.getItemRelationURI(this.service, id, relation);

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
	getRelationItemsRequest<R>(
		id: string,
		relation: string,
		options: OApiServiceRequestOptions
	): OWebXHR<OApiGetPaginatedRelationItemsResponse<R>> {
		const oz = this._appContext.oz,
			url = oz.getItemRelationURI(this.service, id, relation);

		return oz.request<OApiGetPaginatedRelationItemsResponse<R>>(url, {
			method: 'GET',
			params: cleanRequestOptions(options),
		});
	}
}
