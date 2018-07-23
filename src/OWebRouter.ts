"use strict";

/*
 t = "path/to/:id/file/:index/name.:format";
 p = {id:"num",index:"alpha",format:"alpha-num"};
 parseDynamicPath(t,p);
*/
import Utils from "./utils/Utils";

export type tRouteOptions = { [key: string]: keyof typeof token_type_reg_map };
export type tRouteParams = { [key: string]: any };
export type tRouteAction = (ctx: OWebRouteContext) => void;
type tRouteInfo = { reg: RegExp | null, tokens: Array<string> };

const token_type_reg_map = {
		  "num"        : (/(\d+)/).source,
		  "alpha"      : (/([a-zA-Z]+)/).source,
		  "alpha-u"    : (/([a-z]+)/).source,
		  "alpha-l"    : (/([A-Z]+)/).source,
		  "alpha-num"  : (/([a-zA-Z0-9]+)/).source,
		  "alpha-num-l": (/([a-z0-9]+)/).source,
		  "alpha-num-u": (/([A-Z0-9]+)/).source,
		  "any"        : /([^/]+)/.source
	  },
	  token_reg          = /:([a-z][a-z0-9_]*)/i,
	  wLoc               = window.location,
	  wDoc               = window.document,
	  wHistory           = window.history;

let escapeString = function (str: string) {
	return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
};

let stringReg = function (str: string) {
	return new RegExp(escapeString(str));
};

let fixPath = (path: string): string => {
	if (!path.length || path == "/") {
		return "/";
	}
	path = path.replace(/^#/, "");

	if (path[0] != "/") {
		path = "/" + path;
	}

	return path;
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
			reg   : null,
			tokens: tokens
		};
	}

	if (_path.length) {
		reg += stringReg(_path).source;
	}

	return {
		reg   : new RegExp("^" + reg + "$"),
		tokens: tokens
	};
};

export class OWebRoute {
	private readonly path: string;
	private readonly reg: RegExp | null;
	private tokens: Array<string>;
	private readonly action: tRouteAction;

