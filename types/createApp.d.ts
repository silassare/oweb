import OWebService from './OWebService';
import { GoblEntity } from 'gobl-utils-ts';
import OWebApp from './OWebApp';
import { tConfigList } from './OWebConfigs';
import { tUrlList } from './OWebUrl';
export interface IAppStore {
    [key: string]: any;
    services: {
        [name: string]: OWebService<GoblEntity>;
    };
}
export declare class App<S extends IAppStore> extends OWebApp {
    readonly store: S;
    constructor(name: string, configs: tConfigList, urls: tUrlList, storeBundler: (app: App<S>) => S);
    /**
     * Store services shortcut
     */
    get services(): S['services'];
}
export declare const createApp: <S extends IAppStore>(name: string, configs: tConfigList, urls: tUrlList, storeBundler: (app: App<S>) => S) => App<S>;
