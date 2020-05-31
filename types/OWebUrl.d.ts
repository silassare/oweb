import OWebApp from './OWebApp';
export declare type tUrlList = {
    [key: string]: string;
};
export default class OWebUrl {
    private readonly _urlList;
    private readonly _urlLocalBase;
    private readonly _urlServerBase;
    constructor(context: OWebApp, urlList: tUrlList);
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
