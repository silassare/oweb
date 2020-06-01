import OWebApp from './OWebApp';
import { assign, isPlainObject, stringPlaceholderReplace } from './utils/Utils';
import { IOZoneApiJSON } from './ozone';

export interface IServiceAddResponse<T> extends IOZoneApiJSON<any> {
	data: {
		item: T;
	};
}

export interface IServiceGetResponse<T> extends IOZoneApiJSON<any> {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface IServiceGetAllResponse<T> extends IOZoneApiJSON<any> {
	data: {
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface IServiceUpdateResponse<T> extends IOZoneApiJSON<any> {
	data: {
		item: T;
	};
}

export interface IServiceUpdateAllResponse extends IOZoneApiJSON<any> {
	data: {
		affected: number;
	};
}

export interface IServiceDeleteResponse<T> extends IOZoneApiJSON<any> {
	data: {
		item: T;
	};
}

export interface IServiceDeleteAllResponse extends IOZoneApiJSON<any> {
	data: {
		affected: number;
	};
}

export interface IServiceGetRelationItemsResponse<T>
	extends IOZoneApiJSON<any> {
	data: {
		items: T[];
		max?: number;
		page?: number;
		total?: number;
		relations: {
			[key: string]: any;
		};
	};
}

export interface IServiceGetRelationItemResponse<T> extends IOZoneApiJSON<any> {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export type tFilterCondition =
	| 'eq'
	| 'neq'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'in'
	| 'not_in'
	| 'is_null'
	| 'is_not_null'
	| 'like'
	| 'not_like';

export type tFilter =
	| {
			0: tFilterCondition;
			1: string | string[] | number;
			2?: 'or' | 'and';
	  }
	| {
			0: 'is_null' | 'is_not_null';
			1?: 'or' | 'and';
	  };

export type tFiltersMap = { [key: string]: tFilter[] };

export interface IServiceRequestOptions {
	data?: any;
	filters?: tFiltersMap;
	relations?: string | string[];
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;
}

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

		return this.appContext.net<IServiceAddResponse<T>>(url, {
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

		return this.appContext.net<IServiceDeleteResponse<T>>(url, {
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

		return this.appContext.net<IServiceUpdateResponse<T>>(url, {
			method: 'PATCH',
			body: formData,
		});
	}

	/**
	 * Deletes all entities.
	 *
	 * @param options
	 */
	deleteAllRequest(options: IServiceRequestOptions) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IServiceRequestOptions = {};

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

		return this.appContext.net<IServiceDeleteAllResponse>(url, {
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
	updateAllRequest(options: IServiceRequestOptions, formData: any) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IServiceRequestOptions = formData;

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

		return this.appContext.net<IServiceUpdateAllResponse>(url, {
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

		return this.appContext.net<IServiceGetResponse<T>>(url, {
			method: 'GET',
			body: data,
		});
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 */
	getAllRequest(options: IServiceRequestOptions) {
		const url = this.getServiceURI(),
			filters = options.filters,
			_options: IServiceRequestOptions = {};

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

		return this.appContext.net<IServiceGetAllResponse<T>>(url, {
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

		return this.appContext.net<IServiceGetRelationItemResponse<R>>(url, {
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
		options: IServiceRequestOptions,
	) {
		const url = this.getItemRelationURI(id, relation),
			filters = options.filters,
			_options: IServiceRequestOptions = {};

		if (typeof options.max === 'number') {
			_options.max = options.max;
		}
		if (typeof options.page === 'number') {
			_options.page = options.page;
		}

		if (isPlainObject(filters)) {
			_options.filters = filters;
		}

		return this.appContext.net<IServiceGetRelationItemsResponse<R>>(url, {
			method: 'GET',
			body: _options,
		});
	}
}
