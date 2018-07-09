export declare type tRouteOptions = {
    [key: string]: string;
};
export declare type tRouteParams = {
    [key: string]: any;
};
export declare type tRouteInfo = {
    reg: RegExp | null;
    tokens: Array<string>;
};
export declare type tRouteAction = (ctx: RouteContext) => {};
export declare class Route {
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
export declare class RouteContext {
    private readonly tokens;
    private readonly params;
    private readonly url;
    private _stop;
    constructor(route: Route, url: URL, hashMode?: boolean);
    getToken(token: string): any;
    getParam(key: string): any;
    stop(): this;
    stopped(): boolean;
}
export default class OWebRouter {
    private readonly hashMode;
    static readonly SELF: string;
    private _currentPath;
    private _routes;
    private _initialized;
    constructor(hashMode?: boolean);
    start(): this;
    on(path: string | RegExp, rules: tRouteOptions, action: tRouteAction): this;
    protected dispatch(force: boolean, cancelable?: boolean): this;
}
