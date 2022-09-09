import OWebApp from './OWebApp';
export default class OWebUrl<T extends {
    [key: string]: string;
} = any> {
    private readonly _urlList;
    private readonly _urlLocalBase;
    private readonly _urlServerBase;
    constructor(context: OWebApp, urlList: T);
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
//# sourceMappingURL=OWebUrl.d.ts.map