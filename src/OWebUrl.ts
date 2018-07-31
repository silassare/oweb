"use strict";

import OWebApp from "./OWebApp";
import PathResolver from "./utils/PathResolver";

let isServerUrl = function (url_key: string): boolean {
	return /^OZ_SERVER_/.test(url_key);
};

let isLocalUrl = function (url_key: string): boolean {
	return /^OW_LOCAL_/.test(url_key);
};

export type tUrlList = { [key: string]: string };

export default class OWebUrl {
	private readonly _url_list: tUrlList;
	private readonly _url_local_base: string;
	private readonly _url_server_base: string;

	constructor(context: OWebApp, url_list: tUrlList) {
		this._url_list        = url_list;
		this._url_local_base  = context.configs.get("OW_APP_LOCAL_BASE_URL");
		this._url_server_base = context.configs.get("OZ_API_BASE_URL");

		console.log("[OWebUrl] ready!");
	}

	get(url_key: string): string {
		let url: string = this._url_list[url_key];

		if (!url) {
			throw new Error(`[OWebUrl] url key "${url_key}" is not defined.`);
		}

		if (isServerUrl(url_key)) return this.resolveServer(url);
		if (isLocalUrl(url_key)) return this.resolveLocal(url);

		return url;
	}

	resolveLocal(url: string): string {
		return PathResolver.resolve(this._url_local_base, url);
	}

	resolveServer(url: string): string {
		return PathResolver.resolve(this._url_server_base, url);
	}
};