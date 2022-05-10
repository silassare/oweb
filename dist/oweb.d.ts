import { GoblSinglePKEntity } from 'gobl-utils-ts';

export declare const assign: {
    <T, U>(target: T, source: U): T & U;
    <T_1, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
    <T_2, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
    (target: object, ...sources: any[]): any;
};

export declare function between(x: number, a: number, b: number, eq?: boolean): boolean;

/**
 * Build query string from object. Recursively!
 * @param params
 * @param prefix
 */
export declare function buildQueryString(params: Record<string, unknown> | URLSearchParams, prefix?: string): string;

/**
 * Build a URL with a given params
 *
 * @param url
 * @param params
 */
export declare function buildURL(url: string, params: Record<string, unknown> | URLSearchParams): string;

export declare function callback(fn: unknown, args?: any[], ctx?: unknown): any;

export declare function cleanRequestOptions(options: OApiServiceRequestOptions): OApiServiceRequestOptions;

export declare function clone<T>(a: T): T;

declare type Console_2 = typeof console;

export declare const defaultValidators: {
    code: (value: unknown, _name: string, fv: OWebForm) => void;
    uname: (value: unknown, name: string, fv: OWebForm) => void;
    login_pass: (value: unknown, _name: string, fv: OWebForm) => void;
    pass: (value: unknown, _name: string, fv: OWebForm) => void;
    pass_verify: (value: unknown, _name: string, fv: OWebForm) => void;
    birth_date: (value: unknown, name: string, fv: OWebForm) => void;
    gender: (value: unknown, _name: string, fv: OWebForm) => void;
    email: (value: unknown, name: string, fv: OWebForm) => void;
};

declare type DictForEachType = <U extends Record<string, unknown>>(collection: U, iteratee: (value: U[Extract<keyof U, string>], key: Extract<keyof U, string>, collection: U) => void) => void;

export declare function each<T>(obj: {
    [key: string]: T;
} | T[], fn: (value: T, key: any) => void): void;

export declare function encode(val: string): string;

export declare const escapeRegExp: (str: string) => string;

export declare function extractFieldLabelText(form: HTMLFormElement, fieldName: string): string;

export declare function fileSizeFormat(size: number, decimalPoint?: string, thousandsSep?: string): string;

export declare const forEach: ListForEachType & DictForEachType;

export declare function gt(x: number, y: number, eq?: boolean): boolean;

export declare const id: (prefix?: string) => string;

export declare const isArray: (arg: any) => arg is any[];

export declare const isEmpty: (a: unknown) => boolean;

export declare const isFunction: (a: unknown) => a is (...args: any[]) => any;

export declare function isInDOM(element: Node, inBody?: boolean): boolean;

export declare const isInteger: (number: unknown) => boolean;

/**
 * Checks if value is null or undefined.
 *
 * @param a
 */
export declare const isNil: (a: unknown) => a is null | undefined;

export declare const isNotEmpty: (a: unknown) => boolean;

export declare const isPlainObject: <T = Record<string, unknown>>(a: unknown) => a is T;

export declare function isRange(a: unknown, b: unknown): boolean;

export declare const isString: (a: unknown) => a is string;

export declare function isValidAge(day: number, month: number, year: number, minAge: number, maxAge: number): boolean;

declare interface List<T> {
    [index: number]: T;
    length: number;
}

declare type ListForEachType = <U extends List<unknown>>(collection: U, iteratee: (value: U[Extract<keyof U, number>], key: Extract<keyof U, number>, collection: U) => void) => void;

export declare function loadScript(src: string, then?: OScriptLoadCb, fail?: OScriptLoadCb, disableCache?: boolean): void;

export declare function loadScriptBatch(list: OScriptFile[], then?: OBatchCb, disableCache?: boolean): void;

export declare const logger: Console_2 & {
    on: () => void;
    off: () => void;
};

export declare function lt(x: number, y: number, eq?: boolean): boolean;

export declare function noCache(url: string): string;

export declare const noop: () => undefined;

export declare function numberFormat(x: number | string, dec?: number, decimalSep?: string, digitsSep?: string): string;

export declare type OApiAddResponse<T> = OApiResponse<{
    item: T;
}>;

export declare type OApiDeleteAllResponse = OApiResponse<{
    affected: number;
}>;

export declare type OApiDeleteResponse<T> = OApiResponse<{
    item: T;
}>;

export declare type OApiFilter = {
    0: Exclude<OApiFilterCondition, 'is_null' | 'is_not_null'>;
    1: string | number | (string | number)[];
    2?: 'or' | 'and';
} | {
    0: 'is_null' | 'is_not_null';
    1?: 'or' | 'and';
};

export declare type OApiFilterCondition = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'like' | 'not_like';

export declare type OApiFilters = {
    [key: string]: number | string | OApiFilter[];
};

export declare type OApiGetAllResponse<T> = OApiResponse<{
    items: T[];
    max?: number;
    page?: number;
    total?: number;
    relations?: {
        [key: string]: any;
    };
}>;

export declare type OApiGetPaginatedRelationItemsResponse<R> = OApiResponse<{
    items: R[];
    max?: number;
    page?: number;
    total?: number;
}>;

export declare type OApiGetRelationItemResponse<R> = OApiResponse<{
    item: R;
}>;

export declare type OApiGetResponse<T> = OApiResponse<{
    item: T;
    relations?: {
        [key: string]: any;
    };
}>;

export declare interface OApiResponse<R> {
    error: number;
    msg: string;
    data: R;
    utime: number;
    stime?: number;
    stoken?: string;
}

export declare interface OApiServiceRequestOptions {
    data?: any;
    filters?: OApiFilters;
    relations?: string | string[];
    collection?: string;
    order_by?: string;
    max?: number;
    page?: number;
    [key: string]: unknown;
}

export declare type OApiUpdateAllResponse = OApiResponse<{
    affected: number;
}>;

export declare type OApiUpdateResponse<T> = OApiResponse<{
    item: T;
}>;

