import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebCom from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs, { tConfigList } from "./OWebConfigs";
import { iPage, default as OWebPage } from "./OWebPage";
import OWebUrl, { tUrlList } from "./OWebUrl";
export default class OWebApp extends OWebEvent {
    private readonly app_name;
    static readonly EVT_APP_READY: string;
    static readonly SELF: string;
    private readonly pages;
    readonly view: OWebView;
    readonly user: OWebCurrentUser;
    readonly configs: OWebConfigs;
    readonly url: OWebUrl;
    readonly services: {
        [key: string]: OWebService;
    };
    constructor(app_name: string, app_config: tConfigList, app_url: tUrlList);
    getAppName(): string;
    start(): void;
    getService(service_name: string): OWebService;
    registerService(service_name: string, item_id_name: string): this;
    registerPage(page: OWebPage): this;
    getPage(name: string): iPage;
    getFormValidator(form: HTMLFormElement, required?: Array<string>, excluded?: Array<string>): OWebFormValidator;
    forceLogin(): void;
    reloadApp(): void;
    destroyApp(): void;
    sessionActive(): boolean;
    userVerified(): boolean;
    request(method: string, url: string, data: any, success?: Function, fail?: Function, freeze?: boolean): OWebCom;
}
