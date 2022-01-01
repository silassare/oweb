import OWebApp from './OWebApp';
export default class OWebUrl<T extends {
    [key: string]: string;
} = any> {
    private readonly _urlList;
    private readonly _urlLocalBase;
    private readonly _urlServerBase;
    constructor(context: OWebApp, urlList: T);
    get(key: string): string;
    resolveLocal(url: string): string;
    resolveServer(url: string): string;
}
