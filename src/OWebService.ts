"use strict";

import OWebApp from "./OWebApp";
import Utils from "./utils/Utils";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebCom from "./OWebCom";

export type tSvcSuccessCb = () => void;
export type tSvcFailCb = () => void;
export type tSvcReqOptions = {
	max?: number,
	page?: number,
	filters?: any
};

const uri_service         = ":api_url/:service_name",
	  uri_entity          = ":api_url/:service_name/:id",
	  uri_entity_relation = ":api_url/:service_name/:id/:relation";

let toKey = function (query_params: any) {
	let key = JSON.stringify(query_params).replace(/[^a-z0-9]/ig, "");
	return key.length ? key : "no-params";
};

export default class OWebService {
	private readonly _key_store: OWebKeyStorage;
	private readonly _base_data: { api_url: any; service_name: string };

	constructor(private readonly app_context: OWebApp, service_name: string, private readonly item_id_name: string) {

		let s_url       = app_context.configs.get("OZ_APP_API_BASE_URL")
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

	addItem(formData: any, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false): OWebCom {
		let m   = this,
			url = this.getServiceURI();

		return this.app_context.request("POST", url, formData, (response: any) => {
			let data   = response["data"];
			let entity = data["item"];

			m.getCacheManager()
			 .setItem(entity[m.item_id_name], entity);

			Utils.callback(success, [data]);
		}, (response: any) => {
			Utils.callback(fail, [response]);
		}, freeze);
	}

	deleteItem(id: string, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false): OWebCom {
		let m   = this,
			url = this.getItemURI(id);

		return this.app_context.request("DELETE", url, null, (response: any) => {
			let entity = response["data"];

			m.getCacheManager().removeItem(id);

			Utils.callback(success, [entity]);
		}, (response: any) => {
			Utils.callback(fail, [response]);
		}, freeze);

	}

	updateItem(id: string, formData: any, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false): OWebCom {
		let m   = this,
			url = this.getItemURI(id);

		return this.app_context.request("PATCH", url, formData, (response: any) => {
			let entity = response["data"];

			m.getCacheManager().setItem(entity[m.item_id_name], entity);

			Utils.callback(success, [entity]);
		}, (response: any) => {
			Utils.callback(fail, [response]);
		}, freeze);
	}

	updateAllItems(options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false): OWebCom {
		let url                          = this.getServiceURI(),
			filters                      = options.filters,
			request_data: tSvcReqOptions = {};

		if (typeof options["max"] === "number") {
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {
			request_data["page"] = options["page"];
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		return this.app_context.request("PATCH", url, request_data,
			(response: any) => {
				let data = response["data"];

				Utils.callback(success, [data]);
			}, (response: any) => {
				Utils.callback(fail, [response]);
			}, freeze);
	}

	getItem(id: string, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m        = this,
			url      = this.getItemURI(id),
			cache_id = id;

		if (load_cache_first) {
			let tmp_data = m.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.item) {
				Utils.callback(success, [tmp_data, false]);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, null, (response: any) => {
			let entity = response["data"];

			m.getCacheManager().setItem(cache_id, entity);

			Utils.callback(success, [entity, true, response]);
		}, (response: any) => {
			let entity = m.getCacheManager().getItem(cache_id);

			if (entity) {
				Utils.callback(success, [entity, false, response]);
			} else {
				Utils.callback(fail, [response]);
			}
		}, freeze);

	}

	getAllItems(options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false, force_cache: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m                            = this,
			url                          = this.getServiceURI(),
			filters                      = options["filters"],
			request_data: tSvcReqOptions = {};

		if (typeof options["max"] === "number") {
			request_data["max"] = options["max"];
		}
		if (typeof options["page"] === "number") {
			request_data["page"] = options["page"];
		}

		if (Utils.isPlainObject(filters)) {
			request_data["filters"] = filters;
		}

		let cache_id = toKey(request_data);

		if (force_cache && load_cache_first) {
			let tmp_data = m.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.items &&
				Object.keys(tmp_data.items).length) {
				Utils.callback(success, [tmp_data, false]);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, request_data, (response: any) => {
			let data = response["data"];

			force_cache &&
			m.getCacheManager().setItem(cache_id, data);

			Utils.callback(success, [data, true, response]);
		}, (response: any) => {
			let data;
			if (force_cache &&
				(data = m.getCacheManager().getItem(cache_id))) {
				Utils.callback(success, [data, false, response]);
			} else {
				Utils.callback(fail, [response]);
			}
		}, freeze);

	}

	getRelationItems(id: string, relation: string, options: tSvcReqOptions, success: tSvcSuccessCb, fail: tSvcFailCb, freeze: boolean = false, force_cache: boolean = false, load_cache_first: boolean = false): OWebCom {
		let m                            = this,
			url                          = this.getItemRelationURI(id, relation),
			filters                      = options["filters"],
			request_data: tSvcReqOptions = {};

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
			let tmp_data = this.getCacheManager().getItem(cache_id);

			if (tmp_data && tmp_data.items &&
				Object.keys(tmp_data.items).length) {
				Utils.callback(success, [tmp_data, false]);
				freeze = false;
			}
		}

		return this.app_context.request("GET", url, request_data, function (response: any) {
			let data = response["data"];
			if (force_cache) {
				m.getCacheManager().setItem(cache_id, data);
			}

			Utils.callback(success, [data, true, response]);
		}, function (response: any) {
			let data;
			if (force_cache &&
				(data = m.getCacheManager().getItem(cache_id))) {
				Utils.callback(success, [data, false, response]);
			} else {
				Utils.callback(fail, [response]);
			}
		}, freeze);

	}
}