import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import OWebRouter, { OWebRouteContext, tRoutePath, tRoutePathOptions } from "./OWebRouter";
import Utils from "./utils/Utils";

export type tPageRoute = {
	slug?: string,
	title: string,
	description?: string,
	icon?: string,
	path: tRoutePath,
	pathOptions?: tRoutePathOptions,
	sub?: tPageRoute[],
	show?(): boolean
};

export type tPageRouteFull = tPageRoute & {
	readonly id: number,
	readonly href: string,
	readonly parent?: tPageRouteFull,
	active: boolean,
	activeChild: boolean,
	show(): boolean
};

export interface iPage<Component> {
	/**
	 * The page name getter.
	 */
	getName(): string;

	/**
	 * The page routes getter.
	 */
	getRoutes(): tPageRoute[];

	/**
	 * The page component getter.
	 */
	getComponent(): Component;

	/**
	 * Called once when registering the page.
	 *
	 * @param pager
	 */
	install(pager: OWebPager<Component>): this;

	/**
	 * Does this page require a verified user for the requested page route.
	 *
	 * @param context The app context.
	 * @param route The request page route.
	 */
	requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean,

	/**
	 * Called before page open.
	 *
	 * @param context
	 * @param route
	 */
	onOpen(context: OWebRouteContext, route: tPageRouteFull): void,

	/**
	 * Called before page close.
	 *
	 * @param oldRoute
	 * @param newRoute
	 */
	onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void
}

const wDoc = window.document;
let routeId = 0,
	_isParentOf = (parent: tPageRouteFull, route: tPageRouteFull): boolean => {
		let p;
		while ((p = route.parent!)) {
			if (p === parent) {
				return true;
			}

			route = p;
		}
		return false;
	};

export default class OWebPager<Component> extends OWebEvent {
	static readonly SELF = Utils.id();
	static readonly EVT_PAGE_LOCATION_CHANGE = Utils.id();

	private readonly _pages: { [ key: string ]: iPage<Component> } = {};
	private _routes_cache: tPageRoute[] = [];
	private _routes_flattened: tPageRouteFull[] = [];
	private _active_page: iPage<Component> | undefined;
	private _active_route?: tPageRouteFull;

	/**
	 * @param app_context The app context.
	 */
	constructor(private readonly app_context: OWebApp) {
		super();
		console.log("[OWebPager] ready!");
	}

	/**
	 * Returns registered pages routes.
	 */
	getRoutes(): tPageRoute[] {
		return this._routes_cache;
	}

	/**
	 * Returns the page with the given name.
	 * @param name
	 */
	getPage(name: string): iPage<Component> {
		let page: iPage<Component> = this._pages[ name ];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${ name }" is not defined.`);
		}

		return page;
	}

	/**
	 * Returns the active page.
	 */
	getActivePage(): iPage<Component> {
		if (!this._active_page) {
			throw new Error("[OWebPager] no active page.");
		}
		return this._active_page;
	}

	/**
	 * Returns the active page route.
	 */
	getActivePageRoute(): tPageRouteFull {
		if (!this._active_route) {
			throw new Error("[OWebPager] no active route.");
		}
		return this._active_route;
	}

	/**
	 * Returns all pages list.
	 */
	getPageList() {
		return Object.create(this._pages);
	}

	/**
	 * Register a given page.
	 *
	 * @param page
	 */
	registerPage(page: iPage<Component>): this {
		let name = page.getName();

		if (name in this._pages) {
			throw new Error(`[OWebPager] page "${ name }" already registered.`);
		}

		this._pages[ name ] = page.install(this);
		let routes = page.getRoutes();

		this._routes_cache.push(...routes);

		return this._registerPageRoutes(page, routes);
	}

	/**
	 * Helpers to register page routes.
	 *
	 * @param page The page.
	 * @param routes The page routes list.
	 * @param parent The page routes parent.
	 * @private
	 */
	private _registerPageRoutes(page: iPage<Component>, routes: tPageRoute[], parent?: tPageRouteFull): this {

		let router: OWebRouter = this.app_context.router;

		for (let i = 0; i < routes.length; i++) {
			let route: any = routes[ i ];

			route.id = ++routeId;
			route.parent = parent;
			route.href = router.pathToURL(typeof route.path === "string" ? route.path : "/").href;
			route.active = false;
			route.activeChild = false;

			route.show = route.show || function () {
				return true;
			};

			this._routes_flattened.push(route);

			this._addRoute(route, page);

			if (route.sub && route.sub.length) {
				this._registerPageRoutes(page, route.sub, route);
			}
		}

		return this;
	}

	/**
	 * Helper to add route.
	 *
	 * @param route The route object.
	 * @param page The page to which that route belongs to.
	 * @private
	 */
	private _addRoute(route: tPageRouteFull, page: iPage<Component>): this {
		let ctx = this;
		this.app_context.router.on(route.path, route.pathOptions, (routeContext: OWebRouteContext) => {
			console.log("[OWebPager] page route match ->", route, page, routeContext);

			if (page.requireLogin(routeContext, route) && !ctx.app_context.userVerified()) {
				return routeContext.stop() && ctx.app_context.showLoginPage();
			}

			let ar = ctx._active_route, ap = ctx._active_page;

			ap && ar && ap.onClose(ar, route);

			page.onOpen(routeContext, route);

			!routeContext.stopped() && ctx._setActive(page, route);
		});

		return this;
	}

	/**
	 * Helper to set the active route.
	 *
	 * @param page
	 * @param route
	 * @private
	 */
	private _setActive(page: iPage<Component>, route: tPageRouteFull): this {
		let oldPage = this._active_page,
			oldRoute = this._active_route,
			app = this.app_context;

		for (let i = 0; i < this._routes_flattened.length; i++) {
			let c = this._routes_flattened[ i ];

			c.active = route.id === c.id;
			c.activeChild = !c.active && _isParentOf(c, route);
		}

		this._active_page = page;
		this._active_route = route;
		wDoc.title = app.i18n.toHuman(route.title.length ? route.title : app.getAppName());

		let info: any = {
			page,
			oldPage,
			route,
			oldRoute,
			samePage: oldPage === page
		};

		console.log('[OWebPager] info', info);

		return this.trigger(OWebPager.EVT_PAGE_LOCATION_CHANGE, [ route, page ]);
	}

	onLocationChange(handler: (route: tPageRouteFull, page: iPage<Component>) => void) {
		return this.on(OWebPager.EVT_PAGE_LOCATION_CHANGE, handler);
	}
}
