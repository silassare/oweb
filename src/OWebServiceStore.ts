import { GoblSinglePKEntity, getEntityCache } from 'gobl-utils-ts';
import OWebService, {
	IServiceAddResponse,
	IServiceDeleteResponse,
	IServiceUpdateResponse,
	tServiceAddSuccess,
	tServiceDeleteSuccess,
	tServiceFail,
	tServiceGetAllSuccess,
	tServiceGetSuccess,
	tServiceRequestOptions,
	tServiceUpdateSuccess,
} from './OWebService';
import OWebApp from './OWebApp';
import OWebCom from './OWebCom';
import { escapeRegExp, isPlainObject, noop, _error } from './utils/Utils';

export type tEntitiesOrderByCb<T> = (a: T, b: T) => number;

const getId = (item: GoblSinglePKEntity) => item.singlePKValue();

const _with = (target: any, key: string | number, item: any) => {
		return { ...target, [key]: item };
	},
	_without = (target: any, key: string | number) => {
		delete target[key];
		return { ...target };
	};

export default class OWebServiceStore<
	T extends GoblSinglePKEntity
> extends OWebService<T> {
	protected items: { [key: string]: T } = {};
	protected relations: { [key: string]: any } = {};

	constructor(
		appContext: OWebApp,
		private readonly entity: typeof GoblSinglePKEntity,
		serviceName: string,
		persistentCache: boolean = false,
	) {
		super(appContext, serviceName, persistentCache);
	}

	getItem(
		id: string,
		relations: string = '',
		then?: tServiceGetSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		loadCacheFirst: boolean = false,
	): OWebCom {
		const ctx = this;
		return ctx.getRequest(
			id,
			relations,
			(response, fromCache) => {
				ctx.addItemToList(response.data.item, response.data.relations);
				then && then(response, fromCache);
			},
			fail || noop,
			freeze,
			loadCacheFirst,
		);
	}

	getAllItems(
		options: tServiceRequestOptions = {},
		then?: tServiceGetAllSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		forceCache: boolean = true,
	): OWebCom {
		const ctx = this;
		return ctx.getAllRequest(
			options,
			(response, fromCache) => {
				ctx.addItemsToList(
					response.data.items,
					response.data.relations,
				);
				then && then(response, fromCache);
			},
			fail || noop,
			freeze,
			forceCache,
		);
	}

	addItem(
		data: any,
		then?: tServiceAddSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
	): OWebCom {
		const ctx = this;
		return ctx.addRequest(
			data,
			(result) => {
				ctx.addCreated(result);
				then && then(result);
			},
			fail || noop,
			freeze,
		);
	}

	updateItem(
		item: T,
		then?: tServiceUpdateSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
	): OWebCom | false {
		const ctx = this,
			id = getId(item);

		if (!item.isSaved()) {
			const diff = item.toObject(true);

			item.isSaving(true);

			return ctx.updateRequest(
				id,
				diff,
				(result) => {
					item.isSaving(false);
					ctx.setSaved(item, result);
					then && then(result);
				},
				(response, com) => {
					item.isSaving(false);
					fail && fail(response, com);
				},
				freeze,
			);
		}

		_error('not updated ->', item);
		return false;
	}

	deleteItem(
		item: T,
		then?: tServiceDeleteSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
	): OWebCom {
		const ctx = this,
			id = getId(item);

		item.isDeleting(true);
		return ctx.deleteRequest(
			id,
			(result) => {
				item.isDeleting(false);
				ctx.setDeleted(result);
				then && then(result);
			},
			(response, com) => {
				item.isDeleting(false);
				fail && fail(response, com);
			},
			freeze,
		);
	}

	addItemsToList(items: T[] | { [key: string]: T }, relations: any = {}) {
		const ctx = this,
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
				if (relations.hasOwnProperty(rel)) {
					const data = relations[rel];

					if (data[itemId]) {
						ctx.relations[itemId] = _with(
							ctx.relations[itemId],
							rel,
							data[itemId],
						);
					}
				}
			}
		});
	}

	addItemToList(item: T, relations: any = {}) {
		const ctx = this,
			itemId = getId(item);

		ctx.safelyAddItem(item);

		if (!ctx.relations[itemId]) {
			ctx.relations = _with(ctx.relations, itemId, {});
		}

		for (const rel in relations) {
			if (relations.hasOwnProperty(rel)) {
				ctx.relations[itemId] = _with(
					ctx.relations[itemId],
					rel,
					relations[rel],
				);
			}
		}
	}

	private safelyAddItem(item: T) {
		const key = getId(item),
			cachedItem = this.items[key];

		if (cachedItem) {
			cachedItem.doHydrate(item.toObject(), true);
		} else {
			this.items = _with(this.items, key, item);
		}

		return this;
	}

	setSaved(target: T, response: IServiceUpdateResponse<T>) {
		const item = response.data.item;

		target.doHydrate(item.toObject(), true);

		this.safelyAddItem(target);
	}

	addCreated(response: IServiceAddResponse<T>) {
		this.safelyAddItem(response.data.item);
	}

	setDeleted(response: IServiceDeleteResponse<T>) {
		const item = response.data.item;
		this.items = _without(this.items, getId(item));
	}

	itemRelation<Z>(item: T, relation: string): Z | undefined {
		const id = getId(item);
		return this.relations[id] && this.relations[id][relation];
	}

	identify(id: string, checkCache: boolean = true): T | undefined {
		const item = this.items[id];
		let c;

		if (item) return item;

		if (checkCache) {
			c = getEntityCache(this.entity.name) as any;

			return c && c[id];
		}

		return undefined;
	}

	list(ids: string[] = []) {
		const list: T[] = [],
			len = ids.length;
		if (len) {
			for (let i = 0; i < len; i++) {
				const id = ids[i],
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

	orderBy(orderFn: tEntitiesOrderByCb<T>): T[] {
		const keys = Object.keys(this.items);

		return keys.map((key) => this.items[key]).sort(orderFn);
	}

	orderByValueOf(column: string): T[] {
		return this.orderBy((a: any, b: any) => {
			return a[column] - b[column];
		});
	}

	select(
		list: T[] = this.list(),
		predicate: (value: T, index: number) => boolean,
		max = Infinity,
	): T[] {
		const result: T[] = [],
			len = list.length;

		for (let i = 0; i < len && result.length < max; i++) {
			if (predicate(list[i], i)) {
				result.push(list[i]);
			}
		}

		return result;
	}

	search(
		list: T[] = this.list(),
		search: string,
		stringBuilder: (value: T, index: number) => string,
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

	totalCount(): number {
		return Object.keys(this.items).length;
	}
}
