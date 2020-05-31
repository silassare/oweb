import OWebApp from './OWebApp';
import PathResolver from './utils/PathResolver';

const isServerUrl = function (urlKey: string): boolean {
		return /^OZ_SERVER_/.test(urlKey);
	},
	isLocalUrl = function (urlKey: string): boolean {
		return /^OW_LOCAL_/.test(urlKey);
	};

export type tUrlList = { [key: string]: string };

export default class OWebUrl {
	private readonly _urlList: tUrlList;
	private readonly _urlLocalBase: string;
	private readonly _urlServerBase: string;

	constructor(context: OWebApp, urlList: tUrlList) {
		this._urlList = urlList;
		this._urlLocalBase = context.configs.get('OW_APP_LOCAL_BASE_URL');
		this._urlServerBase = context.configs.get('OZ_API_BASE_URL');

		console.log('[OWebUrl] ready!');
	}

	/**
	 * Gets url value with a given url key name.
	 *
	 * @param key The url key name.
	 */
	get(key: string): string {
		const url: string = this._urlList[key];

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
		return PathResolver.resolve(this._urlLocalBase, url);
	}

	/**
	 * Resolve url with server base.
	 *
	 * @param url
	 */
	resolveServer(url: string): string {
		return PathResolver.resolve(this._urlServerBase, url);
	}
}
