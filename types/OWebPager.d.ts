import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
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
export declare type OPageRouteFull<Route extends OPageRoute = OPageRoute> = Route & {
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
    requireLogin?(context: OWebRouteContext, route: OPageRouteFull<Route>): boolean;
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
    onClose?(oldRoute: OPageRouteFull<Route>, newRoute: OPageRouteFull<Route>): void;
}
export default class OWebPager<P extends OPage<R>, R extends OPageRoute = OPageRoute> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_PAGE_LOCATION_CHANGE: string;
    private readonly _pages;
    private _routesCache;
    private _routesFlattened;
    private _activePage?;
    private _activeRoute?;
    /**
     * @param _appContext The app context.
     */
    constructor(_appContext: OWebApp);
    /**
     * Returns registered pages routes.
     */
    getRoutes(): OPageRouteFull<R>[];
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name: string): P;
    /**
     * Returns the active page.
     */
    getActivePage(): P;
    /**
     * Returns the active page route.
     */
    getActivePageRoute(): OPageRouteFull<R>;
    /**
     * Returns all pages list.
     */
    getPageList(): Record<string, P>;
    /**
     * Register a given page.
     *
     * @param page
     */
    registerPage(page: P): this;
    /**
     * Helpers to register page routes.
     *
     * @param page The page.
     * @param routes The page routes list.
     * @param parent The page routes parent.
     * @private
     */
    private _registerPageRoutes;
    /**
     * Helper to add route.
     *
     * @param route The route object.
     * @param page The page to which that route belongs to.
     * @private
     */
    private _addRoute;
    /**
     * Helper to set the active route.
     *
     * @param page
     * @param route
     * @private
     */
    private _setActive;
    onLocationChange(handler: (route: OPageRouteFull<R>, page: P) => void): this;
}
//# sourceMappingURL=OWebPager.d.ts.map