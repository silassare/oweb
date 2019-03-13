import OWebApp from "./OWebApp";
export declare type tUrlList = {
    [key: string]: string;
};
export default class OWebUrl {
    private readonly _url_list;
    private readonly _url_local_base;
    private readonly _url_server_base;
    constructor(context: OWebApp, url_list: tUrlList);
    /**
     * Gets url value with a given url key name.
     *
     * @param key The url key name.
     */
    get(key: string): string;
    /**
     * Resolve url with local base.
     *
     * @param url
     */
    resolveLocal(url: string): string;
    /**
     * Resolve url with server base.
     *
     * @param url
     */
    resolveServer(url: string): string;
}
