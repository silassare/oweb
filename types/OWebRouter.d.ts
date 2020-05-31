import OWebRoute, { tRoutePath, tRoutePathOptions, tRouteAction } from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';
export declare type tRouteTarget = {
    parsed: string;
    href: string;
    path: string;
    fullPath: string;
};
declare type _tRouteStateItem = string | number | boolean | null | undefined | Date | tRouteStateObject;
export declare type tRouteStateItem = _tRouteStateItem | _tRouteStateItem[];
export declare type tRouteStateObject = {
    [key: string]: tRouteStateItem;
};
export interface IRouteDispatcher {
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
    private _currentDispatcher?;
    private _forceReplace;
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     * @param notFound called when a route is not found
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
    getCurrentDispatcher(): IRouteDispatcher | undefined;
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