	constructor(path: string | RegExp, rules: tRouteOptions, action: tRouteAction) {

		if (path instanceof RegExp) {
			this.path   = path.toString();
			this.reg    = path;
			this.tokens = Utils.isArray(rules) ? rules : [];
		} else if (Utils.isString(path) && path.length) {
			rules       = Utils.isPlainObject(rules) ? rules : {};
			let p       = parseDynamicPath(path, rules);
			this.path   = path;
			this.reg    = p.reg;
			this.tokens = p.tokens;
		} else {
			throw new TypeError("[OWebRoute] invalid route path, string or RegExp required.");
		}

		if ("function" !== typeof action) {
			throw new TypeError(`[OWebRoute] invalid action type, got "${ typeof action}" instead of "function".`);
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

export type tRouteStateItem = string | number | null | undefined | Date | tRouteStateObject;
export type tRouteStateObject = {
	[key: string]: tRouteStateItem
};

export class OWebRouteContext {
	private _tokens: tRouteParams;
	private readonly _params: tRouteParams;
	private readonly _url: URL;
	private readonly _path: string;
	private _stopped: boolean = false;
	private _saved: boolean   = false;
	private readonly _state: tRouteStateObject;

	constructor(path: string, url: URL) {
		this._url    = url;
		this._path   = path;
		this._tokens = {};
		this._params = Utils.parseQueryString(this._url.search.replace(/^\?/, ""));

		let hState  = history.state || {};
		this._state = hState.data || {};

		if (hState.path && hState.path !== path) {// should never be true
			console.warn("[OWebRouteContext] using another path state, %s != %s", hState.path, path);
		}
	}

	getToken(key: string): any {
		return this._tokens[key];
	}

	getTokens() {
		return Object.create(this._tokens);
	}

	getParam(key: string): any {
		return this._params[key];
	}

	getParams() {
		return Object.create(this._params);
	}

	getPath(): string {
		return this._path;
	}

	stop(): this {
		this._stopped = true;
		return this;
	}

	stopped(): boolean {
		return this._stopped;
	}

	saved(): boolean {
		return this._saved;
	}

	setTitle(title: string): this {
		if (title.length) {
			wDoc.title = title;
		}

		return this;
	}

	pushState(): this {
		if (!this._saved) {
			this._saved = true;
			let state   = {
				"path": this._path,
				"data": this._state
			};
			wHistory.pushState(state, wDoc.title, this._url.href);
			console.log("[OWebRouteContext] state pushed", history.state, this._url.href);
		} else {
			// just update history state
			console.log("[OWebRouteContext] state push ignored -> will replace");
			this.replaceState();
		}

		return this;
	}

	replaceState(): this {
		this._saved = true;
		let state   = {
			"path": this._path,
			"data": this._state
		};

		wHistory.replaceState(state, wDoc.title, this._url.href);

		console.log("[OWebRouteContext] state replaced", history.state, this._url.href);

		return this;
	}

	runAction(route: OWebRoute): this {
		let fn       = route.getAction();
		this._tokens = route.parse(this._path);

		Utils.callback(fn, [this]);

		return this;
	}
}

export default class OWebRouter {
	private readonly _baseUrl: string;
	private readonly _hashMode: boolean;
	private _currentPath: string                            = "";
	private _routes: OWebRoute[]                            = [];
	private _initialized: boolean                           = false;
	private _listening: boolean                             = false;
	private _historyCount: number                           = 0;
	private _notFound: undefined | ((path: string) => void) = undefined;
	private readonly _popStateListener: (e: PopStateEvent) => void;

	constructor(baseUrl: string, hashMode: boolean = true) {
		let r                  = this;
		this._baseUrl          = baseUrl;
		this._hashMode         = hashMode;
		this._popStateListener = (e: PopStateEvent) => {
			r.onPopState(e);
		};

		console.log("[OWebRouter] ready!");
	}

	start(runBrowse: boolean = true, path: string = wLoc[this._hashMode ? "hash" : "pathname"]): this {
		if (!this._initialized) {
			this._initialized = true;
			this.register();
			console.log("[OWebRouter] start routing!");
			runBrowse && this.browseTo(path);
		} else {
			console.warn("[OWebRouter] router already started!");
		}

		return this;
	}

	stopRouting(): this {
		if (this._initialized) {
			this._initialized = false;
			this.unregister();
			console.log("[OWebRouter] stop routing!");
		} else {
			console.warn("[OWebRouter] you should start routing first!");
		}

		return this;
	}

	private register(): this {
		if (!this._listening) {
			this._listening = true;
			window.addEventListener("popstate", this._popStateListener, false);
		}
		return this;
	}

	private unregister(): this {
		if (this._listening) {
			this._listening = false;
			window.removeEventListener("popstate", this._popStateListener, false);
		}
		return this;
	}

	private onPopState(e: PopStateEvent) {
		console.log("[OWebRouter] popstate ->", e);

		if (e.state) {
			this.browseTo(e.state.path, e.state.data, true);
		} else {
			this.browseTo(wLoc[this._hashMode ? "hash" : "pathname"]);
		}
	}

	on(path: string | RegExp, rules: tRouteOptions = {}, action: tRouteAction): this {
		console.log("[OWebRouter] watching path ->", path, {rules, action});
		this._routes.push(new OWebRoute(path, rules, action));
		return this;
	}

	notFound(callback: (path: string) => void): this {
		this._notFound = callback;
		return this;
	}

	goBack(distance: number = 1): this {
		if (distance > 0) {
			console.log("[OWebRouter] going back -> ", distance);
			if (this._historyCount > 0) {
				if (this._historyCount >= distance) {
					this._historyCount -= distance;
					wHistory.go(-distance);
				} else {
					let c              = this._historyCount;
					this._historyCount = 0;
					wHistory.go(-c);
				}
			} else {
				this._historyCount = 0;
				this.browseTo(this._baseUrl);
			}
		}

		return this;
	}

	browseTo(path: string, state: any = {}, replace: boolean = false): this {
		console.log("[OWebRouter] browsing to -> ", path, state, replace);

		path = fixPath(path);

		if (this._currentPath !== path) {
			this._currentPath = path;
			this._historyCount++;
			let url  = new URL(path, this._baseUrl),
				rCtx = new OWebRouteContext(path, url),
				found;

			if (replace) {
				rCtx.pushState();
			}

			found = this.dispatch(rCtx, true);

			if (!found.length) {
				console.log("[OWebRouter] no route found for path ->", path);
				if (this._notFound) {
					this._notFound(path);
				} else {
					console.warn("[OWebRouter] notFound action is not defined!");
					this.stopRouting();
				}
			} else if (!replace && !rCtx.saved()) {
				rCtx.pushState();
			}
		}

		return this;
	}

	private dispatch(rCtx: OWebRouteContext, cancelable: boolean = true): OWebRoute[] {
		console.log("[OWebRouter] dispatch start -> ", rCtx, cancelable);

		let path               = rCtx.getPath(),
			len                = this._routes.length,
			i                  = -1,
			found: OWebRoute[] = [];

		while (++i < len) {
			let route = this._routes[i];

			// check if the location change during
			if (this._currentPath !== path) {
				console.warn(`[OWebRouter] location change while dispatching: ${path} -> ${this._currentPath}`);
				break;
			}

			if (route.is(path)) {
				found.push(route);

				rCtx.runAction(route);

				if (rCtx.stopped() && cancelable) {
					console.warn(`[OWebRouter] dispatch canceled for "${path}" by route action ->`, route.getAction());
					break;
				}
			}
		}

		console.log("[OWebRouter] dispatch end, routes ->", found);
		return found;
	}
}