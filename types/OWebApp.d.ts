import OWebCom, { iComResponse } from "./OWebCom";
import OWebConfigs, { tConfigList } from "./OWebConfigs";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebDataStore from "./OWebDataStore";
import OWebEvent from "./OWebEvent";
import OWebFormValidator from "./OWebFormValidator";
import OWebRouter from "./OWebRouter";
import OWebService from "./OWebService";
import OWebUrl, { tUrlList } from "./OWebUrl";
import OWebView from "./OWebView";
import OWebLang from "./OWebLang";
export default abstract class OWebApp extends OWebEvent {
    private readonly app_name;
    static readonly SELF: string;
    static readonly EVT_APP_READY: string;
    readonly view: OWebView;
    readonly ls: OWebDataStore;
    readonly router: OWebRouter;
    readonly user: OWebCurrentUser;
    readonly configs: OWebConfigs;
    readonly url: OWebUrl;
    readonly services: {
        [key: string]: OWebService<any>;
    };
    readonly i18n: OWebLang;
    /**
     * OWebApp constructor.
     *
     * @param app_name The app name.
     * @param app_config_list The app config.
     * @param app_url_list The app url list.
     */
    protected constructor(app_name: string, app_config_list: tConfigList, app_url_list: tUrlList);
    /**
     * App name getter.
     */
    getAppName(): string;
    /**
     * Check if we are running in mobile app.
     */
    isMobileApp(): boolean;
    /**
     * To start the web app.
     */
    start(): this;
    /**
     * Returns registered service with a given name.
     *
     * @param service_name The service name.
     */
    getService<T = any>(service_name: string): OWebService<T> | undefined;
    /**
     * Register a new service.
     *
     * @param service The service object.
     */
    registerService<T extends OWebService<any>>(service: T): this;
    /**
     * Returns new form validator instance.
     *
     * @param form The html form element.
     * @param required The required fields names list.
     * @param excluded The fields names to exclude.
     * @param checkAll Force the validator to check all fields.
     */
    getFormValidator(form: HTMLFormElement, required?: Array<string>, excluded?: Array<string>, checkAll?: boolean): OWebFormValidator;
    /**
     * Force login.
     *
     * > This will clear all saved data in the local storage.
     */
    forceLogin(): void;
    /**
     * Reload the app.
     */
    reloadApp(): void;
    /**
     * Destroy the app.
     *
     * > This will clear all saved data in the local storage.
     */
    destroyApp(): void;
    /**
     * Close app.
     */
    closeApp(): void;
    /**
     * Check if user session is active.
     */
    sessionActive(): boolean;
    /**
     * Check if the current user has been authenticated.
     */
    userVerified(): boolean;
    /**
     * Sends request and return promise.
     *
     * @param method The request method.
     * @param url The request url.
     * @param data The request payload.
     * @param freeze Force app view to be frozen.
     */
    requestPromise(method: string, url: string, data: any, freeze?: boolean): Promise<iComResponse>;
    /**
     * Send request.
     *
     * @param method The request method.
     * @param url The request url.
     * @param data The request payload.
     * @param success Request success callback.
     * @param fail Request fail callback.
     * @param freeze Force app view to be frozen.
     */
    request(method: string, url: string, data: any, success?: (response: iComResponse) => void, fail?: (response: iComResponse) => void, freeze?: boolean): OWebCom;
    /**
     * Called when app should show the home page.
     */
    abstract showHomePage(): this;
    /**
     * Called when app should show the login page.
     */
    abstract showLoginPage(): this;
    /**
     * Called when app should show the signup page.
     */
    abstract showSignUpPage(): this;
}
