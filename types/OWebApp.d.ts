import { OWebConfigs, OWebEvent, OWebCurrentUser, OWebView, OWebCom, OWebFormValidator, OWebService, tConfigList, OWebUrl, OWebRouter, tUrlList, iComResponse } from "./oweb";
export default abstract class OWebApp extends OWebEvent {
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
    protected constructor(app_name: string, app_config_list: tConfigList, app_url_list: tUrlList);
    getAppName(): string;
    start(): void;
    getService<T = any>(service_name: string): OWebService<T> | undefined;
    registerService<T extends OWebService<any>>(service: T): this;
    getFormValidator(form: HTMLFormElement, required?: Array<string>, excluded?: Array<string>): OWebFormValidator;
    forceLogin(): void;
    reloadApp(): void;
    destroyApp(): void;
    sessionActive(): boolean;
    userVerified(): boolean;
    requestPromise(method: string, url: string, data: any, freeze?: boolean): Promise<iComResponse>;
    request(method: string, url: string, data: any, success?: (response: iComResponse) => void, fail?: (response: iComResponse) => void, freeze?: boolean): OWebCom;
    abstract showHomePage(): this;
    abstract showLoginPage(): this;
    abstract showSignUpPage(): this;
}
