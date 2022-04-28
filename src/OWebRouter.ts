import { logger, preventDefault, safeOpen } from './utils';
import OWebRoute, {
	ORouteAction,
	ORoutePath,
	ORoutePathOptions,
} from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';

export type ORouteTarget = {
	parsed: string;
	href: string;
	path: string;
	fullPath: string;
};
export type ORouteStateItem =
	| string
	| number
	| boolean
	| null
	| undefined
	| Date
	| ORouteStateObject
	| ORouteStateItem[];
export type ORouteStateObject = { [key: string]: ORouteStateItem };

export interface ORouteDispatcher {
	readonly id: number;
	readonly context: OWebRouteContext;
	readonly found: OWebRoute[];

	isStopped(): boolean;

	dispatch(): this;

	stop(): this;
}

const wLoc = window.location,
	wDoc = window.document,
	wHistory = window.history,
	linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click',
	hashTagStr = '#!';

const which = function which(e: any): number {
		e = e || window.event;
		return null == e.which ? e.button : e.which;
	},
	samePath = function samePath(url: URL) {
		return url.pathname === wLoc.pathname && url.search === wLoc.search;
	},
	sameOrigin = function sameOrigin(href: string) {
		if (!href) return false;
		const url = new URL(href.toString(), wLoc.toString());

		return (
			wLoc.protocol === url.protocol &&
			wLoc.hostname === url.hostname &&
			wLoc.port === url.port
		);
	},
	leadingSlash = function leadingSlash(path: string): string {
		if (!path.length || path === '/') {
			return '/';
		}

		return path[0] !== '/' ? '/' + path : path;
	};

export default class OWebRouter {
	private readonly _baseUrl: string;
	private readonly _hashMode: boolean;
	private _currentTarget: ORouteTarget = {
		parsed: '',
		href: '',
		path: '',
		fullPath: '',
	};
	private _routes: OWebRoute[] = [];
	private _initialized = false;
	private _listening = false;
	private readonly _notFound: undefined | ((target: ORouteTarget) => void) =
		undefined;
	private readonly _popStateListener: (e: PopStateEvent) => void;
	private readonly _linkClickListener: (e: MouseEvent | TouchEvent) => void;
	private _dispatchId = 0;
	private _notFoundLoopCount = 0;
	private _currentDispatcher?: ORouteDispatcher;
	private _forceReplace = false;

	/**
	 * OWebRouter constructor.
	 *
	 * @param baseUrl the base url
	 * @param hashMode weather to use hash mode
	 * @param notFound called when a route is not found
	 */
	constructor(
		baseUrl: string,
		hashMode = true,
		notFound: (target: ORouteTarget) => void
	) {
		const r = this;
		this._baseUrl = baseUrl;
		this._hashMode = hashMode;
		this._notFound = notFound;
		this._popStateListener = (e: PopStateEvent) => {
			logger.debug('[OWebRouter] popstate', e);

			if (e.state) {
				r.browseTo(e.state.url, e.state.data, false);
			} else {
				r.browseTo(wLoc.href, undefined, false);
			}
		};

		this._linkClickListener = (e: MouseEvent | TouchEvent) => {
			r._onClick(e);
		};

		logger.info('[OWebRouter] ready!');
	}

	/**
	 * Starts the router.
	 *
	 * @param firstRun first run flag
	 * @param target initial target, usualy the entry point
	 * @param state initial state
	 */
	start(
		firstRun = true,
		target: string = wLoc.href,
		state?: ORouteStateObject
	): this {
		if (!this._initialized) {
			this._initialized = true;
			this.register();
			logger.info('[OWebRouter] start routing!');
			logger.debug('[OWebRouter] watching routes', this._routes);
			firstRun && this.browseTo(target, state, false);
		} else {
			logger.warn('[OWebRouter] router already started!');
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
			logger.debug('[OWebRouter] stop routing!');
		} else {
			logger.warn('[OWebRouter] you should start routing first!');
		}

		return this;
	}

