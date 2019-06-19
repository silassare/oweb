import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
import { OWebRouteContext, tRoutePath, tRoutePathOptions } from "./OWebRouter";
export declare type tPageRoute = {
    slug?: string;
    title: string;
    description?: string;
    icon?: string;
    path: tRoutePath;
    pathOptions?: tRoutePathOptions;
    sub?: tPageRoute[];
    show?(): boolean;
};
export declare type tPageRouteFull = tPageRoute & {
    readonly id: number;
    readonly href: string;
    readonly parent?: tPageRouteFull;
    active: boolean;
    active_child: boolean;
    show(): boolean;
};
export interface iPage {
    /**
     * The page name getter.
     */
    getName(): string;
    /**
     * The page routes getter.
     */
    getRoutes(): tPageRoute[];
    /**
     * Called once when registering the page.
     *
     * @param pager
     */
    install(pager: OWebPager): this;
    /**
     * Does this page require a verified user for the requested page route.
     *
     * @param context The app context.
     * @param route The request page route.
     */
    requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean;
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    onOpen(context: OWebRouteContext, route: tPageRouteFull): void;
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void;
}
export default class OWebPager extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PAGE_CHANGE: string;
    private readonly _pages;
    private _routes_cache;
    private _routes_flattened;
    private _active_page;
    private _active_route?;
    /**
     * @param app_context The app context.
     */
    constructor(app_context: OWebApp);
    /**
     * Returns registered pages routes.
     */
    getRoutes(): tPageRoute[];
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name: string): iPage;
    /**
     * Returns the active page.
     */
    getActivePage(): iPage;
    /**
     * Returns the active page route.
     */
    getActivePageRoute(): tPageRouteFull;
    /**
     * Returns all pages list.
     */
    getPageList(): any;
    /**
     * Register a given page.
     *
     * @param page
     */
    registerPage(page: iPage): this;
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
}
