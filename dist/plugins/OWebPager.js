"use strict";
import OWebEvent from "../OWebEvent";
let _getParents = (link) => {
    let parents = [], p;
    while (p = link.parent) {
        parents.push(p);
    }
    return parents;
};
let linkId = 1;
let _isParentOf = (parent, link) => {
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
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this.pages = {};
        this.links = [];
        this.links_flattened = [];
        console.log("[OWebPager] ready!");
    }
    getLinks() {
        return this.links;
    }
    getPage(name) {
        let page = this.pages[name];
        if (undefined === page) {
            throw new Error(`[OWebPager] the page "${name}" is not defined.`);
        }
        return page;
    }
    getActivePage() {
        if (!this.active_page) {
            console.warn("[OWebPager] no active page");
        }
        return this.active_page;
    }
    getPageList() {
        return Object.create(this.pages);
    }
    registerPage(page) {
        let name = page.name;
        if (name in this.pages) {
            console.warn(`[OWebPager] page "${name}" will be redefined.`);
        }
        this.pages[name] = page;
        let links = page.links;
        Array.prototype.push.apply(this.links, links);
        return this._registerLinks(links, page);
    }
    _registerLinks(links, page, parent) {
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            link.id = linkId++;
            link.parent = parent;
            link.active = false;
            link.active_child = false;
            link.show = link.show !== false;
            this.links_flattened.push(link);
            this._addRoute(link, page);
            if (link.sub && link.sub.length) {
                this._registerLinks(link.sub, page, link);
            }
        }
        return this;
    }
    _addRoute(link, page) {
        let s = this;
        this.app_context.router.on(link.path, link.options || {}, (ctx) => {
            console.log("[OWebPager] link clicked ->", link, page, ctx);
            s._setActivePage(page)
                ._setActiveLink(link);
            link.action && link.action(ctx);
        });
        return this;
    }
    _setActiveLink(link) {
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
    _setActivePage(newPage) {
        let oldPage = this.active_page;
        if (oldPage !== newPage) {
            this.active_page = newPage;
            this.trigger(OWebPager.EVT_PAGE_CHANGE, [oldPage, newPage]);
        }
        return this;
    }
}
OWebPager.SELF = "OWebPager";
OWebPager.EVT_PAGE_CHANGE = "OWebPager:page_change";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvT1dlYlBhZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sU0FBUyxNQUFNLGNBQWMsQ0FBQztBQXlCckMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxJQUFtQixFQUFtQixFQUFFO0lBQzFELElBQUksT0FBTyxHQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUNGLElBQUksTUFBTSxHQUFRLENBQUMsQ0FBQztBQUNwQixJQUFJLFdBQVcsR0FBRyxDQUFDLE1BQXFCLEVBQUUsSUFBbUIsRUFBVyxFQUFFO0lBQ3pFLElBQUksQ0FBQyxDQUFDO0lBQ04sT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFJLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksR0FBRyxDQUFDLENBQUM7S0FDVDtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBT0YsTUFBTSxDQUFDLE9BQU8sZ0JBQWlCLFNBQVEsU0FBUztJQVMvQyxZQUE2QixXQUFvQjtRQUNoRCxLQUFLLEVBQUUsQ0FBQztRQURvQixnQkFBVyxHQUFYLFdBQVcsQ0FBUztRQUxoQyxVQUFLLEdBQTZCLEVBQUUsQ0FBQztRQUU5QyxVQUFLLEdBQXNDLEVBQUUsQ0FBQztRQUM5QyxvQkFBZSxHQUE0QixFQUFFLENBQUM7UUFJckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxRQUFRO1FBQ1AsT0FBTyxJ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