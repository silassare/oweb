import OWebApp from './OWebApp';
import OWebCom, { IComResponse } from './OWebCom';
import OWebKeyStorage from './OWebKeyStorage';
import { assign, isPlainObject, stringPlaceholderReplace } from './utils/Utils';

export interface IServiceAddResponse<T> extends IComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface IServiceGetResponse<T> extends IComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface IServiceGetAllResponse<T> extends IComResponse {
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

export interface IServiceUpdateResponse<T> extends IComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export interface IServiceUpdateAllData extends IComResponse {
	data: {
		affected: number;
	};
}

export interface IServiceDeleteResponse<T> extends IComResponse {
	data: {
		item: T;
	};
}

export interface IServiceDeleteAllResponse<T> extends IComResponse {
	data: {
		affected: number;
	};
}

export interface IServiceGetRelationItemsResponse<T> extends IComResponse {
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

export interface IServiceGetRelationItemResponse<T> extends IComResponse {
	data: {
		item: T;
		relations?: {
			[key: string]: any;
		};
	};
}

export type tServiceAddSuccess<T> = (response: IServiceAddResponse<T>) => void;
export type tServiceUpdateSuccess<T> = (
	response: IServiceUpdateResponse<T>,
) => void;
export type tServiceUpdateAllSuccess<T> = (
	response: IServiceUpdateAllData,
) => void;
export type tServiceDeleteSuccess<T> = (
	response: IServiceDeleteResponse<T>,
) => void;
export type tServiceDeleteAllSuccess<T> = (
	response: IServiceDeleteAllResponse<T>,
) => void;
export type tServiceGetSuccess<T> = (
	response: IServiceGetResponse<T>,
	fromCache: boolean,
) => void;
export type tServiceGetAllSuccess<T> = (
	response: IServiceGetAllResponse<T>,
	fromCache: boolean,
) => void;
export type tServiceGetRelationSuccess<T> = (
	response: IServiceGetRelationItemResponse<T>,
	fromCache: boolean,
) => void;
export type tServiceGetRelationItemsSuccess<T> = (
	response: IServiceGetRelationItemsResponse<T>,
	fromCache: boolean,
) => void;

export type tServiceFail = (response: IComResponse, com: OWebCom) => void;
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

export type tServiceRequestOptions = {
	data?: any;
	filters?: tFiltersMap;
	relations?: string;
	collection?: string;
	order_by?: string;
	max?: number;
	page?: number;
};

const urIService = ':apiUrl/:serviceName',
	uriEntity = ':apiUrl/:serviceName/:id',
	uriEntityRelation = ':apiUrl/:serviceName/:id/:relation',
	toKey = function (query: any) {
		const key = JSON.stringify(query).replace(/[^a-z0-9]/gi, '');
		return key.length ? key : 'no-params';
	};

export default class OWebService<T> {
	private readonly _keyStore: OWebKeyStorage;
	private readonly _baseData: { apiUrl: any; serviceName: string };

	/**
	 * @param appContext The app context.
	 * @param serviceName The service name.
	 * @param persistentCache To enable persistence data caching.
	 */
	constructor(
		protected readonly appContext: OWebApp,
		serviceName: string,
		persistentCache: boolean = false,
	) {
		const apiUrl = appContext.configs
			.get('OZ_API_BASE_URL')
			.replace(/\/$/g, '');
		this._baseData = { apiUrl, serviceName };
		this._keyStore = new OWebKeyStorage(
			appContext,
			'services:' + serviceName,
			persistentCache,
		);
	}

	/**
	 * Returns the service name.
	 */
	getName(): string {
		return this._baseData.serviceName;
	}

	/**
	 * Returns the service URI.
	 */
	getServiceURI() {
		return stringPlaceholderReplace(urIService, this._baseData);
	}

	/**
	 * Returns entity URI.
	 *
	 * @param id The entity id.
	 */
	getItemURI(id: any): string {
		const data = assign({ id }, this._baseData);
		return stringPlaceholderReplace(uriEntity, data);
	}

	/**
	 * Returns entity relation URI.
	 *
	 * @param id The entity id.
	 * @param relation The relation name.
	 */
	getItemRelationURI(id: string, relation: string): string {
		const data = assign({ id, relation }, this._baseData);
		return stringPlaceholderReplace(uriEntityRelation, data);
	}