	/**
	 * When called the current history will be replaced by the next history state.
	 */
	forceNextReplace(): this {
		this._forceReplace = true;
		return this;
	}

	/**
	 * Returns the current route target.
	 */
	getCurrentTarget(): ORouteTarget {
		return this._currentTarget;
	}

	/**
	 * Returns the current route event dispatcher.
	 */
	getCurrentDispatcher(): ORouteDispatcher | undefined {
		return this._currentDispatcher;
	}

	/**
	 * Returns the current route context.
	 */
	getRouteContext(): OWebRouteContext {
		if (!this._currentDispatcher) {
			throw new Error('[OWebRouter] no route context.');
		}

		return this._currentDispatcher.context;
	}

	/**
	 * Parse a given url.
	 *
	 * @param url the url to parse
	 */
	parseURL(url: string | URL): ORouteTarget {
		const baseUrl = new URL(this._baseUrl),
			fullUrl = new URL(url.toString(), baseUrl);
		let parsed: ORouteTarget;

		if (this._hashMode) {
			parsed = {
				parsed: url.toString(),
				href: fullUrl.href,
				path: fullUrl.hash.replace(hashTagStr, ''),
				fullPath: fullUrl.hash,
			};
		} else {
			let pathname = fullUrl.pathname;
			// when using pathname make sure to remove
			// base uri pathname for app in subdirectory
			if (pathname.indexOf(baseUrl.pathname) === 0) {
				pathname = pathname.substr(baseUrl.pathname.length);
			}

			parsed = {
				parsed: url.toString(),
				href: fullUrl.href,
				path: leadingSlash(pathname),
				fullPath: leadingSlash(
					pathname + fullUrl.search + (fullUrl.hash || '')
				),
			};
		}

		logger.debug('[OWebRouter] parsed url', parsed);

		return parsed;
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
		path: ORoutePath,
		rules: ORoutePathOptions = {},
		action: ORouteAction
	): this {
		this._routes.push(new OWebRoute(path, rules, action));
		return this;
	}

	/**
	 * Add a route.
	 *
	 * @param route
	 */
	addRoute(route: OWebRoute): this {
		this._routes.push(route);
		return this;
	}

