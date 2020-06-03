import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebRouter from './OWebRouter';
import { id, logger } from './utils';
import OWebRouteContext from './OWebRouteContext';
import { tRoutePath, tRoutePathOptions } from './OWebRoute';
import { tI18n } from './OWebI18n';

export interface IPageRoute {
	slug?: string;
	title: tI18n;
	description?: tI18n;
	path: tRoutePath;
	pathOptions?: tRoutePathOptions;
	sub?: IPageRoute[];
	showSub?: boolean;
	disabled?: boolean;

	show?(): boolean;
}

export interface IPageRouteFull {
	slug?: string;
	title: tI18n;
	description?: tI18n;
	path: tRoutePath;
	pathOptions?: tRoutePathOptions;
	sub?: IPageRouteFull[];
	showSub?: boolean;
	disabled?: boolean;

	show(): boolean;

	readonly id: number;
	readonly href: string;
	readonly parent?: IPageRouteFull;
	active: boolean;
	activeChild: boolean;
}

export interface IPage<Component> {
	/**
	 * The page name getter.
	 */
	getName(): string;

	/**
	 * The page routes getter.
	 */
	getRoutes(): IPageRoute[];

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
	requireLogin(context: OWebRouteContext, route: IPageRouteFull): boolean;

	/**
	 * Called before page open.
	 *
	 * @param context
	 * @param route
	 */
	onOpen(context: OWebRouteContext, route: IPageRouteFull): void;

	/**
	 * Called before page close.
	 *
	 * @param oldRoute
	 * @param newRoute
	 */
	onClose(oldRoute: IPageRouteFull, newRoute: IPageRouteFull): void;
}

const wDoc = window.document;
let routeId = 0;
const _isParentOf = (
	parent: IPageRouteFull,
	route: IPageRouteFull,
): boolean => {
	let p;
	// tslint:disable-next-line: no-conditional-assignment
	while ((p = route.parent!)) {
		if (p === parent) {
			return true;
		}

		route = p;
	}
	return false;
};

export default class OWebPager<Component> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_PAGE_LOCATION_CHANGE = id();

	private readonly _pages: { [key: string]: IPage<Component> } = {};
	private _routesCache: IPageRoute[] = [];
	private _routesFlattened: IPageRouteFull[] = [];
	private _activePage: IPage<Component> | undefined;
	private _activeRoute?: IPageRouteFull;

	/**
	 * @param appContext The app context.
	 */
	constructor(private readonly appContext: OWebApp) {
		super();
		logger.info('[OWebPager] ready!');
	}

	/**
	 * Returns registered pages routes.
	 */
	getRoutes(): IPageRoute[] {
		return [...this._routesCache];
	}

	/**
	 * Returns the page with the given name.
	 * @param name
	 */
	getPage(name: string): IPage<Component> {
		const page: IPage<Component> = this._pages[name];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${name}" is not defined.`);
		}

		return page;
	}

	/**
	 * Returns the active page.
	 */
	getActivePage(): IPage<Component> {
		if (!this._activePage) {
			throw new Error('[OWebPager] no active page.');
		}
		return this._activePage;
	}

	/**
	 * Returns the active page route.
	 */
	getActivePageRoute(): IPageRouteFull {
		if (!this._activeRoute) {
			throw new Error('[OWebPager] no active route.');
		}
		return this._activeRoute;
	}

	/**
	 * Returns all pages list.
	 */
	getPageList() {
		return { ...this._pages };
	}

	/**
	 * Register a given page.
	 *
	 * @param page
	 */
	registerPage(page: IPage<Component>): this {
		const name = page.getName();

		if (name in this._pages) {
			throw new Error(`[OWebPager] page "${name}" already registered.`);
		}

		this._pages[name] = page.install(this);
		const routes = page.getRoutes();

		this._routesCache.push(...routes);

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
		page: IPage<Component>,
		routes: IPageRoute[],
		parent?: IPageRouteFull,
	): this {
		const router: OWebRouter = this.appContext.router;

		for (let i = 0; i < routes.length; i++) {
			const route: any = routes[i];

			route.id = ++routeId;
			route.parent = parent;
			route.href = router.pathToURL(
				typeof route.path === 'string' ? route.path : '/',
			).href;
			route.active = false;
			route.activeChild = false;

			route.show =
				route.show ||
				function () {
					return true;
				};

			this._routesFlattened.push(route);

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
	private _addRoute(route: IPageRouteFull, page: IPage<Component>): this {
		const ctx = this;
		this.appContext.router.on(
			route.path,
			route.pathOptions,
			(routeContext: OWebRouteContext) => {
				logger.debug(
					'[OWebPager] page route match',
					route,
					page,
					routeContext,
				);

				if (
					page.requireLogin(routeContext, route) &&
					!ctx.appContext.userVerified()
				) {
					return (
						routeContext.stop() &&
						ctx.appContext.showLoginPage({
							next: routeContext.getPath(),
						})
					);
				}

				const ar = ctx._activeRoute,
					ap = ctx._activePage;

				ap && ar && ap.onClose(ar, route);

				page.onOpen(routeContext, route);

				!routeContext.stopped() && ctx._setActive(page, route);
			},
		);

		return this;
	}

	/**
	 * Helper to set the active route.
	 *
	 * @param page
	 * @param route
	 * @private
	 */
	private _setActive(page: IPage<Component>, route: IPageRouteFull): this {
		const oldPage = this._activePage,
			oldRoute = this._activeRoute,
			app = this.appContext;

		for (let i = 0; i < this._routesFlattened.length; i++) {
			const c = this._routesFlattened[i];

			c.active = route.id === c.id;
			c.activeChild = !c.active && _isParentOf(c, route);
		}

		this._activePage = page;
		this._activeRoute = route;
		wDoc.title = app.i18n.toHuman(
			route.title ? route.title : app.getAppName(),
		);

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

	onLocationChange(
		handler: (route: IPageRouteFull, page: IPage<Component>) => void,
	) {
		return this.on(OWebPager.EVT_PAGE_LOCATION_CHANGE, handler);
	}
}
