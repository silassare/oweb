import OWebApp from './OWebApp';
import OWebCom, {iComResponse} from './OWebCom';
import OWebKeyStorage from './OWebKeyStorage';
import Utils from './utils/Utils';

export interface iServiceAddResponse<T> extends iComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface iServiceGetResponse<T> extends iComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface iServiceGetAllResponse<T> extends iComResponse {
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

export interface iServiceUpdateResponse<T> extends iComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface iServiceUpdateAllData extends iComResponse {
	data: {
		affected: number;
	};
}

export interface iServiceDeleteResponse<T> extends iComResponse {
	data: {
		item: T;
	};
}

export interface iServiceDeleteAllResponse<T> extends iComResponse {
	data: {
		affected: number;
	};
}

export interface iServiceGetRelationItemsResponse<T> extends iComResponse {
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

export interface iServiceGetRelationItemResponse<T> extends iComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export type tServiceAddSuccess<T> = (response: iServiceAddResponse<T>) => void;
export type tServiceUpdateSuccess<T> = (response: iServiceUpdateResponse<T>) => void;
export type tServiceUpdateAllSuccess<T> = (response: iServiceUpdateAllData) => void;
export type tServiceDeleteSuccess<T> = (response: iServiceDeleteResponse<T>) => void;
export type tServiceDeleteAllSuccess<T> = (response: iServiceDeleteAllResponse<T>) => void;
export type tServiceGetSuccess<T> = (response: iServiceGetResponse<T>, fromCache: boolean) => void;
export type tServiceGetAllSuccess<T> = (response: iServiceGetAllResponse<T>, fromCache: boolean) => void;
export type tServiceGetRelationSuccess<T> = (response: iServiceGetRelationItemResponse<T>, fromCache: boolean) => void;
export type tServiceGetRelationItemsSuccess<T> = (
	response: iServiceGetRelationItemsResponse<T>,
	fromCache: boolean
) => void;

export type tServiceFail = (response: iComResponse) => void;

export type tServiceRequestOptions = {
	data?: any;
	filters?: any;
	relations?: string;
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;
};

const uri_service         = ':api_url/:service_name',
	  uri_entity          = ':api_url/:service_name/:id',
	  uri_entity_relation = ':api_url/:service_name/:id/:relation';

let toKey = function (query_params: any) {
	let key = JSON.stringify(query_params).replace(/[^a-z0-9]/gi, '');
	return key.length ? key : 'no-params';
};

export default class OWebService<T> {
	private readonly _key_store: OWebKeyStorage;
	private readonly _base_data: { api_url: any; service_name: string };

	/**
	 * @param app_context The app context.
	 * @param service_name The service name.
	 * @param persistent_cache To enable persistence data caching.
	 */
	constructor(protected readonly app_context: OWebApp, service_name: string, persistent_cache: boolean = false) {
		let s_url       = app_context.configs.get('OZ_API_BASE_URL').replace(/\/$/g, '');
		this._base_data = {api_url: s_url, service_name: service_name};
		this._key_store = new OWebKeyStorage(app_context, 'services:' + service_name, persistent_cache);
	}

	/**
	 * Returns the service name.
	 */
	getName(): string {
		return this._base_data.service_name;
	}

	/**
	 * Returns the service URI.
	 */
	getServiceURI() {
		return Utils.stringKeyReplace(uri_service, this._base_data);
	}

	/**
	 * Returns entity URI.
	 *
	 * @param id The entity id.
	 */
	getItemURI(id: any): string {
		let data = Utils.assign({id: id}, this._base_data);
		return Utils.stringKeyReplace(uri_entity, data);
	}

	/**
	 * Returns entity relation URI.
	 *
	 * @param id The entity id.
	 * @param relation The relation name.
	 */
	getItemRelationURI(id: string, relation: string): string {
		let data = Utils.assign({id: id, relation: relation}, this._base_data);
		return Utils.stringKeyReplace(uri_entity_relation, data);
	}

	/**
	 * Cache manager getter.
	 */
	getCacheManager(): OWebKeyStorage {
		return this._key_store;
	}

