export declare type tRoute = string | RegExp;
export declare type tRouteOptions = {
    [key: string]: RegExp | keyof typeof token_type_reg_map;
};
export declare type tRouteParams = {
    [key: string]: any;
};
export declare type tRouteAction = (ctx: OWebRouteContext) => void;
export declare type tRouteInfo = {
    reg: RegExp | null;
    tokens: Array<string>;
};
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
    constructor(path: string | RegExp, rules: tRouteOptions | Array<string>, action: tRouteAction);
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
    private _stopped;
    private readonly _path;
    private readonly _state;
    private readonly _router;
    constructor(router: OWebRouter, path: string, state: tRouteStateObject);
    getToken(token: string): any;
    getTokens(): any;
    getPath(): string;
    getStateItem(key: string): tRouteStateItem;
    setStateItem(key: string, value: tRouteStateItem): this;
    stopped(): boolean;
    stop(): this;
    save(): this;
    actionRunner(route: OWebRoute): this;
}
export default class OWebRouter {
    private readonly _baseUrl;
    private readonly _hashMode;
    private _current_path;
    private _routes;
    private _initialized;
    private _listening;
    private _notFound;
    private readonly _popStateListener;
    private _dispatch_id;
    private _current_dispatcher?;
    constructor(baseUrl: string, hashMode?: boolean);
    start(firstRun?: boolean, path?: string): this;
    stopRouting(): this;
    getCurrentPath(): string;
    getLocationPath(): string;
    pathToURL(path: string): URL;
    private register;
    private unregister;
    private onPopState;
    on(path: tRoute, rules: tRouteOptions | undefined, action: tRouteAction): this;
    notFound(callback: (path: string) => void): this;
    goBack(distance?: number): this;
    browseTo(path: string, state?: tRouteStateObject, push?: boolean, ignoreIfSamePath?: boolean): this;
    addHistory(path: string, data: tRouteStateObject, title?: string): this;
    replaceHistory(path: string, data: tRouteStateObject, title?: string): this;
    private createDispatcher;
}
export {};
