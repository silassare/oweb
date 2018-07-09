"use strict";
import PathResolver from "./utils/PathResolver";
let is_web = typeof window === "object" && typeof window.location === "object";
let isServerUrl = function (url_key) {
    return /^(OZ_)?SERVER_/.test(url_key);
};
let isLocalUrl = function (url_key) {
    return /^(OZ_)?LOCAL_/.test(url_key);
};
export default class OWebUrl {
    constructor(context, url_list) {
        this._url_list = url_list;
        this._url_local_base = context.configs.get("OZ_APP_LOCAL_BASE_URL");
        this._url_server_base = context.configs.get("OZ_APP_API_BASE_URL");
    }
    get(url_key) {
        return this._addBaseUrl(url_key);
    }
    localResolve(url) {
        return PathResolver.resolve(this._url_local_base, url);
    }
    serverResolve(url) {
        return PathResolver.resolve(this._url_server_base, url);
    }
    _addBaseUrl(url_key) {
        let url = this._url_list[url_key];
        if (!url) {
            throw new Error(`OWebUrl: url key "${url_key}" is not defined.`);
        }
        return isServerUrl(url_key) ? this.localResolve(url) : !is_web && isLocalUrl(url_key) ? this.serverResolve(url) : url;
    }
}
;
//# sourceMappingURL=OWebUrl.js.map