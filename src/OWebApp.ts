import OWebCom, { IComResponse } from './OWebCom';
import OWebConfigs, { tConfigList } from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter, { tRouteStateObject, tRouteTarget } from './OWebRouter';
import OWebUrl, { tUrlList } from './OWebUrl';
import OWebView from './OWebView';
import OWebDate from './plugins/OWebDate';
import OWebI18n from './OWebI18n';
import OWebPager from './OWebPager';
import { clone, id, noop } from './utils/Utils';

export default class OWebApp extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_APP_READY = id();
	static readonly EVT_NOT_FOUND = id();
	static readonly EVT_SHOW_HOME = id();
	static readonly EVT_SHOW_LOGIN = id();
	static readonly EVT_SHOW_REGISTRATION_PAGE = id();

	private readonly _requestDefaultOptions: any = {
		headers: {},
	};

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
	protected constructor(
		private readonly name: string,
		configs: tConfigList,
		urls: tUrlList,
	) {
		super();

		this.ls = new OWebDataStore(this);
		this.configs = new OWebConfigs(this, configs);
		this.url = new OWebUrl(this, urls);
		this.user = new OWebCurrentUser(this);
		this.view = new OWebView();
		this.pager = new OWebPager(this);
		this.i18n = new OWebI18n();

		const ctx = this,
			baseUrl = this.configs.get('OW_APP_LOCAL_BASE_URL'),
			hashMode = false !== this.configs.get('OW_APP_ROUTER_HASH_MODE');

		this.router = new OWebRouter(baseUrl, hashMode, function (
			target: tRouteTarget,
		) {
			ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
		});

		this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));

		const apiKeyHeader = this.configs.get('OZ_API_KEY_HEADER_NAME');
		this._requestDefaultOptions.headers = {
			[apiKeyHeader]: this.configs.get('OZ_API_KEY'),
		};
	}

	/**
	 * Get request default options
	 */
	getRequestDefaultOptions() {
		return clone(this._requestDefaultOptions);
	}

	/**
	 * Set session token
	 */
	setSessionToken(token: string) {
		const headerName = this.configs.get('OZ_SESSION_TOKEN_HEADER_NAME');

		if (headerName && token) {
			this._requestDefaultOptions.headers[headerName] = token;
		}

		return this;
	}

	/**
	 * App name getter.
	 */
	getAppName(): string {
		return this.name;
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
		checkAll: boolean = false,
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
	 * Checks if user session is active.
	 */
	sessionActive(): boolean {
		const now = new Date().getTime(); // milliseconds
		const hour = 60 * 60; // seconds
		const expire = this.user.getSessionExpire() - hour; // seconds
		return expire * 1000 > now;
	}

	/**
	 * Checks if the current user has been authenticated.
	 */
	userVerified(): boolean {
		return Boolean(this.user.getCurrentUser() && this.sessionActive());
	}

	/**
	 * Send request and return promise.
	 *
	 * @param method The request method.
	 * @param url The request url.
	 * @param data The request payload.
	 * @param freeze Force app view to be frozen.
	 */
	requestPromise(
		method: string,
		url: string,
		data: any,
		freeze: boolean = false,
	): Promise<IComResponse> {
		const m = this;
		return new Promise<IComResponse>(function (resolve, reject) {
			m.request(method, url, data, resolve, reject, freeze);
		});
	}

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
	request(
		method: string,
		url: string,
		data: any,
		success: (response: IComResponse, com: OWebCom) => void = noop,
		fail: (response: IComResponse, com: OWebCom) => void = noop,
		freeze: boolean = false,
	): OWebCom {
		const app = this;

		if (freeze) {
			app.view.freeze();
		}

		const options = {
			url,
			method,
			data,
			badNewsShow: false,
		};

		const com = new OWebCom(this, options);
		com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response: IComResponse) => {
			if (freeze) {
				app.view.unfreeze();
			}

			success(response, com);
		})
			.on(OWebCom.EVT_COM_REQUEST_ERROR, (response: IComResponse) => {
				if (freeze) {
					app.view.unfreeze();
				}

				if (response.msg === 'OZ_ERROR_YOU_ARE_NOT_ADMIN') {
					app.destroyApp();
				}

				fail(response, com);
			})
			.on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
				const response: IComResponse = {
					error: 1,
					msg: 'OZ_ERROR_REQUEST_FAIL',
					utime: OWebDate.timestamp(),
					neterror: true,
				};
				if (freeze) {
					app.view.unfreeze();
				}

				fail(response, com);
			})
			.send();

		return com;
	}

	/**
	 * To start the web app.
	 */
	start(): this {
		console.log('[OWebApp] app started!');
		this.trigger(OWebApp.EVT_APP_READY);
		return this;
	}

	/**
	 * Called when app should show the home page.
	 */
	showHomePage(options: tRouteStateObject = {}) {
		this.trigger(OWebApp.EVT_SHOW_HOME, [options]);
	}

	/**
	 * Called when app should show the login page.
	 */
	showLoginPage(options: tRouteStateObject = {}) {
		this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
	}

	/**
	 * Called when app should show the registration page.
	 */
	showRegistrationPage(options: tRouteStateObject = {}) {
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
		handler: (this: this, options: tRouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_HOME, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_LOGIN event
	 *
	 * @param handler
	 */
	onShowLoginPage(
		handler: (this: this, options: tRouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_LOGIN, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
	 *
	 * @param handler
	 */
	onShowRegistrationPage(
		handler: (this: this, options: tRouteStateObject) => void | boolean,
	) {
		return this.on(OWebApp.EVT_SHOW_REGISTRATION_PAGE, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_NOT_FOUND event
	 *
	 * @param handler
	 */
	onPageNotFound(
		handler: (this: this, target: tRouteTarget) => void | boolean,
	) {
		return this.on(OWebApp.EVT_NOT_FOUND, handler);
	}
}
