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
export declare type ORouteTokens = Record<string, string>;
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
    constructor(path: string | RegExp, options: ORoutePathOptions | string[], action: ORouteAction);
    isDynamic(): boolean;
    getAction(): ORouteAction;
    is(pathname: string): boolean;
    parse(pathname: string): ORouteTokens;
    static parseDynamicPath(path: string, options: ORoutePathOptions): ORouteInfo;
}
export {};
