"use strict";

import OWebApp from "./OWebApp";
import Utils from "./utils/Utils";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebCom, {tComResponse} from "./OWebCom";

export interface iServiceAddData<T> {
	item: T,
	relations?: {
		[key: string]: any
	}
}

export interface iServiceGetData<T> {
	item: T,
	relations?: {
		[key: string]: any
	}
}

export interface iServiceGetAllData<T> {
	items: T[],
	max?: number,
	page?: number,
	total?: number,
	relations?: {
		[key: string]: any
	}
}

export interface iServiceUpdateData<T> {
	item: T,
	relations?: {
		[key: string]: any
	}
}

export interface iServiceUpdateAllData {
	affected: number
}

export interface iServiceDeleteData<T> {
	item: T
}

export interface iServiceDeleteAllData<T> {
	affected: number
}

export interface iServiceGetRelationItemsData<T> {
	items: T[],
	max?: number,
	page?: number,
	total?: number,
	relations: {
		[key: string]: any
	}
}

export interface iServiceGetRelationItemData<T> {
	item: T,
	relations?: {
		[key: string]: any
	}
}

export type tServiceAddSuccess<T> = (response: iServiceAddData<T>) => void;
export type tServiceUpdateSuccess<T> = (response: iServiceUpdateData<T>) => void;
export type tServiceUpdateAllSuccess<T> = (response: iServiceUpdateAllData) => void;
export type tServiceDeleteSuccess<T> = (response: iServiceDeleteData<T>) => void;
export type tServiceDeleteAllSuccess<T> = (response: iServiceDeleteAllData<T>) => void;
export type tServiceGetSuccess<T> = (response: iServiceGetData<T>, fromCache: boolean) => void;
export type tServiceGetAllSuccess<T> = (response: iServiceGetAllData<T>, fromCache: boolean) => void;
export type tServiceGetRelationSuccess<T> = (response: iServiceGetRelationItemData<T>, fromCache: boolean) => void;
export type tServiceGetRelationItemsSuccess<T> = (response: iServiceGetRelationItemsData<T>, fromCache: boolean) => void;

export type tServiceFail = (response: tComResponse) => void;

export type tServiceRequestOptions = {
	max?: number,
	page?: number,
	filters?: any,
	relations?: string,
	order_by?: string
};

const uri_service         = ":api_url/:service_name",
	  uri_entity          = ":api_url/:service_name/:id",
	  uri_entity_relation = ":api_url/:service_name/:id/:relation";

let toKey = function (query_params: any) {
	let key = JSON.stringify(query_params).replace(/[^a-z0-9]/ig, "");
	return key.length ? key : "no-params";
};

export default class OWebService<T> {
	private readonly _key_store: OWebKeyStorage;
	private readonly _base_data: { api_url: any; service_name: string };

	constructor(private readonly app_context: OWebApp, service_name: string) {

		let s_url       = app_context.configs.get("OZ_API_BASE_URL")
			.replace(/\/$/g, "");
		this._base_data = {api_url: s_url, service_name: service_name};
		this._key_store = new OWebKeyStorage(app_context, "services:" + service_name);

	}

	getServiceURI() {
		return Utils.stringKeyReplace(uri_service, this._base_data);
	}

	getItemURI(id: any): string {
		let data = Utils.assign({id: id}, this._base_data);
		return Utils.stringKeyReplace(uri_entity, data);
	}

	getItemRelationURI(id: string, relation: string): string {
		let data = Utils.assign({id: id, relation: relation}, this._base_data);
		return Utils.stringKeyReplace(uri_entity_relation, data);
	}

	getCacheManager(): OWebKeyStorage {
		return this._key_store;
	}

	add(formData: any, success: tServiceAddSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let url = this.getServiceURI();

		return this.app_context.request("POST", url, formData, (response: tComResponse) => {
			success(response["data"]);
		}, fail, freeze);
	}

	delete(id: string, success: tServiceDeleteSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let m   = this,
			url = this.getItemURI(id);

		return this.app_context.request("DELETE", url, null, (response: tComResponse) => {
			m.getCacheManager().removeItem(id);
			success(response["data"]);
		}, fail, freeze);
	}

	update(id: string, formData: any, success: tServiceUpdateSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let url = this.getItemURI(id);

		return this.app_context.request("PATCH", url, formData, (response: tComResponse) => {
			success(response["data"]);
		}, fail, freeze);
	}