	/**
	 * Adds an entity.
	 *
	 * @param formData
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	addRequest(formData: any, success: tServiceAddSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let url                                 = this.getServiceURI(),
			req_options: tServiceRequestOptions = formData;

		return this.app_context.request(
			'POST',
			url,
			req_options,
			(response: iComResponse) => {
				success(response as any);
			},
			fail,
			freeze
		);
	}

	/**
	 * Deletes the entity with the given id.
	 *
	 * @param id The entity id.
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	deleteRequest(id: string, success: tServiceDeleteSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let m   = this,
			url = this.getItemURI(id);

		return this.app_context.request(
			'DELETE',
			url,
			null,
			(response: iComResponse) => {
				m.getCacheManager().removeItem(id);
				success(response as any);
			},
			fail,
			freeze
		);
	}

	/**
	 * Updates the entity with the given id.
	 *
	 * @param id The entity id.
	 * @param formData
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	updateRequest(
		id: string,
		formData: any,
		success: tServiceUpdateSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false
	): OWebCom {
		let url                                 = this.getItemURI(id),
			req_options: tServiceRequestOptions = formData;

		return this.app_context.request(
			'PATCH',
			url,
			req_options,
			(response: iComResponse) => {
				success(response as any);
			},
			fail,
			freeze
		);
	}

	/**
	 * Deletes all entities.
	 *
	 * @param options
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	deleteAllRequest(
		options: tServiceRequestOptions,
		success: tServiceDeleteAllSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false
	): OWebCom {
		let url                                 = this.getServiceURI(),
			filters                             = options.filters,
			req_options: tServiceRequestOptions = {};

		if (typeof options['max'] === 'number') {
			// will be ignored by O'Zone
			req_options['max'] = options['max'];
		}
		if (typeof options['page'] === 'number') {
			// will be ignored by O'Zone
			req_options['page'] = options['page'];
		}

		if (Utils.isPlainObject(filters)) {
			req_options['filters'] = filters;
		}

		return this.app_context.request(
			'DELETE',
			url,
			req_options,
			(response: iComResponse) => {
				success(response as any);
			},
			fail,
			freeze
		);
	}

	/**
	 * Updates all entities.
	 *
	 * @param options
	 * @param formData
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	updateAllRequest(
		options: tServiceRequestOptions,
		formData: any,
		success: tServiceUpdateAllSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false
	): OWebCom {
		let url                                 = this.getServiceURI(),
			filters                             = options.filters,
			req_options: tServiceRequestOptions = formData;

		if (typeof options['max'] === 'number') {
			// will be ignored by O'Zone
			req_options['max'] = options['max'];
		}
		if (typeof options['page'] === 'number') {
			// will be ignored by O'Zone
			req_options['page'] = options['page'];
		}

		if (Utils.isPlainObject(filters)) {
			req_options['filters'] = filters;
		}

		return this.app_context.request(
			'PATCH',
			url,
			req_options,
			(response: iComResponse) => {
				success(response as any);
			},
			fail,
			freeze
		);
	}

	/**
	 * Gets an entity with the given id.
	 *
	 * All requested relations names are joined with `|`.
	 * example: `relation1|relation2|relationX`.
	 *
	 * @param id The entity id.
	 * @param relations The relations string.
	 * @param success
	 * @param fail
	 * @param freeze
	 * @param load_cache_first
	 */
	getRequest(
		id: string,
		relations: string         = '',
		success: tServiceGetSuccess<T>,
		fail: tServiceFail,
		freeze: boolean           = false,
		load_cache_first: boolean = false
	): OWebCom {
		let m         = this,
			url       = this.getItemURI(id),
			cache_id  = id,
			data: any = {},
			__cached;

		if (relations.length) {
			data.relations = relations;
		}

		if (load_cache_first) {
			__cached = m.getCacheManager().getItem(cache_id);

			if (__cached) {
				success(__cached, true);
				freeze = false;
			}
		}

		return this.app_context.request(
			'GET',
			url,
			data,
			(response: iComResponse) => {
				m.getCacheManager().setItem(id, response);
				success(response as any, false);
			},
			(response: iComResponse) => {
				if ((__cached = m.getCacheManager().getItem(cache_id))) {
					success(__cached, true);
				} else {
					fail(response);
				}
			},
			freeze
		);
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 * @param success
	 * @param fail
	 * @param freeze
	 * @param force_cache
	 * @param load_cache_first
	 */
	getAllRequest(
		options: tServiceRequestOptions,
		success: tServiceGetAllSuccess<T>,
		fail: tServiceFail,
		freeze: boolean           = false,
		force_cache: boolean      = false,
		load_cache_first: boolean = false
	): OWebCom {
		let m                                   = this,
			url                                 = this.getServiceURI(),
			filters                             = options['filters'],
			req_options: tServiceRequestOptions = {},
			__cached;

		if (typeof options['max'] === 'number') {
			req_options['max'] = options['max'];
		}
		if (typeof options['page'] === 'number') {
			req_options['page'] = options['page'];
		}

		if (typeof options.relations === 'string') {
			req_options['relations'] = options.relations;
		}
		if (typeof options.collection === 'string') {
			req_options['collection'] = options.collection;
		}

		if (typeof options.order_by === 'string') {
			req_options['order_by'] = options.order_by;
		}

		if (Utils.isPlainObject(filters)) {
			req_options['filters'] = filters;
		}

		let cache_id = toKey(req_options);

		if (force_cache && load_cache_first) {
			__cached = m.getCacheManager().getItem(cache_id);

			if (__cached) {
				success(__cached, true);
				freeze = false;
			}
		}

		return this.app_context.request(
			'GET',
			url,
			req_options,
			(response: iComResponse) => {
				force_cache && m.getCacheManager().setItem(cache_id, response);
				success(response as any, false);
			},
			(response: iComResponse) => {
				if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
					success(__cached, true);
				} else {
					fail(response);
				}
			},
			freeze
		);
	}

