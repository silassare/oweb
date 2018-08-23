import {Vue, VueConstructor} from "vue/types/vue";
import {OWebEvent, OWebApp, OWebRouteContext, tRoute, tRouteOptions, OWebRouter} from "../oweb";

export interface iPage {
	getName(): string;

	getLinks(): tPageLink[];

	component(): Vue | VueConstructor | undefined
}

export type tPageLink = {
	readonly title: string,
	readonly description?: string,
	readonly path: tRoute,
	readonly pathOptions?: tRouteOptions,
	readonly slug?: string,
	readonly icon?: string,
	show?(): boolean,
	sub?(): tPageLink[],
	requireLogin?(): boolean,
	onOpen?(ctx: OWebRouteContext): void,
	onClose?(): void
};

export type tPageLinkFull = tPageLink & {
	id: number,
	href: string,
	active: boolean,
	active_child: boolean,
	parent?: tPageLinkFull,
	show(): boolean

};

const wDoc = window.document;

let linkId = 0;

let _isParentOf = (parent: tPageLinkFull, link: tPageLinkFull): boolean => {
	let p;
	while (p = link.parent) {
		if (p === parent) {
			return true;
		}

		link = p;
	}
	return false;
};

export default class OWebPager extends OWebEvent {
	static readonly SELF            = "OWebPager";
	static readonly EVT_PAGE_CHANGE = "OWebPager:page_change";

	private readonly _pages: { [key: string]: iPage } = {};
	private _active_page: iPage | undefined;
	private _links: tPageLinkFull[]                   = [];
	private _links_flattened: tPageLinkFull[]         = [];
	private _active_link?: tPageLinkFull;

	constructor(private readonly app_context: OWebApp) {
		super();
		console.log("[OWebPager] ready!");
	}

	getLinks(): tPageLinkFull[] {
		return this._links;
	}

	getPage(name: string): iPage {
		let page: iPage = this._pages[name];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${name}" is not defined.`);
		}

		return page;
	}

	getActivePage(): iPage | undefined {
		if (!this._active_page) {
			console.warn("[OWebPager] no active page");
		}
		return this._active_page;
	}

	getPageList() {
		return Object.create(this._pages);
	}

	registerPage(page: iPage): this {
		let name = page.getName();
		if (name in this._pages) {
			console.warn(`[OWebPager] page "${name}" will be redefined.`);
		}

		this._pages[name] = page;

		let links = page.getLinks();

		Array.prototype.push.apply(this._links, links);

		return this._registerLinks(links, page);
	}

	private _registerLinks(links: tPageLink[], page: iPage, parent?: tPageLinkFull): this {

		let router: OWebRouter = this.app_context.router;

		for (let i = 0; i < links.length; i++) {
			let link: tPageLinkFull = <any>links[i];
			link.id                 = ++linkId;
			link.parent             = parent;
			link.href               = router.pathToURL(typeof link.path === "string"? link.path : "/").href;
			link.active             = false;
			link.active_child       = false;

			if (!("show" in link)) {
				link.show = function () {
					return true;
				};
			}

			this._links_flattened.push(link);

			this._addRoute(link, page);

			let sub = link.sub ? link.sub() : [];

			if (sub.length) {
				this._registerLinks(sub, page, link);
			}
		}

		return this;
	}

	private _addRoute(link: tPageLinkFull, page: iPage): this {
		let ctx = this;
		this.app_context.router.on(link.path, link.pathOptions || {}, (routeContext: OWebRouteContext) => {
			console.log("[OWebPager] page link match ->", link, page, routeContext);

			if (link.requireLogin && link.requireLogin() && !ctx.app_context.userVerified()) {
				return routeContext.stop() && ctx.app_context.showLoginPage();
			}

			let al = ctx._active_link;

			al && al.onClose && al.onClose();

			link.onOpen && link.onOpen(routeContext);

			ctx._setActivePage(page)
				._setActiveLink(link);
		});

		return this;
	}

	private _setActiveLink(link: tPageLinkFull): this {
		let links = this._links_flattened;

		for (let i = 0; i < links.length; i++) {
			let c = links[i];

			c.active       = link.id === c.id;
			c.active_child = !c.active && _isParentOf(c, link);
		}

		if (link.title.length) {
			wDoc.title = link.title;
		}

		this._active_link = link;

		console.log(`[OWebPager] active link ->`, this._active_link);

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