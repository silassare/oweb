import {getEntityCache, GoblSinglePKEntity} from 'gobl-utils-ts';
import {
	OApiAddResponse,
	OApiDeleteResponse,
	OApiUpdateResponse,
	OApiServiceRequestOptions, OApiGetAllResponse, OApiGetResponse,
} from './ozone';
import OWebApp from './OWebApp';
import {escapeRegExp, isPlainObject} from './utils';
import OWebService from './OWebService';
import OWebXHR from './OWebXHR';
import {OFormData} from './OWebFormValidator';

const getId = (item: GoblSinglePKEntity) => item.singlePKValue();

const _with    = (target: any, key: string | number, item: any) => {
		  return {...target, [key]: item};
	  },
	  _without = (target: any, key: string | number) => {
		  delete target[key];
		  return {...target};
	  };

export default class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
	protected items: { [key: string]: T }       = {};
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
		service: string
	) {
		super(_appContext, service);
	}

	/**
	 * Creates request to get an item by id.
	 *
	 * @param id The item id.
	 * @param relations The relations to retrieve.
	 */
	getItemRequest(id: string, relations = ''): OWebXHR<OApiGetResponse<T>> {
		const ctx = this;

		return this.getRequest(id, relations)
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
	getItemsListRequest(options: OApiServiceRequestOptions = {}): OWebXHR<OApiGetAllResponse<T>> {
		const ctx = this;

		return ctx
			.getAllRequest(options)
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
	addItemRequest(data: OFormData): OWebXHR<OApiAddResponse<T>> {
		const ctx = this;
		return ctx
			.addRequest(data)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.addCreated(response.json);
			});
	}

	/**
	 * Creates update request for a given item.
	 *
	 * @param item
	 */
	updateItemRequest(item: T): OWebXHR<OApiUpdateResponse<T>> {
		const ctx  = this,
			  id   = getId(item),
			  diff = item.toObject(true);

		item.isSaving(true);

		return ctx
			.updateRequest(id, diff)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.setSaved(item, response.json);
			})
			.onFinish(function finishHandler() {
				item.isSaving(false);
			});

	}

	/**
	 * Creates a delete request for a given item.
	 *
	 * @param item
	 */
	deleteItemRequest(item: T): OWebXHR<OApiDeleteResponse<T>> {
		const ctx = this,
			  id  = getId(item);

		item.isDeleting(true);

		return ctx
			.deleteRequest(id)
			.onGoodNews(function goodNewsHandler(response) {
				ctx.setDeleted(response.json);
			})
			.onFinish(function finishHandler() {
				item.isDeleting(false);
			});
	}

	/**
	 * Adds a list of items to this store list.
	 *
	 * @param items
	 * @param relations
	 */
	addItemsToList(items: T[] | { [key: string]: T }, relations: any = {}): void {
		const ctx       = this,
			  list: T[] = (isPlainObject(items)
						   ? Object.values(items)
						   : items || []) as T[];

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
		const ctx    = this,
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
		const key        = getId(item),
			  cachedItem = this.items[key];

		if (cachedItem) {
			cachedItem.doHydrate(item.toObject(), true);
		} else {
			this.items = _with(this.items, key, item);
		}

		return this;
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

		return this.safelyAddItem(target);
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
		const item = response.data.item;
		this.items = _without(this.items, getId(item));
		return this;
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

	/**
	 * Identify a given item in this store by its id.
	 *
	 * @param id
	 * @param checkCache
	 */
	identify(id: string, checkCache = true): T | undefined {
		const item = this.items[id];
		let c;

		if (item) return item;

		if (checkCache) {
			c = getEntityCache(this.entity.name) as any;

			return c && c[id];
		}

		return undefined;
	}

	/**
	 * Gets this store items list.
	 *
	 * @param ids
	 */
	list(ids: string[] = []): T[] {
		const list: T[] = [],
			  len       = ids.length;
		if (len) {
			for (let i = 0; i < len; i++) {
				const id   = ids[i],
					  item = this.identify(id);
				if (item) {
					list.push(item);
				}
			}
		} else {
			for (const key in this.items) {
				if (Object.prototype.hasOwnProperty.call(this.items, key)) {
					list.push(this.items[key]);
				}
			}
		}

		return list;
	}

	/**
	 * Order items.
	 *
	 * @param order
	 */
	orderBy(order: (a: T, b: T) => number): T[] {
		const keys = Object.keys(this.items);

		return keys.map((key) => this.items[key]).sort(order);
	}

	/**
	 * Order items by value of a given column.
	 *
	 * @param column
	 */
	orderByValueOf(column: string): T[] {
		return this.orderBy((a: any, b: any) => {
			return a[column] - b[column];
		});
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
		predicate: (value: T, index: number) => boolean,
		max       = Infinity
	): T[] {
		const result: T[] = [],
			  len         = list.length;

		for (let i = 0; i < len && result.length < max; i++) {
			if (predicate(list[i], i)) {
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
		predicate: (value: T, index: number) => boolean,
		max       = Infinity
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
		stringBuilder: (value: T, index: number) => string
	): T[] {
		if (!(search = search.trim()).length) {
			return list;
		}

		const reg = new RegExp(escapeRegExp(search), 'i');

		return list.filter((item: any, index: number) => {
			const v = stringBuilder(item, index);
			return reg.test(v);
		});
	}

	/**
	 * Count items in this store.
	 */
	totalCount(): number {
		return Object.keys(this.items).length;
	}
}
