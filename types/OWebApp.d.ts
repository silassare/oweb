import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebCom, { tComResponse } from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs, { tConfigList } from "./OWebConfigs";
import OWebUrl, { tUrlList } from "./OWebUrl";
import OWebRouter from "./OWebRouter";
export default class OWebApp extends OWebEvent {
    private readonly app_name;
    static readonly EVT_APP_READY: string;
    static readonly SELF: string;
    readonly view: OWebView;
    readonly router: OWebRouter;
    readonly user: OWebCurrentUser;
    readonly configs: OWebConfigs;
    readonly url: OWebUrl;
    readonly services: {
        [key: string]: OWebService<any>;
    };
    constructor(app_name: string, app_config_list: tConfigList, app_url_list: tUrlList);
    getAppName(): string;
    start(): void;
    getService<T>(service_name: string): OWebService<T>;
    registerService(service_name: string, item_id_name: string): this;
    getFormValidator(form: HTMLFormElement, required?: Array<string>, excluded?: Array<string>): OWebFormValidator;
    forceLogin(): void;
    reloadApp(): void;
    destroyApp(): void;
    sessionActive(): boolean;
    userVerified(): boolean;
    requestPromise(method: string, url: string, data: any, freeze?: boolean): Promise<tComResponse>;
    request(method: string, url: string, data: any, success?: (response: tComResponse) => void, fail?: (response: tComResponse) => void, freeze?: boolean): OWebCom;
}
