import { OWebApp } from "./oweb";
export declare type tUrlList = {
    [key: string]: string;
};
export default class OWebUrl {
    private readonly _url_list;
    private readonly _url_local_base;
    private readonly _url_server_base;
    constructor(context: OWebApp, url_list: tUrlList);
    get(url_key: string): string;
    resolveLocal(url: string): string;
    resolveServer(url: string): string;
}
