import OWebApp from './OWebApp';
import PathResolver from './utils/PathResolver';
import { logger } from './utils';

const isServerUrl = function isServerUrl(urlKey: string): boolean {
		return /^OZ_SERVER_/.test(urlKey);
	},
	isLocalUrl = function isLocalUrl(urlKey: string): boolean {
		return /^OW_LOCAL_/.test(urlKey);
	};

export default class OWebUrl<T extends { [key: string]: string } = any> {
	private readonly _urlList: T;
	private readonly _urlLocalBase: string;
	private readonly _urlServerBase: string;

	constructor(context: OWebApp, urlList: T) {
		this._urlList = urlList;
		this._urlLocalBase = context.configs.get('OW_APP_LOCAL_BASE_URL');
		this._urlServerBase = context.configs.get('OZ_API_BASE_URL');

		logger.info('[OWebUrl] ready!');
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
