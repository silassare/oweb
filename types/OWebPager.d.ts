import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import { OWebRouteContext, tRoutePath, tRoutePathOptions } from './OWebRouter';
import { tI18n } from "./oweb";
export interface iPageRoute {
    slug?: string;
    title: tI18n;
    description?: tI18n;
    path: tRoutePath;
    pathOptions?: tRoutePathOptions;
    sub?: iPageRoute[];
    showSub?: boolean;
    disabled?: boolean;
    show?(): boolean;
}
export interface iPageRouteFull {
    slug?: string;
    title: tI18n;
    description?: tI18n;
    path: tRoutePath;
    pathOptions?: tRoutePathOptions;
    sub?: iPageRouteFull[];
    showSub?: boolean;
    disabled?: boolean;
    show(): boolean;
    readonly id: number;
    readonly href: string;
    readonly parent?: iPageRouteFull;
    active: boolean;
    activeChild: boolean;
}
export interface iPage<Component> {
    /**
     * The page name getter.
     */
    getName(): string;
    /**
     * The page routes getter.
     */
    getRoutes(): iPageRoute[];
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
    requireLogin(context: OWebRouteContext, route: iPageRouteFull): boolean;
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    onOpen(context: OWebRouteContext, route: iPageRouteFull): void;
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose(oldRoute: iPageRouteFull, newRoute: iPageRouteFull): void;
}
export default class OWebPager<Component> extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PAGE_LOCATION_CHANGE: string;
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
    getRoutes(): iPageRoute[];
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name: string): iPage<Component>;
    /**
     * Returns the active page.
     */
    getActivePage(): iPage<Component>;
    /**
     * Returns the active page route.
     */
    getActivePageRoute(): iPageRouteFull;
    /**
     * Returns all pages list.
     */
    getPageList(): {
        [x: string]: iPage<Component>;
    };
    /**
     * Register a given page.
     *
     * @param page
     */
    registerPage(page: iPage<Component>): this;
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
    onLocationChange(handler: (route: iPageRouteFull, page: iPage<Component>) => void): this;
}
