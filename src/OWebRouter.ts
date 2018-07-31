"use strict";
/*
 t = "path/to/:id/file/:index/name.:format";
 p = {id:"num",index:"alpha",format:"alpha-num"};
 parseDynamicPath(t,p);
*/
import Utils from "./utils/Utils";

export type tRouteOptions = { [key: string]: keyof typeof token_type_reg_map };
export type tRouteParams = { [key: string]: any };
export type tRouteAction = (ctx: OWebDispatchContext) => void;
export type tRouteInfo = { reg: RegExp | null, tokens: Array<string> };

interface iRouteDispatcher {
	readonly id: number,
	readonly context: OWebDispatchContext,
	readonly found: OWebRoute[]

	isActive(): boolean,

	dispatch(): void,

	cancel(): void,
}

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

	constructor(path: string | RegExp, rules: tRouteOptions | Array<string>, action: tRouteAction) {

		if (path instanceof RegExp) {
			this.path   = path.toString();
			this.reg    = path;
			this.tokens = Utils.isArray(rules) ? rules : [];
		} else if (Utils.isString(path) && path.length) {
			rules       = <tRouteOptions> (Utils.isPlainObject(rules) ? rules : {});
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

export class OWebDispatchContext {
	private _tokens: tRouteParams;
	private _stopped: boolean = false;
	private readonly _path: string;
	private readonly _state: tRouteStateObject;
	private readonly _router: OWebRouter;

	constructor(router: OWebRouter, path: string, state: tRouteStateObject) {
		this._path   = path;
		this._tokens = {};
		this._state  = state || {};
		this._router = router;
	}

	getToken(token: string): any {
		return this._tokens[token];
	}

	getTokens() {
		return Object.create(this._tokens);
	}

	getPath(): string {
		return this._path;
	}

	getStateItem(key: string): tRouteStateItem {
		return this._state[key];
	}

	setStateItem(key: string, value: tRouteStateItem): this {
		this._state[key] = value;
		return this;
	}

	stopped(): boolean {
		return this._stopped;
	}

	stop(): this {
		if (!this._stopped) {
			console.warn("[OWebDispatchContext] route context will stop.");
			this.save();// save before stop
			this._stopped = true;
			console.warn("[OWebDispatchContext] route context was stopped!");
		} else {
			console.warn("[OWebDispatchContext] route context already stopped!");
		}
		return this;
	}

	save(): this {
		if (!this.stopped()) {
			console.log("[OWebDispatchContext] saving state!");
			this._router.replaceHistory(this._path, this._state);
		} else {
			console.error("[OWebDispatchContext] you shouldn't try to save when stopped.")
		}
		return this;
	}

	actionRunner(route: OWebRoute): this {
		this._tokens = route.parse(this._path);

		route.getAction()(this);

		return this;
	}
}

export default class OWebRouter {
	private readonly _baseUrl: string;
	private readonly _hashMode: boolean;
	private _current_path: string                           = "";
	private _routes: OWebRoute[]                            = [];
	private _initialized: boolean                           = false;
	private _listening: boolean                             = false;
	private _notFound: undefined | ((path: string) => void) = undefined;
	private readonly _popStateListener: (e: PopStateEvent) => void;
	private _dispatch_id                                    = 0;
	private _current_dispatcher?: iRouteDispatcher;

	constructor(baseUrl: string, hashMode: boolean = true) {
		let r                  = this;
		this._baseUrl          = baseUrl;
		this._hashMode         = hashMode;
		this._popStateListener = (e: PopStateEvent) => {
			r.onPopState(e);
		};

		console.log("[OWebRouter] ready!");
	}

	start(firstRun: boolean = true, path: string = this.getLocationPath()): this {
		if (!this._initialized) {
			this._initialized = true;
			this.register();
			console.log("[OWebRouter] start routing!");
			console.log("[OWebRouter] watching routes ->", this._routes);
			firstRun && this.browseTo(path, undefined, false);
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

	getCurrentPath(): string {
		return this._current_path;
	}

	getLocationPath(): string {
		// TODO when using pathname make sure to remove base uri pathname for app in subdirectory
		return fixPath(wLoc[this._hashMode ? "hash" : "pathname"]);
	}

	pathToURL(path: string): URL {
		path = fixPath(path);
		return new URL(this._hashMode ? "#" + path : path, this._baseUrl);
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
		console.log("[OWebRouter] popstate ->", arguments);

		if (e.state) {
			this.browseTo(e.state.path, e.state.data, false);
		} else {
			this.browseTo(this.getLocationPath(), undefined, false);
		}
	}

	on(path: string | RegExp, rules: tRouteOptions = {}, action: tRouteAction): this {
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
			let hLen = wHistory.length;
			if (hLen > 1) {
				if (hLen >= distance) {
					wHistory.go(-distance);
				} else {
					wHistory.go(-hLen);
				}
			} else {
				console.warn("[OWebRouter] can't go back -> history.length === 1", distance);
			}
		}

		return this;
	}

	browseTo(path: string, state: tRouteStateObject = {}, push: boolean = true, ignoreIfSamePath: boolean = false): this {
		path = fixPath(path);

		console.log("[OWebRouter] browsing to -> ", path, state, push);

		if (ignoreIfSamePath && this._current_path !== path) {
			console.log("[OWebRouter] ignore same path -> ", path);
			return this;
		}

		if (this._current_dispatcher && this._current_dispatcher.isActive()) {
			this._current_dispatcher.cancel();
		}

		this._current_path = path;

		push && this.addHistory(path, state);

		let cd = this._current_dispatcher = this.createDispatcher(path, state, ++this._dispatch_id);

		cd.dispatch();

		if (cd.id === this._dispatch_id && !cd.context.stopped()) {
			if (!cd.found.length) {
				console.warn("[OWebRouter] no route found for path ->", path);
				if (this._notFound) {
					this._notFound(path);
				} else {
					console.error("[OWebRouter] notFound action is not defined!");
					this.stopRouting();
				}
			} else {
				cd.context.save();
				console.log("[OWebRouter] success ->", path);
			}
		}

		return this;
	}

	addHistory(path: string, data: tRouteStateObject, title: string = ""): this {
		path      = fixPath(path);
		title     = title && title.length ? title : wDoc.title;
		let state = {
				"path": path,
				"data": data
			},
			url   = this.pathToURL(path);

		wHistory.pushState(state, title, url.href);
		console.warn("[OWebDispatchContext] history added", wHistory.state, url.href);

		return this;
	}

	replaceHistory(path: string, data: tRouteStateObject, title: string = ""): this {
		path      = fixPath(path);
		title     = title && title.length ? title : wDoc.title;
		let state = {
				"path": path,
				"data": data
			},
			url   = this.pathToURL(path);

		wHistory.replaceState(state, title, url.href);
		console.warn("[OWebDispatchContext] history updated", wHistory.state);

		return this;
	}

	private createDispatcher(path: string, state: tRouteStateObject, id: number): iRouteDispatcher {

		console.log(`[OWebRouter][dispatcher-${id}] creation.`);

		let ctx                = this,
			found: OWebRoute[] = [],
			len                = this._routes.length,
			active             = false,
			dispatchContext    = new OWebDispatchContext(this, path, state),
			o                  = {
				context : dispatchContext,
				id,
				found,
				isActive: () => active,
				cancel  : function () {
					if (active) {
						active = false;
						console.warn(`[OWebRouter][dispatcher-${id}] cancel called!`);
					} else {
						console.error(`[OWebRouter][dispatcher-${id}] cancel called when inactive.`);
					}
				},
				dispatch: function () {
					if (!active) {
						console.log(`[OWebRouter][dispatcher-${id}] start ->`, o);
						active = true;
						let i  = -1;

						while (++i < len) {
							if (!active) {
								console.warn(`[OWebRouter][dispatcher-${id}] browseTo called while dispatching: ${path} -> ${ctx._current_path}`);
								break;
							}

							let route = ctx._routes[i];

							if (dispatchContext.stopped()) {
								console.warn(`[OWebRouter][dispatcher-${id}] canceled for "${path}" by route action ->`, route.getAction());
								o.cancel();
								break;
							}

							if (route.is(path)) {
								found.push(route);
								dispatchContext.actionRunner(route);
							}
						}

						active = false;
					} else {
						console.warn(`[OWebRouter][dispatcher-${id}] is busy`);
					}
				}
			};

		return o;
	}
}