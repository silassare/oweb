import { GoblEntity, GoblSinglePKEntity } from 'gobl-utils-ts';
import OWebService, {
	tServiceGetSuccess,
	tServiceFail,
	tServiceAddSuccess,
	tServiceRequestOptions,
	tServiceGetAllSuccess,
	tServiceUpdateSuccess,
	tServiceDeleteSuccess,
	iServiceUpdateResponse,
	iServiceAddResponse,
	iServiceDeleteResponse,
} from './OWebService';
import OWebApp from './OWebApp';
import OWebCom from './OWebCom';
import Utils from './utils/Utils';

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
		app_context: OWebApp,
		private readonly entity: typeof GoblSinglePKEntity,
		service_name: string,
		persistent_cache: boolean = false
	) {
		super(app_context, service_name, persistent_cache);
	}

	getItem(
		id: string,
		relations: string = '',
		then?: tServiceGetSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		load_cache_first: boolean = false,
		dialog: boolean = true
	): OWebCom {
		let ctx = this,
			app = this.app_context;
		return ctx.getRequest(
			id,
			relations,
			(response, fromCache) => {
				ctx.addItemToList(response.data.item, response.data.relations);
				then && then(response, fromCache);
			},
			response => {
				dialog && app.view.dialog(response);
				fail && fail(response);
			},
			freeze,
			load_cache_first
		);
	}

	getAllItems(
		options: tServiceRequestOptions = {},
		then?: tServiceGetAllSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		force_cache: boolean = true,
		dialog: boolean = true
	): OWebCom {
		let ctx = this,
			app = this.app_context;
		return ctx.getAllRequest(
			options,
			(response, fromCache) => {
				ctx.addItemsToList(
					response.data.items,
					response.data.relations
				);
				then && then(response, fromCache);
			},
			response => {
				dialog && app.view.dialog(response);
				fail && fail(response);
			},
			freeze,
			force_cache
		);
	}

	addItem(
		data: any,
		then?: tServiceAddSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		dialog: boolean = true
	): OWebCom {
		let ctx = this,
			app = this.app_context;
		return ctx.addRequest(
			data,
			result => {
				ctx.addCreated(result);
				then && then(result);
			},
			response => {
				dialog && app.view.dialog(response);
				fail && fail(response);
			},
			freeze
		);
	}

	updateItem(
		item: T,
		then?: tServiceUpdateSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		dialog: boolean = true
	): OWebCom | false {
		let ctx = this,
			app = this.app_context,
			id = getId(item);

		if (!item.isSaved()) {
			let diff = item.toObject(true);

			item.isSaving(true);

			return ctx.updateRequest(
				id,
				diff,
				result => {
					item.isSaving(false);
					ctx.setSaved(item, result);
					then && then(result);
				},
				response => {
					item.isSaving(false);
					dialog && app.view.dialog(response);
					fail && fail(response);
				},
				freeze
			);
		}

		console.error('Not modified ->', item);
		return false;
	}

	deleteItem(
		item: T,
		then?: tServiceDeleteSuccess<T>,
		fail?: tServiceFail,
		freeze: boolean = true,
		dialog: boolean = true
	): OWebCom {
		let ctx = this,
			app = this.app_context,
			id = getId(item);

		item.isDeleting(true);
		return ctx.deleteRequest(
			id,
			result => {
				item.isDeleting(false);
				ctx.setDeleted(result);
				then && then(result);
			},
			response => {
				item.isDeleting(false);
				dialog && app.view.dialog(response);
				fail && fail(response);
			},
			freeze
		);
	}

	addItemsToList(items: T[] | { [key: string]: T }, relations: any = {}) {
		let ctx = this;
		let list: T[] = (Utils.isPlainObject(items)
			? Object.values(items)
			: items || []) as T[];

		list.forEach(item => {
			let itemId = getId(item);

			ctx.safelyAddItem(item);

			if (!ctx.relations[itemId]) {
				ctx.relations = _with(ctx.relations, itemId, {});
			}

			for (let rel in relations) {
				if (relations.hasOwnProperty(rel)) {
					let data = relations[rel];

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

	addItemToList(item: T, relations: any = {}) {
		let ctx = this,
			itemId = getId(item);

		ctx.safelyAddItem(item);

		if (!ctx.relations[itemId]) {
			ctx.relations = _with(ctx.relations, itemId, {});
		}

		for (let rel in relations) {
			if (relations.hasOwnProperty(rel)) {
				ctx.relations[itemId] = _with(
					ctx.relations[itemId],
					rel,
					relations[rel]
				);
			}
		}
	}

	private safelyAddItem(item: T) {
		let key = getId(item),
			cachedItem = this.items[key];

		if (cachedItem) {
			cachedItem.doHydrate(item.toObject(), true);
		} else {
			this.items = _with(this.items, key, item);
		}

		return this;
	}

	setSaved(target: T, response: iServiceUpdateResponse<T>) {
		let item = response.data.item;

		target.doHydrate(item.toObject(), true);

		this.safelyAddItem(target);
	}

	addCreated(response: iServiceAddResponse<T>) {
		this.safelyAddItem(response.data.item);
	}

	setDeleted(response: iServiceDeleteResponse<T>) {
		let item = response.data.item;
		this.items = _without(this.items, getId(item));
	}

	itemRelation<Z>(item: T, relation: string): Z | undefined {
		let id = getId(item);
		return this.relations[id] && this.relations[id][relation];
	}

	identify(id: string, checkCache: boolean = true): T | undefined {
		let item = this.items[id],
			c;

		if (item) return item;

		if (checkCache) {
			c = <any>GoblEntity.subCache(this.entity.name);

			return c && c[id];
		}

		return undefined;
	}

	list(ids: string[] = []) {
		let list: T[] = [],
			len = ids.length;
		if (len) {
			for (let i = 0; i < len; i++) {
				let id = ids[i],
					item = this.identify(id);
				if (item) {
					list.push(item);
				}
			}
		} else {
			for (let key in this.items) {
				if (Object.prototype.hasOwnProperty.call(this.items, key)) {
					list.push(this.items[key]);
				}
			}
		}

		return list;
	}

	orderBy(orderFn: tEntitiesOrderByCb<T>): T[] {
		let keys = Object.keys(this.items);

		return keys.map(key => this.items[key]).sort(orderFn);
	}

	orderByValueOf(column: string): T[] {
		return this.orderBy((a: any, b: any) => {
			return a[column] - b[column];
		});
	}

	select(
		list: T[] = this.list(),
		predicate: (value: T, index: number) => boolean,
		max = Infinity
	): T[] {
		let result: T[] = [],
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
		stringBuilder: (value: T, index: number) => string
	): T[] {
		if (!(search = search.trim()).length) {
			return list;
		}

		let reg = new RegExp(Utils.escapeRegExp(search), 'i');

		return list.filter((item: any, index: number) => {
			let v = stringBuilder(item, index);
			return reg.test(v);
		});
	}

	totalCount(): number {
		return Object.keys(this.items).length;
	}
}
