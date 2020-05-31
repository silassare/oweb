import OWebEvent from './OWebEvent';
import { id } from './utils/Utils';
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
export default class OWebPager extends OWebEvent {
    /**
     * @param appContext The app context.
     */
    constructor(appContext) {
        super();
        this.appContext = appContext;
        this._pages = {};
        this._routesCache = [];
        this._routesFlattened = [];
        console.log('[OWebPager] ready!');
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
            console.log('[OWebPager] page route match ->', route, page, routeContext);
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
        console.log('[OWebPager] info', info);
        this.trigger(OWebPager.EVT_PAGE_LOCATION_CHANGE, [route, page]);
        return this;
    }
    onLocationChange(handler) {
        return this.on(OWebPager.EVT_PAGE_LOCATION_CHANGE, handler);
    }
}
OWebPager.SELF = id();
OWebPager.EVT_PAGE_LOCATION_CHANGE = id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlBhZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09XZWJQYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFFcEMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQXFGbkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUM3QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDaEIsTUFBTSxXQUFXLEdBQUcsQ0FDbkIsTUFBc0IsRUFDdEIsS0FBcUIsRUFDWCxFQUFFO0lBQ1osSUFBSSxDQUFDLENBQUM7SUFDTixzREFBc0Q7SUFDdEQsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTyxDQUFDLEVBQUU7UUFDM0IsSUFBSSxDQUFDLEtBQUssTUFBTSxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxLQUFLLEdBQUcsQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxPQUFPLE9BQU8sU0FBcUIsU0FBUSxTQUFTO0lBVTFEOztPQUVHO0lBQ0gsWUFBNkIsVUFBbUI7UUFDL0MsS0FBSyxFQUFFLENBQUM7UUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBUztRQVQvQixXQUFNLEdBQXdDLEVBQUUsQ0FBQztRQUMxRCxpQkFBWSxHQUFpQixFQUFFLENBQUM7UUFDaEMscUJBQWdCLEdBQXFCLEVBQUUsQ0FBQztRQVMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNSLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsT0FBTyxDQUFDLElBQVk7UUFDbkIsTUFBTSxJQUFJLEdBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakQsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLElBQUksbUJBQW1CLENBQUMsQ0FBQztTQUNsRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3RCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUMvQztRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQkFBa0I7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDVixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxZQUFZLENBQUMsSUFBc0I7UUFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTVCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsSUFBSSx1QkFBdUIsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVoQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBRWxDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLG1CQUFtQixDQUMxQixJQUFzQixFQUN0QixNQUFvQixFQUNwQixNQUF1QjtRQUV2QixNQUFNLE1BQU0sR0FBZSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUVsRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxNQUFNLEtBQUssR0FBUSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQztZQUNyQixLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUN0QixLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQzVCLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FDakQsQ0FBQyxJQUFJLENBQUM7WUFDUCxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNyQixLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUUxQixLQUFLLENBQUMsSUFBSTtnQkFDVCxLQUFLLENBQUMsSUFBSTtvQkFDVjt3QkFDQyxPQUFPLElBQUksQ0FBQztvQkFDYixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRTVCLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDbEMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ2pEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxTQUFTLENBQUMsS0FBcUIsRUFBRSxJQUFzQjtRQUM5RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUN4QixLQUFLLENBQUMsSUFBSSxFQUNWLEtBQUssQ0FBQyxXQUFXLEVBQ2pCLENBQUMsWUFBOEIsRUFBRSxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQ1YsaUNBQWlDLEVBQ2pDLEtBQUssRUFDTCxJQUFJLEVBQ0osWUFBWSxDQUNaLENBQUM7WUFFRixJQUNDLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQztnQkFDdEMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxFQUM3QjtnQkFDRCxPQUFPLENBQ04sWUFBWSxDQUFDLElBQUksRUFBRTtvQkFDbkIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUM7d0JBQzVCLElBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFO3FCQUM1QixDQUFDLENBQ0YsQ0FBQzthQUNGO1lBRUQsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFDMUIsRUFBRSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFFdEIsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVqQyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDLENBQ0QsQ0FBQztRQUVGLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLFVBQVUsQ0FBQyxJQUFzQixFQUFFLEtBQXFCO1FBQy9ELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQy9CLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUM1QixHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUV2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0RCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFbkMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNuRDtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQzVCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FDNUMsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFRO1lBQ2pCLElBQUk7WUFDSixPQUFPO1lBQ1AsS0FBSztZQUNMLFFBQVE7WUFDUixRQUFRLEVBQUUsT0FBTyxLQUFLLElBQUk7U0FDMUIsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVoRSxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxnQkFBZ0IsQ0FDZixPQUFnRTtRQUVoRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzdELENBQUM7O0FBMU5lLGNBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNaLGtDQUF3QixHQUFHLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJBcHAgZnJvbSAnLi9PV2ViQXBwJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IE9XZWJSb3V0ZXIgZnJvbSAnLi9PV2ViUm91dGVyJztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlQ29udGV4dCBmcm9tICcuL09XZWJSb3V0ZUNvbnRleHQnO1xuaW1wb3J0IHsgdFJvdXRlUGF0aCwgdFJvdXRlUGF0aE9wdGlvbnMgfSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgeyB0STE4biB9IGZyb20gJy4vT1dlYkkxOG4nO1xuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlUm91dGUge1xuXHRzbHVnPzogc3RyaW5nO1xuXHR0aXRsZTogdEkxOG47XG5cdGRlc2NyaXB0aW9uPzogdEkxOG47XG5cdHBhdGg6IHRSb3V0ZVBhdGg7XG5cdHBhdGhPcHRpb25zPzogdFJvdXRlUGF0aE9wdGlvbnM7XG5cdHN1Yj86IElQYWdlUm91dGVbXTtcblx0c2hvd1N1Yj86IGJvb2xlYW47XG5cdGRpc2FibGVkPzogYm9vbGVhbjtcblxuXHRzaG93PygpOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlUm91dGVGdWxsIHtcblx0c2x1Zz86IHN0cmluZztcblx0dGl0bGU6IHRJMThuO1xuXHRkZXNjcmlwdGlvbj86IHRJMThuO1xuXHRwYXRoOiB0Um91dGVQYXRoO1xuXHRwYXRoT3B0aW9ucz86IHRSb3V0ZVBhdGhPcHRpb25zO1xuXHRzdWI/OiBJUGFnZVJvdXRlRnVsbFtdO1xuXHRzaG93U3ViPzogYm9vbGVhbjtcblx0ZGlzYWJsZWQ/OiBib29sZWFuO1xuXG5cdHNob3coKTogYm9vbGVhbjtcblxuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBocmVmOiBzdHJpbmc7XG5cdHJlYWRvbmx5IHBhcmVudD86IElQYWdlUm91dGVGdWxsO1xuXHRhY3RpdmU6IGJvb2xlYW47XG5cdGFjdGl2ZUNoaWxkOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQYWdlPENvbXBvbmVudD4ge1xuXHQvKipcblx0ICogVGhlIHBhZ2UgbmFtZSBnZXR0ZXIuXG5cdCAqL1xuXHRnZXROYW1lKCk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHBhZ2Ugcm91dGVzIGdldHRlci5cblx0ICovXG5cdGdldFJvdXRlcygpOiBJUGFnZVJvdXRlW107XG5cblx0LyoqXG5cdCAqIFRoZSBwYWdlIGNvbXBvbmVudCBnZXR0ZXIuXG5cdCAqL1xuXHRnZXRDb21wb25lbnQoKTogQ29tcG9uZW50O1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgb25jZSB3aGVuIHJlZ2lzdGVyaW5nIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZXJcblx0ICovXG5cdGluc3RhbGwocGFnZXI6IE9XZWJQYWdlcjxDb21wb25lbnQ+KTogdGhpcztcblxuXHQvKipcblx0ICogRG9lcyB0aGlzIHBhZ2UgcmVxdWlyZSBhIHZlcmlmaWVkIHVzZXIgZm9yIHRoZSByZXF1ZXN0ZWQgcGFnZSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGFwcCBjb250ZXh0LlxuXHQgKiBAcGFyYW0gcm91dGUgVGhlIHJlcXVlc3QgcGFnZSByb3V0ZS5cblx0ICovXG5cdHJlcXVpcmVMb2dpbihjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LCByb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwpOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgYmVmb3JlIHBhZ2Ugb3Blbi5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRvbk9wZW4oY29udGV4dDogT1dlYlJvdXRlQ29udGV4dCwgcm91dGU6IElQYWdlUm91dGVGdWxsKTogdm9pZDtcblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBwYWdlIGNsb3NlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb2xkUm91dGVcblx0ICogQHBhcmFtIG5ld1JvdXRlXG5cdCAqL1xuXHRvbkNsb3NlKG9sZFJvdXRlOiBJUGFnZVJvdXRlRnVsbCwgbmV3Um91dGU6IElQYWdlUm91dGVGdWxsKTogdm9pZDtcbn1cblxuY29uc3Qgd0RvYyA9IHdpbmRvdy5kb2N1bWVudDtcbmxldCByb3V0ZUlkID0gMDtcbmNvbnN0IF9pc1BhcmVudE9mID0gKFxuXHRwYXJlbnQ6IElQYWdlUm91dGVGdWxsLFxuXHRyb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwsXG4pOiBib29sZWFuID0+IHtcblx0bGV0IHA7XG5cdC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuXHR3aGlsZSAoKHAgPSByb3V0ZS5wYXJlbnQhKSkge1xuXHRcdGlmIChwID09PSBwYXJlbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJvdXRlID0gcDtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUGFnZXI8Q29tcG9uZW50PiBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9QQUdFX0xPQ0FUSU9OX0NIQU5HRSA9IGlkKCk7XG5cblx0cHJpdmF0ZSByZWFkb25seSBfcGFnZXM6IHsgW2tleTogc3RyaW5nXTogSVBhZ2U8Q29tcG9uZW50PiB9ID0ge307XG5cdHByaXZhdGUgX3JvdXRlc0NhY2hlOiBJUGFnZVJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfcm91dGVzRmxhdHRlbmVkOiBJUGFnZVJvdXRlRnVsbFtdID0gW107XG5cdHByaXZhdGUgX2FjdGl2ZVBhZ2U6IElQYWdlPENvbXBvbmVudD4gfCB1bmRlZmluZWQ7XG5cdHByaXZhdGUgX2FjdGl2ZVJvdXRlPzogSVBhZ2VSb3V0ZUZ1bGw7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBhcHBDb250ZXh0IFRoZSBhcHAgY29udGV4dC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgYXBwQ29udGV4dDogT1dlYkFwcCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUGFnZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcmVnaXN0ZXJlZCBwYWdlcyByb3V0ZXMuXG5cdCAqL1xuXHRnZXRSb3V0ZXMoKTogSVBhZ2VSb3V0ZVtdIHtcblx0XHRyZXR1cm4gWy4uLnRoaXMuX3JvdXRlc0NhY2hlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYWdlIHdpdGggdGhlIGdpdmVuIG5hbWUuXG5cdCAqIEBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRQYWdlKG5hbWU6IHN0cmluZyk6IElQYWdlPENvbXBvbmVudD4ge1xuXHRcdGNvbnN0IHBhZ2U6IElQYWdlPENvbXBvbmVudD4gPSB0aGlzLl9wYWdlc1tuYW1lXTtcblx0XHRpZiAodW5kZWZpbmVkID09PSBwYWdlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFtPV2ViUGFnZXJdIHRoZSBwYWdlIFwiJHtuYW1lfVwiIGlzIG5vdCBkZWZpbmVkLmApO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFjdGl2ZSBwYWdlLlxuXHQgKi9cblx0Z2V0QWN0aXZlUGFnZSgpOiBJUGFnZTxDb21wb25lbnQ+IHtcblx0XHRpZiAoIXRoaXMuX2FjdGl2ZVBhZ2UpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJQYWdlcl0gbm8gYWN0aXZlIHBhZ2UuJyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9hY3RpdmVQYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFjdGl2ZSBwYWdlIHJvdXRlLlxuXHQgKi9cblx0Z2V0QWN0aXZlUGFnZVJvdXRlKCk6IElQYWdlUm91dGVGdWxsIHtcblx0XHRpZiAoIXRoaXMuX2FjdGl2ZVJvdXRlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUGFnZXJdIG5vIGFjdGl2ZSByb3V0ZS4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2FjdGl2ZVJvdXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYWxsIHBhZ2VzIGxpc3QuXG5cdCAqL1xuXHRnZXRQYWdlTGlzdCgpIHtcblx0XHRyZXR1cm4geyAuLi50aGlzLl9wYWdlcyB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGEgZ2l2ZW4gcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHBhZ2Vcblx0ICovXG5cdHJlZ2lzdGVyUGFnZShwYWdlOiBJUGFnZTxDb21wb25lbnQ+KTogdGhpcyB7XG5cdFx0Y29uc3QgbmFtZSA9IHBhZ2UuZ2V0TmFtZSgpO1xuXG5cdFx0aWYgKG5hbWUgaW4gdGhpcy5fcGFnZXMpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgW09XZWJQYWdlcl0gcGFnZSBcIiR7bmFtZX1cIiBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcGFnZXNbbmFtZV0gPSBwYWdlLmluc3RhbGwodGhpcyk7XG5cdFx0Y29uc3Qgcm91dGVzID0gcGFnZS5nZXRSb3V0ZXMoKTtcblxuXHRcdHRoaXMuX3JvdXRlc0NhY2hlLnB1c2goLi4ucm91dGVzKTtcblxuXHRcdHJldHVybiB0aGlzLl9yZWdpc3RlclBhZ2VSb3V0ZXMocGFnZSwgcm91dGVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXJzIHRvIHJlZ2lzdGVyIHBhZ2Ugcm91dGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZSBUaGUgcGFnZS5cblx0ICogQHBhcmFtIHJvdXRlcyBUaGUgcGFnZSByb3V0ZXMgbGlzdC5cblx0ICogQHBhcmFtIHBhcmVudCBUaGUgcGFnZSByb3V0ZXMgcGFyZW50LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfcmVnaXN0ZXJQYWdlUm91dGVzKFxuXHRcdHBhZ2U6IElQYWdlPENvbXBvbmVudD4sXG5cdFx0cm91dGVzOiBJUGFnZVJvdXRlW10sXG5cdFx0cGFyZW50PzogSVBhZ2VSb3V0ZUZ1bGwsXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHJvdXRlcjogT1dlYlJvdXRlciA9IHRoaXMuYXBwQ29udGV4dC5yb3V0ZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgcm91dGU6IGFueSA9IHJvdXRlc1tpXTtcblxuXHRcdFx0cm91dGUuaWQgPSArK3JvdXRlSWQ7XG5cdFx0XHRyb3V0ZS5wYXJlbnQgPSBwYXJlbnQ7XG5cdFx0XHRyb3V0ZS5ocmVmID0gcm91dGVyLnBhdGhUb1VSTChcblx0XHRcdFx0dHlwZW9mIHJvdXRlLnBhdGggPT09ICdzdHJpbmcnID8gcm91dGUucGF0aCA6ICcvJyxcblx0XHRcdCkuaHJlZjtcblx0XHRcdHJvdXRlLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0cm91dGUuYWN0aXZlQ2hpbGQgPSBmYWxzZTtcblxuXHRcdFx0cm91dGUuc2hvdyA9XG5cdFx0XHRcdHJvdXRlLnNob3cgfHxcblx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHR0aGlzLl9yb3V0ZXNGbGF0dGVuZWQucHVzaChyb3V0ZSk7XG5cblx0XHRcdHRoaXMuX2FkZFJvdXRlKHJvdXRlLCBwYWdlKTtcblxuXHRcdFx0aWYgKHJvdXRlLnN1YiAmJiByb3V0ZS5zdWIubGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMuX3JlZ2lzdGVyUGFnZVJvdXRlcyhwYWdlLCByb3V0ZS5zdWIsIHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gYWRkIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGUgVGhlIHJvdXRlIG9iamVjdC5cblx0ICogQHBhcmFtIHBhZ2UgVGhlIHBhZ2UgdG8gd2hpY2ggdGhhdCByb3V0ZSBiZWxvbmdzIHRvLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBfYWRkUm91dGUocm91dGU6IElQYWdlUm91dGVGdWxsLCBwYWdlOiBJUGFnZTxDb21wb25lbnQ+KTogdGhpcyB7XG5cdFx0Y29uc3QgY3R4ID0gdGhpcztcblx0XHR0aGlzLmFwcENvbnRleHQucm91dGVyLm9uKFxuXHRcdFx0cm91dGUucGF0aCxcblx0XHRcdHJvdXRlLnBhdGhPcHRpb25zLFxuXHRcdFx0KHJvdXRlQ29udGV4dDogT1dlYlJvdXRlQ29udGV4dCkgPT4ge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcblx0XHRcdFx0XHQnW09XZWJQYWdlcl0gcGFnZSByb3V0ZSBtYXRjaCAtPicsXG5cdFx0XHRcdFx0cm91dGUsXG5cdFx0XHRcdFx0cGFnZSxcblx0XHRcdFx0XHRyb3V0ZUNvbnRleHQsXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHBhZ2UucmVxdWlyZUxvZ2luKHJvdXRlQ29udGV4dCwgcm91dGUpICYmXG5cdFx0XHRcdFx0IWN0eC5hcHBDb250ZXh0LnVzZXJWZXJpZmllZCgpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRyb3V0ZUNvbnRleHQuc3RvcCgpICYmXG5cdFx0XHRcdFx0XHRjdHguYXBwQ29udGV4dC5zaG93TG9naW5QYWdlKHtcblx0XHRcdFx0XHRcdFx0bmV4dDogcm91dGVDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGFyID0gY3R4Ll9hY3RpdmVSb3V0ZSxcblx0XHRcdFx0XHRhcCA9IGN0eC5fYWN0aXZlUGFnZTtcblxuXHRcdFx0XHRhcCAmJiBhciAmJiBhcC5vbkNsb3NlKGFyLCByb3V0ZSk7XG5cblx0XHRcdFx0cGFnZS5vbk9wZW4ocm91dGVDb250ZXh0LCByb3V0ZSk7XG5cblx0XHRcdFx0IXJvdXRlQ29udGV4dC5zdG9wcGVkKCkgJiYgY3R4Ll9zZXRBY3RpdmUocGFnZSwgcm91dGUpO1xuXHRcdFx0fSxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIHNldCB0aGUgYWN0aXZlIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFnZVxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgX3NldEFjdGl2ZShwYWdlOiBJUGFnZTxDb21wb25lbnQ+LCByb3V0ZTogSVBhZ2VSb3V0ZUZ1bGwpOiB0aGlzIHtcblx0XHRjb25zdCBvbGRQYWdlID0gdGhpcy5fYWN0aXZlUGFnZSxcblx0XHRcdG9sZFJvdXRlID0gdGhpcy5fYWN0aXZlUm91dGUsXG5cdFx0XHRhcHAgPSB0aGlzLmFwcENvbnRleHQ7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3JvdXRlc0ZsYXR0ZW5lZC5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYyA9IHRoaXMuX3JvdXRlc0ZsYXR0ZW5lZFtpXTtcblxuXHRcdFx0Yy5hY3RpdmUgPSByb3V0ZS5pZCA9PT0gYy5pZDtcblx0XHRcdGMuYWN0aXZlQ2hpbGQgPSAhYy5hY3RpdmUgJiYgX2lzUGFyZW50T2YoYywgcm91dGUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2FjdGl2ZVBhZ2UgPSBwYWdlO1xuXHRcdHRoaXMuX2FjdGl2ZVJvdXRlID0gcm91dGU7XG5cdFx0d0RvYy50aXRsZSA9IGFwcC5pMThuLnRvSHVtYW4oXG5cdFx0XHRyb3V0ZS50aXRsZSA/IHJvdXRlLnRpdGxlIDogYXBwLmdldEFwcE5hbWUoKSxcblx0XHQpO1xuXG5cdFx0Y29uc3QgaW5mbzogYW55ID0ge1xuXHRcdFx0cGFnZSxcblx0XHRcdG9sZFBhZ2UsXG5cdFx0XHRyb3V0ZSxcblx0XHRcdG9sZFJvdXRlLFxuXHRcdFx0c2FtZVBhZ2U6IG9sZFBhZ2UgPT09IHBhZ2UsXG5cdFx0fTtcblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlBhZ2VyXSBpbmZvJywgaW5mbyk7XG5cblx0XHR0aGlzLnRyaWdnZXIoT1dlYlBhZ2VyLkVWVF9QQUdFX0xPQ0FUSU9OX0NIQU5HRSwgW3JvdXRlLCBwYWdlXSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG9uTG9jYXRpb25DaGFuZ2UoXG5cdFx0aGFuZGxlcjogKHJvdXRlOiBJUGFnZVJvdXRlRnVsbCwgcGFnZTogSVBhZ2U8Q29tcG9uZW50PikgPT4gdm9pZCxcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYlBhZ2VyLkVWVF9QQUdFX0xPQ0FUSU9OX0NIQU5HRSwgaGFuZGxlcik7XG5cdH1cbn1cbiJdfQ==