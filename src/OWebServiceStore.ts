import { GoblSinglePKEntity, getEntityCache } from 'gobl-utils-ts';
import OWebService, {
	IServiceAddResponse,
	IServiceDeleteResponse,
	IServiceUpdateResponse,
	IServiceRequestOptions,
} from './OWebService';
import OWebApp from './OWebApp';
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
		service: string,
	) {
		super(appContext, service);
	}

	getItem(id: string, relations: string = '') {
		const ctx = this;

		return ctx
			.getRequest(id, relations)
			.onGoodNews(function (response) {
				ctx.addItemToList(
					response.json!.data.item,
					response.json!.data.relations,
				);
			})
			.send();
	}

	getAllItems(options: IServiceRequestOptions = {}) {
		const ctx = this;

		return ctx
			.getAllRequest(options)
			.onGoodNews(function (response) {
				ctx.addItemsToList(
					response.json!.data.items,
					response.json!.data.relations,
				);
			})
			.send();
	}

	addItem(data: any) {
		const ctx = this;
		return ctx
			.addRequest(data)
			.onGoodNews(function (response) {
				ctx.addCreated(response.json!);
			})
			.send();
	}

	updateItem(item: T, freeze: boolean = true) {
		const ctx = this,
			id = getId(item);

		if (!item.isSaved()) {
			const diff = item.toObject(true);

			item.isSaving(true);

			return ctx
				.updateRequest(id, diff)
				.onGoodNews(function (response) {
					ctx.setSaved(item, response.json!);
				})
				.onFinished(function () {
					item.isSaving(false);
				})
				.send();
		}

		_error('not updated', item);
		return false;
	}

	deleteItem(item: T) {
		const ctx = this,
			id = getId(item);

		item.isDeleting(true);

		return ctx
			.deleteRequest(id)
			.onGoodNews(function (response) {
				ctx.setDeleted(response.json!);
			})
			.onFinished(function () {
				item.isDeleting(false);
			})
			.send();
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
