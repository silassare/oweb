import OWebConfigs from './OWebConfigs';
import OWebDataStore, { OJSONValue } from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebForm, { OWebFormDefinition } from './OWebForm';
import OWebRouter, { ORouteStateObject, ORouteTarget } from './OWebRouter';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebI18n from './OWebI18n';
import OZone from './ozone';
import OWebPager, { OPage, OPageRoute } from './OWebPager';
import OWebUser from './OWebUser';
import { ONetRequestOptions } from './OWebNet';
import OWebXHR from './OWebXHR';
export interface OUrlList {
    [key: string]: string;
    OZ_SERVER_GET_FILE_URI: string;
    OZ_SERVER_TNET_SERVICE: string;
    OZ_SERVER_LOGIN_SERVICE: string;
    OZ_SERVER_LOGOUT_SERVICE: string;
    OZ_SERVER_SIGNUP_SERVICE: string;
    OZ_SERVER_ACCOUNT_RECOVERY_SERVICE: string;
    OZ_SERVER_PASSWORD_SERVICE: string;
    OZ_SERVER_CAPTCHA_SERVICE: string;
    OZ_SERVER_UPLOAD_SERVICE: string;
    OW_APP_PATH_SIGN_UP: string;
    OW_APP_PATH_LOGOUT: string;
    OW_APP_PATH_LOGIN: string;
    OW_APP_PATH_HOME: string;
}
export interface OAppConfigs {
    [key: string]: OJSONValue;
    OW_APP_NAME: string;
    OW_APP_VERSION: string;
    OW_APP_LOCAL_BASE_URL: string;
    OW_APP_ROUTER_HASH_MODE: boolean;
    OW_APP_ALLOWED_COUNTRIES: string[];
    OZ_API_KEY: string;
    OZ_API_KEY_HEADER_NAME: string;
    OZ_API_ALLOW_REAL_METHOD_HEADER: boolean;
    OZ_API_REAL_METHOD_HEADER_NAME: string;
    OZ_API_BASE_URL: string;
    OZ_CODE_REG: string;
    OZ_USER_NAME_MIN_LENGTH: number;
    OZ_USER_NAME_MAX_LENGTH: number;
    OZ_PASS_MIN_LENGTH: number;
    OZ_PASS_MAX_LENGTH: number;
    OZ_USER_MIN_AGE: number;
    OZ_USER_MAX_AGE: number;
    OZ_PPIC_MIN_SIZE: number;
    OZ_USER_ALLOWED_GENDERS: string[];
}
export interface OUserConfigs {
    [key: string]: OJSONValue;
    OW_APP_DEFAULT_LANG: string;
    OW_APP_COUNTRY: string;
}
export interface OStore {
    [key: string]: any;
}
export declare type OUser = {
    [key: string]: any;
};
export interface OAppOptions<Store extends OStore = OStore, Page extends OPage<OPageRoute> = OPage<OPageRoute>, User extends OUser = OUser, AppConfigs extends Partial<OAppConfigs> = Partial<OAppConfigs>, UserConfigs extends Partial<OUserConfigs> = Partial<OUserConfigs>, UrlList extends Partial<OUrlList> = Partial<OUrlList>, Context = OWebApp<Store, Page, User>> {
    name: string;
    appConfigs: AppConfigs;
    userConfigs: UserConfigs;
    urls: UrlList;
    user: (this: Context) => OWebUser<User>;
    store: (this: Context) => Store;
    pager: (this: Context) => OWebPager<Page>;
}
export default class OWebApp<Store extends OStore = OStore, Page extends OPage = OPage, User extends OUser = OUser, Options extends OAppOptions<Store, Page, User> = any> extends OWebEvent {
    private readonly options;
    static readonly SELF: string;
    static readonly EVT_APP_READY: string;
    static readonly EVT_NOT_FOUND: string;
    static readonly EVT_SHOW_HOME: string;
    static readonly EVT_SHOW_LOGIN: string;
    static readonly EVT_SHOW_REGISTRATION_PAGE: string;
    readonly view: OWebView;
    readonly ls: OWebDataStore;
    readonly router: OWebRouter;
    readonly configs: OWebConfigs<OAppConfigs & Options['appConfigs'], OUserConfigs & Options['userConfigs']>;
    readonly url: OWebUrl;
    readonly i18n: OWebI18n;
    readonly oz: OZone;
    private readonly _user;
    private readonly _store;
    private readonly _pager;
    /**
     * OWebApp constructor.
     *
     * @param options
     */
    protected constructor(options: Options);
    /**
     * Build an HTTP request.
     *
     * @param url
     * @param options
     */
    request<Response>(url: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    /**
     * User getter.
     */
    get user(): ReturnType<Options['user']>;
    /**
     * Store getter.
     */
    get store(): ReturnType<Options['store']>;
    /**
     * Pager instance getter.
     */
    get pager(): ReturnType<Options['pager']>;
    /**
     * App name getter.
     */
    getAppName(): string;
    /**
     * Checks if we are running in mobile app.
     */
    isMobileApp(): boolean;
    /**
     * Returns new oweb form instance.
     *
     * @param form The html form element.
     * @param required The required fields names list.
     * @param excluded The fields names to exclude.
     * @param checkAll Force the validator to check all fields.
     * @param verbose Log warning.
     *
     * @deprecated use {@link OWebApp.form}
     */
    getFormValidator(form: OWebFormDefinition | HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean): OWebForm;
    /**
     * Returns new oweb form instance.
     *
     * @param form The html form element.
     * @param required The required fields names list.
     * @param excluded The fields names to exclude.
     * @param checkAll Force the validator to check all fields.
     * @param verbose Log warning.
     */
    form(form: OWebFormDefinition | HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean): OWebForm;
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
     * To start the web app.
     */
    start(): this;
    /**
     * Called when app should show the home page.
     */
    showHomePage(options?: ORouteStateObject): void;
    /**
     * Called when app should show the login page.
     */
    showLoginPage(options?: ORouteStateObject): void;
    /**
     * Called when app should show the registration page.
     */
    showRegistrationPage(options?: ORouteStateObject): void;
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
    onShowHomePage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_SHOW_LOGIN event
     *
     * @param handler
     */
    onShowLoginPage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
     *
     * @param handler
     */
    onShowRegistrationPage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    /**
     * Register handler for OWebApp.EVT_NOT_FOUND event
     *
     * @param handler
     */
    onPageNotFound(handler: (this: this, target: ORouteTarget) => void | boolean): this;
    /**
     * Creates new app instance.
     *
     * @param options
     */
    static create<Options extends OAppOptions<OStore, OPage, OUser> = any>(options: Options): OWebApp<any, any, any, Options>;
}
//# sourceMappingURL=OWebApp.d.ts.map