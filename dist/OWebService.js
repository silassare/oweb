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
        let s_url = app_context.configs.get("OZ_API_BASE_URL")
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
    add(formData, success, fail, freeze = false) {
        let url = this.getServiceURI();
        return this.app_context.request("POST", url, formData, (response) => {
            success(response["data"]);
        }, fail, freeze);
    }
    delete(id, success, fail, freeze = false) {
        let m = this, url = this.getItemURI(id);
        return this.app_context.request("DELETE", url, null, (response) => {
            m.getCacheManager().removeItem(id);
            success(response["data"]);
        }, fail, freeze);
    }
    update(id, formData, success, fail, freeze = false) {
        let url = this.getItemURI(id);
        return this.app_context.request("PATCH", url, formData, (response) => {
            success(response["data"]);
        }, fail, freeze);
    }
    deleteAll(options, success, fail, freeze = false) {
        let url = this.getServiceURI(), filters = options.filters, request_data = {};
        if (typeof options["max"] === "number") { // will be ignored by O'Zone
            request_data["max"] = options["max"];
        }
        if (typeof options["page"] === "number") { // will be ignored by O'Zone
            request_data["page"] = options["page"];
        }
        if (Utils.isPlainObject(filters)) {
            request_data["filters"] = filters;
        }
        return this.app_context.request("DELETE", url, request_data, (response) => {
            success(response["data"]);
        }, fail, freeze);
    }
    updateAll(options, formData, success, fail, freeze = false) {
        let url = this.getServiceURI(), filters = options.filters, request_data = {
            data: formData
        };
        if (typeof options["max"] === "number") { // will be ignored by O'Zone
            request_data["max"] = options["max"];
        }
        if (typeof options["page"] === "number") { // will be ignored by O'Zone
            request_data["page"] = options["page"];
        }
        if (Utils.isPlainObject(filters)) {
            request_data["filters"] = filters;
        }
        return this.app_context.request("PATCH", url, request_data, (response) => {
            success(response["data"]);
        }, fail, freeze);
    }
    get(id, success, fail, freeze = false, load_cache_first = false) {
        let m = this, url = this.getItemURI(id), cache_id = id;
        if (load_cache_first) {
            let tmp_data = m.getCacheManager().getItem(cache_id);
            if (tmp_data) {
                success(tmp_data, true);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, null, (response) => {
            let data = response["data"];
            m.getCacheManager().setItem(id, data);
            success(data, false);
        }, (response) => {
            let data = m.getCacheManager().getItem(cache_id);
            if (data) {
                success(data, true);
            }
            else {
                fail(response);
            }
        }, freeze);
    }
    getAll(options, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
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
                success(tmp_data, true);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, request_data, (response) => {
            let data = response["data"];
            force_cache && m.getCacheManager().setItem(cache_id, data);
            success(data, false);
        }, (response) => {
            let data;
            if (force_cache &&
                (data = m.getCacheManager().getItem(cache_id))) {
                success(data, true);
            }
            else {
                fail(response);
            }
        }, freeze);
    }
    getRelation(id, relation, success, fail, freeze = false, force_cache = false, load_cache_first = false) {
        let m = this, url = this.getItemRelationURI(id, relation);
        let cache_id = toKey({ id, relation });
        if (force_cache && load_cache_first) {
            let tmp_data = this.getCacheManager().getItem(cache_id);
            if (tmp_data && tmp_data.item &&
                Object.keys(tmp_data.item).length) {
                success(tmp_data, true);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, {}, function (response) {
            let data = response["data"];
            force_cache && m.getCacheManager().setItem(cache_id, data);
            success(data, false);
        }, function (response) {
            let data;
            if (force_cache &&
                (data = m.getCacheManager().getItem(cache_id))) {
                success(data, true);
            }
            else {
                fail(response);
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
                success(tmp_data, true);
                freeze = false;
            }
        }
        return this.app_context.request("GET", url, request_data, function (response) {
            let data = response["data"];
            force_cache && m.getCacheManager().setItem(cache_id, data);
            success(data, false);
        }, function (response) {
            let data;
            if (force_cache &&
                (data = m.getCacheManager().getItem(cache_id))) {
                success(data, true);
            }
            else {
                fail(response);
            }
        }, freeze);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvT1dlYlNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBR2IsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sY0FBYyxNQUFNLGtCQUFrQixDQUFDO0FBaUY5QyxNQUFNLFdBQVcsR0FBVyx3QkFBd0IsRUFDakQsVUFBVSxHQUFZLDRCQUE0QixFQUNsRCxtQkFBbUIsR0FBRyxzQ0FBc0MsQ0FBQztBQUVoRSxJQUFJLEtBQUssR0FBRyxVQUFVLFlBQWlCO0lBQ3RDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPO0lBSWIsWUFBNkIsV0FBb0IsRUFBRSxZQUFvQixFQUFtQixZQUFvQjtRQUFqRixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUF5QyxpQkFBWSxHQUFaLFlBQVksQ0FBUTtRQUU3RyxJQUFJLEtBQUssR0FBUyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQzthQUMxRCxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUM7SUFFL0UsQ0FBQztJQUVELGFBQWE7UUFDWixPQUFPLEtBQUssQ0FBQyxnQkFBZ0Is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