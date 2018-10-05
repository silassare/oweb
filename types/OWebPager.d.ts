import { VueConstructor } from "vue/types/vue";
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
    getName(): string;
    getRoutes(): tPageRoute[];
    install(pager: OWebPager): this;
    component(): VueConstructor | undefined;
    requireLogin(context: OWebRouteContext, route: tPageRouteFull): boolean;
    onOpen(context: OWebRouteContext, route: tPageRouteFull): void;
    onClose(oldRoute: tPageRouteFull, newRoute: tPageRouteFull): void;
}
export default class OWebPager extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PAGE_CHANGE: string;
    private readonly _pages;
    private _active_page;
    private _routes_cache;
    private _routes_flattened;
    private _active_route?;
    constructor(app_context: OWebApp);
    getRoutes(): tPageRoute[];
    getPage(name: string): iPage;
    getActivePage(): iPage;
    getActivePageRoute(): tPageRouteFull;
    getPageList(): any;
    registerPage(page: iPage): this;
    private _registerPageRoutes;
    private _addRoute;
    private _setActiveRoute;
    private _setActivePage;
}
