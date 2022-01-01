import OWebRoute, { ORouteAction, ORoutePath, ORoutePathOptions } from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';
export declare type ORouteTarget = {
    parsed: string;
    href: string;
    path: string;
    fullPath: string;
};
export declare type ORouteStateItem = string | number | boolean | null | undefined | Date | ORouteStateObject | ORouteStateItem[];
export declare type ORouteStateObject = {
    [key: string]: ORouteStateItem;
};
export interface ORouteDispatcher {
    readonly id: number;
    readonly context: OWebRouteContext;
    readonly found: OWebRoute[];
    isActive(): boolean;
    dispatch(): this;
    cancel(): this;
}
export default class OWebRouter {
    private readonly _baseUrl;
    private readonly _hashMode;
    private _currentTarget;
    private _routes;
    private _initialized;
    private _listening;
    private readonly _notFound;
    private readonly _popStateListener;
    private readonly _linkClickListener;
    private _dispatchId;
    private _notFoundLoopCount;
    private _currentDispatcher?;
    private _forceReplace;
    constructor(baseUrl: string, hashMode: boolean | undefined, notFound: (target: ORouteTarget) => void);
    start(firstRun?: boolean, target?: string, state?: ORouteStateObject): this;
    stopRouting(): this;
    forceNextReplace(): this;
    getCurrentTarget(): ORouteTarget;
    getCurrentDispatcher(): ORouteDispatcher | undefined;
    getRouteContext(): OWebRouteContext;
    parseURL(url: string | URL): ORouteTarget;
    pathToURL(path: string, base?: string): URL;
    on(path: ORoutePath, rules: ORoutePathOptions | undefined, action: ORouteAction): this;
    addRoute(route: OWebRoute): this;
    goBack(distance?: number): this;
    browseTo(url: string, state?: ORouteStateObject, push?: boolean, ignoreSameLocation?: boolean): this;
    addHistory(url: string, state: ORouteStateObject, title?: string): this;
    replaceHistory(url: string, state: ORouteStateObject, title?: string): this;
    private createDispatcher;
    private register;
    private unregister;
    private _onClick;
}
