import {VueConstructor} from "vue/types/vue";
import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import OWebLang from "./OWebLang";
import OWebRouter, {OWebRouteContext, tRoutePath, tRoutePathOptions} from "./OWebRouter";
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
	active_child: boolean,
	show(): boolean
};

export interface iPage {
	getName(): string;

	getRoutes(): tPageRoute[];

	install(pager: OWebPager): this;

	component(): VueConstructor | undefined,

	requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean,

	onOpen(context: OWebRouteContext, route: tPageRouteFull): void,

	onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void
}

const wDoc        = window.document;
let routeId       = 0,
	  _isParentOf = (parent: tPageRouteFull, route: tPageRouteFull): boolean => {
		  let p;
		  while (p = route.parent!) {
			  if (p === parent) {
				  return true;
			  }

			  route = p;
		  }
		  return false;
	  };

export default class OWebPager extends OWebEvent {
	static readonly SELF            = Utils.id();
	static readonly EVT_PAGE_CHANGE = Utils.id();

	private readonly _pages: { [key: string]: iPage } = {};
	private _active_page: iPage | undefined;
	private _routes_cache: tPageRoute[]               = [];
	private _routes_flattened: tPageRouteFull[]       = [];
	private _active_route?: tPageRouteFull;

	constructor(private readonly app_context: OWebApp) {
		super();
		console.log("[OWebPager] ready!");
	}

	getRoutes(): tPageRoute[] {
		return this._routes_cache;
	}

	getPage(name: string): iPage {
		let page: iPage = this._pages[name];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${name}" is not defined.`);
		}

		return page;
	}

	getActivePage(): iPage {
		if (!this._active_page) {
			throw new Error("[OWebPager] no active page.");
		}
		return this._active_page;
	}

	getActivePageRoute(): tPageRouteFull {
		if (!this._active_route) {
			throw new Error("[OWebPager] no active route.");
		}
		return this._active_route;
	}

	getPageList() {
		return Object.create(this._pages);
	}

	registerPage(page: iPage): this {
		let name = page.getName();

		if (name in this._pages) {
			throw new Error(`[OWebPager] page "${name}" already registered.`);
		}

		this._pages[name] = page.install(this);
		let routes        = page.getRoutes();

		this._routes_cache.push(...routes);

		return this._registerPageRoutes(page, routes);
	}

	private _registerPageRoutes(page: iPage, routes: tPageRoute[], parent?: tPageRouteFull): this {

		let router: OWebRouter = this.app_context.router;

		for (let i = 0; i < routes.length; i++) {
			let route: any = routes[i];

			route.id           = ++routeId;
			route.parent       = parent;
			route.href         = router.pathToURL(typeof route.path === "string" ? route.path : "/").href;
			route.active       = false;
			route.active_child = false;

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

	private _addRoute(route: tPageRouteFull, page: iPage): this {
		let ctx = this;
		this.app_context.router.on(route.path, route.pathOptions, (routeContext: OWebRouteContext) => {
			console.log("[OWebPager] page route match ->", route, page, routeContext);

			if (page.requireLogin(routeContext, route) && !ctx.app_context.userVerified()) {
				return routeContext.stop() && ctx.app_context.showLoginPage();
			}

			let ar = ctx._active_route, ap = ctx._active_page;

			ap && ar && ap.onClose(ar, route);

			page.onOpen(routeContext, route);

			!routeContext.stopped() && ctx._setActivePage(page)._setActiveRoute(route);
		});

		return this;
	}

	private _setActiveRoute(route: tPageRouteFull): this {
		let list = this._routes_flattened;

		for (let i = 0; i < list.length; i++) {
			let c = list[i];

			c.active       = route.id === c.id;
			c.active_child = !c.active && _isParentOf(c, route);
		}

		wDoc.title = OWebLang.toHuman(route.title.length ? route.title : this.app_context.getAppName());

		this._active_route = route;

		console.log(`[OWebPager] active route ->`, this._active_route);

		return this;
	}

	private _setActivePage(newPage: iPage): this {
		let oldPage = this._active_page;

		if (oldPage !== newPage) {
			console.log(`[OWebPager] page changing ->`, newPage, oldPage);
			this._active_page = newPage;
			this.trigger(OWebPager.EVT_PAGE_CHANGE, [oldPage, newPage]);
		} else {
			console.log(`[OWebPager] same page ->`, oldPage, newPage);
		}

		return this;
	}
}