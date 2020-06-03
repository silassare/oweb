import OWebEvent from './OWebEvent';
import { id, logger } from './utils';
const wDoc = window.document;
let routeId = 0;
const _isParentOf = (parent, route) => {
    let p;
    // tslint:disable-next-line: no-conditional-assignment
    while ((p = route.parent)) {
        if (p === parent) {
            return true;
        }
        route = p;
    }
    return false;
};
let OWebPager = /** @class */ (() => {
    class OWebPager extends OWebEvent {
        /**
         * @param appContext The app context.
         */
        constructor(appContext) {
            super();
            this.appContext = appContext;
            this._pages = {};
            this._routesCache = [];
            this._routesFlattened = [];
            logger.info('[OWebPager] ready!');
        }
        /**
         * Returns registered pages routes.
         */
        getRoutes() {
            return [...this._routesCache];
        }
        /**
         * Returns the page with the given name.
         * @param name
         */
        getPage(name) {
            const page = this._pages[name];
            if (undefined === page) {
                throw new Error(`[OWebPager] the page "${name}" is not defined.`);
            }
            return page;
        }
        /**
         * Returns the active page.
         */
        getActivePage() {
            if (!this._activePage) {
                throw new Error('[OWebPager] no active page.');
            }
            return this._activePage;
        }
        /**
         * Returns the active page route.
         */
        getActivePageRoute() {
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
        registerPage(page) {
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
        _registerPageRoutes(page, routes, parent) {
            const router = this.appContext.router;
            for (let i = 0; i < routes.length; i++) {
                const route = routes[i];
                route.id = ++routeId;
                route.parent = parent;
                route.href = router.pathToURL(typeof route.path === 'string' ? route.path : '/').href;
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
        _addRoute(route, page) {
            const ctx = this;
            this.appContext.router.on(route.path, route.pathOptions, (routeContext) => {
                logger.debug('[OWebPager] page route match', route, page, routeContext);
                if (page.requireLogin(routeContext, route) &&
                    !ctx.appContext.userVerified()) {
                    return (routeContext.stop() &&
                        ctx.appContext.showLoginPage({
                            next: routeContext.getPath(),
                        }));
                }
                const ar = ctx._activeRoute, ap = ctx._activePage;
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
        _setActive(page, route) {
            const oldPage = this._activePage, oldRoute = this._activeRoute, app = this.appContext;
            for (let i = 0; i < this._routesFlattened.length; i++) {
                const c = this._routesFlattened[i];
                c.active = route.id === c.id;
                c.activeChild = !c.active && _isParentOf(c, route);
            }
            this._activePage = page;
            this._activeRoute = route;
            wDoc.title = app.i18n.toHuman(route.title ? route.title : app.getAppName());
            const info = {
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
        onLocationChange(handler) {
            return this.on(OWebPager.EVT_PAGE_LOCATION_CHANGE, handler);
        }
    }
    OWebPager.SELF = id();
    OWebPager.EVT_PAGE_LOCATION_CHANGE = id();
    return OWebPager;
})();
export default OWebPager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFFcEMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFxRnJDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDN0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLE1BQU0sV0FBVyxHQUFHLENBQ25CLE1BQXNCLEVBQ3RCLEtBQXFCLEVBQ1gsRUFBRTtJQUNaLElBQUksQ0FBQyxDQUFDO0lBQ04sc0RBQXNEO0lBQ3RELE9BQU8sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU8sQ0FBQyxFQUFFO1FBQzNCLElBQUksQ0FBQyxLQUFLLE1BQU0sRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUNWO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDLENBQUM7QUFFRjtJQUFBLE1BQXFCLFNBQXFCLFNBQVEsU0FBUztRQVUxRDs7V0FFRztRQUNILFlBQTZCLFVBQW1CO1lBQy9DLEtBQUssRUFBRSxDQUFDO1lBRG9CLGVBQVUsR0FBVixVQUFVLENBQVM7WUFUL0IsV0FBTSxHQUF3QyxFQUFFLENBQUM7WUFDMUQsaUJBQVksR0FBaUIsRUFBRSxDQUFDO1lBQ2hDLHFCQUFnQixHQUFxQixFQUFFLENBQUM7WUFTL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFRDs7V0FFRztRQUNILFNBQVM7WUFDUixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVEOzs7V0FHRztRQUNILE9BQU8sQ0FBQyxJQUFZO1lBQ25CLE1BQU0sSUFBSSxHQUFxQixJ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QUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFaEUsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsZ0JBQWdCLENBQ2YsT0FBZ0U7WUFFaEUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDOztJQTFOZSxjQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWixrQ0FBd0IsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQTBOakQsZ0JBQUM7S0FBQTtlQTVOb0IsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQXBwIGZyb20gJy4vT1dlYkFwcCc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCBPV2ViUm91dGVyIGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQgeyBpZCwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlQ29udGV4dCBmcm9tICcuL09XZWJSb3V0ZUNvbnRleHQnO1xuaW1wb3J0IHsgdFJvdXRlUGF0aCwgdFJvdXRlUGF0aE9wdGlvbnMgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgeyB0STE4biB9IGZyb20gJy4vT1dlYkkxOG4nO1xuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlUm91dGUge1xuXHRzbHVnPzogc3RyaW5nO1xuXHR0aXRsZTogdEkxOG47XG5cdGRlc2NyaXB0aW9uPzogdEkxOG47XG5cdHBhdGg6IHRSb3V0ZVBhdGg7XG5cdHBhdGhPcHRpb25zPzogdFJvdXRlUGF0aE9wdGlvbnM7XG5cdHN1Yj86IElQYWdlUm91dGVbXTtcblx0c2hvd1N1Yj86IGJvb2xlYW47XG5cdGRpc2FibGVkPzogYm9vbGVhbjtcblxuXHRzaG93PygpOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlUm91dGVGdWxsIHtcblx0c2x1Zz86IHN0cmluZztcblx0dGl0bGU6IHRJMThuO1xuXHRkZXNjcmlwdGlvbj86IHRJMThuO1xuXHRwYXRoOiB0Um91dGVQYXRoO1xuXHRwYXRoT3B0aW9ucz86IHRSb3V0ZVBhdGhPcHRpb25zO1xuXHRzdWI/OiBJUGFnZVJvdXRlRnVsbFtdO1xuXHRzaG93U3ViPzogYm9vbGVhbjtcblx0ZGlzYWJsZWQ/OiBib29sZWFuO1xuXG5cdHNob3coKTogYm9vbGVhbjtcblxuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBocmVmOiBzdHJpbmc7XG5cdHJlYWRvbmx5IHBhcmVudD86IElQYWdlUm91dGVGdWxsO1xuXHRhY3RpdmU6IGJvb2xlYW47XG5cdGFjdGl2ZUNoaWxkOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlPENvbXBvbmVudD4ge1xuXHQvKipcblx0ICogVGhlIHBhZ2UgbmFtZSBnZXR0ZXIuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHBhZ2Ugcm91dGVzIGdldHRlci5cblx0ICovXG5cdGdldFJvdXRlcygpOiBJUGFnZVJvdXRlW107XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIGNvbXBvbmVudCBnZXR0ZXIuXG5cdCAqL1xuXHRnZXRDb21wb25lbnQoKTogQ29tcG9uZW50O1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgb25jZSB3aGVuIHJlZ2lzdGVyaW5nIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZXJcblx0ICovXG5cdGluc3RhbGwocGFnZXI6IE9XZWJQYWdlcjxDb21wb25lbnQ+KTogdGhpcztcblxuXHQvKipcblx0ICogRG9lcyB0aGlzIHBhZ2UgcmVxdWlyZSBhIHZlcmlmaWVkIHVzZXIgZm9yIHRoZSByZXF1ZXN0ZWQgcGFnZSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gcm91dGUgVGhlIHJlcXVlc3QgcGFnZSByb3V0ZS5cblx0ICovXG5cdHJlcXVpcmVMb2dpbihjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LCByb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwpOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgYmVmb3JlIHBhZ2Ugb3Blbi5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRvbk9wZW4oY29udGV4dDogT1dlYlJvdXRlQ29udGV4dCwgcm91dGU6IElQYWdlUm91dGVGdWxsKTogdm9pZDtcblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBwYWdlIGNsb3NlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb2xkUm91dGVcblx0ICogQHBhcmFtIG5ld1JvdXRlXG5cdCAqL1xuXHRvbkNsb3NlKG9sZFJvdXRlOiBJUGFnZVJvdXRlRnVsbCwgbmV3Um91dGU6IElQYWdlUm91dGVGdWxsKTogdm9pZDtcbn1cblxuY29uc3Qgd0RvYyA9IHdpbmRvdy5kb2N1bWVudDtcbmxldCByb3V0ZUlkID0gMDtcbmNvbnN0IF9pc1BhcmVudE9mID0gKFxuXHRwYXJlbnQ6IElQYWdlUm91dGVGdWxsLFxuXHRyb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwsXG4pOiBib29sZWFuID0+IHtcblx0bGV0IHA7XG5cdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHR3aGlsZSAoKHAgPSByb3V0ZS5wYXJlbnQhKSkge1xuXHRcdGlmIChwID09PSBwYXJlbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJvdXRlID0gcDtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUGFnZXI8Q29tcG9uZW50PiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQUdFX0xPQ0FUSU9OX0NIQU5HRSA9IGlkKCk7XG5cblx0cHJpdmF0ZSByZWFkb25seSBfcGFnZXM6IHsgW2tleTogc3RyaW5nXTogSVBhZ2U8Q29tcG9uZW50PiB9ID0ge307XG5cdHByaXZhdGUgX3JvdXRlc0NhY2hlOiBJUGFnZVJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfcm91dGVzRmxhdHRlbmVkOiBJUGFnZVJvdXRlRnVsbFtdID0gW107XG5cdHByaXZhdGUgX2FjdGl2ZVBhZ2U6IElQYWdlPENvbXBvbmVudD4gfCB1bmRlZmluZWQ7XG5cdHByaXZhdGUgX2FjdGl2ZVJvdXRlPzogSVBhZ2VSb3V0ZUZ1bGw7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBDb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUGFnZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcmVnaXN0ZXJlZCBwYWdlcyByb3V0ZXMuXG5cdCAqL1xuXHRnZXRSb3V0ZXMoKTogSVBhZ2VSb3V0ZVtdIHtcblx0XHRyZXR1cm4gWy4uLnRoaXMuX3JvdXRlc0NhY2hlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYWdlIHdpdGggdGhlIGdpdmVuIG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRQYWdlKG5hbWU6IHN0cmluZyk6IElQYWdlPENvbXBvbmVudD4ge1xuXHRcdGNvbnN0IHBhZ2U6IElQYWdlPENvbXBvbmVudD4gPSB0aGlzLl9wYWdlc1tuYW1lXTtcblx0XHRpZiAodW5kZWZpbmVkID09PSBwYWdlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViUGFnZXJdIHRoZSBwYWdlIFwiJHtuYW1lfVwiIGlzIG5vdCBkZWZpbmVkLmApO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFjdGl2ZSBwYWdlLlxuXHQgKi9cblx0Z2V0QWN0aXZlUGFnZSgpOiBJUGFnZTxDb21wb25lbnQ+IHtcblx0XHRpZiAoIXRoaXMuX2FjdGl2ZVBhZ2UpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJQYWdlcl0gbm8gYWN0aXZlIHBhZ2UuJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9hY3RpdmVQYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFjdGl2ZSBwYWdlIHJvdXRlLlxuXHQgKi9cblx0Z2V0QWN0aXZlUGFnZVJvdXRlKCk6IElQYWdlUm91dGVGdWxsIHtcblx0XHRpZiAoIXRoaXMuX2FjdGl2ZVJvdXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUGFnZXJdIG5vIGFjdGl2ZSByb3V0ZS4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGl2ZVJvdXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYWxsIHBhZ2VzIGxpc3QuXG5cdCAqL1xuXHRnZXRQYWdlTGlzdCgpIHtcblx0XHRyZXR1cm4geyAuLi50aGlzLl9wYWdlcyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgZ2l2ZW4gcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHBhZ2Vcblx0ICovXG5cdHJlZ2lzdGVyUGFnZShwYWdlOiBJUGFnZTxDb21wb25lbnQ+KTogdGhpcyB7XG5cdFx0Y29uc3QgbmFtZSA9IHBhZ2UuZ2V0TmFtZSgpO1xuXG5cdFx0aWYgKG5hbWUgaW4gdGhpcy5fcGFnZXMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJQYWdlcl0gcGFnZSBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcGFnZXNbbmFtZV0gPSBwYWdlLmluc3RhbGwodGhpcyk7XG5cdFx0Y29uc3Qgcm91dGVzID0gcGFnZS5nZXRSb3V0ZXMoKTtcblxuXHRcdHRoaXMuX3JvdXRlc0NhY2hlLnB1c2goLi4ucm91dGVzKTtcblxuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RlclBhZ2VSb3V0ZXMocGFnZSwgcm91dGVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXJzIHRvIHJlZ2lzdGVyIHBhZ2Ugcm91dGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZSBUaGUgcGFnZS5cblx0ICogQHBhcmFtIHJvdXRlcyBUaGUgcGFnZSByb3V0ZXMgbGlzdC5cblx0ICogQHBhcmFtIHBhcmVudCBUaGUgcGFnZSByb3V0ZXMgcGFyZW50LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcmVnaXN0ZXJQYWdlUm91dGVzKFxuXHRcdHBhZ2U6IElQYWdlPENvbXBvbmVudD4sXG5cdFx0cm91dGVzOiBJUGFnZVJvdXRlW10sXG5cdFx0cGFyZW50PzogSVBhZ2VSb3V0ZUZ1bGwsXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHJvdXRlcjogT1dlYlJvdXRlciA9IHRoaXMuYXBwQ29udGV4dC5yb3V0ZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgcm91dGU6IGFueSA9IHJvdXRlc1tpXTtcblxuXHRcdFx0cm91dGUuaWQgPSArK3JvdXRlSWQ7XG5cdFx0XHRyb3V0ZS5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRyb3V0ZS5ocmVmID0gcm91dGVyLnBhdGhUb1VSTChcblx0XHRcdFx0dHlwZW9mIHJvdXRlLnBhdGggPT09ICdzdHJpbmcnID8gcm91dGUucGF0aCA6ICcvJyxcblx0XHRcdCkuaHJlZjtcblx0XHRcdHJvdXRlLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0cm91dGUuYWN0aXZlQ2hpbGQgPSBmYWxzZTtcblxuXHRcdFx0cm91dGUuc2hvdyA9XG5cdFx0XHRcdHJvdXRlLnNob3cgfHxcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHR0aGlzLl9yb3V0ZXNGbGF0dGVuZWQucHVzaChyb3V0ZSk7XG5cblx0XHRcdHRoaXMuX2FkZFJvdXRlKHJvdXRlLCBwYWdlKTtcblxuXHRcdFx0aWYgKHJvdXRlLnN1YiAmJiByb3V0ZS5zdWIubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuX3JlZ2lzdGVyUGFnZVJvdXRlcyhwYWdlLCByb3V0ZS5zdWIsIHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gYWRkIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGUgVGhlIHJvdXRlIG9iamVjdC5cblx0ICogQHBhcmFtIHBhZ2UgVGhlIHBhZ2UgdG8gd2hpY2ggdGhhdCByb3V0ZSBiZWxvbmdzIHRvLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfYWRkUm91dGUocm91dGU6IElQYWdlUm91dGVGdWxsLCBwYWdlOiBJUGFnZTxDb21wb25lbnQ+KTogdGhpcyB7XG5cdFx0Y29uc3QgY3R4ID0gdGhpcztcblx0XHR0aGlzLmFwcENvbnRleHQucm91dGVyLm9uKFxuXHRcdFx0cm91dGUucGF0aCxcblx0XHRcdHJvdXRlLnBhdGhPcHRpb25zLFxuXHRcdFx0KHJvdXRlQ29udGV4dDogT1dlYlJvdXRlQ29udGV4dCkgPT4ge1xuXHRcdFx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHRcdFx0J1tPV2ViUGFnZXJdIHBhZ2Ugcm91dGUgbWF0Y2gnLFxuXHRcdFx0XHRcdHJvdXRlLFxuXHRcdFx0XHRcdHBhZ2UsXG5cdFx0XHRcdFx0cm91dGVDb250ZXh0LFxuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRwYWdlLnJlcXVpcmVMb2dpbihyb3V0ZUNvbnRleHQsIHJvdXRlKSAmJlxuXHRcdFx0XHRcdCFjdHguYXBwQ29udGV4dC51c2VyVmVyaWZpZWQoKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LnN0b3AoKSAmJlxuXHRcdFx0XHRcdFx0Y3R4LmFwcENvbnRleHQuc2hvd0xvZ2luUGFnZSh7XG5cdFx0XHRcdFx0XHRcdG5leHQ6IHJvdXRlQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBhciA9IGN0eC5fYWN0aXZlUm91dGUsXG5cdFx0XHRcdFx0YXAgPSBjdHguX2FjdGl2ZVBhZ2U7XG5cblx0XHRcdFx0YXAgJiYgYXIgJiYgYXAub25DbG9zZShhciwgcm91dGUpO1xuXG5cdFx0XHRcdHBhZ2Uub25PcGVuKHJvdXRlQ29udGV4dCwgcm91dGUpO1xuXG5cdFx0XHRcdCFyb3V0ZUNvbnRleHQuc3RvcHBlZCgpICYmIGN0eC5fc2V0QWN0aXZlKHBhZ2UsIHJvdXRlKTtcblx0XHRcdH0sXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhlbHBlciB0byBzZXQgdGhlIGFjdGl2ZSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHBhZ2Vcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcml2YXRlIF9zZXRBY3RpdmUocGFnZTogSVBhZ2U8Q29tcG9uZW50Piwgcm91dGU6IElQYWdlUm91dGVGdWxsKTogdGhpcyB7XG5cdFx0Y29uc3Qgb2xkUGFnZSA9IHRoaXMuX2FjdGl2ZVBhZ2UsXG5cdFx0XHRvbGRSb3V0ZSA9IHRoaXMuX2FjdGl2ZVJvdXRlLFxuXHRcdFx0YXBwID0gdGhpcy5hcHBDb250ZXh0O1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9yb3V0ZXNGbGF0dGVuZWQubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGMgPSB0aGlzLl9yb3V0ZXNGbGF0dGVuZWRbaV07XG5cblx0XHRcdGMuYWN0aXZlID0gcm91dGUuaWQgPT09IGMuaWQ7XG5cdFx0XHRjLmFjdGl2ZUNoaWxkID0gIWMuYWN0aXZlICYmIF9pc1BhcmVudE9mKGMsIHJvdXRlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9hY3RpdmVQYWdlID0gcGFnZTtcblx0XHR0aGlzLl9hY3RpdmVSb3V0ZSA9IHJvdXRlO1xuXHRcdHdEb2MudGl0bGUgPSBhcHAuaTE4bi50b0h1bWFuKFxuXHRcdFx0cm91dGUudGl0bGUgPyByb3V0ZS50aXRsZSA6IGFwcC5nZXRBcHBOYW1lKCksXG5cdFx0KTtcblxuXHRcdGNvbnN0IGluZm86IGFueSA9IHtcblx0XHRcdHBhZ2UsXG5cdFx0XHRvbGRQYWdlLFxuXHRcdFx0cm91dGUsXG5cdFx0XHRvbGRSb3V0ZSxcblx0XHRcdHNhbWVQYWdlOiBvbGRQYWdlID09PSBwYWdlLFxuXHRcdH07XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUGFnZXJdIGxvY2F0aW9uIGluZm8nLCBpbmZvKTtcblxuXHRcdHRoaXMudHJpZ2dlcihPV2ViUGFnZXIuRVZUX1BBR0VfTE9DQVRJT05fQ0hBTkdFLCBbcm91dGUsIHBhZ2VdKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0b25Mb2NhdGlvbkNoYW5nZShcblx0XHRoYW5kbGVyOiAocm91dGU6IElQYWdlUm91dGVGdWxsLCBwYWdlOiBJUGFnZTxDb21wb25lbnQ+KSA9PiB2b2lkLFxuXHQpIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViUGFnZXIuRVZUX1BBR0VfTE9DQVRJT05fQ0hBTkdFLCBoYW5kbGVyKTtcblx0fVxufVxuIl19