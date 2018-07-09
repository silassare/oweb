"use strict";
import Utils from "./utils/Utils";
import OWebKeyStorage from "./OWebKeyStorage";
const uri_service = ":api_url/:service_name", uri_entity = ":api_url/:service_name/:id", uri_entity_relation = ":api_url/:service_name/:id/:relation";
let toKey = function (query_params) {
    let key = JSON.stringify(query_params).replace(/[^a-z0-9]/ig, "");
    return key.length ? key : "no-params";
};
export default class OWebService {
    constructor(app_context, service_name, item_id_name) {
        this.app_context = app_context;
        this.item_id_name = item_id_name;
        let s_url = app_context.configs.get("OZ_APP_API_BASE_URL")
            .replace(/\/$/g, "");
        this._base_data = { api_url: s_url, service_name: service_name };
        this._key_store = new OWebKeyStorage(app_context, "services:" + service_name);
    }
    getServiceURI() {
        return Utils.stringKeyReplace(uri_service, this._base_data);
    }
    getItemURI(id) {
        let data = Utils.assign({ id: id }, this._base_data);
        return Utils.stringKeyReplace(uri_entity, data);
    }
    getItemRelationURI(id, relation) {
        let data = Utils.assign({ id: id, relation: relation }, this._base_data);
        return Utils.stringKeyReplace(uri_entity_relation, data);
    }
    getCacheManager() {
        return this._key_store;
    }
    addItem(formData, success, fail, freeze = false) {
        let m = this, url = this.getServiceURI();
        return this.app_context.request("POST", url, formData, (response) => {
            let data = response["data"];
            let entity = data["item"];
            m.getCacheManager()
                .setItem(entity[m.item_id_name], entity);
            Utils.callback(success, [data]);
        }, (response) => {
            Utils.callback(fail, [response]);
        }, freeze);
    }
    deleteItem(id, success, fail, freeze = false) {
        let m = this, url = this.getItemURI(id);
        return this.app_context.request("DELETE", url, null, (response) => {
            let entity = response["data"];
            m.getCacheManager().removeItem(id);
            Utils.callback(success, [entity]);
        }, (response) => {
            Utils.callback(fail, [response]);
        }, freeze);
    }
    updateItem(id, formData, success, fail, freeze = false) {
        let m = this, url = this.getItemURI(id);
        return this.app_context.request("PATCH", url, formData, (response) => {
            let entity = response["data"];
            m.getCacheManager().setItem(entity[m.item_id_name], entity);
            Utils.callback(success, [entity]);
        }, (response) => {
            Utils.callback(fail, [response]);
        }, freeze);
    }
    updateAllItems(options, success, fail, freeze = false) {
        let url = this.getServiceURI(), filters = options.filters, request_data = {};
        if (typeof options["max"] === "number") {
            request_data["max"] = options["max"];
        }
        if (typeof options["page"] === "number") {
            request_data["page"] = options["page"];
        }
        if (Utils.isPlainObject(filters)) {
            request_data["filters"] = filters;
        }
        return this.app_context.request("PATCH", url, request_data, (response) => {
            let data = response["data"];
            Utils.callback(success, [data]);
        }, (response) => {
            Utils.callback(fail, [response]);
        }, freeze);
    }
    getItem(id, success, fail, freeze = false, load_cache_first = false) {
        let m = this, url = this.getItemURI(id), cache_id = id;
        if (load_cache_first) {
            let tmp_data = m.getCacheManager().getItem(cache_id);
            if (tmp_data && tmp_data.item) {
                Utils.callback(success, [tmp_data, false]);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, null, (response) => {
            let entity = response["data"];
            m.getCacheManager().setItem(cache_id, entity);
            Utils.callback(success, [entity, true, response]);
        }, (response) => {
            let entity = m.getCacheManager().getItem(cache_id);
            if (entity) {
                Utils.callback(success, [entity, false, response]);
            }
            else {
                Utils.callback(fail, [response]);
            }
        }, freeze);
    }
    getAllItems(options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getServiceURI(), filters = options["filters"], request_data = {};
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
        return this.app_context.request("GET", url, request_data, (response) => {
            let data = response["data"];
            force_cache &&
                m.getCacheManager().setItem(cache_id, data);
            Utils.callback(success, [data, true, response]);
        }, (response) => {
            let data;
            if (force_cache &&
                (data = m.getCacheManager().getItem(cache_id))) {
                Utils.callback(success, [data, false, response]);
            }
            else {
                Utils.callback(fail, [response]);
            }
        }, freeze);
    }
    getRelationItems(id, relation, options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getItemRelationURI(id, relation), filters = options["filters"], request_data = {};
        if (typeof options["max"] === "number") {
            request_data["max"] = options["max"];
        }
        if (typeof options["page"] === "number") {
            request_data["page"] = options["page"];
        }
        if (Utils.isPlainObject(filters)) {
            request_data["filters"] = filters;
        }
        let cache_id = toKey(Utils.assign({ relation: relation }, request_data));
        if (force_cache && load_cache_first) {
            let tmp_data = this.getCacheManager().getItem(cache_id);
            if (tmp_data && tmp_data.items &&
                Object.keys(tmp_data.items).length) {
                Utils.callback(success, [tmp_data, false]);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, request_data, function (response) {
            let data = response["data"];
            if (force_cache) {
                m.getCacheManager().setItem(cache_id, data);
            }
            Utils.callback(success, [data, true, response]);
        }, function (response) {
            let data;
            if (force_cache &&
                (data = m.getCacheManager().getItem(cache_id))) {
                Utils.callback(success, [data, false, response]);
            }
            else {
                Utils.callback(fail, [response]);
            }
        }, freeze);
    }
}
//# sourceMappingURL=OWebService.js.map