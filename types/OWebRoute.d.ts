import OWebRouteContext from './OWebRouteContext';
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
    tokens: string[];
};
declare const tokenTypesRegMap: {
    num: string;
    alpha: string;
    'alpha-fullUrl': string;
    'alpha-l': string;
    'alpha-num': string;
    'alpha-num-l': string;
    'alpha-num-fullUrl': string;
    any: string;
};
export default class OWebRoute {
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
    constructor(path: string | RegExp, options: tRoutePathOptions | string[], action: tRouteAction);
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
export {};
