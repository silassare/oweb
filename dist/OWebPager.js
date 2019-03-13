import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
const wDoc = window.document;
let routeId = 0, _isParentOf = (parent, route) => {
    let p;
    while ((p = route.parent)) {
        if (p === parent) {
            return true;
        }
        route = p;
    }
    return false;
};
export default class OWebPager extends OWebEvent {
    /**
     * @param app_context The app context.
     */
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this._pages = {};
        this._routes_cache = [];
        this._routes_flattened = [];
        console.log("[OWebPager] ready!");
    }
    /**
     * Returns registered pages routes.
     */
    getRoutes() {
        return this._routes_cache;
    }
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name) {
        let page = this._pages[name];
        if (undefined === page) {
            throw new Error(`[OWebPager] the page "${name}" is not defined.`);
        }
        return page;
    }
    /**
     * Returns the active page.
     */
    getActivePage() {
        if (!this._active_page) {
            throw new Error("[OWebPager] no active page.");
        }
        return this._active_page;
    }
    /**
     * Returns the active page route.
     */
    getActivePageRoute() {
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
    registerPage(page) {
        let name = page.getName();
        if (name in this._pages) {
            throw new Error(`[OWebPager] page "${name}" already registered.`);
        }
        this._pages[name] = page.install(this);
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
    _registerPageRoutes(page, routes, parent) {
        let router = this.app_context.router;
        for (let i = 0; i < routes.length; i++) {
            let route = routes[i];
            route.id = ++routeId;
            route.parent = parent;
            route.href = router.pathToURL(typeof route.path === "string" ? route.path : "/").href;
            route.active = false;
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
    /**
     * Helper to add route.
     *
     * @param route The route object.
     * @param page The page to which that route belongs to.
     * @private
     */
    _addRoute(route, page) {
        let ctx = this;
        this.app_context.router.on(route.path, route.pathOptions, (routeContext) => {
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
    /**
     * Helper to set the active route.
     *
     * @param route
     * @private
     */
    _setActiveRoute(route) {
        let list = this._routes_flattened;
        for (let i = 0; i < list.length; i++) {
            let c = list[i];
            c.active = route.id === c.id;
            c.active_child = !c.active && _isParentOf(c, route);
        }
        wDoc.title = this.app_context.i18n.toHuman(route.title.length ? route.title : this.app_context.getAppName());
        this._active_route = route;
        console.log(`[OWebPager] active route ->`, this._active_route);
        return this;
    }
    /**
     * Helper to set the active page.
     *
     * @param page
     * @private
     */
    _setActivePage(page) {
        let old_page = this._active_page;
        if (old_page !== page) {
            console.log(`[OWebPager] page changing ->`, page, old_page);
            this._active_page = page;
            this.trigger(OWebPager.EVT_PAGE_CHANGE, [old_page, page]);
        }
        else {
            console.log(`[OWebPager] same page ->`, old_page, page);
        }
        return this;
    }
}
OWebPager.SELF = Utils.id();
OWebPager.EVT_PAGE_CHANGE = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFFcEMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBaUVsQyxNQUFNLElBQUksR0FBUSxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2xDLElBQUksT0FBTyxHQUFPLENBQUMsRUFDbEIsV0FBVyxHQUFHLENBQUMsTUFBc0IsRUFBRSxLQUFxQixFQUFXLEVBQUU7SUFDeEUsSUFBSSxDQUFDLENBQUM7SUFDTixPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFPLENBQUMsRUFBRTtRQUMzQixJQUFJLENBQUMsS0FBSyxNQUFNLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELEtBQUssR0FBRyxDQUFDLENBQUM7S0FDVjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sZ0JBQWlCLFNBQVEsU0FBUztJQVUvQzs7T0FFRztJQUNILFlBQTZCLFdBQW9CO1FBQ2hELEtBQUssRUFBRSxDQUFDO1FBRG9CLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1FBVGhDLFdBQU0sR0FBNkIsRUFBRSxDQUFDO1FBRS9DLGtCQUFhLEdBQStCLEVBQUUsQ0FBQztRQUMvQyxzQkFBaUIsR0FBMkIsRUFBRSxDQUFDO1FBUXRELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTO1FBQ1IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPLENBQUMsSUFBWTtRQUNuQixJQUFJLElBQUksR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksU0FBUyxLQUFL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QztTQUN4RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQzs7QUFoTWUsY0FBSSxHQUFjLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUM3Qix5QkFBZSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gXCIuL09XZWJBcHBcIjtcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSBcIi4vT1dlYkV2ZW50XCI7XG5pbXBvcnQgT1dlYlJvdXRlciwge09XZWJSb3V0ZUNvbnRleHQsIHRSb3V0ZVBhdGgsIHRSb3V0ZVBhdGhPcHRpb25zfSBmcm9tIFwiLi9PV2ViUm91dGVyXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxuZXhwb3J0IHR5cGUgdFBhZ2VSb3V0ZSA9IHtcblx0c2x1Zz86IHN0cmluZyxcblx0dGl0bGU6IHN0cmluZyxcblx0ZGVzY3JpcHRpb24/OiBzdHJpbmcsXG5cdGljb24/OiBzdHJpbmcsXG5cdHBhdGg6IHRSb3V0ZVBhdGgsXG5cdHBhdGhPcHRpb25zPzogdFJvdXRlUGF0aE9wdGlvbnMsXG5cdHN1Yj86IHRQYWdlUm91dGVbXSxcblx0c2hvdz8oKTogYm9vbGVhblxufTtcblxuZXhwb3J0IHR5cGUgdFBhZ2VSb3V0ZUZ1bGwgPSB0UGFnZVJvdXRlICYge1xuXHRyZWFkb25seSBpZDogbnVtYmVyLFxuXHRyZWFkb25seSBocmVmOiBzdHJpbmcsXG5cdHJlYWRvbmx5IHBhcmVudD86IHRQYWdlUm91dGVGdWxsLFxuXHRhY3RpdmU6IGJvb2xlYW4sXG5cdGFjdGl2ZV9jaGlsZDogYm9vbGVhbixcblx0c2hvdygpOiBib29sZWFuXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIGlQYWdlIHtcblx0LyoqXG5cdCAqIFRoZSBwYWdlIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0TmFtZSgpOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIHJvdXRlcyBnZXR0ZXIuXG5cdCAqL1xuXHRnZXRSb3V0ZXMoKTogdFBhZ2VSb3V0ZVtdO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgb25jZSB3aGVuIHJlZ2lzdGVyaW5nIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZXJcblx0ICovXG5cdGluc3RhbGwocGFnZXI6IE9XZWJQYWdlcik6IHRoaXM7XG5cblx0LyoqXG5cdCAqIERvZXMgdGhpcyBwYWdlIHJlcXVpcmUgYSB2ZXJpZmllZCB1c2VyIGZvciB0aGUgcmVxdWVzdGVkIHBhZ2Ugcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICogQHBhcmFtIHJvdXRlIFRoZSByZXF1ZXN0IHBhZ2Ugcm91dGUuXG5cdCAqL1xuXHRyZXF1aXJlTG9naW4oY29udGV4dDogT1dlYlJvdXRlQ29udGV4dCwgcm91dGU6IHRQYWdlUm91dGVGdWxsKTogYm9vbGVhbixcblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBwYWdlIG9wZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0XG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0b25PcGVuKGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsIHJvdXRlOiB0UGFnZVJvdXRlRnVsbCk6IHZvaWQsXG5cblx0LyoqXG5cdCAqIENhbGxlZCBiZWZvcmUgcGFnZSBjbG9zZS5cblx0ICpcblx0ICogQHBhcmFtIG9sZFJvdXRlXG5cdCAqIEBwYXJhbSBuZXdSb3V0ZVxuXHQgKi9cblx0b25DbG9zZShvbGRSb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwsIG5ld1JvdXRlOiB0UGFnZVJvdXRlRnVsbCk6IHZvaWRcbn1cblxuY29uc3Qgd0RvYyAgICAgID0gd2luZG93LmRvY3VtZW50O1xubGV0IHJvdXRlSWQgICAgID0gMCxcblx0X2lzUGFyZW50T2YgPSAocGFyZW50OiB0UGFnZVJvdXRlRnVsbCwgcm91dGU6IHRQYWdlUm91dGVGdWxsKTogYm9vbGVhbiA9PiB7XG5cdFx0bGV0IHA7XG5cdFx0d2hpbGUgKChwID0gcm91dGUucGFyZW50ISkpIHtcblx0XHRcdGlmIChwID09PSBwYXJlbnQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJvdXRlID0gcDtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUGFnZXIgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXHRzdGF0aWMgcmVhZG9ubHkgU0VMRiAgICAgICAgICAgID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQUdFX0NIQU5HRSA9IFV0aWxzLmlkKCk7XG5cblx0cHJpdmF0ZSByZWFkb25seSBfcGFnZXM6IHsgW2tleTogc3RyaW5nXTogaVBhZ2UgfSA9IHt9O1xuXHRwcml2YXRlIF9hY3RpdmVfcGFnZTogaVBhZ2UgfCB1bmRlZmluZWQ7XG5cdHByaXZhdGUgX3JvdXRlc19jYWNoZTogdFBhZ2VSb3V0ZVtdICAgICAgICAgICAgICAgPSBbXTtcblx0cHJpdmF0ZSBfcm91dGVzX2ZsYXR0ZW5lZDogdFBhZ2VSb3V0ZUZ1bGxbXSAgICAgICA9IFtdO1xuXHRwcml2YXRlIF9hY3RpdmVfcm91dGU/OiB0UGFnZVJvdXRlRnVsbDtcblxuXHQvKipcblx0ICogQHBhcmFtIGFwcF9jb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwX2NvbnRleHQ6IE9XZWJBcHApIHtcblx0XHRzdXBlcigpO1xuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJQYWdlcl0gcmVhZHkhXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcmVnaXN0ZXJlZCBwYWdlcyByb3V0ZXMuXG5cdCAqL1xuXHRnZXRSb3V0ZXMoKTogdFBhZ2VSb3V0ZVtdIHtcblx0XHRyZXR1cm4gdGhpcy5fcm91dGVzX2NhY2hlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHBhZ2Ugd2l0aCB0aGUgZ2l2ZW4gbmFtZS5cblx0ICogQHBhcmFtIG5hbWVcblx0ICovXG5cdGdldFBhZ2UobmFtZTogc3RyaW5nKTogaVBhZ2Uge1xuXHRcdGxldCBwYWdlOiBpUGFnZSA9IHRoaXMuX3BhZ2VzW25hbWVdO1xuXHRcdGlmICh1bmRlZmluZWQgPT09IHBhZ2UpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJQYWdlcl0gdGhlIHBhZ2UgXCIke25hbWV9XCIgaXMgbm90IGRlZmluZWQuYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhZ2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYWN0aXZlIHBhZ2UuXG5cdCAqL1xuXHRnZXRBY3RpdmVQYWdlKCk6IGlQYWdlIHtcblx0XHRpZiAoIXRoaXMuX2FjdGl2ZV9wYWdlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbT1dlYlBhZ2VyXSBubyBhY3RpdmUgcGFnZS5cIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9hY3RpdmVfcGFnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhY3RpdmUgcGFnZSByb3V0ZS5cblx0ICovXG5cdGdldEFjdGl2ZVBhZ2VSb3V0ZSgpOiB0UGFnZVJvdXRlRnVsbCB7XG5cdFx0aWYgKCF0aGlzLl9hY3RpdmVfcm91dGUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIltPV2ViUGFnZXJdIG5vIGFjdGl2ZSByb3V0ZS5cIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9hY3RpdmVfcm91dGU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbGwgcGFnZXMgbGlzdC5cblx0ICovXG5cdGdldFBhZ2VMaXN0KCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3BhZ2VzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBhIGdpdmVuIHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYWdlXG5cdCAqL1xuXHRyZWdpc3RlclBhZ2UocGFnZTogaVBhZ2UpOiB0aGlzIHtcblx0XHRsZXQgbmFtZSA9IHBhZ2UuZ2V0TmFtZSgpO1xuXG5cdFx0aWYgKG5hbWUgaW4gdGhpcy5fcGFnZXMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJQYWdlcl0gcGFnZSBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcGFnZXNbbmFtZV0gPSBwYWdlLmluc3RhbGwodGhpcyk7XG5cdFx0bGV0IHJvdXRlcyAgICAgICAgPSBwYWdlLmdldFJvdXRlcygpO1xuXG5cdFx0dGhpcy5fcm91dGVzX2NhY2hlLnB1c2goLi4ucm91dGVzKTtcblxuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RlclBhZ2VSb3V0ZXMocGFnZSwgcm91dGVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXJzIHRvIHJlZ2lzdGVyIHBhZ2Ugcm91dGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZSBUaGUgcGFnZS5cblx0ICogQHBhcmFtIHJvdXRlcyBUaGUgcGFnZSByb3V0ZXMgbGlzdC5cblx0ICogQHBhcmFtIHBhcmVudCBUaGUgcGFnZSByb3V0ZXMgcGFyZW50LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcmVnaXN0ZXJQYWdlUm91dGVzKHBhZ2U6IGlQYWdlLCByb3V0ZXM6IHRQYWdlUm91dGVbXSwgcGFyZW50PzogdFBhZ2VSb3V0ZUZ1bGwpOiB0aGlzIHtcblxuXHRcdGxldCByb3V0ZXI6IE9XZWJSb3V0ZXIgPSB0aGlzLmFwcF9jb250ZXh0LnJvdXRlcjtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcm91dGU6IGFueSA9IHJvdXRlc1tpXTtcblxuXHRcdFx0cm91dGUuaWQgICAgICAgICAgID0gKytyb3V0ZUlkO1xuXHRcdFx0cm91dGUucGFyZW50ICAgICAgID0gcGFyZW50O1xuXHRcdFx0cm91dGUuaHJlZiAgICAgICAgID0gcm91dGVyLnBhdGhUb1VSTCh0eXBlb2Ygcm91dGUucGF0aCA9PT0gXCJzdHJpbmdcIiA/IHJvdXRlLnBhdGggOiBcIi9cIikuaHJlZjtcblx0XHRcdHJvdXRlLmFjdGl2ZSAgICAgICA9IGZhbHNlO1xuXHRcdFx0cm91dGUuYWN0aXZlX2NoaWxkID0gZmFsc2U7XG5cblx0XHRcdHJvdXRlLnNob3cgPSByb3V0ZS5zaG93IHx8IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9O1xuXG5cdFx0XHR0aGlzLl9yb3V0ZXNfZmxhdHRlbmVkLnB1c2gocm91dGUpO1xuXG5cdFx0XHR0aGlzLl9hZGRSb3V0ZShyb3V0ZSwgcGFnZSk7XG5cblx0XHRcdGlmIChyb3V0ZS5zdWIgJiYgcm91dGUuc3ViLmxlbmd0aCkge1xuXHRcdFx0XHR0aGlzLl9yZWdpc3RlclBhZ2VSb3V0ZXMocGFnZSwgcm91dGUuc3ViLCByb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIGFkZCByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlIFRoZSByb3V0ZSBvYmplY3QuXG5cdCAqIEBwYXJhbSBwYWdlIFRoZSBwYWdlIHRvIHdoaWNoIHRoYXQgcm91dGUgYmVsb25ncyB0by5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX2FkZFJvdXRlKHJvdXRlOiB0UGFnZVJvdXRlRnVsbCwgcGFnZTogaVBhZ2UpOiB0aGlzIHtcblx0XHRsZXQgY3R4ID0gdGhpcztcblx0XHR0aGlzLmFwcF9jb250ZXh0LnJvdXRlci5vbihyb3V0ZS5wYXRoLCByb3V0ZS5wYXRoT3B0aW9ucywgKHJvdXRlQ29udGV4dDogT1dlYlJvdXRlQ29udGV4dCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlBhZ2VyXSBwYWdlIHJvdXRlIG1hdGNoIC0+XCIsIHJvdXRlLCBwYWdlLCByb3V0ZUNvbnRleHQpO1xuXG5cdFx0XHRpZiAocGFnZS5yZXF1aXJlTG9naW4ocm91dGVDb250ZXh0LCByb3V0ZSkgJiYgIWN0eC5hcHBfY29udGV4dC51c2VyVmVyaWZpZWQoKSkge1xuXHRcdFx0XHRyZXR1cm4gcm91dGVDb250ZXh0LnN0b3AoKSAmJiBjdHguYXBwX2NvbnRleHQuc2hvd0xvZ2luUGFnZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYXIgPSBjdHguX2FjdGl2ZV9yb3V0ZSwgYXAgPSBjdHguX2FjdGl2ZV9wYWdlO1xuXG5cdFx0XHRhcCAmJiBhciAmJiBhcC5vbkNsb3NlKGFyLCByb3V0ZSk7XG5cblx0XHRcdHBhZ2Uub25PcGVuKHJvdXRlQ29udGV4dCwgcm91dGUpO1xuXG5cdFx0XHQhcm91dGVDb250ZXh0LnN0b3BwZWQoKSAmJiBjdHguX3NldEFjdGl2ZVBhZ2UocGFnZSkuX3NldEFjdGl2ZVJvdXRlKHJvdXRlKTtcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBzZXQgdGhlIGFjdGl2ZSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9zZXRBY3RpdmVSb3V0ZShyb3V0ZTogdFBhZ2VSb3V0ZUZ1bGwpOiB0aGlzIHtcblx0XHRsZXQgbGlzdCA9IHRoaXMuX3JvdXRlc19mbGF0dGVuZWQ7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBjID0gbGlzdFtpXTtcblxuXHRcdFx0Yy5hY3RpdmUgICAgICAgPSByb3V0ZS5pZCA9PT0gYy5pZDtcblx0XHRcdGMuYWN0aXZlX2NoaWxkID0gIWMuYWN0aXZlICYmIF9pc1BhcmVudE9mKGMsIHJvdXRlKTtcblx0XHR9XG5cblx0XHR3RG9jLnRpdGxlID0gdGhpcy5hcHBfY29udGV4dC5pMThuLnRvSHVtYW4ocm91dGUudGl0bGUubGVuZ3RoID8gcm91dGUudGl0bGUgOiB0aGlzLmFwcF9jb250ZXh0LmdldEFwcE5hbWUoKSk7XG5cblx0XHR0aGlzLl9hY3RpdmVfcm91dGUgPSByb3V0ZTtcblxuXHRcdGNvbnNvbGUubG9nKGBbT1dlYlBhZ2VyXSBhY3RpdmUgcm91dGUgLT5gLCB0aGlzLl9hY3RpdmVfcm91dGUpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIHNldCB0aGUgYWN0aXZlIHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYWdlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9zZXRBY3RpdmVQYWdlKHBhZ2U6IGlQYWdlKTogdGhpcyB7XG5cdFx0bGV0IG9sZF9wYWdlID0gdGhpcy5fYWN0aXZlX3BhZ2U7XG5cblx0XHRpZiAob2xkX3BhZ2UgIT09IHBhZ2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKGBbT1dlYlBhZ2VyXSBwYWdlIGNoYW5naW5nIC0+YCwgcGFnZSwgb2xkX3BhZ2UpO1xuXHRcdFx0dGhpcy5fYWN0aXZlX3BhZ2UgPSBwYWdlO1xuXHRcdFx0dGhpcy50cmlnZ2VyKE9XZWJQYWdlci5FVlRfUEFHRV9DSEFOR0UsIFtvbGRfcGFnZSwgcGFnZV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgW09XZWJQYWdlcl0gc2FtZSBwYWdlIC0+YCwgb2xkX3BhZ2UsIHBhZ2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59Il19