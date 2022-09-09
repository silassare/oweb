import { getEntityCache, GoblEntity, GoblSinglePKEntity } from 'gobl-utils-ts';
import {
	OApiAddResponse,
	OApiDeleteResponse,
	OApiUpdateResponse,
	OApiServiceRequestOptions,
	OApiGetAllResponse,
	OApiGetResponse,
} from './ozone';
import OWebApp from './OWebApp';
import { escapeRegExp, isPlainObject } from './utils';
import OWebService from './OWebService';
import OWebXHR from './OWebXHR';
import { OWebFormData } from './OWebForm';
import { ONetRequestBody } from './OWebNet';

const getId = (item: GoblSinglePKEntity) => item.singlePKValue();

const _with = (target: any, key: string | number, item: any) => {
	return { ...target, [key]: item };
};

interface OServiceDataStore<T extends GoblSinglePKEntity> {
	add(item: T): this;
	get(id: string): T | undefined;
	update(item: T): this;
	remove(id: string): this;
	all(): T[];
	clear(): this;
	filter(filterFn: (entry: T) => boolean): T[];
	relationServiceResolver<R extends GoblSinglePKEntity>(
		relation: string
	): undefined | OWebServiceStore<R>;
}

const defaultServiceDataStore = function defaultServiceDataStore<
	T extends GoblSinglePKEntity
>(): OServiceDataStore<T> {
	let items: { [key: string]: T } = {};
	const o: OServiceDataStore<T> = {
		add(item: T) {
			const id = getId(item);
			id in items ? o.update(item) : (items[id] = item);
			return o;
		},
		get(id: string): T | undefined {
			return items[id];
		},
		update(item: T) {
			const id = getId(item);
			if (items[id]) {
				items[id].doHydrate(item.toObject(false), true);
			}

			return o;
		},
		remove(id: string) {
			delete items[id];
			return o;
		},
		all(): T[] {
			return Object.values(items);
		},
		filter(filterFn: (entry: T) => boolean): T[] {
			return Object.values(items).filter(filterFn);
		},
		relationServiceResolver<R extends GoblSinglePKEntity>():
			| undefined
			| OWebServiceStore<R> {
			return undefined;
		},
		clear() {
			items = {};
			return this;
		},
	};

	return o;
};

export default class OWebServiceStore<
	T extends GoblSinglePKEntity