	deleteAll(options: tServiceRequestOptions, success: tServiceDeleteAllSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let url                                  = this.getServiceURI(),
			filters                              = options.filters,
			request_data: tServiceRequestOptions = {};

		if (typeof options["max"] === "number") {// will be ignored by O'Zone
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {// will be ignored by O'Zone
			request_data["page"] = options["page"];
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		return this.app_context.request("DELETE", url, request_data, (response: tComResponse) => {
			success(response["data"]);
		}, fail, freeze);
	}

	updateAll(options: tServiceRequestOptions, formData: any, success: tServiceUpdateAllSuccess<T>, fail: tServiceFail, freeze: boolean = false): OWebCom {
		let url                                                  = this.getServiceURI(),
			filters                                              = options.filters,
			request_data: tServiceRequestOptions & { data: any } = {
				data: formData
			};

		if (typeof options["max"] === "number") {// will be ignored by O'Zone
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {// will be ignored by O'Zone
			request_data["page"] = options["page"];
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		return this.app_context.request("PATCH", url, request_data, (response: tComResponse) => {
			success(response["data"]);
		}, fail, freeze);
	}

	get(id: string, relations: string = "", success: tServiceGetSuccess<T>, fail: tServiceFail, freeze: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m         = this,
			url       = this.getItemURI(id),
			data: any = null,
			cache_id  = id;

		if (relations.length) {
			data = {relations};
		}

		if (load_cache_first) {
			let tmp_data = m.getCacheManager().getItem(cache_id);

			if (tmp_data) {
				success(tmp_data, true);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, data, (response: tComResponse) => {
			let data = response["data"];
			m.getCacheManager().setItem(id, data);
			success(data, false);
		}, (response: tComResponse) => {
			let data = m.getCacheManager().getItem(cache_id);

			if (data) {
				success(data, true);
			} else {
				fail(response);
			}
		}, freeze);

	}

	getAll(options: tServiceRequestOptions, success: tServiceGetAllSuccess<T>, fail: tServiceFail, freeze: boolean = false, force_cache: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m                                    = this,
			url                                  = this.getServiceURI(),
			filters                              = options["filters"],
			request_data: tServiceRequestOptions = {};

		if (typeof options["max"] === "number") {
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {
			request_data["page"] = options["page"];
		}

		if (typeof options.relations === "string") {
			request_data["relations"] = options.relations
		}

		if (typeof options.order_by === "string") {
			request_data["order_by"] = options.order_by
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		let cache_id = toKey(request_data);

		if (force_cache && load_cache_first) {
			let tmp_data = m.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.items &&
				Object.keys(tmp_data.items).length) {
				success(tmp_data, true);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, request_data, (response: tComResponse) => {
			let data = response["data"];
			force_cache && m.getCacheManager().setItem(cache_id, data);
			success(data, false);
		}, (response: tComResponse) => {
			let data;
			if (force_cache &&
				(data = m.getCacheManager().getItem(cache_id))) {
				success(data, true);
			} else {
				fail(response);
			}
		}, freeze);

	}

	getRelation<R>(id: string, relation: string, success: tServiceGetRelationSuccess<R>, fail: tServiceFail, freeze: boolean = false, force_cache: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m   = this,
			url = this.getItemRelationURI(id, relation);

		let cache_id = toKey({id, relation});

		if (force_cache && load_cache_first) {
			let tmp_data = <iServiceGetRelationItemData<R>>this.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.relations && tmp_data.relations[relation]) {
				success(tmp_data, true);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, {}, function (response: tComResponse) {
			let data = response["data"];
			force_cache && m.getCacheManager().setItem(cache_id, data);
			success(data, false);
		}, function (response: tComResponse) {
			let data;
			if (force_cache &&
				(data = m.getCacheManager().getItem(cache_id))) {
				success(data, true);
			} else {
				fail(response);
			}
		}, freeze);
	}

	getRelationItems<R>(id: string, relation: string, options: tServiceRequestOptions, success: tServiceGetRelationItemsSuccess<R>, fail: tServiceFail, freeze: boolean = false, force_cache: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m                                    = this,
			url                                  = this.getItemRelationURI(id, relation),
			filters                              = options["filters"],
			request_data: tServiceRequestOptions = {};

		if (typeof options["max"] === "number") {
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {
			request_data["page"] = options["page"];
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		let cache_id = toKey(Utils.assign({relation: relation}, request_data));

		if (force_cache && load_cache_first) {
			let tmp_data = <iServiceGetRelationItemsData<R>>this.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.relations && tmp_data.relations[relation]) {
				success(tmp_data, true);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, request_data, function (response: tComResponse) {
			let data = response["data"];
			force_cache && m.getCacheManager().setItem(cache_id, data);

			success(data, false);
		}, function (response: tComResponse) {
			let data;
			if (force_cache &&
				(data = m.getCacheManager().getItem(cache_id))) {
				success(data, true);
			} else {
				fail(response);
			}
		}, freeze);
	}
}