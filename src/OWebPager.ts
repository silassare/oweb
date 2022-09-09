import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebRouter from './OWebRouter';
import { id, logger } from './utils';
import OWebRouteContext from './OWebRouteContext';
import OWebRoute, { ORoutePath, ORoutePathOptions } from './OWebRoute';
import { OI18n } from './OWebI18n';

export interface OPageRoute {
	slug?: string;
	icon?: string;
	title: OI18n;
	description?: OI18n;
	path: ORoutePath;
	pathOptions?: ORoutePathOptions;
	children?: OPageRoute[];
	showChildren?: boolean;
	disabled?: boolean;
	show?: boolean;
}

export type OPageRouteFull<Route extends OPageRoute = OPageRoute> = Route & {
	pathOptions: ORoutePathOptions;
	children: OPageRouteFull[];
	showChildren: boolean;
	disabled: boolean;
	show: boolean;

	readonly id: number;
	readonly href?: string;
	readonly parent?: OPageRouteFull<Route>;
	active: boolean;
	activeChild: boolean;
	webRoute: OWebRoute;
};

export interface OPage<Route extends OPageRoute = OPageRoute> {
	/**
	 * The page name getter.
	 */
	name: string;

	/**
	 * The page routes getter.
	 */
	routes: Route[];

	/**
	 * Called once when registering the page.
	 *
	 * @param pager
	 */
	install?(pager: OWebPager<this>): this;

	/**
	 * Does this page require a verified user for the requested page route.
	 *
	 * @param context The app context.
	 * @param route The request page route.
	 */
	requireLogin?(
		context: OWebRouteContext,
		route: OPageRouteFull<Route>
	): boolean;

	/**
	 * Called before page open.
	 *
	 * @param context
	 * @param route
	 */
	onOpen?(context: OWebRouteContext, route: OPageRouteFull<Route>): void;

	/**
	 * Called before page close.
	 *
	 * @param oldRoute
	 * @param newRoute
	 */
	onClose?(
		oldRoute: OPageRouteFull<Route>,
		newRoute: OPageRouteFull<Route>
	): void;
}

const wDoc = window.document;
let routeId = 0;
const _isParentOf = (
	parent: OPageRouteFull,
	route: OPageRouteFull
): boolean => {
	let p;
	while ((p = route.parent)) {
		if (p === parent) {
			return true;
		}

		route = p;
	}
	return false;
};

export default class OWebPager<
	P extends OPage<R>,
	R extends OPageRoute = OPageRoute
> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_PAGE_LOCATION_CHANGE = id();

	private readonly _pages: Record<string, P> = {};
	private _routesCache: OPageRouteFull<R>[] = [];
	private _routesFlattened: OPageRouteFull<R>[] = [];
	private _activePage?: P;
	private _activeRoute?: OPageRouteFull<R>;

	/**
	 * @param _appContext The app context.
	 */
	constructor(private readonly _appContext: OWebApp) {
		super();
		logger.info('[OWebPager] ready!');
	}

	/**
	 * Returns registered pages routes.
	 */
	getRoutes(): OPageRouteFull<R>[] {
		return [...this._routesCache];
	}

	/**
	 * Returns the page with the given name.
	 * @param name
	 */
	getPage(name: string): P {
		const page: P = this._pages[name];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${name}" is not defined.`);
		}

		return page;
	}

	/**
	 * Returns the active page.
	 */
	getActivePage(): P {
		if (!this._activePage) {
			throw new Error('[OWebPager] no active page.');
		}
		return this._activePage;
	}

	/**
	 * Returns the active page route.
	 */
	getActivePageRoute(): OPageRouteFull<R> {
		if (!this._activeRoute) {
			throw new Error('[OWebPager] no active route.');
		}
		return this._activeRoute;
	}

	/**
	 * Returns all pages list.
	 */
	getPageList(): Record<string, P> {
		return { ...this._pages };
	}

	/**
	 * Register a given page.
	 *
	 * @param page
	 */
	registerPage(page: P): this {
		const name = page.name;

		if (name in this._pages) {
			throw new Error(`[OWebPager] page "${name}" already registered.`);
		}

		page.install && page.install(this);

		this._pages[name] = page;
		const routes = page.routes;

		this._routesCache.push(...(routes as any[]));

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
	private _registerPageRoutes(
		page: P,
		routes: R[],
		parent?: OPageRouteFull<R>
	): this {
		const router: OWebRouter = this._appContext.router;

		for (let i = 0; i < routes.length; i++) {
			const route: any = routes[i];

			if (!route.id) {
				route.id = ++routeId;
				route.parent = parent;
				route.pathOptions = route.pathOptions || {};
				route.children = route.children || [];
				route.active = false;
				route.activeChild = false;

				const webRoute = (route.webRoute = this._addRoute(route, page));
				if (!webRoute.isDynamic()) {
					route.href = router.pathToURL(route.path).href;
				}

				if (!('show' in route)) {
					route.show = true;
				}
				if (!('showChildren' in route)) {
					route.showChildren = true;
				}
				if (!('disabled' in route)) {
					route.disabled = false;
				}

				this._routesFlattened.push(route);

				if (route.children.length) {
					this._registerPageRoutes(page, route.children, route);
				}
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
	private _addRoute(route: OPageRouteFull<R>, page: P): OWebRoute {
		const webRoute = new OWebRoute(
			route.path,
			route.pathOptions,
			(routeContext: OWebRouteContext) => {
				logger.debug('[OWebPager] page route match', route, page, routeContext);

				if (
					page.requireLogin &&
					page.requireLogin(routeContext, route) &&
					!this._appContext.user.userVerified()
				) {
					return (
						routeContext.stop() &&
						this._appContext.showLoginPage({
							next: routeContext.getPath(),
						})
					);
				}

				if (route.disabled) {
					return routeContext.stop() && this._appContext.showHomePage();
				}

				const ar = this._activeRoute,
					ap = this._activePage;

				ap && ar && ap.onClose && ap.onClose(ar, route);

				page.onOpen && page.onOpen(routeContext, route);

				if (!routeContext.isStopped()) {
					routeContext.stop();
					this._setActive(page, route);
				}
			}
		);

		this._appContext.router.addRoute(webRoute);

		return webRoute;
	}

	/**
	 * Helper to set the active route.
	 *
	 * @param page
	 * @param route
	 * @private
	 */
	private _setActive(page: P, route: OPageRouteFull<R>): this {
		const oldPage = this._activePage,
			oldRoute = this._activeRoute,
			app = this._appContext;

		for (let i = 0; i < this._routesFlattened.length; i++) {
			const c = this._routesFlattened[i];

			c.active = route.id === c.id;
			c.activeChild = !c.active && _isParentOf(c, route);
		}

		this._activePage = page;
		this._activeRoute = route;
		wDoc.title = app.i18n.toHuman(route.title ? route.title : app.getAppName());

		const info: any = {
			page,
			oldPage,
			route,
			oldRoute,
			samePage: oldPage === page,
		};

		logger.debug('[OWebPager] location info', info);

		this.trigger(OWebPager.EVT_PAGE_LOCATION_CHANGE, [route, page]);

		return this;
	}

	onLocationChange(handler: (route: OPageRouteFull<R>, page: P) => void): this {
		return this.on(OWebPager.EVT_PAGE_LOCATION_CHANGE, handler);
	}
}
