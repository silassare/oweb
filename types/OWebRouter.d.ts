export declare type tRouteOptions = {
    [key: string]: keyof typeof token_type_reg_map;
};
export declare type tRouteParams = {
    [key: string]: any;
};
export declare type tRouteAction = (ctx: OWebRouteContext) => void;
declare const token_type_reg_map: {
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
    constructor(path: string | RegExp, rules: tRouteOptions, action: tRouteAction);
    isDynamic(): boolean;
    getPath(): string;
    getAction(): tRouteAction;
    is(path: string): boolean;
    parse(path: string): tRouteParams;
}
export declare type tRouteStateItem = string | number | null | undefined | Date | tRouteStateObject;
export declare type tRouteStateObject = {
    [key: string]: tRouteStateItem;
};
export declare class OWebRouteContext {
    private _tokens;
    private readonly _params;
    private readonly _url;
    private readonly _path;
    private _stopped;
    private _saved;
    private readonly _state;
    constructor(path: string, url: URL);
    getToken(key: string): any;
    getTokens(): any;
    getParam(key: string): any;
    getParams(): any;
    getPath(): string;
    stop(): this;
    stopped(): boolean;
    saved(): boolean;
    setTitle(title: string): this;
    pushState(): this;
    replaceState(): this;
    runAction(route: OWebRoute): this;
}
export default class OWebRouter {
    private readonly _baseUrl;
    private readonly _hashMode;
    private _currentPath;
    private _routes;
    private _initialized;
    private _listening;
    private _historyCount;
    private _notFound;
    private readonly _popStateListener;
    constructor(baseUrl: string, hashMode?: boolean);
    start(runBrowse?: boolean, path?: string): this;
    stopRouting(): this;
    private register;
    private unregister;
    private onPopState;
    on(path: string | RegExp, rules: tRouteOptions | undefined, action: tRouteAction): this;
    notFound(callback: (path: string) => void): this;
    goBack(distance?: number): this;
    browseTo(path: string, state?: any, replace?: boolean): this;
    private dispatch;
}
export {};
