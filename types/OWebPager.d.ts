import OWebApp from './OWebApp';
import OWebEvent from './OWebEvent';
import OWebRouteContext from './OWebRouteContext';
import { tRoutePath, tRoutePathOptions } from './OWebRoute';
import { tI18n } from './OWebI18n';
export interface IPageRoute {
    slug?: string;
    title: tI18n;
    description?: tI18n;
    path: tRoutePath;
    pathOptions?: tRoutePathOptions;
    sub?: IPageRoute[];
    showSub?: boolean;
    disabled?: boolean;
    show?(): boolean;
}
export interface IPageRouteFull {
    slug?: string;
    title: tI18n;
    description?: tI18n;
    path: tRoutePath;
    pathOptions?: tRoutePathOptions;
    sub?: IPageRouteFull[];
    showSub?: boolean;
    disabled?: boolean;
    show(): boolean;
    readonly id: number;
    readonly href: string;
    readonly parent?: IPageRouteFull;
    active: boolean;
    activeChild: boolean;
}
export interface IPage<Component> {
    /**
     * The page name getter.
     */
    getName(): string;
    /**
     * The page routes getter.
     */
    getRoutes(): IPageRoute[];
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
    requireLogin(context: OWebRouteContext, route: IPageRouteFull): boolean;
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    onOpen(context: OWebRouteContext, route: IPageRouteFull): void;
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose(oldRoute: IPageRouteFull, newRoute: IPageRouteFull): void;
}
export default class OWebPager<Component> extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_PAGE_LOCATION_CHANGE: string;
    private readonly _pages;
    private _routesCache;
    private _routesFlattened;
    private _activePage;
    private _activeRoute?;
    /**
     * @param appContext The app context.
     */
    constructor(appContext: OWebApp);
    /**
     * Returns registered pages routes.
     */
    getRoutes(): IPageRoute[];
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name: string): IPage<Component>;
    /**
     * Returns the active page.
     */
    getActivePage(): IPage<Component>;
    /**
     * Returns the active page route.
     */
    getActivePageRoute(): IPageRouteFull;
    /**
     * Returns all pages list.
     */
    getPageList(): {
        [x: string]: IPage<Component>;
    };
    /**
     * Register a given page.
     *
     * @param page
     */
    registerPage(page: IPage<Component>): this;
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
    onLocationChange(handler: (route: IPageRouteFull, page: IPage<Component>) => void): this;
}
