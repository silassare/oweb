import Utils from './utils/Utils';

export type tRoutePath = string | RegExp;
export type tRoutePathOptions = {
	[key: string]: RegExp | keyof typeof tokenTypesRegMap;
};
export type tRouteTokensMap = { [key: string]: string };
export type tRouteAction = (ctx: OWebRouteContext) => void;
export type tRouteInfo = { reg: RegExp | null; tokens: Array<string> };
type _tRouteStateItem =
	| string
	| number
	| boolean
	| null
	| undefined
	| Date
	| tRouteStateObject;
export type tRouteStateItem = _tRouteStateItem | Array<_tRouteStateItem>;
export type tRouteStateObject = { [key: string]: tRouteStateItem };
export type tRouteTarget = {
	parsed: string;
	href: string;
	path: string;
	fullPath: string;
};

export interface iRouteDispatcher {
	readonly id: number;
	readonly context: OWebRouteContext;
	readonly found: OWebRoute[];

	isActive(): boolean;

	dispatch(): this;

	cancel(): this;
}

const tokenTypesRegMap = {
		num: /\d+/.source,
		alpha: /[a-zA-Z]+/.source,
		'alpha-u': /[a-z]+/.source,
		'alpha-l': /[A-Z]+/.source,
		'alpha-num': /[a-zA-Z0-9]+/.source,
		'alpha-num-l': /[a-z0-9]+/.source,
		'alpha-num-u': /[A-Z0-9]+/.source,
		any: /[^/]+/.source,
	},
	token_reg = /:([a-z][a-z0-9_]*)/i,
	wLoc = window.location,
	wDoc = window.document,
	wHistory = window.history,
	linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click',
	hashTagStr = '#!';

const which = function(e: any) {
		e = e || window.event;
		return null == e.which ? e.button : e.which;
	},
	samePath = function(url: URL) {
		return url.pathname === wLoc.pathname && url.search === wLoc.search;
	},
	sameOrigin = function(href: string) {
		if (!href) return false;
		let url = new URL(href.toString(), wLoc.toString());

		return (
			wLoc.protocol === url.protocol &&
			wLoc.hostname === url.hostname &&
			wLoc.port === url.port
		);
	},
	escapeString = function(str: string) {
		return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1');
	},
	stringReg = function(str: string) {
		return new RegExp(escapeString(str));
	},
	leadingSlash = (path: string): string => {
		if (!path.length || path == '/') {
			return '/';
		}

		return path[0] != '/' ? '/' + path : path;
	},
	wrapReg = (str: string, capture: boolean = false) =>
		capture ? '(' + str + ')' : '(?:' + str + ')';

