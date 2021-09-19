import OWebConfigs from './OWebConfigs';
import OWebDataStore, { OJSONValue } from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator, { OForm } from './OWebFormValidator';
import OWebRouter, { ORouteStateObject, ORouteTarget } from './OWebRouter';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebI18n from './OWebI18n';
import { assign, id, logger } from './utils';
import OZone from './ozone';
import OWebPager, { OPage } from './OWebPager';
import OWebUser from './OWebUser';
import { ONetRequestOptions } from './OWebNet';
import OWebXHR from './OWebXHR';
import defaultAppConfigs from './default/app.configs';
import defaultUserConfigs from './default/user.configs';
import defaultAppUrls from './default/app.urls';

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

export type OUser = {
	[key: string]: any;
};

export interface OAppOptions<
	Store extends OStore,
	Page extends OPage,
	User extends OUser
> {
	name: string;
	appConfigs: Partial<OAppConfigs>;
	userConfigs: Partial<OUserConfigs>;
	urls: Partial<OUrlList>;
	user: (
		this: OWebApp<Store, Page, User, OAppOptions<Store, Page, User>>,
	) => OWebUser<User>;
	store: (
		this: OWebApp<Store, Page, User, OAppOptions<Store, Page, User>>,
	) => Store;
	pager: (
		this: OWebApp<Store, Page, User, OAppOptions<Store, Page, User>>,
	) => OWebPager<Page>;
}

export default class OWebApp<
	Store extends OStore = any,
	Page extends OPage = any,
	User extends OUser = any,
	Options extends OAppOptions<Store, Page, User> = any
> extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_APP_READY = id();
	static readonly EVT_NOT_FOUND = id();
	static readonly EVT_SHOW_HOME = id();
	static readonly EVT_SHOW_LOGIN = id();
	static readonly EVT_SHOW_REGISTRATION_PAGE = id();

	readonly view: OWebView;
	readonly ls: OWebDataStore;
	readonly router: OWebRouter;
	readonly user: OWebUser<User>;
	readonly configs: OWebConfigs<OAppConfigs, OUserConfigs>;
	readonly url: OWebUrl;
	readonly i18n: OWebI18n;
	readonly oz: OZone;

	private readonly _store: Store;
	private readonly _pager: OWebPager<Page>;

	/**
	 * OWebApp constructor.
	 *
	 * @param options
	 */
	protected constructor(private readonly options: Options) {
		super();

		this.ls = new OWebDataStore(this);
		this.configs = new OWebConfigs(
			this,
			assign({}, defaultAppConfigs, options.appConfigs),
			assign({}, defaultUserConfigs, options.userConfigs)
		);
		this.url = new OWebUrl(this, assign({}, defaultAppUrls, options.urls));
		this.view = new OWebView();
		this.i18n = new OWebI18n();
		this.user = options.user.call(this);
		this._store = options.store.call(this);
		this._pager = options.pager.call(this);

		const ctx = this,
			baseUrl = this.configs.get('OW_APP_LOCAL_BASE_URL'),
			hashMode = this.configs.get('OW_APP_ROUTER_HASH_MODE');

		this.router = new OWebRouter(
			baseUrl,
			hashMode,
			function notFoundHandler(target: ORouteTarget) {
				ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
			}
		);

		this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));

		this.oz = OZone.instantiate(this);
	}

	/**
	 * Build an HTTP request.
	 *
	 * @param url
	 * @param options
	 */
	request<Response>(
		url: string,
		options: Partial<ONetRequestOptions<Response>> = {}
	): OWebXHR<Response> {
		logger.debug('[Net] new request', url, options);

		const event = function event(type: string) {
			return function eventHandler(): void {
				logger.debug('[Net] event %s', type, url, options);
			};
		};

		const o = new OWebXHR<Response>(url, {
			withCredentials: true,
			...options,
		});

		o.onFinish(event('onFinished'))
			.onError(event('onError'))
			.onFail(event('onFailed'))
			.onHttpError(event('onHttpError'))
			.onHttpSuccess(event('onHttpSuccess'))
			.onGoodNews(event('onGoodNews'))
			.onBadNews(event('onBadNews'))
			.onDownloadProgress(event('onDownloadProgress'))
			.onUploadProgress(event('onUploadProgress'))
			.onResponse(event('onResponse'));

		return o;
	}

	/**
	 * Store getter.
	 */
	get store(): ReturnType<Options['store']> {
		return this._store as any;
	}

	/**
	 * Pager instance getter.
	 */
	get pager(): ReturnType<Options['pager']> {
		return this._pager as any;
	}

	/**
	 * App name getter.
	 */
	getAppName(): string {
		return this.options.name;
	}

	/**
	 * Checks if we are running in mobile app.
	 */
	isMobileApp(): boolean {
		return 'cordova' in window;
	}

	/**
	 * Returns new form validator instance.
	 *
	 * @param form The html form element.
	 * @param required The required fields names list.
	 * @param excluded The fields names to exclude.
	 * @param checkAll Force the validator to check all fields.
	 * @param verbose Log warning.
	 */
	getFormValidator(
		form: OForm,
		required: string[] = [],
		excluded: string[] = [],
		checkAll = false,
		verbose = false
	): OWebFormValidator {
		return new OWebFormValidator(
			this,
			form,
			required,
			excluded,
			checkAll,
			verbose
		);
	}

	/**
	 * Force login.
	 *
	 * > This will clear all saved data in the local storage.
	 */
	forceLogin():void {
		this.ls.clear();
		this.showLoginPage({});
	}

	/**
	 * Reload the app.
	 */
	reloadApp():void {
		// TODO: instead of reloading the current location, find a way to browse to web app entry point
		// for android & ios restart the app
		// window.location.reload(true);
		this.showHomePage({});
	}

	/**
	 * Destroy the app.
	 *
	 * > This will clear all saved data in the local storage.
	 */
	destroyApp():void {
		// erase data
		this.ls.clear();
		this.reloadApp();
	}

	/**
	 * Close app.
	 */
	closeApp():void {
		// cordova
		if (window.navigator && (window.navigator as any).app) {
			(window.navigator as any).app.exitApp();
		} else {
			window.close();
		}
	}

	/**
	 * To start the web app.
	 */
	start(): this {
		logger.info('[OWebApp] app started!');
		this.trigger(OWebApp.EVT_APP_READY);
		return this;
	}

	/**
	 * Called when app should show the home page.
	 */
	showHomePage(options: ORouteStateObject = {}):void {
		this.trigger(OWebApp.EVT_SHOW_HOME, [options]);
	}

	/**
	 * Called when app should show the login page.
	 */
	showLoginPage(options: ORouteStateObject = {}):void {
		this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
	}

	/**
	 * Called when app should show the registration page.
	 */
	showRegistrationPage(options: ORouteStateObject = {}):void {
		this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
	}

	/**
	 * Register handler for OWebApp.EVT_APP_READY event
	 *
	 * @param handler
	 */
	onReady(handler: (this: this) => void | boolean):this {
		return this.on(OWebApp.EVT_APP_READY, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_HOME event
	 *
	 * @param handler
	 */
	onShowHomePage(
		handler: (this: this, options: ORouteStateObject) => void | boolean
	):this {
		return this.on(OWebApp.EVT_SHOW_HOME, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_LOGIN event
	 *
	 * @param handler
	 */
	onShowLoginPage(
		handler: (this: this, options: ORouteStateObject) => void | boolean
	) :this{
		return this.on(OWebApp.EVT_SHOW_LOGIN, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
	 *
	 * @param handler
	 */
	onShowRegistrationPage(
		handler: (this: this, options: ORouteStateObject) => void | boolean
	):this {
		return this.on(OWebApp.EVT_SHOW_REGISTRATION_PAGE, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_NOT_FOUND event
	 *
	 * @param handler
	 */
	onPageNotFound(
		handler: (this: this, target: ORouteTarget) => void | boolean
	):this {
		return this.on(OWebApp.EVT_NOT_FOUND, handler);
	}

	/**
	 * Creates new app instance.
	 *
	 * @param options
	 */
	static create<Options extends OAppOptions<OStore, OPage, OUser> = any>(
		options: Options
	): OWebApp<any, any, any, Options> {
		return new OWebApp(options);
	}
}