	/**
	 * Cache manager getter.
	 */
	getCacheManager(): OWebKeyStorage {
		return this._keyStore;
	}

	/**
	 * Adds an entity.
	 *
	 * @param formData
	 * @param success
	 * @param fail
	 * @param freeze
	 */
	addRequest(
		formData: any,
		success: tServiceAddSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false,
	): OWebCom {
		const url = this.getServiceURI(),
			newOptions: tServiceRequestOptions = formData;

		return this.appContext.request(
			'POST',
			url,
			newOptions,
			(response: IComResponse) => {
				success(response as any);
			},
			fail,
			freeze,
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
	deleteRequest(
		id: string,
		success: tServiceDeleteSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false,
	): OWebCom {
		const m = this,
			url = this.getItemURI(id);

		return this.appContext.request(
			'DELETE',
			url,
			null,
			(response: IComResponse) => {
				m.getCacheManager().removeItem(id);
				success(response as any);
			},
			fail,
			freeze,
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
		freeze: boolean = false,
	): OWebCom {
		const url = this.getItemURI(id),
			newOptions: tServiceRequestOptions = formData;

		return this.appContext.request(
			'PATCH',
			url,
			newOptions,
			(response: IComResponse) => {
				success(response as any);
			},
			fail,
			freeze,
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
		freeze: boolean = false,
	): OWebCom {
		const url = this.getServiceURI(),
			filters = options.filters,
			newOptions: tServiceRequestOptions = {};

		if (typeof options.max === 'number') {
			// will be ignored by O'Zone
			newOptions.max = options.max;
		}
		if (typeof options.page === 'number') {
			// will be ignored by O'Zone
			newOptions.page = options.page;
		}

		if (isPlainObject(filters)) {
			newOptions.filters = filters;
		}

		return this.appContext.request(
			'DELETE',
			url,
			newOptions,
			(response: IComResponse) => {
				success(response as any);
			},
			fail,
			freeze,
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
		freeze: boolean = false,
	): OWebCom {
		const url = this.getServiceURI(),
			filters = options.filters,
			newOptions: tServiceRequestOptions = formData;

		if (typeof options.max === 'number') {
			// will be ignored by O'Zone
			newOptions.max = options.max;
		}
		if (typeof options.page === 'number') {
			// will be ignored by O'Zone
			newOptions.page = options.page;
		}

		if (isPlainObject(filters)) {
			newOptions.filters = filters;
		}

		return this.appContext.request(
			'PATCH',
			url,
			newOptions,
			(response: IComResponse) => {
				success(response as any);
			},
			fail,
			freeze,
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
	 * @param loadCacheFirst
	 */
	getRequest(
		id: string,
		relations: string = '',
		success: tServiceGetSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false,
		loadCacheFirst: boolean = false,
	): OWebCom {
		const m = this,
			url = this.getItemURI(id),
			cacheId = id,
			data: any = {};
		let _cached;

		if (relations.length) {
			data.relations = relations;
		}

		if (loadCacheFirst) {
			_cached = m.getCacheManager().getItem(cacheId);

			if (_cached) {
				success(_cached, true);
				freeze = false;
			}
		}

		return this.appContext.request(
			'GET',
			url,
			data,
			(response: IComResponse) => {
				m.getCacheManager().setItem(id, response);
				success(response as any, false);
			},
			(response: IComResponse, com: OWebCom) => {
				// tslint:disable-next-line: no-conditional-assignment
				if ((_cached = m.getCacheManager().getItem(cacheId))) {
					success(_cached, true);
				} else {
					fail(response, com);
				}
			},
			freeze,
		);
	}

	/**
	 * Gets all entities.
	 *
	 * @param options
	 * @param success
	 * @param fail
	 * @param freeze
	 * @param forceCache
	 * @param loadCacheFirst
	 */
	getAllRequest(
		options: tServiceRequestOptions,
		success: tServiceGetAllSuccess<T>,
		fail: tServiceFail,
		freeze: boolean = false,
		forceCache: boolean = false,
		loadCacheFirst: boolean = false,
	): OWebCom {
		const m = this,
			url = this.getServiceURI(),
			filters = options.filters,
			newOptions: tServiceRequestOptions = {};
		let _cached;

		if (typeof options.max === 'number') {
			newOptions.max = options.max;
		}
		if (typeof options.page === 'number') {
			newOptions.page = options.page;
		}

		if (typeof options.relations === 'string') {
			newOptions.relations = options.relations;
		}
		if (typeof options.collection === 'string') {
			newOptions.collection = options.collection;
		}

		if (typeof options.order_by === 'string') {
			newOptions.order_by = options.order_by;
		}

		if (isPlainObject(filters)) {
			newOptions.filters = filters;
		}

		const cacheId = toKey(newOptions);

		if (forceCache && loadCacheFirst) {
			_cached = m.getCacheManager().getItem(cacheId);

			if (_cached) {
				success(_cached, true);
				freeze = false;
			}
		}

		return this.appContext.request(
			'GET',
			url,
			newOptions,
			(response: IComResponse) => {
				forceCache && m.getCacheManager().setItem(cacheId, response);
				success(response as any, false);
			},
			(response: IComResponse, com: OWebCom) => {
				if (
					forceCache &&
					// tslint:disable-next-line: no-conditional-assignment
					(_cached = m.getCacheManager().getItem(cacheId))
				) {
					success(_cached, true);
				} else {
					fail(response, com);
				}
			},
			freeze,
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
	 * @param forceCache
	 * @param loadCacheFirst
	 */
	getRelationRequest<R>(
		id: string,
		relation: string,
		success: tServiceGetRelationSuccess<R>,
		fail: tServiceFail,
		freeze: boolean = false,
		forceCache: boolean = false,
		loadCacheFirst: boolean = false,
	): OWebCom {
		const m = this,
			url = this.getItemRelationURI(id, relation),
			cacheId = toKey({ id, relation });
		let _cached;

		if (forceCache && loadCacheFirst) {
			_cached = this.getCacheManager().getItem(cacheId);

			if (_cached) {
				success(_cached, true);
				freeze = false;
			}
		}

		return this.appContext.request(
			'GET',
			url,
			{},
			function (response: IComResponse) {
				forceCache && m.getCacheManager().setItem(cacheId, response);
				success(response as any, false);
			},
			function (response: IComResponse, com: OWebCom) {
				if (
					forceCache &&
					// tslint:disable-next-line: no-conditional-assignment
					(_cached = m.getCacheManager().getItem(cacheId))
				) {
					success(_cached, true);
				} else {
					fail(response, com);
				}
			},
			freeze,
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
	 * @param forceCache
	 * @param loadCacheFirst
	 */
	getRelationItemsRequest<R>(
		id: string,
		relation: string,
		options: tServiceRequestOptions,
		success: tServiceGetRelationItemsSuccess<R>,
		fail: tServiceFail,
		freeze: boolean = false,
		forceCache: boolean = false,
		loadCacheFirst: boolean = false,
	): OWebCom {
		const m = this,
			url = this.getItemRelationURI(id, relation),
			filters = options.filters,
			newOptions: tServiceRequestOptions = {};

		if (typeof options.max === 'number') {
			newOptions.max = options.max;
		}
		if (typeof options.page === 'number') {
			newOptions.page = options.page;
		}

		if (isPlainObject(filters)) {
			newOptions.filters = filters;
		}

		const cacheId = toKey(assign({ relation }, newOptions));
		let _cached;

		if (forceCache && loadCacheFirst) {
			_cached = this.getCacheManager().getItem(
				cacheId,
			) as IServiceGetRelationItemsResponse<R>;

			if (_cached) {
				success(_cached, true);
				freeze = false;
			}
		}

		return this.appContext.request(
			'GET',
			url,
			newOptions,
			function (response: IComResponse) {
				forceCache && m.getCacheManager().setItem(cacheId, response);

				success(response as any, false);
			},
			function (response: IComResponse, com: OWebCom) {
				if (
					forceCache &&
					// tslint:disable-next-line: no-conditional-assignment
					(_cached = m.getCacheManager().getItem(cacheId))
				) {
					success(_cached, true);
				} else {
					fail(response, com);
				}
			},
			freeze,
		);
	}
}
