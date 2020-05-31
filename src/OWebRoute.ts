import { escapeRegExp, isArray, isPlainObject, isString } from './utils/Utils';
import OWebRouteContext from './OWebRouteContext';

export type tRoutePath = string | RegExp;
export type tRoutePathOptions = {
	[key: string]: RegExp | keyof typeof tokenTypesRegMap;
};
export type tRouteTokensMap = { [key: string]: string };
export type tRouteAction = (ctx: OWebRouteContext) => void;
export type tRouteInfo = { reg: RegExp | null; tokens: string[] };

const tokenTypesRegMap = {
		'num': /\d+/.source,
		'alpha': /[a-zA-Z]+/.source,
		'alpha-fullUrl': /[a-z]+/.source,
		'alpha-l': /[A-Z]+/.source,
		'alpha-num': /[a-zA-Z0-9]+/.source,
		'alpha-num-l': /[a-z0-9]+/.source,
		'alpha-num-fullUrl': /[A-Z0-9]+/.source,
		'any': /[^/]+/.source,
	},
	tokenReg = /:([a-z][a-z0-9_]*)/i,
	stringReg = function (str: string) {
		return new RegExp(escapeRegExp(str));
	},
	wrapReg = (str: string, capture: boolean = false) =>
		capture ? '(' + str + ')' : '(?:' + str + ')';

export default class OWebRoute {
	private readonly path: string;
	private readonly reg: RegExp | null;
	private tokens: string[];
	private readonly action: tRouteAction;

	/**
	 * OWebRoute Constructor.
	 *
	 * @param path The route path string or regexp.
	 * @param options The route options.
	 * @param action The route action function.
	 */
	constructor(
		path: string | RegExp,
		options: tRoutePathOptions | string[],
		action: tRouteAction,
	) {
		if (path instanceof RegExp) {
			this.path = path.toString();
			this.reg = path;
			this.tokens = isArray(options) ? options : [];
		} else if (isString(path) && path.length) {
			options = (isPlainObject(options)
				? options
				: {}) as tRoutePathOptions;
			const p = OWebRoute.parseDynamicPath(path, options);
			this.path = path;
			this.reg = p.reg;
			this.tokens = p.tokens;
		} else {
			throw new TypeError(
				'[OWebRoute] invalid route path, string or RegExp required.',
			);
		}

		if ('function' !== typeof action) {
			throw new TypeError(
				`[OWebRoute] invalid action type, got "${typeof action}" instead of "function".`,
			);
		}

		this.action = action;
	}

	/**
	 * Returns true if this route is dynamic false otherwise.
	 */
	isDynamic() {
		return this.reg != null;
	}

	/**
	 * Gets route action.
	 */
	getAction(): tRouteAction {
		return this.action;
	}

	/**
	 * Checks if a given pathname match this route.
	 *
	 * @param pathname
	 */
	is(pathname: string): boolean {
		return this.reg ? this.reg.test(pathname) : this.path === pathname;
	}

	/**
	 * Parse a given pathname.
	 *
	 * @param pathname
	 */
	parse(pathname: string): tRouteTokensMap {
		if (this.isDynamic()) {
			const founds: any = String(pathname).match(this.reg as RegExp);

			if (founds) {
				return this.tokens.reduce(
					(acc: any, key: string, index: number) => {
						acc[key] = founds[index + 1];
						return acc;
					},
					{},
				);
			}
		}

		return {};
	}

	/**
	 * Parse dynamic path and returns appropriate regexp and tokens list.
	 *
	 * ```js
	 * let format = "path/to/:id/file/:index/name.:format";
	 * let options = {
	 * 		id: "num",
	 * 		index: "alpha",
	 * 		format:	"alpha-num"
	 * };
	 * let info = parseDynamicPath(format,options);
	 *
	 * info === {
	 *     reg: RegExp,
	 *     tokens: ["id","index","format"]
	 * };
	 * ```
	 * @param path The path format string.
	 * @param options The path options.
	 */
	static parseDynamicPath(
		path: string,
		options: tRoutePathOptions,
	): tRouteInfo {
		const tokens: string[] = [];
		let reg: string = '',
			_path: string = path,
			match: RegExpExecArray | null;

		// tslint:disable-next-line: no-conditional-assignment
		while ((match = tokenReg.exec(_path)) != null) {
			const found: any = match[0],
				token: any = match[1],
				rule: any = options[token] || 'any',
				head: string = _path.slice(0, match.index);

			if (head.length) {
				reg += wrapReg(stringReg(head).source);
			}

			if (typeof rule === 'string' && rule in tokenTypesRegMap) {
				reg += wrapReg((tokenTypesRegMap as any)[rule], true);
			} else if (rule instanceof RegExp) {
				reg += wrapReg(rule.source, true);
			} else {
				throw new Error(
					`Invalid rule for token ':${token}' in path '${path}'`,
				);
			}

			tokens.push(token);

			_path = _path.slice(match.index + found.length);
		}

		if (!reg.length) {
			return {
				reg: null,
				tokens,
			};
		}

		if (_path.length) {
			reg += wrapReg(stringReg(_path).source);
		}

		return {
			reg: new RegExp('^' + reg + '$'),
			tokens,
		};
	}
}
