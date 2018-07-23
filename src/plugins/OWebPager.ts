"use strict";

import OWebEvent from "../OWebEvent";
import {OWebRouteContext, tRouteAction, tRouteOptions} from "../OWebRouter";
import OWebApp from "../OWebApp";

export type tPageLink = {
	title: string,
	path: string,
	description?: string,
	action?: tRouteAction,
	options?: tRouteOptions,
	show?: boolean,
	slug?: string,
	icon?: string,
	sub?: tPageLink[]
};

export type tPageLinkFull = tPageLink & {
	id: number,
	active: boolean,
	active_child: boolean,
	show: boolean,
	parent?: tPageLinkFull,
	sub?: tPageLinkFull[]
};

let _getParents = (link: tPageLinkFull): tPageLinkFull[] => {
	let parents: tPageLinkFull[] = [], p;
	while (p = link.parent) {
		parents.push(p);
	}

	return parents;
};
let linkId      = 1;
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

export type tPage = {
	name: string,
	links: tPageLink[]
};

export default class OWebPager extends OWebEvent {
	static readonly SELF            = "OWebPager";
	static readonly EVT_PAGE_CHANGE = "OWebPager:page_change";

	private readonly pages: { [key: string]: tPage } = {};
	private active_page: tPage | undefined;
	private links: tPageLinkFull[]                   = [];
	private links_flattened: tPageLinkFull[]         = [];

	constructor(private readonly app_context: OWebApp) {
		super();
		console.log("[OWebPager] ready!");
	}

	getLinks(): tPageLinkFull[] {
		return this.links;
	}

	getPage(name: string): tPage {
		let page: tPage = this.pages[name];
		if (undefined === page) {
			throw new Error(`[OWebPager] the page "${name}" is not defined.`);
		}

		return page;
	}

	getActivePage(): tPage | undefined {
		if (!this.active_page) {
			console.warn("[OWebPager] no active page");
		}
		return this.active_page;
	}

	getPageList() {
		return Object.create(this.pages);
	}

	registerPage(page: tPage): this {
		let name = page.name;
		if (name in this.pages) {
			console.warn(`[OWebPager] page "${name}" will be redefined.`);
		}

		this.pages[name] = page;

		let links = page.links;

		Array.prototype.push.apply(this.links, links);

		return this._registerLinks(links, page);
	}

	private _registerLinks(links: tPageLink[], page: tPage, parent?: tPageLinkFull): this {

		for (let i = 0; i < links.length; i++) {
			let link: tPageLinkFull = <any>links[i];
			link.id                 = linkId++;
			link.parent             = parent;
			link.active             = false;
			link.active_child       = false;
			link.show               = link.show !== false;

			this.links_flattened.push(link);

			this._addRoute(link, page);

			if (link.sub && link.sub.length) {
				this._registerLinks(link.sub, page, link);
			}
		}

		return this;
	}

	private _addRoute(link: tPageLinkFull, page: tPage): this {
		let s = this;

		this.app_context.router.on(link.path, link.options || {}, (ctx: OWebRouteContext) => {
			console.log("[OWebPager] page link match ->", link, page, ctx);
			s._setActivePage(page)
				._setActiveLink(link);

			link.action && link.action(ctx);
		});

		return this;

	}

	private _setActiveLink(link: tPageLinkFull): this {
		let links = this.links_flattened;
		for (let i = 0; i < links.length; i++) {
			let c = links[i];

			c.active = link.id === c.id;

			if (!c.active) {
				c.active_child = _isParentOf(c, link);
			}
		}

		return this;
	}

	private _setActivePage(newPage: tPage): this {
		let oldPage = this.active_page;
		if (oldPage !== newPage) {
			this.active_page = newPage;
			this.trigger(OWebPager.EVT_PAGE_CHANGE, [oldPage, newPage]);
		}

		return this;
	}
}