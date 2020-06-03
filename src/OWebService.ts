import OWebApp from './OWebApp';
import { assign, isPlainObject, stringPlaceholderReplace } from './utils/Utils';
import {
	IOZoneApiAddResponse,
	IOZoneApiDeleteResponse,
	IOZoneApiUpdateResponse,
	IOZoneApiDeleteAllResponse,
	IOZoneApiUpdateAllResponse,
	IOZoneApiGetResponse,
	IOZoneApiGetAllResponse,
	IOZoneApiGetRelationItemResponse,
	IOZoneApiGetRelationItemsResponse,
	IOZoneApiRequestOptions,
} from './ozone';

const SERVICE_URL_FORMAT = ':api_url/:serviceName',
	SERVICE_ENTITY_FORMAT = ':api_url/:service/:id',
	SERVICE_ENTITY_RELATION_FORMAT = ':api_url/:service/:id/:relation';

export default class OWebService<T> {
	private readonly _baseData: { api_url: any; service: string };

	/**
	 * @param appContext The app context.
	 * @param service The service name.
	 * @param persistentCache To enable persistence data caching.
	 */
	constructor(protected readonly appContext: OWebApp, service: string) {
		const apiBaseUrl = appContext.configs
			.get('OZ_API_BASE_URL')
			.replace(/\/$/g, '');
		this._baseData = { api_url: apiBaseUrl, service };
	}

	/**
	 * Returns the service name.
	 */
	getName(): string {
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
	getItemURI(id: any): string {
		const data = assign({ id }, this._baseData);
		return stringPlaceholderReplace(SERVICE_ENTITY_FORMAT, data);
	}

	/**
	 * Returns entity relation URI.
	 *
	 * @param id The entity id.
	 * @param relation The relation name.
	 */
	getItemRelationURI(id: string, relation: string): string {
		const data = assign({ id, relation }, this._baseData);
		return stringPlaceholderReplace(SERVICE_ENTITY_RELATION_FORMAT, data);
	}

	/**
	 * Adds an entity.
	 *
	 * @param formData
	 */
	addRequest(formData: FormData | object) {
		const url = this.getServiceURI();

		return this.appContext.net<IOZoneApiAddResponse<T>>(url, {
			method: 'POST',
			body: formData,
		});
	}

	/**
	 * Deletes the entity with the given id.
	 *
	 * @param id The entity id.
	 */
	deleteRequest(id: string) {
		const url = this.getItemURI(id);

		return this.appContext.net<IOZoneApiDeleteResponse<T>>(url, {
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
		const url = this.getItemURI(id);

		return this.appContext.net<IOZoneApiUpdateResponse<T>>(url, {
			method: 'PATCH',
			body: formData,
		});
	}

	/**
	 * Deletes all entities.
	 *
	 * @param options
	 */
	deleteAllRequest(options: IOZoneApiRequestOptions) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IOZoneApiRequestOptions = {};

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

		return this.appContext.net<IOZoneApiDeleteAllResponse>(url, {
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
	updateAllRequest(options: IOZoneApiRequestOptions, formData: any) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IOZoneApiRequestOptions = formData;

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

		return this.appContext.net<IOZoneApiUpdateAllResponse>(url, {
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
	getRequest(id: string, relations: string = '') {
		const url = this.getItemURI(id),
			data: any = {};

		if (relations.length) {
			data.relations = relations;
		}

		return this.appContext.net<IOZoneApiGetResponse<T>>(url, {
			method: 'GET',
			body: data,
		});
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 */
	getAllRequest(options: IOZoneApiRequestOptions) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IOZoneApiRequestOptions = {};

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

		return this.appContext.net<IOZoneApiGetAllResponse<T>>(url, {
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
	getRelationRequest<R>(id: string, relation: string) {
		const url = this.getItemRelationURI(id, relation);

		return this.appContext.net<IOZoneApiGetRelationItemResponse<R>>(url, {
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
		options: IOZoneApiRequestOptions,
	) {
		const url = this.getItemRelationURI(id, relation),
			filters = options.filters,
			_options: IOZoneApiRequestOptions = {};

		if (typeof options.max === 'number') {
			_options.max = options.max;
		}
		if (typeof options.page === 'number') {
			_options.page = options.page;
		}

		if (isPlainObject(filters)) {
			_options.filters = filters;
		}

		return this.appContext.net<IOZoneApiGetRelationItemsResponse<R>>(url, {
			method: 'GET',
			body: _options,
		});
	}
}
