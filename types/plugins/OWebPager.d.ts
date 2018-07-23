import OWebEvent from "../OWebEvent";
import { tRouteAction, tRouteOptions } from "../OWebRouter";
import OWebApp from "../OWebApp";
export declare type tPageLink = {
    title: string;
    path: string;
    description?: string;
    action?: tRouteAction;
    options?: tRouteOptions;
    show?: boolean;
    slug?: string;
    icon?: string;
    sub?: tPageLink[];
};
export declare type tPageLinkFull = tPageLink & {
    id: number;
    active: boolean;
    active_child: boolean;
    show: boolean;
    parent?: tPageLinkFull;
    sub?: tPageLinkFull[];
};
export declare type tPage = {
    name: string;
    links: tPageLink[];
};
export default class OWebPager extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PAGE_CHANGE: string;
    private readonly pages;
    private active_page;
    private links;
    private links_flattened;
    constructor(app_context: OWebApp);
    getLinks(): tPageLinkFull[];
    getPage(name: string): tPage;
    getActivePage(): tPage | undefined;
    getPageList(): any;
    registerPage(page: tPage): this;
    private _registerLinks;
    private _addRoute;
    private _setActiveLink;
    private _setActivePage;
}
