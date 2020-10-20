import OWebConfigs from './OWebConfigs';
import OWebDataStore, {OJSONSerializable} from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter, {ORouteStateObject, ORouteTarget} from './OWebRouter';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebI18n from './OWebI18n';
import {id, logger} from './utils';
import OZone from './ozone';
import OWebPager, {OPage} from './OWebPager';
import OWebUser from './OWebUser';

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
}

export interface OAppConfigs {
	[key: string]: OJSONSerializable;

	OW_APP_NAME: string;
	OW_APP_VERSION: string;
	OW_APP_LOCAL_BASE_URL: string;
	OW_APP_ROUTER_HASH_MODE: boolean;
	OW_APP_ALLOWED_COUNTRIES: string[];
	OW_APP_LOGO_SRC: string;
	OW_APP_ANDROID_ID: string;
	OW_APP_UPDATER_SCRIPT_SRC: string;

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
	[key: string]: OJSONSerializable;

	OW_APP_DEFAULT_LANG: string;
	OW_APP_COUNTRY: string;
}

export interface OStore {
	[key: string]: any;

	services: {
		[name: string]: any;
	};
}

export interface OAppOptions<Store extends OStore, Page extends OPage> {
	name: string;
	appConfigs: OAppConfigs;
	userConfigs: OUserConfigs;
	urls: OUrlList;
	user: (this: OWebApp<Store, Page, OAppOptions<Store, Page>>) => OWebUser<any>;
	store: (this: OWebApp<Store, Page, OAppOptions<Store, Page>>) => Store;
	pager: (this: OWebApp<Store, Page, OAppOptions<Store, Page>>) => OWebPager<Page>;
}

export default class OWebApp<Store extends OStore = any, Page extends OPage = any, Options extends OAppOptions<Store, Page> = any> extends OWebEvent {
	static readonly SELF                       = id();
	static readonly EVT_APP_READY              = id();
	static readonly EVT_NOT_FOUND              = id();
	static readonly EVT_SHOW_HOME              = id();
	static readonly EVT_SHOW_LOGIN             = id();
	static readonly EVT_SHOW_REGISTRATION_PAGE = id();

	readonly view: OWebView;
	readonly ls: OWebDataStore;
	readonly router: OWebRouter;
	readonly user: OWebUser<any>;
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
	protected constructor(
		private readonly options: Options,
	) {
		super();

		this.ls      = new OWebDataStore(this);
		this.configs = new OWebConfigs(this, options.appConfigs, options.userConfigs);
		this.url     = new OWebUrl(this, options.urls);
		this.view    = new OWebView();
		this.i18n    = new OWebI18n();
		this.user    = options.user.call(this);
		this._store  = options.store.call(this);
		this._pager  = options.pager.call(this);

		const ctx      = this,
			  baseUrl  = this.configs.get('OW_APP_LOCAL_BASE_URL'),
			  hashMode = this.configs.get('OW_APP_ROUTER_HASH_MODE');

		this.router = new OWebRouter(baseUrl, hashMode, function (
			target: ORouteTarget,
		) {
			ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
		});

		this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));

		this.oz = OZone.instantiate(this);
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
	 * Store services shortcut.
	 */
	get services(): ReturnType<Options['store']>['services'] {
		return this.store.services;
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
	 */
	getFormValidator(
		form: HTMLFormElement,
		required: string[] = [],
		excluded: string[] = [],
		checkAll           = false,
	) {
		return new OWebFormValidator(this, form, required, excluded, checkAll);
	}

	/**
	 * Force login.
	 *
	 * > This will clear all saved data in the local storage.
	 */
	forceLogin() {
		this.ls.clear();
		this.showLoginPage({});
	}

	/**
	 * Reload the app.
	 */
	reloadApp() {
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
	destroyApp() {
		// erase data
		this.ls.clear();
		this.reloadApp();
	}

	/**
	 * Close app.
	 */
	closeApp() {
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
	showHomePage(options: ORouteStateObject = {}) {
		this.trigger(OWebApp.EVT_SHOW_HOME, [options]);
	}

	/**
	 * Called when app should show the login page.
	 */
	showLoginPage(options: ORouteStateObject = {}) {
		this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
	}

	/**
	 * Called when app should show the registration page.
	 */
	showRegistrationPage(options: ORouteStateObject = {}) {
		this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
	}

	/**
	 * Register handler for OWebApp.EVT_APP_READY event
	 *
	 * @param handler
	 */
	onReady(handler: (this: this) => void | boolean) {
		return this.on(OWebApp.EVT_APP_READY, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_HOME event
	 *
	 * @param handler
	 */
	onShowHomePage(
		handler: (this: this, options: ORouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_HOME, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_LOGIN event
	 *
	 * @param handler
	 */
	onShowLoginPage(
		handler: (this: this, options: ORouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_LOGIN, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
	 *
	 * @param handler
	 */
	onShowRegistrationPage(
		handler: (this: this, options: ORouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_REGISTRATION_PAGE, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_NOT_FOUND event
	 *
	 * @param handler
	 */
	onPageNotFound(
		handler: (this: this, target: ORouteTarget) => void | boolean,
	) {
		return this.on(OWebApp.EVT_NOT_FOUND, handler);
	}

	/**
	 * Creates new app instance.
	 *
	 * @param options
	 */
	static create<Options extends OAppOptions<OStore, OPage> = any>(
		options: Options,
	) {
		return new OWebApp(options);
	}

}
