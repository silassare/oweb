import OWebConfigs from './OWebConfigs';
import OWebDataStore, { OJSONValue } from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebForm, { OWebFormOptions } from './OWebForm';
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
export interface OAppOptions<Store extends OStore = OStore, Page extends OPage<Route> = OPage<any>, User extends OUser = OUser, Route extends OPageRoute = OPageRoute, Context = OWebApp<Store, Page, User>> {
    name: string;
    appConfigs: Partial<OAppConfigs>;
    userConfigs: Partial<OUserConfigs>;
    urls: Partial<OUrlList>;
    user: (this: Context) => OWebUser<User>;
    store: (this: Context) => Store;
    pager: (this: Context) => OWebPager<Page>;
}
export default class OWebApp<Store extends OStore = OStore, Page extends OPage<Route> = OPage<any>, User extends OUser = OUser, Route extends OPageRoute = OPageRoute, Options extends OAppOptions<Store, Page, User> = any> extends OWebEvent {
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
    readonly configs: OWebConfigs<OAppConfigs, OUserConfigs>;
    readonly url: OWebUrl;
    readonly i18n: OWebI18n;
    readonly oz: OZone;
    private readonly _user;
    private readonly _store;
    private readonly _pager;
    protected constructor(options: Options);
    request<Response>(url: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    get user(): ReturnType<Options['user']>;
    get store(): ReturnType<Options['store']>;
    get pager(): ReturnType<Options['pager']>;
    getAppName(): string;
    isMobileApp(): boolean;
    form(form: OWebFormOptions | HTMLFormElement, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean): OWebForm;
    forceLogin(): void;
    reloadApp(): void;
    destroyApp(): void;
    closeApp(): void;
    start(): this;
    showHomePage(options?: ORouteStateObject): void;
    showLoginPage(options?: ORouteStateObject): void;
    showRegistrationPage(options?: ORouteStateObject): void;
    onReady(handler: (this: this) => void | boolean): this;
    onShowHomePage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    onShowLoginPage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    onShowRegistrationPage(handler: (this: this, options: ORouteStateObject) => void | boolean): this;
    onPageNotFound(handler: (this: this, target: ORouteTarget) => void | boolean): this;
    static create<Options extends OAppOptions<OStore, OPage, OUser> = any>(options: Options): OWebApp<any, any, any, any, Options>;
}
