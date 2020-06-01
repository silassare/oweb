import OWebConfigs, { tConfigList } from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter, { tRouteStateObject, tRouteTarget } from './OWebRouter';
import OWebUrl, { tUrlList } from './OWebUrl';
import OWebView from './OWebView';
import OWebI18n from './OWebI18n';
import OWebPager from './OWebPager';
import { INetRequestOptions } from './OWebNet';
import OWebXHR from './OWebXHR';
import { IOZoneApiJSON } from './ozone';
export default class OWebApp extends OWebEvent {
    private readonly name;
    static readonly SELF: string;
    static readonly EVT_APP_READY: string;
    static readonly EVT_NOT_FOUND: string;
    static readonly EVT_SHOW_HOME: string;
    static readonly EVT_SHOW_LOGIN: string;
    static readonly EVT_SHOW_REGISTRATION_PAGE: string;
    private readonly _requestDefaultOptions;
    readonly view: OWebView;
    readonly pager: OWebPager<any>;
    readonly ls: OWebDataStore;
    readonly router: OWebRouter;
    readonly user: OWebCurrentUser;
    readonly configs: OWebConfigs;
    readonly url: OWebUrl;
    readonly i18n: OWebI18n;
    /**
     * OWebApp constructor.
     *
     * @param name The app name.
     * @param configs The app config.
     * @param urls The app url list.
     */
    protected constructor(name: string, configs: tConfigList, urls: tUrlList);
    /**
     * Get request default options
     */
    getRequestDefaultOptions(): any;
    /**
     * Set session token
     */
    setSessionToken(token: string): this;
    /**
     * App name getter.
     */
    getAppName(): string;
    /**
     * Checks if we are running in mobile app.
     */
    isMobileApp(): boolean;
    /**
     * Returns new form validator instance.
     *
     * @param form The html form element.
     * @param required The required fields names list.
     * @param excluded The fields names to exclude.
     * @param checkAll Force the validator to check all fields.
     */
    getFormValidator(form: HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean): OWebFormValidator;
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
     * Create net instance.
     *
     * @param url The request url.
     * @param options The request options.
     */
    net<R extends IOZoneApiJSON<any>>(url: string, options: Partial<INetRequestOptions<R>>): OWebXHR<R>;
    /**
     * To start the web app.
     */
    start(): this;
    /**
     * Called when app should show the home page.
     */
    showHomePage(options?: tRouteStateObject): void;
    /**
     * Called when app should show the login page.
     */
    showLoginPage(options?: tRouteStateObject): void;
    /**
     * Called when app should show the registration page.
     */
    showRegistrationPage(options?: tRouteStateObject): void;
    /**
     * Register handler for OWebApp.EVT_APP_READY event
     *
     * @param handler
     */
    onReady(handler: (this: this) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_SHOW_HOME event
     *
     * @param handler
     */
    onShowHomePage(handler: (this: this, options: tRouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_SHOW_LOGIN event
     *
     * @param handler
     */
    onShowLoginPage(handler: (this: this, options: tRouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
     *
     * @param handler
     */
    onShowRegistrationPage(handler: (this: this, options: tRouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_NOT_FOUND event
     *
     * @param handler
     */
    onPageNotFound(handler: (this: this, target: tRouteTarget) => void | boolean): this;
}
