export declare type tRoutePath = string | RegExp;
export declare type tRoutePathOptions = {
    [key: string]: RegExp | keyof typeof tokenTypesRegMap;
};
export declare type tRouteTokensMap = {
    [key: string]: string;
};
export declare type tRouteAction = (ctx: OWebRouteContext) => void;
export declare type tRouteInfo = {
    reg: RegExp | null;
    tokens: Array<string>;
};
declare type _tRouteStateItem = string | number | boolean | null | undefined | Date | tRouteStateObject;
export declare type tRouteStateItem = _tRouteStateItem | Array<_tRouteStateItem>;
export declare type tRouteStateObject = {
    [key: string]: tRouteStateItem;
};
export declare type tRouteTarget = {
    parsed: string;
    href: string;
    path: string;
    fullPath: string;
};
export interface iRouteDispatcher {
    readonly id: number;
    readonly context: OWebRouteContext;
    readonly found: OWebRoute[];
    isActive(): boolean;
    dispatch(): this;
    cancel(): this;
}
declare const tokenTypesRegMap: {
    "num": string;
    "alpha": string;
    "alpha-u": string;
    "alpha-l": string;
    "alpha-num": string;
    "alpha-num-l": string;
    "alpha-num-u": string;
    "any": string;
};
export declare class OWebRoute {
    private readonly path;
    private readonly reg;
    private tokens;
    private readonly action;
    /**
     *
     * @param path The route path string or regexp.
     * @param options The route options.
     * @param action The route action function.
     */
    constructor(path: string | RegExp, options: tRoutePathOptions | Array<string>, action: tRouteAction);
    /**
     * Returns true if this route is dynamic false otherwise.
     */
    isDynamic(): boolean;
    /**
     * Gets route action.
     */
    getAction(): tRouteAction;
    /**
     * Checks if a given pathname match this route.
     *
     * @param pathname
     */
    is(pathname: string): boolean;
    /**
     * Parse a given pathname.
     *
     * @param pathname
     */
    parse(pathname: string): tRouteTokensMap;
    /**
     * Parse dynamic path and returns appropriate regexp and tokens list.
     *
     * ```js
     * let format = "path/to/:id/file/:index/name.:format";
     * let options = {
     * 		id: "num",
     * 		index: "alpha",
     * 		format:	"alpha-num"
     * };
     * let info = parseDynamicPath(format,options);
     *
     * info === {
     *     reg: RegExp,
     *     tokens: ["id","index","format"]
     * };
     * ```
     * @param path The path format string.
     * @param options The path options.
     */
    static parseDynamicPath(path: string, options: tRoutePathOptions): tRouteInfo;
}
export declare class OWebRouteContext {
    private _tokens;
    private _stopped;
    private readonly _target;
    private readonly _state;
    private readonly _router;
    constructor(router: OWebRouter, target: tRouteTarget, state: tRouteStateObject);
    getToken(token: string): any;
    getTokens(): any;
    getPath(): string;
    getStateItem(key: string): tRouteStateItem;
    getSearchParam(param: string): string | null;
    setStateItem(key: string, value: tRouteStateItem): this;
    stopped(): boolean;
    stop(): this;
    save(): this;
    actionRunner(route: OWebRoute): this;
}
export default class OWebRouter {
    private readonly _baseUrl;
    private readonly _hashMode;
    private _current_target;
    private _routes;
    private _initialized;
    private _listening;
    private _notFound;
    private readonly _popStateListener;
    private readonly _linkClickListener;
    private _dispatch_id;
    private _current_dispatcher?;
    private _force_replace;
    constructor(baseUrl: string, hashMode?: boolean);
    start(firstRun?: boolean, target?: string, state?: tRouteStateObject): this;
    stopRouting(): this;
    forceNextReplace(): this;
    getCurrentTarget(): tRouteTarget;
    getCurrentDispatcher(): iRouteDispatcher | undefined;
    getRouteContext(): OWebRouteContext;
    parseURL(url: string | URL): tRouteTarget;
    pathToURL(path: string, base?: string): URL;
    on(path: tRoutePath, rules: tRoutePathOptions | undefined, action: tRouteAction): this;
    notFound(callback: (target: tRouteTarget) => void): this;
    goBack(distance?: number): this;
    browseTo(url: string, state?: tRouteStateObject, push?: boolean, ignoreSameLocation?: boolean): this;
    addHistory(url: string, state: tRouteStateObject, title?: string): this;
    replaceHistory(url: string, state: tRouteStateObject, title?: string): this;
    private createDispatcher;
    private register;
    private unregister;
    private _onClick;
}
export {};
