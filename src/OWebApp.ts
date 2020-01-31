import OWebCom, { iComResponse } from './OWebCom';
import OWebConfigs, { tConfigList } from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter, { tRouteTarget, tRouteStateObject } from './OWebRouter';
import OWebUrl, { tUrlList } from './OWebUrl';
import OWebView from './OWebView';
import OWebDate from './plugins/OWebDate';
import Utils from './utils/Utils';
import OWebI18n from './OWebI18n';
import OWebPager from './OWebPager';

/**
 * @ignore
 */
const noop = () => {};

export default class OWebApp extends OWebEvent {
	static readonly SELF = Utils.id();
	static readonly EVT_APP_READY = Utils.id();
	static readonly EVT_NOT_FOUND = Utils.id();
	static readonly EVT_SHOW_HOME = Utils.id();
	static readonly EVT_SHOW_LOGIN = Utils.id();
	static readonly EVT_SHOW_REGISTRATION_PAGE = Utils.id();

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
	 * @param state The app state.
	 */
	protected constructor(
		private readonly name: string,
		configs: tConfigList,
		urls: tUrlList
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
			base_url = this.configs.get('OW_APP_LOCAL_BASE_URL'),
			hash_mode = false !== this.configs.get('OW_APP_ROUTER_HASH_MODE');

		this.router = new OWebRouter(base_url, hash_mode, function(
			target: tRouteTarget
		) {
			ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
		});

		this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));

		let api_key_header = this.configs.get('OZ_API_KEY_HEADER_NAME');
		this._requestDefaultOptions.headers = {
			[api_key_header]: this.configs.get('OZ_API_KEY'),
		};
	}

	/**
	 * Get request default options
	 */
	getRequestDefaultOptions() {
		return Utils.copy(this._requestDefaultOptions);
	}

	/**
	 * Set session token
	 */
	setSessionToken(token: string) {
		let header_name = this.configs.get('OZ_SESSION_TOKEN_HEADER_NAME');

		if (header_name && token) {
			this._requestDefaultOptions.headers[header_name] = token;
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
		required: Array<string> = [],
		excluded: Array<string> = [],
		checkAll: boolean = false
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
		let now = new Date().getTime(); // milliseconds
		let hour = 60 * 60; // seconds
		let expire = this.user.getSessionExpire() - hour; // seconds
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
		freeze: boolean = false
	): Promise<iComResponse> {
		let m = this;
		return new Promise<iComResponse>(function(resolve, reject) {
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
		success: (this: OWebCom, response: iComResponse) => void = noop,
		fail: (this: OWebCom, response: iComResponse) => void = noop,
		freeze: boolean = false
	): OWebCom {
		let app = this;

		if (freeze) {
			app.view.freeze();
		}

		let options = {
			url: url,
			method: method,
			data: data,
			badNewsShow: false,
		};

		let com = new OWebCom(this, options);
		com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response: iComResponse) => {
			// setTimeout(function () {
			if (freeze) {
				app.view.unfreeze();
			}

			success.call(com, response);
			// }, 1000);
		})
			.on(OWebCom.EVT_COM_REQUEST_ERROR, (response: iComResponse) => {
				if (response['msg'] === 'OZ_ERROR_YOU_ARE_NOT_ADMIN') {
					app.destroyApp();
				}

				if (freeze) {
					app.view.unfreeze();
				}

				fail.call(com, response);
			})
			.on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
				if (freeze) {
					app.view.unfreeze();
				}
				let response: iComResponse = {
					error: 1,
					msg: 'OZ_ERROR_REQUEST_FAIL',
					utime: OWebDate.timestamp(),
				};

				response.neterror = true;

				fail.call(com, response);
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
		handler: (this: this, options: tRouteStateObject) => void | boolean
	) {
		return this.on(OWebApp.EVT_SHOW_HOME, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_LOGIN event
	 *
	 * @param handler
	 */
	onShowLoginPage(
		handler: (this: this, options: tRouteStateObject) => void | boolean
	) {
		return this.on(OWebApp.EVT_SHOW_LOGIN, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
	 *
	 * @param handler
	 */
	onShowRegistrationPage(
		handler: (this: this, options: tRouteStateObject) => void | boolean
	) {
		return this.on(OWebApp.EVT_SHOW_REGISTRATION_PAGE, handler);
	}

	/**
	 * Register handler for OWebApp.EVT_NOT_FOUND event
	 *
	 * @param handler
	 */
	onPageNotFound(
		handler: (this: this, target: tRouteTarget) => void | boolean
	) {
		return this.on(OWebApp.EVT_NOT_FOUND, handler);
	}
}
