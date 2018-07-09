"use strict";

import OWebApp from "./OWebApp";
import PathResolver from "./utils/PathResolver";

let is_web = typeof window === "object" && typeof window.location === "object";

let isServerUrl = function (url_key: string): boolean {
	return /^(OZ_)?SERVER_/.test(url_key);
};

let isLocalUrl = function (url_key: string): boolean {
	return /^(OZ_)?LOCAL_/.test(url_key);
};

export type tUrlList = { [key: string]: string };

export default class OWebUrl {
	private readonly _url_list: tUrlList;
	private readonly _url_local_base: string;
	private readonly _url_server_base: string;

	constructor(context: OWebApp, url_list: tUrlList) {
		this._url_list        = url_list;
		this._url_local_base  = context.configs.get("OZ_APP_LOCAL_BASE_URL");
		this._url_server_base = context.configs.get("OZ_APP_API_BASE_URL");
	}

	get(url_key: string): string {
		return this._addBaseUrl(url_key);
	}

	localResolve(url: string): string {
		return PathResolver.resolve(this._url_local_base, url);
	}

	serverResolve(url: string): string {
		return PathResolver.resolve(this._url_server_base, url);
	}

	private _addBaseUrl(url_key: string): string {
		let url: string = this._url_list[url_key];

		if (!url) {
			throw new Error(`OWebUrl: url key "${url_key}" is not defined.`);
		}

		return isServerUrl(url_key) ? this.localResolve(url) : !is_web && isLocalUrl(url_key) ? this.serverResolve(url) : url;
	}
};