export declare interface OAppConfigs {
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

export declare interface OAppOptions<Store extends OStore = OStore, Page extends OPage<OPageRoute> = OPage<OPageRoute>, User extends OUser = OUser, AppConfigs extends Partial<OAppConfigs> = Partial<OAppConfigs>, UserConfigs extends Partial<OUserConfigs> = Partial<OUserConfigs>, UrlList extends Partial<OUrlList> = Partial<OUrlList>, Context = OWebApp<Store, Page, User>> {
    name: string;
    appConfigs: AppConfigs;
    userConfigs: UserConfigs;
    urls: UrlList;
    user: (this: Context) => OWebUser<User>;
    store: (this: Context) => Store;
    pager: (this: Context) => OWebPager<Page>;
}

export declare type OBatchCb = (success: boolean, done: string[], failed: string[]) => void;

export declare type ODateValue = Date | number | string;

declare type OEventHandler = (...args: any[]) => void | boolean;

export declare type OFileAliasInfo = {
    file_id: string;
    file_key: string;
};

export declare type OFileMarked = (Blob | File) & {
    oz_mark_file_id?: string;
    oz_mark_file_key?: string;
};

export declare type OFileQuality = 0 | 1 | 2 | 3;

export declare type OI18n = OI18nOptions | string;

export declare type OI18nData = {
    [key: string]: any;
};

export declare type OI18nDefinition = Record<string, OJSONValue>;

export declare type OI18nElement = string | {
    text?: string;
    placeholder?: string;
    title?: string;
    lang?: string;
    data?: OI18nData;
    pluralize?: OI18nPluralize;
};

export declare type OI18nOptions = {
    text?: string;
    lang?: string;
    data?: OI18nData;
    pluralize?: OI18nPluralize;
};

export declare type OI18nPluralize = number | ((data: OI18nData, parts: string[]) => number);

declare interface OJSONSerializable {
    toJSON(): OJSONValue;
}

declare type OJSONValue = string | number | boolean | Date | OJSONSerializable | {
    [key: string]: OJSONValue;
} | OJSONValue[];

export declare interface ONetError extends OViewDialog {
    type: 'error';
    errType: 'bad_news' | 'http' | 'network' | 'abort' | 'timeout' | 'unknown';
}

export declare type ONetRequestBody = undefined | string | Record<string, unknown> | FormData | URLSearchParams | File | Blob;

export declare type ONetRequestMethod = 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';

export declare interface ONetRequestOptions<T> {
    method: ONetRequestMethod;
    body?: ONetRequestBody;
    params?: ONetRequestParams;
    timeout: number;
    withCredentials: boolean;
    responseType: XMLHttpRequest['responseType'];
    headers: {
        [key: string]: string;
    };
    isSuccessStatus: (status: number) => boolean;
    isGoodNews: (json: null | T) => boolean;
    errorResponseToDialog: (response: ONetResponse<T>) => {
        text: string;
        data?: Record<string, unknown>;
    };
}

export declare type ONetRequestParams = undefined | Record<string, unknown> | URLSearchParams;

export declare interface ONetResponse<T> {
    raw: any;
    json: T;
    status: number;
    statusText: string;
    isGoodNews: boolean;
    isSuccessStatus: boolean;
}

export declare interface OPage<Route extends OPageRoute = OPageRoute> {
    /**
     * The page name getter.
     */
    name: string;
    /**
     * The page routes getter.
     */
    routes: Route[];
    /**
     * Called once when registering the page.
     *
     * @param pager
     */
    install?(pager: OWebPager<this>): this;
    /**
     * Does this page require a verified user for the requested page route.
     *
     * @param context The app context.
     * @param route The request page route.
     */
    requireLogin?(context: OWebRouteContext, route: OPageRouteFull<Route>): boolean;
    /**
     * Called before page open.
     *
     * @param context
     * @param route
     */
    onOpen?(context: OWebRouteContext, route: OPageRouteFull<Route>): void;
    /**
     * Called before page close.
     *
     * @param oldRoute
     * @param newRoute
     */
    onClose?(oldRoute: OPageRouteFull<Route>, newRoute: OPageRouteFull<Route>): void;
}

export declare interface OPageRoute {
    slug?: string;
    icon?: string;
    title: OI18n;
    description?: OI18n;
    path: ORoutePath;
    pathOptions?: ORoutePathOptions;
    children?: OPageRoute[];
    showChildren?: boolean;
    disabled?: boolean;
    show?: boolean;
}

export declare type OPageRouteFull<Route extends OPageRoute = OPageRoute> = Route & {
    pathOptions: ORoutePathOptions;
    children: OPageRouteFull[];
    showChildren: boolean;
    disabled: boolean;
    show: boolean;
    readonly id: number;
    readonly href?: string;
    readonly parent?: OPageRouteFull<Route>;
    active: boolean;
    activeChild: boolean;
    webRoute: OWebRoute;
};

declare type ORouteAction = (ctx: OWebRouteContext) => void;

export declare interface ORouteDispatcher {
    readonly id: number;
    readonly context: OWebRouteContext;
    readonly found: OWebRoute[];
    isStopped(): boolean;
    dispatch(): this;
    stop(): this;
}

declare type ORouteInfo = {
    reg: RegExp | null;
    tokens: string[];
};

declare type ORoutePath = string | RegExp;

declare type ORoutePathOptions = {
    [key: string]: RegExp | keyof typeof tokenTypesRegMap;
};

export declare type ORouteStateItem = string | number | boolean | null | undefined | Date | ORouteStateObject | ORouteStateItem[];

export declare type ORouteStateObject = {
    [key: string]: ORouteStateItem;
};

export declare type ORouteTarget = {
    parsed: string;
    href: string;
    path: string;
    fullPath: string;
};

declare type ORouteTokens = Record<string, string>;

export declare type OScriptFile = [string, () => boolean] | [string];

export declare type OScriptLoadCb = (src: string) => void;

declare interface OServiceDataStore<T extends GoblSinglePKEntity> {
    add(item: T): this;
    get(id: string): T | undefined;
    update(item: T): this;
    remove(id: string): this;
    all(): T[];
    clear(): this;
    filter(filterFn: (entry: T) => boolean): T[];
    relationServiceResolver<R extends GoblSinglePKEntity>(relation: string): undefined | OWebServiceStore<R>;
}

export declare interface OStore {
    [key: string]: any;
}

declare type OTNetReadyInfo<User> = {
    status: string;
    data: OTNetResponseData<User>;
};

declare type OTNetResponseData<User> = {
    ok: boolean;
    _current_user?: User;
    _info_sign_up?: any;
};

export declare interface OUrlList {
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

export declare type OUser = {
    [key: string]: any;
};

export declare interface OUserConfigs {
    [key: string]: OJSONValue;
    OW_APP_DEFAULT_LANG: string;
    OW_APP_COUNTRY: string;
}

export declare type OViewDialog = {
    type: 'info' | 'error' | 'done';
    text: string;
    data?: Record<string, unknown>;
};

export declare class OWebAccountRecovery<Start, Validate, End> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_AR_SUCCESS;
    private static readonly EVT_AR_FAIL;
    static readonly AR_STEP_START = 1;
    static readonly AR_STEP_VALIDATE = 2;
    static readonly AR_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiResponse<Start>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiResponse<Validate>>>;
    stepEnd(data: {
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiResponse<End>>>;
    onRecoverySuccess(handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void): this;
    onRecoveryFail(handler: (this: this, err: ONetError) => void): this;
    private _sendForm;
}

export declare class OWebApp<Store extends OStore = OStore, Page extends OPage<OPageRoute> = OPage<OPageRoute>, User extends OUser = OUser, Options extends OAppOptions<Store, Page, User> = any> extends OWebEvent {
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

export declare class OWebConfigs<P extends {
    [key: string]: OJSONValue;
}, U extends {
    [key: string]: OJSONValue;
}, B = U & P> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_CONFIG_CHANGE: string;
    private readonly _tagName;
    private readonly _defaultUserConfigs;
    private readonly _appConfigs;
    private _usersConfigs;
    constructor(_appContext: OWebApp, appConfigs: P, userConfigs: U);
    /**
     * Resets a given config to its default value.
     *
     * @param config
     */
    resetToDefault<T extends keyof U>(config: T): this;
    /**
     * Resets all configs to their default values.
     *
     * @param confirmFirst When true a confirm will request will be sent to the user.
     */
    resetAllToDefault(confirmFirst?: boolean): this;
    /**
     * Gets a config value.
     *
     * @param config
     */
    get<T extends keyof B>(config: T): B[T];
    /**
     * Updates a given config with the given value.
     *
     * @param config The config name.
     * @param value The new value.
     */
    set<T extends keyof U>(config: T, value: U[T]): this;
    /**
     * Load all saved configs.
     *
     * @private
     */
    private _loadSavedConfigs;
    /**
     * Checks if the config is an app config name.
     *
     * @param config
     * @private
     */
    private _isAppConfig;
    /**
     * Checks if the config exists.
     *
     * @param config
     * @private
     */
    private _assertDefined;
}

export declare class OWebDataStore extends OWebEvent {
    static readonly EVT_DATA_STORE_CLEARED: string;
    private readonly _key;
    private _data;
    constructor(_appContext: OWebApp);
    /**
     * Sets key/value pair in the store.
     *
     * @param key The data key name.
     * @param value The data value.
     */
    set(key: string, value: OJSONValue): boolean;
    /**
     * Gets data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be returned in an object.
     *
     * @param key The data key name.
     */
    get(key: string | RegExp): any;
    /**
     * Removes data with the given key.
     *
     * When the key is a regexp all data with a key name that match the given
     * regexp will be removed.
     *
     * @param key
     */
    remove(key: string | RegExp): boolean;
    /**
     * Clear the data store.
     */
    clear(): boolean;
    /**
     * Register data store clear event handler.
     *
     * @param cb
     */
    onClear(cb: (this: this) => void): this;
    /**
     * Helper to make data store persistent.
     *
     * @private
     */
    private _persist;
}

export declare class OWebDate {
    private _appContext;
    private date;
    constructor(_appContext: OWebApp, date?: ODateValue);
    /**
     * Format date with a given format.
     */
    format(format?: string, isLangKey?: boolean): string;
    fromNow(): string;
    compare(_startDate: ODateValue, _endDate: ODateValue): {
        format: string;
        nSeconds: number;
        nMinutes: number;
        nHours: number;
        nDays: number;
        nWeeks: number;
        nMonths: number;
        nYears: number;
        inPast: boolean;
        cDays: number;
        cHours: number;
        cMinutes: number;
        cSeconds: number;
    };
    /**
     * Returns date description object.
     */
    describe(): {
        format: string;
        nSeconds: number;
        nMinutes: number;
        nHours: number;
        nDays: number;
        nWeeks: number;
        nMonths: number;
        nYears: number;
        inPast: boolean;
        cDays: number;
        cHours: number;
        cMinutes: number;
        cSeconds: number;
        D: string;
        L: string;
        l: number;
        ll: number;
        d: number;
        M: string;
        F: string;
        m: number;
        mm: string;
        Y: number;
        y: number;
        h: number;
        hh: string;
        H: number;
        i: number;
        ii: string;
        s: number;
        ss: string;
        ms: number;
        a: string;
        A: string;
    };
    /**
     * Date setter.
     *
     * @param date
     */
    setDate(date: ODateValue): this;
    /**
     * Date getter.
     */
    getDate(): ODateValue;
    /**
     * Returns unix like timestamp.
     */
    static timestamp(): number;
}

export declare class OWebError extends Error {
    readonly data: any;
    /**
     * OWebError constructor.
     *
     * @param message
     * @param data
     */
    constructor(message?: Error | string, data?: any);
}

export declare class OWebEvent {
    private _events;
    /**
     * Register event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    on(event: string, handler: (this: this, ...args: any[]) => ReturnType<OEventHandler>): this;
    /**
     * Removes event handler.
     *
     * @param event The event name.
     * @param handler The event handler function.
     */
    off(event: string, handler: () => void): this;
    /**
     * Trigger an event.
     *
     * @param event The event name.
     * @param data The data to be passed as arguments to the event handlers.
     * @param cancelable When true the event will stop when a handler returns false.
     * @param context The context in which each handler will be called. Default: this.
     */
    protected trigger(event: string, data?: any[], cancelable?: boolean, context?: any): boolean;
}

export declare class OWebForm {
    private readonly _appContext;
    private readonly adapter;
    private readonly required;
    private readonly excluded;
    private readonly checkAll;
    private readonly verbose;
    private errors;
    /**
     * @param _appContext The app context.
     * @param adapter The form.
     * @param required The required fields.
     * @param excluded The fields to exclude from validation.
     * @param checkAll When true all fields will be validated.
     * @param verbose Log warning.
     */
    constructor(_appContext: OWebApp, adapter: OWebFormAdapter, required?: string[], excluded?: string[], checkAll?: boolean, verbose?: boolean);
    /**
     * Returns the app context.
     */
    getAppContext(): OWebApp;
    /**
     * Returns the form adapter.
     */
    getFormAdapter(): OWebFormAdapter;
    /**
     * Gets app config.
     *
     * @param key
     */
    getConfig(key: string): any;
    /**
     * Returns a FormData containing the validated form fields.
     *
     * @param fields The fields name list. When empty all field will be added to the FormData.
     */
    getFormData(fields?: string[]): FormData;
    /**
     * Gets a given field name value.
     *
     * @param name
     */
    getFieldValue<T = null | OWebFormDataEntryValue>(name: string): T;
    /**
     * Sets a given field value.
     * @param name
     * @param value
     */
    setFieldValue(name: string, value: OWebFormDataEntryValue): this;
    /**
     * Returns error map.
     */
    getErrors(): OWebFormErrors;
    /**
     * Runs form validation.
     */
    validate(showDialog?: boolean): boolean;
    /**
     * Make an assertions.
     *
     * @param predicate The assertion predicate.
     * @param message The error message when the predicate is false.
     * @param data The error data.
     */
    assert(predicate: unknown, message: string, data?: Record<string, unknown>): this;
    /**
     * Declare a field validator.
     *
     * @param name The validator name.
     * @param validator The validator function.
     */
    static declareFieldValidator(name: string, validator: OWebFormFieldValidator): void;
    /**
     * Gets field validator.
     *
     * @param name The field validator name.
     */
    static getDeclaredValidator(name: string): OWebFormFieldValidator | undefined;
}

declare abstract class OWebFormAdapter {
    protected validators: {
        [key: string]: OWebFormFieldValidator[];
    };
    /**
     * Gets validators for the field with the given name.
     */
    getFieldValidators(fieldName: string): OWebFormFieldValidator[];
    /**
     * Adds validator for the field with the given name.
     *
     * @param fieldName
     * @param validator
     */
    pushFieldValidator(fieldName: string, validator: string | OWebFormFieldValidator<unknown>): this;
    /**
     * Returns form data.
     * @param fields The fields name list.
     */
    abstract toFormData(fields: string[]): FormData;
    /**
     * Gets a given field name value.
     *
     * @param fieldName
     */
    abstract getFieldValue<T = null | OWebFormDataEntryValue>(fieldName: string): T;
    /**
     * Sets a given field value.
     *
     * @param fieldName
     * @param value
     */
    abstract setFieldValue(fieldName: string, value: OWebFormDataEntryValue): this;
    /**
     * Returns all fields names list.
     */
    abstract getFieldsNames(): string[];
    /**
     * Returns field label.
     *
     * We search the field label, placeholder or title.
     *
     * @param fieldName
     */
    abstract getFieldLabel(fieldName: string): string;
}

export declare type OWebFormData = FormData | Record<string, any>;

declare type OWebFormDataEntryValue = File | string;

export declare type OWebFormDefinition = Record<string, OWebFormField>;

export declare class OWebFormError extends OWebError {
    readonly isFormError = true;
}

export declare type OWebFormErrors = {
    [key: string]: OWebFormError[];
};

export declare interface OWebFormField {
    [key: string]: unknown;
    value: any;
    label?: string;
    validator?: string | OWebFormFieldValidator;
}

export declare type OWebFormFieldValidator<T = unknown> = (value: T, fieldName: string, context: OWebForm) => void;

export declare class OWebFS {
    static readonly OFA_MIME_TYPE = "text/x-ozone-file-alias";
    /**
     * Checks for file object.
     *
     * @param f
     */
    static isFile(f: unknown): f is OFileMarked;
    /**
     * Checks for marked file object.
     * @param f
     */
    static isMarkedFile(f: unknown): boolean;
    /**
     * Creates O'Zone file alias.
     *
     * @param info
     */
    static createFileAlias(info: OFileAliasInfo): File;
}

export declare class OWebI18n extends OWebEvent {
    private defaultLangCode;
    /**
     * Sets default i18n lang code.
     *
     * @deprecated use {@link OWebI18n.setLang}
     *
     * @param lang The i18n lang code.
     */
    setDefaultLang(lang: string): this;
    /**
     * Sets i18n lang code.
     *
     * @param lang The i18n lang code.
     */
    setLang(lang: string): this;
    /**
     * Gets current lang.
     *
     * @returns {string}
     */
    getCurrentLang(): string;
    /**
     * Gets supported languages.
     *
     * @returns {string[]}
     */
    getSupportedLangs(): string[];
    /**
     * Returns i18n translation.
     *
     * @param key The i18n string key.
     * @param data The data to inject in translation process.
     * @param pluralize
     * @param lang The i18n lang code to use.
     */
    toHuman(key: OI18n, data?: OI18nData, pluralize?: OI18nPluralize, lang?: string): string;
    /**
     * Sets i18n for HTMLElement
     *
     * @param el
     * @param options
     */
    el(el: HTMLElement, options: OI18nElement): void;
    /**
     * Sets the i18n lang data.
     *
     * @param lang The i18n lang code
     * @param data The i18n lang data.
     */
    static loadLangData(lang: string, data: OI18nDefinition): void;
}

export declare class OWebKeyStorage extends OWebEvent {
    private readonly _appContext;
    private readonly tagName;
    private persistent;
    private readonly _maxLifeTime;
    private _store;
    /**
     * @param _appContext The app context.
     * @param tagName The key storage name.
     * @param persistent True to persists the key storage data.
     * @param maxLifeTime The duration in seconds until key data deletion.
     */
    constructor(_appContext: OWebApp, tagName: string, persistent?: boolean, maxLifeTime?: number);
    /**
     * Returns the key storage data.
     */
    getStoreData<D extends Record<string, OJSONValue>>(): D;
    /**
     * Returns a given key value.
     *
     * @param key The key name.
     */
    getItem<T extends OJSONValue>(key: string): T | null;
    /**
     * Sets an item to the key storage.
     *
     * @param key The key name.
     * @param value The key value.
     */
    setItem(key: string, value: OJSONValue): this;
    /**
     * Removes item from the key storage.
     *
     * @param key The item key name.
     */
    removeItem(key: string): this;
    /**
     * Save the key storage.
     */
    private _save;
    /**
     * Clear the key storage.
     */
    clear(): this;
    /**
     * Helper to clear all expired value from the key storage.
     *
     * @private
     */
    private _clearExpired;
}

export declare class OWebLogin<User> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_LOGIN_FAIL: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(_appContext: OWebApp);
    loginWithEmail(data: {
        email: string;
        pass: string;
    }): Promise<ONetResponse<OApiResponse<User>>>;
    loginWithPhone(data: {
        phone: string;
        pass: string;
    }): Promise<ONetResponse<OApiResponse<User>>>;
    onLoginFail(handler: (this: this, err: ONetError) => void): this;
    onLoginSuccess(handler: (this: this, response: ONetResponse<OApiResponse<User>>) => void): this;
    private _tryLogin;
}

export declare class OWebLogout<Result> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_LOGOUT_FAIL: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    constructor(_appContext: OWebApp);
    onLogoutFail(handler: (this: this, err: ONetError) => void): this;
    onLogoutSuccess(handler: (this: this, response: ONetResponse<OApiResponse<Result>>) => void): this;
    logout(): Promise<ONetResponse<OApiResponse<Result>>>;
}

export declare abstract class OWebNet<T = null> extends OWebEvent {
    protected url: string;
    protected options: ONetRequestOptions<T>;
    static readonly SELF: string;
    static readonly EVT_ERROR: string;
    static readonly EVT_RESPONSE: string;
    static readonly EVT_HTTP_SUCCESS: string;
    static readonly EVT_HTTP_ERROR: string;
    static readonly EVT_FINISH: string;
    static readonly EVT_GOOD_NEWS: string;
    static readonly EVT_BAD_NEWS: string;
    static readonly EVT_FAIL: string;
    static readonly EVT_UPLOAD_PROGRESS: string;
    static readonly EVT_DOWNLOAD_PROGRESS: string;
    /**
     * OWebNet constructor.
     *
     * @param url
     * @param options
     * @protected
     */
    protected constructor(url: string, options: ONetRequestOptions<T>);
    /**
     * Assertion that throws error when request is already sent.
     *
     * @param message
     * @private
     */
    protected assertNotSent(message: string): void;
    /**
     * Called when request sent and the server responded.
     *
     * @param handler
     */
    onResponse(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when request sent and http response status code is in success range.
     *
     * @param handler
     */
    onHttpSuccess(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Always called when the request finished.
     *
     * @param handler
     */
    onFinish(handler: (this: this) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `true`.
     *
     * @param handler
     */
    onGoodNews(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when `options.responseType` is `json` and `options.isGoodNews` returns `false`.
     *
     * @param handler
     */
    onBadNews(handler: (this: this, response: ONetResponse<any>) => void): this;
    /**
     * Called on error: abort, timeout, network
     *
     * @param handler
     */
    onError(handler: (this: this, error: ONetError) => void): this;
    /**
     * Called when request sent and http response status code is in error range.
     *
     * @param handler
     */
    onHttpError(handler: (this: this, response: ONetResponse<T>) => void): this;
    /**
     * Called when there is a general error, an http status error or a bad news.
     *
     * @param handler
     */
    onFail(handler: (this: this, raison: ONetError) => void): this;
    /**
     * Listen to download progress event.
     *
     * NOTE: this is not supported by all browser.
     *
     * @param handler
     */
    onUploadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    /**
     * Listen to download progress event.
     *
     * @param handler
     */
    onDownloadProgress(handler: (this: this, progress: ProgressEvent) => void): this;
    /**
     * Checks if the request is already sent.
     */
    abstract isSent(): boolean;
    /**
     * Send the request and return a promise.
     */
    abstract send(): Promise<ONetResponse<T>>;
    /**
     * Abort the request
     */
    abstract abort(): this;
}

export declare class OWebPager<P extends OPage<R>, R extends OPageRoute = OPageRoute> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_PAGE_LOCATION_CHANGE: string;
    private readonly _pages;
    private _routesCache;
    private _routesFlattened;
    private _activePage?;
    private _activeRoute?;
    /**
     * @param _appContext The app context.
     */
    constructor(_appContext: OWebApp);
    /**
     * Returns registered pages routes.
     */
    getRoutes(): OPageRouteFull<R>[];
    /**
     * Returns the page with the given name.
     * @param name
     */
    getPage(name: string): P;
    /**
     * Returns the active page.
     */
    getActivePage(): P;
    /**
     * Returns the active page route.
     */
    getActivePageRoute(): OPageRouteFull<R>;
    /**
     * Returns all pages list.
     */
    getPageList(): Record<string, P>;
    /**
     * Register a given page.
     *
     * @param page
     */
    registerPage(page: P): this;
    /**
     * Helpers to register page routes.
     *
     * @param page The page.
     * @param routes The page routes list.
     * @param parent The page routes parent.
     * @private
     */
    private _registerPageRoutes;
    /**
     * Helper to add route.
     *
     * @param route The route object.
     * @param page The page to which that route belongs to.
     * @private
     */
    private _addRoute;
    /**
     * Helper to set the active route.
     *
     * @param page
     * @param route
     * @private
     */
    private _setActive;
    onLocationChange(handler: (route: OPageRouteFull<R>, page: P) => void): this;
}

export declare class OWebPassword<Result> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_FAIL: string;
    constructor(_appContext: OWebApp);
    editPass(data: {
        cpass: string;
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiResponse<Result>>>;
    editPassAdmin(data: {
        uid: string;
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiResponse<Result>>>;
    private _sendForm;
    onEditFail(handler: (this: this, err: ONetError) => void): this;
    onEditSuccess(handler: (this: this, response: ONetResponse<OApiResponse<Result>>) => void): this;
}

export declare class OWebRoute {
    private readonly path;
    private readonly reg;
    private tokens;
    private readonly action;
    /**
     * OWebRoute Constructor.
     *
     * @param path The route path string or regexp.
     * @param options The route options.
     * @param action The route action function.
     */
    constructor(path: string | RegExp, options: ORoutePathOptions | string[], action: ORouteAction);
    /**
     * Returns true if this route is dynamic false otherwise.
     */
    isDynamic(): boolean;
    /**
     * Gets route action.
     */
    getAction(): ORouteAction;
    /**
     * Checks if a given pathname match this route.
     *
     * @param pathname
     */
    is(pathname: string): boolean;
    /**
     * Parse a given pathname.
     *
     * @param pathname
     */
    parse(pathname: string): ORouteTokens;
    /**
     * Parse dynamic path and returns appropriate regexp and tokens list.
     *
     * ```js
     * let format = "path/to/:id/file/:index/name.:format";
     * let options = {
     * 		id: "num",
     * 		index: "alpha",
     * 		format:	"alpha-num"
     * };
     * let info = parseDynamicPath(format,options);
     *
     * info === {
     *     reg: RegExp,
     *     tokens: ["id","index","format"]
     * };
     * ```
     * @param path The path format string.
     * @param options The path options.
     */
    static parseDynamicPath(path: string, options: ORoutePathOptions): ORouteInfo;
}

export declare class OWebRouteContext {
    private _tokens;
    private _stopped;
    private readonly _target;
    private readonly _state;
    private readonly _router;
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router: OWebRouter, target: ORouteTarget, state: ORouteStateObject);
    /**
     * Gets route token value
     *
     * @param token The token.
     */
    getToken(token: string, def?: string | null): string | null;
    /**
     * Gets a map of all tokens and values.
     */
    getTokens(): ORouteTokens;
    /**
     * Gets the path.
     */
    getPath(): string;
    /**
     * Gets stored value in history state with a given key.
     *
     * @param key the state key
     */
    getStateItem(key: string, def?: ORouteStateItem): string | number | boolean | Date | ORouteStateObject | ORouteStateItem[] | null;
    /**
     * Sets a key in history state.
     *
     * @param key the state key
     * @param value  the state value
     */
    setStateItem(key: string, value: ORouteStateItem): this;
    /**
     * Gets search param value.
     *
     * @param name the search param name
     * @param def the default to return when not defined
     */
    getSearchParam(name: string, def?: string): string | null;
    /**
     * Check if the route dispatcher is stopped.
     */
    isStopped(): boolean;
    /**
     * Stop the route dispatcher.
     */
    stop(): this;
    /**
     * Save history state.
     */
    save(): this;
    /**
     * Runs action attached to a given route.
     *
     * @param route
     */
    actionRunner(route: OWebRoute): this;
}

export declare class OWebRouter {
    private readonly _baseUrl;
    private readonly _hashMode;
    private _currentTarget;
    private _routes;
    private _initialized;
    private _listening;
    private readonly _notFound;
    private readonly _popStateListener;
    private readonly _linkClickListener;
    private _dispatchId;
    private _notFoundLoopCount;
    private _currentDispatcher?;
    private _forceReplace;
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     * @param notFound called when a route is not found
     */
    constructor(baseUrl: string, hashMode: boolean | undefined, notFound: (target: ORouteTarget) => void);
    /**
     * Starts the router.
     *
     * @param firstRun first run flag
     * @param target initial target, usualy the entry point
     * @param state initial state
     */
    start(firstRun?: boolean, target?: string, state?: ORouteStateObject): this;
    /**
     * Stops the router.
     */
    stopRouting(): this;
    /**
     * When called the current history will be replaced by the next history state.
     */
    forceNextReplace(): this;
    /**
     * Returns the current route target.
     */
    getCurrentTarget(): ORouteTarget;
    /**
     * Returns the current route event dispatcher.
     */
    getCurrentDispatcher(): ORouteDispatcher | undefined;
    /**
     * Returns the current route context.
     */
    getRouteContext(): OWebRouteContext;
    /**
     * Parse a given url.
     *
     * @param url the url to parse
     */
    parseURL(url: string | URL): ORouteTarget;
    /**
     * Builds url with a given path and base url.
     *
     * @param path the path
     * @param base the base url
     */
    pathToURL(path: string, base?: string): URL;
    /**
     * Attach a route action.
     *
     * @param path the path to watch
     * @param rules the path rules
     * @param action the action to run
     */
    on(path: ORoutePath, rules: ORoutePathOptions | undefined, action: ORouteAction): this;
    /**
     * Add a route.
     *
     * @param route
     */
    addRoute(route: OWebRoute): this;
    /**
     * Go back.
     *
     * @param distance the distance in history
     */
    goBack(distance?: number): this;
    /**
     * Browse to a specific location
     *
     * @param url the next url
     * @param state the initial state
     * @param push should we push into the history state
     * @param ignoreSameLocation  ignore browsing again to same location
     */
    browseTo(url: string, state?: ORouteStateObject, push?: boolean, ignoreSameLocation?: boolean): this;
    /**
     * Adds history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    addHistory(url: string, state: ORouteStateObject, title?: string): this;
    /**
     * Replace the current history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    replaceHistory(url: string, state: ORouteStateObject, title?: string): this;
    /**
     * Create route event dispatcher
     *
     * @param target the route target
     * @param state the history state
     * @param id the dispatcher id
     */
    private createDispatcher;
    /**
     * Register DOM events handler.
     */
    private register;
    /**
     * Unregister all DOM events handler.
     */
    private unregister;
    /**
     * Handle click event
     *
     * onclick from page.js library: github.com/visionmedia/page.js
     *
     * @param e the envent object
     */
    private _onClick;
}

export declare class OWebService<Entity> {
    protected readonly _appContext: OWebApp;
    protected name: string;
    /**
     * OWebService constructor.
     *
     * @param _appContext The app context.
     * @param name The service name.
     */
    constructor(_appContext: OWebApp, name: string);
    /**
     * Make request to a specific endpoint using this service as base url.
     */
    request<Response extends OApiResponse<any>>(path: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    /**
     * Returns the service name.
     */
    getName(): string;
    /**
     * Adds an entity.
     *
     * @param formData
     */
    addItem(formData: ONetRequestBody): OWebXHR<OApiAddResponse<Entity>>;
    /**
     * Deletes the entity with the given id.
     *
     * @param id The entity id.
     */
    deleteItem(id: string): OWebXHR<OApiDeleteResponse<Entity>>;
    /**
     * Updates the entity with the given id.
     *
     * @param id The entity id.
     * @param formData
     */
    updateItem(id: string, formData: ONetRequestBody): OWebXHR<OApiUpdateResponse<Entity>>;
    /**
     * Deletes all entities.
     *
     * @param options
     */
    deleteItems(options: OApiServiceRequestOptions): OWebXHR<OApiDeleteAllResponse>;
    /**
     * Updates all entities.
     *
     * @param options
     */
    updateItems(options: OApiServiceRequestOptions): OWebXHR<OApiUpdateAllResponse>;
    /**
     * Gets an entity with the given id.
     *
     * All requested relations names are joined with `|`.
     * example: `relation1|relation2|relationX`.
     *
     * @param id The entity id.
     * @param relations The relations string.
     */
    getItem(id: string, relations?: string): OWebXHR<OApiGetResponse<Entity>>;
    /**
     * Gets all entities.
     *
     * @param options
     */
    getItems(options: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<Entity>>;
    /**
     * Gets a single item relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name
     */
    getRelationItem<R>(id: string, relation: string): OWebXHR<OApiGetRelationItemResponse<R>>;
    /**
     * Gets multiple items relation for a given entity id.
     *
     * @param id The entity id.
     * @param relation The relation name.
     * @param options
     */
    getRelationItems<R>(id: string, relation: string, options: OApiServiceRequestOptions): OWebXHR<OApiGetPaginatedRelationItemsResponse<R>>;
}

export declare class OWebServiceStore<T extends GoblSinglePKEntity> extends OWebService<T> {
    private readonly entity;
    protected store: OServiceDataStore<T>;
    protected relations: {
        [key: string]: any;
    };
    /**
     * OWebServiceStore constructor.
     *
     * @param _appContext
     * @param entity
     * @param service
     */
    constructor(_appContext: OWebApp, entity: typeof GoblSinglePKEntity, service: string, store?: OServiceDataStore<T>);
    /**
     * Creates request to get an item by id.
     *
     * @param id The item id.
     * @param relations The relations to retrieve.
     */
    getItem(id: string, relations?: string): OWebXHR<OApiGetResponse<T>>;
    /**
     * Creates request to get items list.
     *
     * @param options
     */
    getItems(options?: OApiServiceRequestOptions): OWebXHR<OApiGetAllResponse<T>>;
    /**
     * Creates request to add new item.
     *
     * @param data
     */
    addItem(data: OWebFormData): OWebXHR<OApiAddResponse<T>>;
    /**
     * Creates update request for a given item.
     *
     * @param item
     */
    updateItem(item: T | string, formData?: ONetRequestBody | null): OWebXHR<OApiUpdateResponse<T>>;
    /**
     * Creates a delete request for a given item.
     *
     * @param item
     */
    deleteItem(item: T | string): OWebXHR<OApiDeleteResponse<T>>;
    /**
     * Adds a list of items to this store list.
     *
     * @param items
     * @param relations
     */
    addItemsToList(items: T[] | Record<string, T>, relations?: any): void;
    /**
     * Adds a given item and its relations to this store.
     *
     * @param item
     * @param relations
     */
    addItemToList(item: T, relations?: any): void;
    /**
     * Safely add item to this store.
     *
     * @param item
     * @private
     */
    private safelyAddItem;
    /**
     * Modify successfully saved item state and data.
     *
     * @param target
     * @param response
     * @private
     */
    private setSaved;
    /**
     * Adds a newly created item to this store.
     *
     * @param response
     */
    private addCreated;
    /**
     * Removes a given item from this store when deleted.
     *
     * @param response
     */
    private setDeleted;
    /**
     * Identify a given item in this store by its id.
     *
     * @param id
     * @param checkCacheForMissing
     */
    identify(id: string, checkCacheForMissing?: boolean): T | undefined;
    /**
     * Gets this store items list.
     */
    list(ids?: string[], checkCacheForMissing?: boolean): T[];
    /**
     * Filter items in this store or in a given list.
     *
     * @param list
     * @param predicate
     * @param max
     */
    filter(list: T[] | undefined, predicate: (value: T) => boolean, max?: number): T[];
    /**
     * Select some items in this store.
     *
     * @alias filter
     *
     * @param list
     * @param predicate
     * @param max
     */
    select(list: T[] | undefined, predicate: (value: T) => boolean, max?: number): T[];
    /**
     * Search items in this store or in a given items list.
     *
     * @param list
     * @param search
     * @param stringBuilder
     */
    search(list: T[] | undefined, search: string, stringBuilder: (value: T) => string): T[];
    /**
     * Gets a given item relations.
     *
     * @param item
     * @param relation
     */
    itemRelation<Z>(item: T, relation: string): Z | undefined;
}

export declare class OWebSignUp<Start, Validate, End> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_SIGN_UP_SUCCESS;
    private static readonly EVT_SIGN_UP_FAIL;
    static readonly SIGN_UP_STEP_START = 1;
    static readonly SIGN_UP_STEP_VALIDATE = 2;
    static readonly SIGN_UP_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiResponse<Start>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiResponse<Validate>>>;
    stepEnd(data: {
        uname: string;
        pass: string;
        vpass: string;
        birth_date: string;
        gender: string;
        email?: string;
    }): Promise<ONetResponse<OApiResponse<End>>>;
    onSignUpFail(handler: (this: this, err: ONetError) => void): this;
    onSignUpSuccess(handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void): this;
    private _sendForm;
}

export declare class OWebTNet<App extends OWebApp, User = ReturnType<App['user']['getCurrentUser']>> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_TNET_READY;
    static readonly STATE_UNKNOWN: string;
    static readonly STATE_NO_USER: string;
    static readonly STATE_OFFLINE_USER: string;
    static readonly STATE_VERIFIED_USER: string;
    static readonly STATE_SIGN_UP_PROCESS: string;
    constructor(_appContext: App);
    onReady(handler: (this: this, status: string, data?: OTNetReadyInfo<User>) => void): this;
    check(): Promise<ONetResponse<OApiResponse<OTNetResponseData<User>>>>;
}

export declare class OWebUrl<T extends {
    [key: string]: string;
} = any> {
    private readonly _urlList;
    private readonly _urlLocalBase;
    private readonly _urlServerBase;
    constructor(context: OWebApp, urlList: T);
    /**
     * Gets url value with a given url key name.
     *
     * @param key The url key name.
     */
    get(key: string): string;
    /**
     * Resolve url with local base.
     *
     * @param url
     */
    resolveLocal(url: string): string;
    /**
     * Resolve url with server base.
     *
     * @param url
     */
    resolveServer(url: string): string;
}

export declare class OWebUser<UserEntity extends OUser> extends OWebEvent {
    protected _appContext: OWebApp;
    private _keyStore;
    constructor(_appContext: OWebApp);
    /**
     * Returns a new {@link OWebLogin} instance.
     */
    login(): OWebLogin<UserEntity>;
    /**
     * Returns a new {@link OWebLogout} instance.
     */
    logout(): OWebLogout<UserEntity>;
    /**
     * Returns a new {@link OWebSignUp} instance.
     */
    signUp<Start, Validate, End>(): OWebSignUp<Start, Validate, End>;
    /**
     * Returns a new {@link OWebPassword} instance.
     */
    password(): OWebPassword<UserEntity>;
    /**
     * Returns a new {@link OWebAccountRecovery} instance.
     */
    accountRecovery<Start, Validate, End>(): OWebAccountRecovery<Start, Validate, End>;
    /**
     * Checks if user session is active.
     */
    sessionActive(): boolean;
    /**
     * Checks if the current user has been authenticated.
     *
     * @deprecated use {@link OWebUser.isVerified }
     */
    userVerified(): boolean;
    /**
     * Sets current user data.
     *
     * @param user
     *
     * @deprecated use {@link OWebUser.setCurrent}
     */
    setCurrentUser(user: UserEntity): this;
    /**
     * Returns current user data.
     *
     * @deprecated use {@link OWebUser.getCurrent}
     */
    getCurrentUser(): UserEntity | null;
    /**
     * Checks if the current user has been authenticated.
     */
    isVerified(): boolean;
    /**
     * Returns current user data.
     */
    getCurrent(): UserEntity | null;
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrent(user: UserEntity): this;
    /**
     * Sets current user session expire time.
     *
     * @param expire
     */
    setSessionExpire(expire: number): this;
    /**
     * Returns current user session expire time.
     */
    getSessionExpire(): number;
    /**
     * Sets current user session token.
     *
     * @param token
     */
    setSessionToken(token: string): this;
    /**
     * Returns current user session token.
     */
    getSessionToken(): string | null;
    /**
     * Clear user data.
     */
    clear(): this;
}

export declare class OWebView extends OWebEvent {
    static readonly SELF: string;
    static readonly EVT_VIEW_FREEZE: string;
    static readonly EVT_VIEW_UNFREEZE: string;
    static readonly EVT_VIEW_DIALOG: string;
    private _freezeCounter;
    constructor();
    /**
     * Checks if the view is frozen.
     */
    isFrozen(): boolean;
    /**
     * To freeze the view.
     */
    freeze(): this;
    /**
     * Unfreeze the view.
     */
    unfreeze(): this;
    /**
     * Trigger dialog event to the view.
     * @param dialog
     * @param canUseAlert
     */
    dialog(dialog: OViewDialog | OApiResponse<any> | ONetError, canUseAlert?: boolean): void;
    /**
     * Register freeze event handler.
     *
     * @param handler
     */
    onFreeze(handler: (this: this) => void): this;
    /**
     * Register unfreeze event handler.
     *
     * @param handler
     */
    onUnFreeze(handler: (this: this) => void): this;
    /**
     * Register dialog event handler.
     *
     * @param handler
     */
    onDialog(handler: (this: this, dialog: OViewDialog, canUseAlert: boolean) => void): this;
}

export declare class OWebXHR<T> extends OWebNet<T> {
    private _abort?;
    private _sent;
    /**
     * OWebXHR constructor.
     *
     * @param url
     * @param options
     */
    constructor(url: string, options: Partial<ONetRequestOptions<T>>);
    /**
     * @inheritDoc
     */
    isSent(): boolean;
    /**
     * @inheritDoc
     */
    send(): Promise<ONetResponse<T>>;
    /**
     * @inheritDoc
     */
    abort(): this;
    /**
     * Builds the request body.
     *
     * @param body
     * @private
     */
    private requestBody;
}

declare class OZone {
    private _appContext;
    private readonly apiHost;
    /**
     * OZone constructor.
     *
     * @param _appContext
     */
    protected constructor(_appContext: OWebApp);
    /**
     * Create new ozone api instance or get from cache
     *
     */
    static instantiate(_appContext: OWebApp): OZone;
    /**
     * Makes a request.
     *
     * @param url The request url
     * @param options The request options
     */
    request<Response extends OApiResponse<any>>(url: string, options?: Partial<ONetRequestOptions<Response>>): OWebXHR<Response>;
    /**
     * Returns the service URI.
     *
     * @param serviceName The service name.
     */
    getServiceURI(serviceName: string): string;
    /**
     * Returns an absolute uri string.
     *
     * @param serviceName The service name.
     * @param path The path.
     */
    toAbsoluteURI(serviceName: string, path: string): string;
    /**
     * Returns entity URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     */
    getItemURI(serviceName: string, id: string | number): string;
    /**
     * Returns entity relation URI.
     *
     * @param serviceName The service name.
     * @param id The entity id.
     * @param relation The relation name.
     */
    getItemRelationURI(serviceName: string, id: string, relation: string): string;
}

export declare function parseQueryString(str: string): Record<string, string>;

export declare const PathResolver: {
    /**
     * The directory separator.
     */
    DS: string;
    /**
     * Resolve a given path to the the given root.
     *
     * @param root
     * @param path
     */
    resolve(root: string, path: string): string;
    /**
     * Do the path resolving job.
     *
     * @param path
     */
    job(path: string): string;
    /**
     * Normalize a given path.
     *
     * @param path
     */
    normalize(path: string): string;
    /**
     * Checks if a path is a relative path.
     * @param path
     */
    isRelative(path: string): boolean;
};

export declare function preventDefault(e: Event): void;

/**
 * Opens the provided url by injecting a hidden iframe that calls
 * window.open(), then removes the iframe from the DOM.
 *
 * Prevent reverse tabnabbing phishing attacks caused by _blank
 *
 * https://mathiasbynens.github.io/rel-noopener/
 *
 * https://github.com/danielstjules/blankshield/blob/6e208bf25a44bf50d1a5e85ae96fee0c015d05bc/blankshield.js#L166
 *
 * @param url
 * @param strWindowName
 * @param strWindowFeatures
 */
export declare function safeOpen(url?: string, strWindowName?: string, strWindowFeatures?: string): Window | null;

export declare function searchParam(name: string, url?: string | URL | Location): string | null;

export declare function shuffle<X>(a: X[]): X[];

export declare function stringPlaceholderReplace(str: string, data: Record<string, unknown>): string;

export declare function textToLineString(text: string): string;

export declare const toArray: <X>(a: Iterable<X>) => X[];

declare const tokenTypesRegMap: {
    num: string;
    alpha: string;
    'alpha-num': string;
    any: string;
};

export declare function unique<X>(arr: X[]): X[];

/**
 * Generate uuid.
 */
export declare function uuid(): string;

export { }
