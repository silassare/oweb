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
    name: string;
    routes: Route[];
    install?(pager: OWebPager<this>): this;
    requireLogin?(context: OWebRouteContext, route: OPageRouteFull<Route>): boolean;
    onOpen?(context: OWebRouteContext, route: OPageRouteFull<Route>): void;
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
    constructor(_appContext: OWebApp);
    getRoutes(): OPageRouteFull<R>[];
    getPage(name: string): P;
    getActivePage(): P;
    getActivePageRoute(): OPageRouteFull<R>;
    getPageList(): Record<string, P>;
    registerPage(page: P): this;
    private _registerPageRoutes;
    private _addRoute;
    private _setActive;
    onLocationChange(handler: (route: OPageRouteFull<R>, page: P) => void): this;
}
