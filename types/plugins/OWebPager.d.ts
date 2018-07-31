import OWebEvent from "../OWebEvent";
import { tRouteAction, tRouteOptions } from "../OWebRouter";
import OWebApp from "../OWebApp";
export interface iPage {
    name: string;
    getLinks: () => tPageLink[];
    onPageOpen?: tRouteAction;
    onPageClose?: tRouteAction;
}
export declare type tPageLink = {
    title: string;
    path: string;
    require_login?: boolean;
    description?: string;
    options?: tRouteOptions;
    show?: boolean;
    slug?: string;
    icon?: string;
    sub?: tPageLink[];
};
export declare type tPageLinkFull = tPageLink & {
    id: number;
    href: string;
    active: boolean;
    active_child: boolean;
    require_login: boolean;
    show: boolean;
    parent?: tPageLinkFull;
    sub?: tPageLinkFull[];
};
export default class OWebPager extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PAGE_CHANGE: string;
    private readonly _pages;
    private _active_page;
    private _links;
    private _links_flattened;
    private _active_link?;
    constructor(app_context: OWebApp);
    getLinks(): tPageLinkFull[];
    getPage(name: string): iPage;
    getActivePage(): iPage | undefined;
    getPageList(): any;
    registerPage(page: iPage): this;
    private _registerLinks;
    private _addRoute;
    private _setActiveLink;
    private _setActivePage;
}