	/**
	 * Gets a single item relation for a given entity id.
	 *
	 * @param id The entity id.
	 * @param relation The relation name
	 * @param success
	 * @param fail
	 * @param freeze
	 * @param force_cache
	 * @param load_cache_first
	 */
	getRelationRequest<R>(
		id: string,
		relation: string,
		success: tServiceGetRelationSuccess<R>,
		fail: tServiceFail,
		freeze: boolean           = false,
		force_cache: boolean      = false,
		load_cache_first: boolean = false
	): OWebCom {
		let m        = this,
			url      = this.getItemRelationURI(id, relation),
			cache_id = toKey({id, relation}),
			__cached;

		if (force_cache && load_cache_first) {
			__cached = this.getCacheManager().getItem(cache_id);

			if (__cached) {
				success(__cached, true);
				freeze = false;
			}
		}

		return this.app_context.request(
			'GET',
			url,
			{},
			function (response: iComResponse) {
				force_cache && m.getCacheManager().setItem(cache_id, response);
				success(response as any, false);
			},
			function (response: iComResponse) {
				if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
					success(__cached, true);
				} else {
					fail(response);
				}
			},
			freeze
		);
	}

	/**
	 * Gets multiple items relation for a given entity id.
	 *
	 * @param id The entity id.
	 * @param relation The relation name.
	 * @param options
	 * @param success
	 * @param fail
	 * @param freeze
	 * @param force_cache
	 * @param load_cache_first
	 */
	getRelationItemsRequest<R>(
		id: string,
		relation: string,
		options: tServiceRequestOptions,
		success: tServiceGetRelationItemsSuccess<R>,
		fail: tServiceFail,
		freeze: boolean           = false,
		force_cache: boolean      = false,
		load_cache_first: boolean = false
	): OWebCom {
		let m                                   = this,
			url                                 = this.getItemRelationURI(id, relation),
			filters                             = options['filters'],
			req_options: tServiceRequestOptions = {};

		if (typeof options['max'] === 'number') {
			req_options['max'] = options['max'];
		}
		if (typeof options['page'] === 'number') {
			req_options['page'] = options['page'];
		}

		if (Utils.isPlainObject(filters)) {
			req_options['filters'] = filters;
		}

		let cache_id = toKey(Utils.assign({relation: relation}, req_options)),
			__cached;

		if (force_cache && load_cache_first) {
			__cached = <iServiceGetRelationItemsResponse<R>>this.getCacheManager().getItem(cache_id);

			if (__cached) {
				success(__cached, true);
				freeze = false;
			}
		}

		return this.app_context.request(
			'GET',
			url,
			req_options,
			function (response: iComResponse) {
				force_cache && m.getCacheManager().setItem(cache_id, response);

				success(response as any, false);
			},
			function (response: iComResponse) {
				if (force_cache && (__cached = m.getCacheManager().getItem(cache_id))) {
					success(__cached, true);
				} else {
					fail(response);
				}
			},
			freeze
		);
	}
}
