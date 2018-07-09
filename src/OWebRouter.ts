"use strict";

/*
 t = "path/to/:id/file/:index/name.:format";
 p = {id:"num",index:"alpha",format:"alpha-num"};
 parseDynamicPath(t,p);
*/
import Utils from "./utils/Utils";

export type tRouteOptions = { [key: string]: string };
export type tRouteParams = { [key: string]: any };
export type tRouteInfo = { reg: RegExp | null, tokens: Array<string> };
export type tRouteAction = (ctx: RouteContext) => {};

const token_type_reg_map = {
		  "num": (/(\d+)/).source,
		  "alpha": (/([a-zA-Z]+)/).source,
		  "alpha-u": (/([a-z]+)/).source,
		  "alpha-l": (/([A-Z]+)/).source,
		  "alpha-num": (/([a-zA-Z0-9]+)/).source,
		  "alpha-num-l": (/([a-z0-9]+)/).source,
		  "alpha-num-u": (/([A-Z0-9]+)/).source,
		  "any": /([^/]+)/.source
	  },
	  token_reg          = /:([a-z][a-z0-9_]*)/i,
	  wLoc               = window.location;

let escapeString = function (str: string) {
	return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
};

let stringReg = function (str: string) {
	return new RegExp(escapeString(str));
};

let getPathname = (url: URL | Location, hash: boolean = true) => {
	return hash ? url.hash.replace(/^#/, "") : url.pathname;
};

let parseDynamicPath = function (path: string, options: tRouteOptions): tRouteInfo {

	let tokens: Array<string> = [],
		reg: string           = "",
		_path: string         = path,
		match: RegExpExecArray | null;

	while ((match = token_reg.exec(_path)) != null) {
		let found: any   = match[0],
			token: any   = match[1],
			rule: any    = options[token] || "any",
			head: string = _path.slice(0, match.index);

		if (head.length) {
			reg += stringReg(head).source;
		}

		if (typeof rule === "string" && rule in token_type_reg_map) {
			reg += (token_type_reg_map as any)[rule];
		} else if (rule instanceof RegExp) {
			reg += rule.source;
		} else {
			throw new Error("Invalid rule for token ':" + token + "' in path '" + path + "'");
		}

		tokens.push(token);

		_path = _path.slice(match.index + found.length);
	}

	if (!reg.length) {
		return {
			reg: null,
			tokens: tokens
		};
	}

	if (_path.length) {
		reg += stringReg(_path).source;
	}

	return {
		reg: new RegExp("^" + reg + "$"),
		tokens: tokens
	};
};

export class Route {
	private readonly path: string;
	private readonly reg: RegExp | null;
	private tokens: Array<string>;
	private readonly action: tRouteAction;

	constructor(path: string | RegExp, rules: tRouteOptions, action: tRouteAction) {

		if (path instanceof RegExp) {
			this.path   = path.source;
			this.reg    = path;
			this.tokens = Utils.isArray(rules) ? rules : [];
		} else if (Utils.isString(path) && path.length) {
			let result  = parseDynamicPath(path, rules);
			this.path   = path;
			this.reg    = result.reg;
			this.tokens = result.tokens;
		} else {
			throw new TypeError("Invalid route path, string or RegExp required.");
		}

		if ("function" !== typeof action) {
			throw new TypeError("Invalid action type, got '" + typeof action + "' instead of 'function'.");
		}

		this.action = action;
	}

	isDynamic() {
		return this.reg != null;
	}

	getPath(): string {
		return this.path;
	}

	getAction(): tRouteAction {
		return this.action;
	}

	is(path: string): boolean {
		return (this.reg) ? this.reg.test(path) : this.path === path;
	}

	parse(path: string): tRouteParams {

		if (this.isDynamic()) {
			let founds: any;

			if (founds = String(path).match(this.reg as RegExp)) {
				return this.tokens.reduce((acc: any, key: string, index: number) => {
					acc[key] = founds[index + 1];
					return acc;
				}, {});

			}
		}

		return {};
	}
}

export class RouteContext {
	private readonly tokens: tRouteParams = {};
	private readonly params: tRouteParams = {};
	private readonly url: URL;
	private _stop: boolean                = false;

	constructor(route: Route, url: URL, hashMode: boolean = true) {
		this.tokens = route.parse(getPathname(url, hashMode));
		this.params = Utils.parseQueryString(url.search.replace(/^\?/, ""));
		this.url    = url;
	}

	getToken(token: string): any {
		return this.tokens[token];
	}

	getParam(key: string): any {
		return this.params[key];
	}

	stop(): this {
		this._stop = true;
		return this;
	}

	stopped(): boolean {
		return this._stop;
	}
}

export default class OWebRouter {
	static readonly SELF = "OWebRouter";

	private _currentPath: string  = "";
	private _routes: Route[]      = [];
	private _initialized: boolean = false;

	constructor(private readonly hashMode: boolean = true) {
	}

	start(): this {
		let s = this;
		if (s._initialized) {
			return this;
		}

		s._initialized = true;

		let onPopState   = function (ev: any) {
			console.log("popstate", arguments);
		};
		let onHashChange = function (ev: any) {
			console.log("hashchange", arguments);
		};

		if (s.hashMode) {
			window.onhashchange = onHashChange;
		} else {
			window.onpopstate = onPopState;
		}
		return this;
	}

	on(path: string | RegExp, rules: tRouteOptions, action: tRouteAction): this {
		this._routes.push(new Route(path, rules, action));
		return this;
	}

	protected dispatch(force: boolean, cancelable: boolean = false): this {
		let s    = this,
			path = getPathname(wLoc, this.hashMode);

		if (this._currentPath !== path || force) {
			this._currentPath = path;

			let url: URL                     = new URL(wLoc.href),
				len = this._routes.length, i = 0;

			while (i < len) {
				let route = this._routes[i];

				// check if the location change during
				if (this._currentPath !== path) {
					console.warn(`OWebRouter: location change while dispatching: ${path} -> ${this._currentPath}`);
					break;
				}

				if (route.is(path)) {
					let fn   = route.getAction(),
						rCtx = new RouteContext(route, url, s.hashMode);

					Utils.callback(fn, [rCtx]);

					if (rCtx.stopped() && cancelable) {
						console.warn(`OWebRouter: dispatch canceled for ${path}`);
						break;
					}
				}
			}

		}

		return this;
	}
}