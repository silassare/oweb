import { Vue, VueConstructor } from "vue/types/vue";
import { OWebEvent, OWebApp, OWebRouteContext, tRoute, tRouteOptions } from "../oweb";
export interface iPage {
    getName(): string;
    getLinks(): tPageLink[];
    component(): Vue | VueConstructor | undefined;
}
export declare type tPageLink = {
    readonly title: string;
    readonly description?: string;
    readonly path: tRoute;
    readonly pathOptions?: tRouteOptions;
    readonly slug?: string;
    readonly icon?: string;
    show?(): boolean;
    sub?(): tPageLink[];
    requireLogin?(): boolean;
    onOpen?(ctx: OWebRouteContext): void;
    onClose?(): void;
};
export declare type tPageLinkFull = tPageLink & {
    id: number;
    href: string;
    active: boolean;
    active_child: boolean;
    parent?: tPageLinkFull;
    show(): boolean;
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
