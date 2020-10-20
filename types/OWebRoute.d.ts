import OWebRouteContext from './OWebRouteContext';
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
export declare type ORoutePath = string | RegExp;
export declare type ORoutePathOptions = {
    [key: string]: RegExp | keyof typeof tokenTypesRegMap;
};
export declare type ORouteTokensMap = {
    [key: string]: string;
};
export declare type ORouteAction = (ctx: OWebRouteContext) => void;
export declare type ORouteInfo = {
    reg: RegExp | null;
    tokens: string[];
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
    constructor(path: string | RegExp, options: ORoutePathOptions | string[], action: ORouteAction);
    /**
     * Returns true if this route is dynamic false otherwise.
     */
    isDynamic(): boolean;
    /**
     * Gets route action.
     */
    getAction(): ORouteAction;
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
    parse(pathname: string): ORouteTokensMap;
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
    static parseDynamicPath(path: string, options: ORoutePathOptions): ORouteInfo;
}
export {};
