import OWebApp from "./OWebApp";
import PathResolver from "./utils/PathResolver";

let isServerUrl = function (url_key: string): boolean {
	return /^OZ_SERVER_/.test(url_key);
}, isLocalUrl   = function (url_key: string): boolean {
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

	/**
	 * Gets url value with a given url key name.
	 *
	 * @param key The url key name.
	 */
	get(key: string): string {
		let url: string = this._url_list[key];

		if (!url) {
			throw new Error(`[OWebUrl] url key "${key}" is not defined.`);
		}

		if (isServerUrl(key)) return this.resolveServer(url);
		if (isLocalUrl(key)) return this.resolveLocal(url);

		return url;
	}

	/**
	 * Resolve url with local base.
	 *
	 * @param url
	 */
	resolveLocal(url: string): string {
		return PathResolver.resolve(this._url_local_base, url);
	}

	/**
	 * Resolve url with server base.
	 *
	 * @param url
	 */
	resolveServer(url: string): string {
		return PathResolver.resolve(this._url_server_base, url);
	}
};