export class OWebRoute {
	private readonly path: string;
	private readonly reg: RegExp | null;
	private tokens: Array<string>;
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
		options: tRoutePathOptions | Array<string>,
		action: tRouteAction
	) {
		if (path instanceof RegExp) {
			this.path = path.toString();
			this.reg = path;
			this.tokens = Utils.isArray(options) ? options : [];
		} else if (Utils.isString(path) && path.length) {
			options = <tRoutePathOptions>(
				(Utils.isPlainObject(options) ? options : {})
			);
			let p = OWebRoute.parseDynamicPath(path, options);
			this.path = path;
			this.reg = p.reg;
			this.tokens = p.tokens;
		} else {
			throw new TypeError(
				'[OWebRoute] invalid route path, string or RegExp required.'
			);
		}

		if ('function' !== typeof action) {
			throw new TypeError(
				`[OWebRoute] invalid action type, got "${typeof action}" instead of "function".`
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
			let founds: any = String(pathname).match(this.reg as RegExp);

			if (founds) {
				return this.tokens.reduce(
					(acc: any, key: string, index: number) => {
						acc[key] = founds[index + 1];
						return acc;
					},
					{}
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
		options: tRoutePathOptions
	): tRouteInfo {
		let tokens: Array<string> = [],
			reg: string = '',
			_path: string = path,
			match: RegExpExecArray | null;

		while ((match = token_reg.exec(_path)) != null) {
			let found: any = match[0],
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
					"Invalid rule for token ':" +
						token +
						"' in path '" +
						path +
						"'"
				);
			}

			tokens.push(token);

			_path = _path.slice(match.index + found.length);
		}

		if (!reg.length) {
			return {
				reg: null,
				tokens: tokens,
			};
		}

		if (_path.length) {
			reg += wrapReg(stringReg(_path).source);
		}

		return {
			reg: new RegExp('^' + reg + '$'),
			tokens: tokens,
		};
	}
}

export class OWebRouteContext {
	private _tokens: tRouteTokensMap;
	private _stopped: boolean = false;
	private readonly _target: tRouteTarget;
	private readonly _state: tRouteStateObject;
	private readonly _router: OWebRouter;

	/**
	 * OWebRouteContext constructor.
	 *
	 * @param router
	 * @param target
	 * @param state
	 */
	constructor(
		router: OWebRouter,
		target: tRouteTarget,
		state: tRouteStateObject
	) {
		this._target = target;
		this._tokens = {};
		this._state = state || {};
		this._router = router;
	}

	/**
	 * Gets route token value
	 *
	 * @param token The token.
	 */
	getToken(token: string): any {
		return this._tokens[token];
	}

	/**
	 * Gets a map of all tokens and values.
	 */
	getTokens() {
		return Object.create(this._tokens);
	}

	/**
	 * Gets the path.
	 */
	getPath(): string {
		return this._target.path;
	}

	/**
	 * Gets stored value in history state with a given key.
	 *
	 * @param key the state key
	 */
	getStateItem(key: string): tRouteStateItem {
		return this._state[key];
	}

	/**
	 * Sets a key in history state.
	 *
	 * @param key the state key
	 * @param value  the state value
	 */
	setStateItem(key: string, value: tRouteStateItem): this {
		this._state[key] = value;
		return this.save();
	}

	/**
	 * Gets search param.
	 *
	 * @param param the param name
	 */
	getSearchParam(param: string): string | null {
		return new URL(this._target.href).searchParams.get(param);
	}

	/**
	 * Check if the route dispatcher is stopped.
	 */
	stopped(): boolean {
		return this._stopped;
	}

	/**
	 * Stop the route dispatcher.
	 */
	stop(): this {
		if (!this._stopped) {
			console.warn('[OWebDispatchContext] route context will stop.');
			this.save(); // save before stop
			this._stopped = true;
			this._router.getCurrentDispatcher()!.cancel();
			console.warn('[OWebDispatchContext] route context was stopped!');
		} else {
			console.warn(
				'[OWebDispatchContext] route context already stopped!'
			);
		}
		return this;
	}

	/**
	 * Save history state.
	 */
	save(): this {
		if (!this.stopped()) {
			console.log('[OWebDispatchContext] saving state...');
			this._router.replaceHistory(this._target.href, this._state);
		} else {
			console.error(
				"[OWebDispatchContext] you shouldn't try to save when stopped."
			);
		}
		return this;
	}

	/**
	 * Runs action attached to a given route.
	 *
	 * @param route
	 */
	actionRunner(route: OWebRoute): this {
		this._tokens = route.parse(this._target.path);

		route.getAction()(this);

		return this;
	}
}

export default class OWebRouter {
	private readonly _baseUrl: string;
	private readonly _hashMode: boolean;
	private _current_target: tRouteTarget = {
		parsed: '',
		href: '',
		path: '',
		fullPath: '',
	};
	private _routes: OWebRoute[] = [];
	private _initialized: boolean = false;
	private _listening: boolean = false;
	private _notFound: undefined | ((target: tRouteTarget) => void) = undefined;
	private readonly _popStateListener: (e: PopStateEvent) => void;
	private readonly _linkClickListener: (e: MouseEvent | TouchEvent) => void;
	private _dispatch_id = 0;
	private _current_dispatcher?: iRouteDispatcher;
	private _force_replace: boolean = false;

	/**
	 * OWebRouter constructor.
	 *
	 * @param baseUrl the base url
	 * @param hashMode weather to use hash mode
	 */
	constructor(baseUrl: string, hashMode: boolean = true) {
		let r = this;
		this._baseUrl = baseUrl;
		this._hashMode = hashMode;
		this._popStateListener = (e: PopStateEvent) => {
			console.log('[OWebRouter] popstate ->', arguments);

			if (e.state) {
				r.browseTo(e.state.url, e.state.data, false);
			} else {
				r.browseTo(wLoc.href, undefined, false);
			}
		};

		this._linkClickListener = (e: MouseEvent | TouchEvent) => {
			r._onClick(e);
		};

		console.log('[OWebRouter] ready!');
	}

	/**
	 * Starts the router.
	 *
	 * @param firstRun first run flag
	 * @param target initial target, usualy the entry point
	 * @param state initial state
	 */
	start(
		firstRun: boolean = true,
		target: string = wLoc.href,
		state?: tRouteStateObject
	): this {
		if (!this._initialized) {
			this._initialized = true;
			this.register();
			console.log('[OWebRouter] start routing!');
			console.log('[OWebRouter] watching routes ->', this._routes);
			firstRun && this.browseTo(target, state, false);
		} else {
			console.warn('[OWebRouter] router already started!');
		}

		return this;
	}

	/**
	 * Stops the router.
	 */
	stopRouting(): this {
		if (this._initialized) {
			this._initialized = false;
			this.unregister();
			console.log('[OWebRouter] stop routing!');
		} else {
			console.warn('[OWebRouter] you should start routing first!');
		}

		return this;
	}

	/**
	 * When called the current history will be replaced by the next history state.
	 */
	forceNextReplace(): this {
		this._force_replace = true;
		return this;
	}

	/**
	 * Returns the current route target.
	 */
	getCurrentTarget(): tRouteTarget {
		return this._current_target;
	}

	/**
	 * Returns the current route event dispatcher.
	 */
	getCurrentDispatcher(): iRouteDispatcher | undefined {
		return this._current_dispatcher;
	}

	/**
	 * Returns the current route context.
	 */
	getRouteContext(): OWebRouteContext {
		if (!this._current_dispatcher) {
			throw new Error('[OWebRouter] no route context.');
		}

		return this._current_dispatcher.context;
	}

	/**
	 * Parse a given url.
	 *
	 * @param url the url to parse
	 */
	parseURL(url: string | URL): tRouteTarget {
		let b = new URL(this._baseUrl),
			u = new URL(url.toString(), b),
			_: tRouteTarget;

		if (this._hashMode) {
			_ = {
				parsed: url.toString(),
				href: u.href,
				path: u.hash.replace(hashTagStr, ''),
				fullPath: u.hash,
			};
		} else {
			let pathname = u.pathname;
			// when using pathname make sure to remove
			// base uri pathname for app in subdirectory
			if (pathname.indexOf(b.pathname) === 0) {
				pathname = pathname.substr(b.pathname.length);
			}

			_ = {
				parsed: url.toString(),
				href: u.href,
				path: leadingSlash(pathname),
				fullPath: leadingSlash(pathname + u.search + (u.hash || '')),
			};
		}

		console.log('[OWebRouter] parsed url ->', _);

		return _;
	}

	/**
	 * Builds url with a given path and base url.
	 *
	 * @param path the path
	 * @param base the base url
	 */
	pathToURL(path: string, base?: string): URL {
		base = base && base.length ? base : this._baseUrl;

		if (path.indexOf(base) === 0) {
			return new URL(path);
		}

		if (/^https?:\/\//.test(path)) {
			return new URL(path);
		}

		path = this._hashMode ? hashTagStr + leadingSlash(path) : path;

		return new URL(path, base);
	}

	/**
	 * Attach a route action.
	 *
	 * @param path the path to watch
	 * @param rules the path rules
	 * @param action the action to run
	 */
	on(
		path: tRoutePath,
		rules: tRoutePathOptions = {},
		action: tRouteAction
	): this {
		this._routes.push(new OWebRoute(path, rules, action));
		return this;
	}

	/**
	 * Attach a route
	 *
	 * @param handler the notfound handler
	 */
	notFound(handler: (target: tRouteTarget) => void): this {
		this._notFound = handler;
		return this;
	}

	/**
	 * Go back.
	 *
	 * @param distance the distance in history
	 */
	goBack(distance: number = 1): this {
		if (distance > 0) {
			console.log('[OWebRouter] going back -> ', distance);
			let hLen = wHistory.length;
			if (hLen > 1) {
				if (hLen >= distance) {
					wHistory.go(-distance);
				} else {
					wHistory.go(-hLen);
				}
			} else {
				// cordova
				if (window.navigator && (window.navigator as any).app) {
					(window.navigator as any).app.exitApp();
				} else {
					window.close();
				}
			}
		}

		return this;
	}

	/**
	 * Browse to a specific location
	 *
	 * @param url the next url
	 * @param state the initial state
	 * @param push should we push into the history state
	 * @param ignoreSameLocation  ignore browsing again to same location
	 */
	browseTo(
		url: string,
		state: tRouteStateObject = {},
		push: boolean = true,
		ignoreSameLocation: boolean = false
	): this {
		let targetUrl = this.pathToURL(url),
			target = this.parseURL(targetUrl.href),
			_cd = this._current_dispatcher,
			cd: iRouteDispatcher;

		if (!sameOrigin(target.href)) {
			window.open(url);
			return this;
		}

		console.log('[OWebRouter] browsing to -> ', target.path, {
			state,
			push,
			target,
		});

		if (ignoreSameLocation && this._current_target.href === target.href) {
			console.log('[OWebRouter] ignore same location -> ', target.path);
			return this;
		}

		if (_cd && _cd.isActive()) {
			console.warn(
				'[OWebRouter] browseTo called while dispatching -> ',
				_cd
			);
			_cd.cancel();
		}

		this._current_target = target;

		if (this._force_replace) {
			this._force_replace = false;
			this.replaceHistory(targetUrl.href, state);
		} else {
			push && this.addHistory(targetUrl.href, state);
		}

		this._current_dispatcher = cd = this.createDispatcher(
			target,
			state,
			++this._dispatch_id
		);

		if (!cd.found.length) {
			console.warn(
				'[OWebRouter] no route found for path ->',
				target.path
			);
			if (this._notFound) {
				this._notFound(target);
			} else {
				throw new Error('[OWebRouter] notFound action is not defined!');
			}

			return this;
		}

		cd.dispatch();

		if (cd.id === this._dispatch_id && !cd.context.stopped()) {
			cd.context.save();
			console.log('[OWebRouter] success ->', target.path);
		}

		return this;
	}

	/**
	 * Adds history.
	 *
	 * @param url the url
	 * @param state the history state
	 * @param title the window title
	 */
	addHistory(
		url: string,
		state: tRouteStateObject,
		title: string = ''
	): this {
		title = title && title.length ? title : wDoc.title;

		wHistory.pushState({ url, data: state }, title, url);

		console.warn('[OWebDispatchContext] history added', state, url);

		return this;
	}

	/**
	 * Replace the current history.
	 *
	 * @param url the url
	 * @param state the history state
	 * @param title the window title
	 */
	replaceHistory(
		url: string,
		state: tRouteStateObject,
		title: string = ''
	): this {
		title = title && title.length ? title : wDoc.title;

		wHistory.replaceState({ url, data: state }, title, url);

		console.warn(
			'[OWebDispatchContext] history replaced -> ',
			wHistory.state,
			url
		);

		return this;
	}

	/**
	 * Create route event dispatcher
	 *
	 * @param target the route target
	 * @param state the history state
	 * @param id the dispatcher id
	 */
	private createDispatcher(
		target: tRouteTarget,
		state: tRouteStateObject,
		id: number
	): iRouteDispatcher {
		console.log(`[OWebRouter][dispatcher-${id}] creation.`);

		let ctx = this,
			found: OWebRoute[] = [],
			active = false,
			routeContext = new OWebRouteContext(this, target, state),
			o: iRouteDispatcher;

		for (let i = 0; i < ctx._routes.length; i++) {
			let route = ctx._routes[i];

			if (route.is(target.path)) {
				found.push(route);
			}
		}

		o = {
			context: routeContext,
			id,
			found,
			isActive: () => active,
			cancel: function() {
				if (active) {
					active = false;
					console.warn(
						`[OWebRouter][dispatcher-${id}] cancel called!`,
						o
					);
				} else {
					console.error(
						`[OWebRouter][dispatcher-${id}] cancel called when inactive.`,
						o
					);
				}
				return o;
			},
			dispatch: function() {
				if (!active) {
					console.log(`[OWebRouter][dispatcher-${id}] start ->`, o);

					let j = -1;
					active = true;

					while (active && ++j < found.length) {
						routeContext.actionRunner(found[j]);
					}

					active = false;
				} else {
					console.warn(`[OWebRouter][dispatcher-${id}] is busy!`, o);
				}

				return o;
			},
		};

		return o;
	}

	/**
	 * Register DOM events handler.
	 */
	private register(): this {
		if (!this._listening) {
			this._listening = true;
			window.addEventListener('popstate', this._popStateListener, false);
			wDoc.addEventListener(
				linkClickEvent,
				this._linkClickListener,
				false
			);
		}

		return this;
	}

	/**
	 * Unregister all DOM events handler.
	 */
	private unregister(): this {
		if (this._listening) {
			this._listening = false;
			window.removeEventListener(
				'popstate',
				this._popStateListener,
				false
			);
			wDoc.removeEventListener(
				linkClickEvent,
				this._linkClickListener,
				false
			);
		}

		return this;
	}

	/**
	 * Handle click event
	 *
	 * onclick from page.js library: github.com/visionmedia/page.js
	 *
	 * @param e the envent object
	 */
	private _onClick(e: MouseEvent | TouchEvent) {
		if (1 !== which(e)) return;

		if (e.metaKey || e.ctrlKey || e.shiftKey) return;
		if (e.defaultPrevented) return;

		// ensure link
		// use shadow dom when available if not, fall back to composedPath() for browsers that only have shady
		let el: HTMLElement | null = <HTMLElement>e.target,
			eventPath =
				(e as any).path ||
				((e as any).composedPath ? (e as any).composedPath() : null);

		if (eventPath) {
			for (let i = 0; i < eventPath.length; i++) {
				if (!eventPath[i].nodeName) continue;
				if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
				if (!eventPath[i].href) continue;

				el = eventPath[i];
				break;
			}
		}
		// continue ensure link
		// el.nodeName for svg links are 'a' instead of 'A'
		while (el && 'A' !== el.nodeName.toUpperCase()) el = <any>el.parentNode;
		if (!el || 'A' !== el.nodeName.toUpperCase()) return;

		// we check if link is inside an svg
		// in this case, both href and target are always inside an object
		let svg =
			typeof (el as any).href === 'object' &&
			(el as any).href.constructor.name === 'SVGAnimatedString';

		// Ignore if tag has
		// 1. "download" attribute
		// 2. rel="external" attribute
		if (
			el.hasAttribute('download') ||
			el.getAttribute('rel') === 'external'
		)
			return;

		// ensure non-hash for the same path
		let link = el.getAttribute('href');
		if (
			!this._hashMode &&
			samePath(el as any) &&
			((el as any).hash || '#' === link)
		)
			return;

		// we check for mailto: in the href
		if (link && link.indexOf('mailto:') > -1) return;

		// we check target
		// svg target is an object and its desired value is in .baseVal property
		if (svg ? (el as any).target.baseVal : (el as any).target) return;

		// x-origin
		// note: svg links that are not relative don't call click events (and skip page.js)
		// consequently, all svg links tested inside page.js are relative and in the same origin
		if (!svg && !sameOrigin((el as any).href)) return;

		// rebuild path
		// There aren't .pathname and .search properties in svg links, so we use href
		// Also, svg href is an object and its desired value is in .baseVal property
		let targetHref = svg ? (el as any).href.baseVal : (el as any).href;

		// strip leading "/[drive letter]:" on NW.js on Windows
		/*
		 let hasProcess = typeof process !== 'undefined';
		 if (hasProcess && targetHref.match(/^\/[a-zA-Z]:\//)) {
		 targetHref = targetHref.replace(/^\/[a-zA-Z]:\//, "/");
		 }
		 */

		let orig = targetHref;

		if (targetHref.indexOf(this._baseUrl) === 0) {
			targetHref = targetHref.substr(this._baseUrl.length);
		}

		if (orig === targetHref) return;

		e.preventDefault();
		console.log(
			'[OWebRouter][click] ->',
			el,
			orig,
			targetHref,
			wHistory.state
		);
		this.browseTo(orig);
	}
}