	/**
	 * Go back.
	 *
	 * @param distance the distance in history
	 */
	goBack(distance = 1): this {
		if (distance > 0) {
			logger.debug('[OWebRouter] going back', distance);
			const hLen = wHistory.length;
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
		state: ORouteStateObject = {},
		push = true,
		ignoreSameLocation = false
	): this {
		const targetUrl = this.pathToURL(url),
			target = this.parseURL(targetUrl.href),
			_cd = this._currentDispatcher;
		let cd: ORouteDispatcher;

		if (!sameOrigin(target.href)) {
			window.open(url);
			return this;
		}

		logger.debug('[OWebRouter] browsing to', target.path, {
			state,
			push,
			target,
		});

		if (ignoreSameLocation && this._currentTarget.href === target.href) {
			logger.debug('[OWebRouter] ignore same location', target.path);
			return this;
		}

		if (_cd && !_cd.isStopped()) {
			logger.warn('[OWebRouter] browseTo called while dispatching', _cd);
			_cd.stop();
		}

		this._currentTarget = target;

		if (this._forceReplace) {
			this._forceReplace = false;
			this.replaceHistory(targetUrl.href, state);
		} else {
			push && this.addHistory(targetUrl.href, state);
		}

		this._currentDispatcher = cd = this.createDispatcher(
			target,
			state,
			++this._dispatchId
		);

		if (!cd.found.length) {
			logger.warn('[OWebRouter] no route found for path', target.path);
			if (this._notFound) {
				if (!this._notFoundLoopCount) {
					this._notFoundLoopCount++;
					this._notFound(target);
				} else {
					throw new Error(
						'[OWebRouter] "notFound" handler is redirecting to another missing route. This may cause infinite loop.'
					);
				}
			} else {
				throw new Error('[OWebRouter] "notFound" handler is not defined.');
			}

			return this;
		}

		this._notFoundLoopCount = 0;

		cd.dispatch();

		if (cd.id === this._dispatchId && !cd.context.isStopped()) {
			cd.context.save();
			logger.debug('[OWebRouter] success', target.path);
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
	addHistory(url: string, state: ORouteStateObject, title = ''): this {
		title = title && title.length ? title : wDoc.title;

		wHistory.pushState({ url, data: state }, title, url);

		logger.debug('[OWebDispatchContext] history added', state, url);

		return this;
	}

	/**
	 * Replace the current history.
	 *
	 * @param url the url
	 * @param state the history state
	 * @param title the window title
	 */
	replaceHistory(url: string, state: ORouteStateObject, title = ''): this {
		title = title && title.length ? title : wDoc.title;

		wHistory.replaceState({ url, data: state }, title, url);

		logger.debug('[OWebDispatchContext] history replaced', wHistory.state, url);

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
		target: ORouteTarget,
		state: ORouteStateObject,
		id: number
	): ORouteDispatcher {
		logger.debug(`[OWebRouter][dispatcher-${id}] creation.`);

		const ctx = this,
			found: OWebRoute[] = [],
			routeContext = new OWebRouteContext(this, target, state);
		let active = false;

		for (let i = 0; i < ctx._routes.length; i++) {
			const route = ctx._routes[i];

			if (route.is(target.path)) {
				found.push(route);
			}
		}

		const o: ORouteDispatcher = {
			context: routeContext,
			id,
			found,
			isStopped: () => !active,
			stop() {
				if (active) {
					active = false;
					logger.debug(`[OWebRouter][dispatcher-${id}] stopped!`, o);
				} else {
					logger.error(`[OWebRouter][dispatcher-${id}] already stopped.`, o);
				}
				return o;
			},
			dispatch() {
				if (!active) {
					logger.debug(`[OWebRouter][dispatcher-${id}] start`, o);

					let j = -1;
					active = true;

					while (active && ++j < found.length) {
						routeContext.actionRunner(found[j]);
					}

					active = false;
				} else {
					logger.warn(`[OWebRouter][dispatcher-${id}] is busy!`, o);
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
			wDoc.addEventListener(linkClickEvent, this._linkClickListener, false);
		}

		return this;
	}

	/**
	 * Unregister all DOM events handler.
	 */
	private unregister(): this {
		if (this._listening) {
			this._listening = false;
			window.removeEventListener('popstate', this._popStateListener, false);
			wDoc.removeEventListener(linkClickEvent, this._linkClickListener, false);
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
		let el: HTMLElement | null = e.target as HTMLElement;
		const eventPath =
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
		while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode as any;
		if (!el || 'A' !== el.nodeName.toUpperCase()) return;

		// we check if link is inside an svg
		// in this case, both href and target are always inside an object
		const svg =
			typeof (el as any).href === 'object' &&
			(el as any).href.constructor.name === 'SVGAnimatedString';

		// Ignore if tag has
		// 1. "download" attribute
		// 2. rel="external" attribute
		if (el.hasAttribute('download') || el.getAttribute('rel') === 'external')
			return;

		// ensure non-hash for the same path
		const link = el.getAttribute('href');
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

		const orig = targetHref;

		if (targetHref.indexOf(this._baseUrl) === 0) {
			targetHref = targetHref.substr(this._baseUrl.length);
		}

		if (orig === targetHref) {
			if (el.getAttribute('target') === '_blank') {
				safeOpen(orig);
				preventDefault(e);
			}

			return;
		}

		preventDefault(e);

		logger.debug(
			'[OWebRouter][click] link clicked',
			el,
			orig,
			targetHref,
			wHistory.state
		);
		this.browseTo(orig);
	}
}