> extends OWebService<T> {
	protected store: OServiceDataStore<T>;
	protected relations: { [key: string]: any } = {};

	/**
	 * OWebServiceStore constructor.
	 *
	 * @param _appContext
	 * @param entity
	 * @param service
	 */
	constructor(
		_appContext: OWebApp,
		private readonly entity: typeof GoblSinglePKEntity,
		service: string,
		store?: OServiceDataStore<T>
	) {
		super(_appContext, service);

		this.store = store || defaultServiceDataStore<T>();
	}

	/**
	 * Creates request to get an item by id.
	 *
	 * @param id The item id.
	 * @param relations The relations to retrieve.
	 */
	getItem(id: string, relations = ''): OWebXHR<OApiGetResponse<T>> {
		const ctx = this;

		return super
			.getItem(id, relations)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.addItemToList(
					response.json.data.item,
					response.json.data.relations
				);
			});
	}

	/**
	 * Creates request to get items list.
	 *
	 * @param options
	 */
	getItems(
		options: OApiServiceRequestOptions = {}
	): OWebXHR<OApiGetAllResponse<T>> {
		const ctx = this;

		return super
			.getItems(options)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.addItemsToList(
					response.json.data.items,
					response.json.data.relations
				);
			});
	}

	/**
	 * Creates request to add new item.
	 *
	 * @param data
	 */
	addItem(data: OWebFormData): OWebXHR<OApiAddResponse<T>> {
		const ctx = this;
		return super.addItem(data).onGoodNews(function goodNewsHandler(response) {
			ctx.addCreated(response.json);
		});
	}

	/**
	 * Creates update request for a given item.
	 *
	 * @param item
	 */
	updateItem(
		item: T | string,
		formData: ONetRequestBody | null = null
	): OWebXHR<OApiUpdateResponse<T>> {
		const ctx = this;
		let id, target: T | undefined;

		if (item instanceof GoblEntity) {
			id = getId(item);
			target = item;
		} else {
			id = item;
			target = this.identify(id);
		}

		const diff = formData ? formData : target ? target.toObject(true) : {};

		target && target.isSaving(true);

		return super
			.updateItem(id, diff)
			.onGoodNews(function goodNewsHandler(response) {
				target && ctx.setSaved(target, response.json);
			})
			.onFinish(function finishHandler() {
				target && target.isSaving(false);
			});
	}

	/**
	 * Creates a delete request for a given item.
	 *
	 * @param item
	 */
	deleteItem(item: T | string): OWebXHR<OApiDeleteResponse<T>> {
		const ctx = this;
		let id, target: T | undefined;

		if (item instanceof GoblEntity) {
			id = getId(item);
			target = item;
		} else {
			id = item;
			target = this.identify(id);
		}

		target && target.isDeleting(true);

		return super
			.deleteItem(id)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.setDeleted(response.json);
			})
			.onFinish(function finishHandler() {
				target && target.isDeleting(false);
			});
	}

	/**
	 * Adds a list of items to this store list.
	 *
	 * @param items
	 * @param relations
	 */
	addItemsToList(items: T[] | Record<string, T>, relations: any = {}): void {
		const ctx = this,
			list: T[] = (
				isPlainObject(items) ? Object.values(items) : items || []
			) as T[];

		list.forEach((item) => {
			const itemId = getId(item);

			ctx.safelyAddItem(item);

			if (!ctx.relations[itemId]) {
				ctx.relations = _with(ctx.relations, itemId, {});
			}

			for (const rel in relations) {
				if (Object.prototype.hasOwnProperty.call(relations, rel)) {
					const data = relations[rel];

					if (data[itemId]) {
						ctx.relations[itemId] = _with(
							ctx.relations[itemId],
							rel,
							data[itemId]
						);
					}
				}
			}
		});
	}

	/**
	 * Adds a given item and its relations to this store.
	 *
	 * @param item
	 * @param relations
	 */
	addItemToList(item: T, relations: any = {}): void {
		const ctx = this,
			itemId = getId(item);

		ctx.safelyAddItem(item);

		if (!ctx.relations[itemId]) {
			ctx.relations = _with(ctx.relations, itemId, {});
		}

		for (const rel in relations) {
			if (Object.prototype.hasOwnProperty.call(relations, rel)) {
				ctx.relations[itemId] = _with(
					ctx.relations[itemId],
					rel,
					relations[rel]
				);
			}
		}
	}

	/**
	 * Safely add item to this store.
	 *
	 * @param item
	 * @private
	 */
	private safelyAddItem(item: T) {
		const id = getId(item),
			cachedItem = this.store.get(id);

		if (cachedItem) {
			item = cachedItem.doHydrate(item.toObject(), true);
		}

		return this.store.add(item);
	}

	/**
	 * Modify successfully saved item state and data.
	 *
	 * @param target
	 * @param response
	 * @private
	 */
	private setSaved(target: T, response: OApiUpdateResponse<T>) {
		const item = response.data.item;

		target.doHydrate(item.toObject(), true);

		return this.store.add(target);
	}

	/**
	 * Adds a newly created item to this store.
	 *
	 * @param response
	 */
	private addCreated(response: OApiAddResponse<T>) {
		return this.safelyAddItem(response.data.item);
	}

	/**
	 * Removes a given item from this store when deleted.
	 *
	 * @param response
	 */
	private setDeleted(response: OApiDeleteResponse<T>) {
		return this.store.remove(getId(response.data.item));
	}

	/**
	 * Identify a given item in this store by its id.
	 *
	 * @param id
	 * @param checkCacheForMissing
	 */
	identify(id: string, checkCacheForMissing = true): T | undefined {
		const item = this.store.get(id);

		if (item) return item;

		if (checkCacheForMissing) {
			const cache = getEntityCache(this.entity.name) as any;
			return cache && cache[id];
		}

		return undefined;
	}

	/**
	 * Gets this store items list.
	 */
	list(ids: string[] = [], checkCacheForMissing = true): T[] {
		const len = ids.length;

		if (!len) {
			return this.store.all();
		}

		const list: T[] = [];

		for (let i = 0; i < len; i++) {
			const id = ids[i],
				item = this.identify(id, checkCacheForMissing);
			if (item) {
				list.push(item);
			}
		}

		return list;
	}

	/**
	 * Filter items in this store or in a given list.
	 *
	 * @param list
	 * @param predicate
	 * @param max
	 */
	filter(
		list: T[] = this.list(),
		predicate: (value: T) => boolean,
		max = Infinity
	): T[] {
		const result: T[] = [],
			len = list.length;

		for (let i = 0; i < len && result.length < max; i++) {
			if (predicate(list[i])) {
				result.push(list[i]);
			}
		}

		return result;
	}

	/**
	 * Select some items in this store.
	 *
	 * @alias filter
	 *
	 * @param list
	 * @param predicate
	 * @param max
	 */
	select(
		list: T[] = this.list(),
		predicate: (value: T) => boolean,
		max = Infinity
	): T[] {
		return this.filter(list, predicate, max);
	}

	/**
	 * Search items in this store or in a given items list.
	 *
	 * @param list
	 * @param search
	 * @param stringBuilder
	 */
	search(
		list: T[] = this.list(),
		search: string,
		stringBuilder: (value: T) => string
	): T[] {
		if (!(search = search.trim()).length) {
			return list;
		}

		const reg = new RegExp(escapeRegExp(search), 'i');

		return list.filter((item: any) => {
			const v = stringBuilder(item);
			return reg.test(v);
		});
	}
	/**
	 * Gets a given item relations.
	 *
	 * @param item
	 * @param relation
	 */
	itemRelation<Z>(item: T, relation: string): Z | undefined {
		const id = getId(item);
		return this.relations[id] && this.relations[id][relation];
	}
}
