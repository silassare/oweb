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
    num: string;
    alpha: string;
    'alpha-u': string;
    'alpha-l': string;
    'alpha-num': string;
    'alpha-num-l': string;
    'alpha-num-u': string;
    any: string;
};
export declare class OWebRoute {
    private readonly path;
    private readonly reg;
    private tokens;
    private readonly action;
    /**
     * OWebRoute Constructor.
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
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router: OWebRouter, target: tRouteTarget, state: tRouteStateObject);
    /**
     * Gets route token value
     *
     * @param token The token.
     */
    getToken(token: string): any;
    /**
     * Gets a map of all tokens and values.
     */
    getTokens(): any;
    /**
     * Gets the path.
     */
    getPath(): string;
    /**
     * Gets stored value in history state with a given key.
     *
     * @param key the state key
     */
    getStateItem(key: string): tRouteStateItem;
    /**
     * Sets a key in history state.
     *
     * @param key the state key
     * @param value  the state value
     */
    setStateItem(key: string, value: tRouteStateItem): this;
    /**
     * Gets search param.
     *
     * @param param the param name
     */
    getSearchParam(param: string): string | null;
    /**
     * Check if the route dispatcher is stopped.
     */
    stopped(): boolean;
    /**
     * Stop the route dispatcher.
     */
    stop(): this;
    /**
     * Save history state.
     */
    save(): this;
    /**
     * Runs action attached to a given route.
     *
     * @param route
     */
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
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     */
    constructor(baseUrl: string, hashMode: boolean | undefined, notFound: (target: tRouteTarget) => void);
    /**
     * Starts the router.
     *
     * @param firstRun first run flag
     * @param target initial target, usualy the entry point
     * @param state initial state
     */
    start(firstRun?: boolean, target?: string, state?: tRouteStateObject): this;
    /**
     * Stops the router.
     */
    stopRouting(): this;
    /**
     * When called the current history will be replaced by the next history state.
     */
    forceNextReplace(): this;
    /**
     * Returns the current route target.
     */
    getCurrentTarget(): tRouteTarget;
    /**
     * Returns the current route event dispatcher.
     */
    getCurrentDispatcher(): iRouteDispatcher | undefined;
    /**
     * Returns the current route context.
     */
    getRouteContext(): OWebRouteContext;
    /**
     * Parse a given url.
     *
     * @param url the url to parse
     */
    parseURL(url: string | URL): tRouteTarget;
    /**
     * Builds url with a given path and base url.
     *
     * @param path the path
     * @param base the base url
     */
    pathToURL(path: string, base?: string): URL;
    /**
     * Attach a route action.
     *
     * @param path the path to watch
     * @param rules the path rules
     * @param action the action to run
     */
    on(path: tRoutePath, rules: tRoutePathOptions | undefined, action: tRouteAction): this;
    /**
     * Go back.
     *
     * @param distance the distance in history
     */
    goBack(distance?: number): this;
    /**
     * Browse to a specific location
     *
     * @param url the next url
     * @param state the initial state
     * @param push should we push into the history state
     * @param ignoreSameLocation  ignore browsing again to same location
     */
    browseTo(url: string, state?: tRouteStateObject, push?: boolean, ignoreSameLocation?: boolean): this;
    /**
     * Adds history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    addHistory(url: string, state: tRouteStateObject, title?: string): this;
    /**
     * Replace the current history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    replaceHistory(url: string, state: tRouteStateObject, title?: string): this;
    /**
     * Create route event dispatcher
     *
     * @param target the route target
     * @param state the history state
     * @param id the dispatcher id
     */
    private createDispatcher;
    /**
     * Register DOM events handler.
     */
    private register;
    /**
     * Unregister all DOM events handler.
     */
    private unregister;
    /**
     * Handle click event
     *
     * onclick from page.js library: github.com/visionmedia/page.js
     *
     * @param e the envent object
     */
    private _onClick;
}
export {};
