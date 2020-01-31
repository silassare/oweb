import OWebService from './OWebService';
import { GoblEntity } from 'gobl-utils-ts';
import { OWebApp, tConfigList, tUrlList } from './oweb';
export interface iAppStore {
    [key: string]: any;
    services: {
        [name: string]: OWebService<GoblEntity>;
    };
}
export declare class App<S extends iAppStore> extends OWebApp {
    readonly store: S;
    constructor(name: string, configs: tConfigList, urls: tUrlList, storeFn: (app: App<S>) => S);
    /**
     * Store services shortcut
     */
    readonly services: {
        [name: string]: OWebService<GoblEntity>;
    };
}
declare const createApp: <S extends iAppStore>(name: string, configs: tConfigList, urls: tUrlList, storeFn: (app: App<S>) => S) => App<S>;
export default createApp;
