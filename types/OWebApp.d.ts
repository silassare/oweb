import OWebCom, { iComResponse } from "./OWebCom";
import OWebConfigs, { tConfigList } from "./OWebConfigs";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebDataStore from "./OWebDataStore";
import OWebEvent from "./OWebEvent";
import OWebFormValidator from "./OWebFormValidator";
import OWebRouter, { tRouteTarget } from "./OWebRouter";
import OWebService from "./OWebService";
import OWebUrl, { tUrlList } from "./OWebUrl";
import OWebView, { tViewDialog } from "./OWebView";
import OWebI18n from "./OWebI18n";
import OWebPager, { iPage } from "./OWebPager";
export interface iAppState {
    ready: boolean;
    splash: boolean;
    frozen: boolean;
    show_nav: boolean;
    current_page?: iPage;
    dialogs: tViewDialog[];
}
export interface iAppStateOptions {
    ready?: boolean;
    splash?: boolean;
    frozen?: boolean;
    show_nav?: boolean;
    current_page?: iPage;
    dialogs?: tViewDialog[];
}
export default abstract class OWebApp extends OWebEvent {
    private readonly name;
    static readonly SELF: string;
    static readonly EVT_APP_READY: string;
    readonly state: iAppState;
    readonly view: OWebView;
    readonly pager: OWebPager;
    readonly ls: OWebDataStore;
    readonly router: OWebRouter;
    readonly user: OWebCurrentUser;
    readonly configs: OWebConfigs;
    readonly url: OWebUrl;
    readonly services: {
        [key: string]: OWebService<any>;
    };
    readonly i18n: OWebI18n;
    /**
     * OWebApp constructor.
     *
     * @param name The app name.
     * @param configs The app config.
     * @param urls The app url list.
     * @param state The app state.
     */
    protected constructor(name: string, configs: tConfigList, urls: tUrlList, state?: iAppStateOptions);
    /**
     * App name getter.
     */
    getAppName(): string;
    /**
     * Checks if we are running in mobile app.
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
     * Checks if user session is active.
     */
    sessionActive(): boolean;
    /**
     * Checks if the current user has been authenticated.
     */
    userVerified(): boolean;
    /**
     * Send request and return promise.
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
    request(method: string, url: string, data: any, success?: (this: OWebCom, response: iComResponse) => void, fail?: (this: OWebCom, response: iComResponse) => void, freeze?: boolean): OWebCom;
    /**
     * Register handler for OWebApp.EVT_APP_READY event
     *
     * @param handler
     */
    onReady(handler: (this: this) => void | boolean): this;
    /**
     * Called when app should show the home page.
     */
    abstract showHomePage(): this;
    /**
     * Called when the requested route was not found.
     */
    abstract showNotFound(target: tRouteTarget): this;
    /**
     * Called when app should show the login page.
     */
    abstract showLoginPage(): this;
    /**
     * Called when app should show the signup page.
     */
    abstract showSignUpPage(): this;
}
