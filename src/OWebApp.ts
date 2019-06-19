import OWebCom, {iComResponse} from "./OWebCom";
import OWebConfigs, {tConfigList} from "./OWebConfigs";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebDataStore from "./OWebDataStore";
import OWebEvent from "./OWebEvent";
import OWebFormValidator from "./OWebFormValidator";
import OWebRouter, {tRouteTarget} from "./OWebRouter";
import OWebService from "./OWebService";
import OWebUrl, {tUrlList} from "./OWebUrl";
import OWebView, {tViewDialog} from "./OWebView";
import OWebDate from "./plugins/OWebDate";
import Utils from "./utils/Utils";
import OWebI18n from "./OWebI18n";
import OWebPager, {iPage} from "./OWebPager";

/**
 * @ignore
 */
const noop = () => {
};

export interface iAppState {
	ready: boolean,
	splash: boolean,
	frozen: boolean,
	show_nav: boolean,
	current_page?: iPage,
	dialogs: tViewDialog[]
}

export interface iAppStateOptions {
	ready?: boolean,
	splash?: boolean,
	frozen?: boolean,
	show_nav?: boolean,
	current_page?: iPage,
	dialogs?: tViewDialog[]
}

export default abstract class OWebApp extends OWebEvent {

	static readonly SELF          = Utils.id();
	static readonly EVT_APP_READY = Utils.id();

	readonly state: iAppState;
	readonly view: OWebView;
	readonly pager: OWebPager;
	readonly ls: OWebDataStore;
	readonly router: OWebRouter;
	readonly user: OWebCurrentUser;
	readonly configs: OWebConfigs;
	readonly url: OWebUrl;
	readonly services: { [key: string]: OWebService<any> } = {};
	readonly i18n: OWebI18n;

	/**
	 * OWebApp constructor.
	 *
	 * @param name The app name.
	 * @param configs The app config.
	 * @param urls The app url list.
	 * @param state The app state.
	 */
	protected constructor(private readonly name: string, configs: tConfigList, urls: tUrlList, state: iAppStateOptions = ({} as iAppStateOptions)) {
		super();

		this.state = {
			ready       : false,
			frozen      : false,
			splash      : true,
			show_nav    : true,
			current_page: undefined,
			dialogs     : [],
			...state
		};

		this.ls       = new OWebDataStore(this);
		this.configs  = new OWebConfigs(this, configs);
		this.url      = new OWebUrl(this, urls);
		this.user     = new OWebCurrentUser(this);
		this.view     = new OWebView();
		this.pager    = new OWebPager(this);
		this.i18n     = new OWebI18n(this);
		let base_url  = this.configs.get("OW_APP_LOCAL_BASE_URL"),
			hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE"),
			m         = this;
		this.router   = new OWebRouter(base_url, hash_mode);

		this.router.notFound(this.showNotFound.bind(this));

		this.i18n.setDefaultLang(this.configs.get("OW_APP_DEFAULT_LANG"));

		this.pager.on(OWebPager.EVT_PAGE_CHANGE, () => {
			m.state.current_page = m.pager.getActivePage();
		});

		this.view.onFreeze(() => {
			m.state.frozen = true;
		}).onUnFreeze(() => {
			m.state.frozen = false;
		}).onDialog((dialog: tViewDialog, can_use_alert: boolean) => {

			let {text, data} = dialog;

			if (text && text.length) {
				if (can_use_alert && m.isMobileApp()) {
					alert(m.i18n.toHuman(text, data));
				} else {
					m.state.dialogs.push(dialog);
				}
			}
		});
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
		return "cordova" in window;
	}

	/**
	 * To start the web app.
	 */
	start(): this {
		console.log("[OWebApp] app started!");
		this.trigger(OWebApp.EVT_APP_READY);
		return this;
	}

	/**
	 * Returns registered service with a given name.
	 *
	 * @param service_name The service name.
	 */
	getService<T = any>(service_name: string): OWebService<T> | undefined {
		return this.services[service_name];
	}

	/**
	 * Register a new service.
	 *
	 * @param service The service object.
	 */
	registerService<T extends OWebService<any>>(service: T): this {

		let service_name = service.getName();

		if (this.services[service_name]) {
			throw new Error(`A service with the name "${service_name}" already defined.`);
		}

		this.services[service_name] = service;

		return this;
	}

	/**
	 * Returns new form validator instance.
	 *
	 * @param form The html form element.
	 * @param required The required fields names list.
	 * @param excluded The fields names to exclude.
	 * @param checkAll Force the validator to check all fields.
	 */
	getFormValidator(form: HTMLFormElement, required: Array<string> = [], excluded: Array<string> = [], checkAll: boolean = false) {
		return new OWebFormValidator(this, form, required, excluded, checkAll);
	}

	/**
	 * Force login.
	 *
	 * > This will clear all saved data in the local storage.
	 */
	forceLogin() {
		this.ls.clear();
		this.showLoginPage();
	}

	/**
	 * Reload the app.
	 */
	reloadApp() {
		// TODO: instead of reloading the current location, find a way to browse to web app entry point
		// for android & ios restart the app
		// window.location.reload(true);
		this.showHomePage();
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
		let now    = (new Date()).getTime();// milliseconds
		let hour   = 60 * 60;// seconds
		let expire = this.user.getSessionExpire() - hour;// seconds
		return (expire * 1000) > now;
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
	requestPromise(method: string, url: string, data: any, freeze: boolean = false): Promise<iComResponse> {
		let m = this;
		return new Promise<iComResponse>(function (resolve, reject) {
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
	request(method: string, url: string, data: any, success: (this: OWebCom, response: iComResponse) => void = noop, fail: (this: OWebCom, response: iComResponse) => void = noop, freeze: boolean = false): OWebCom {
		let app = this;

		if (freeze) {
			app.view.freeze();
		}

		let options = {
			url        : url,
			method     : method,
			data       : data,
			badNewsShow: false
		};

		let com = new OWebCom(this, options);
		com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response: iComResponse) => {
			// setTimeout(function () {
			if (freeze) {
				app.view.unfreeze();
			}

			success.call(com, response);
			// }, 1000);
		}).on(OWebCom.EVT_COM_REQUEST_ERROR, (response: iComResponse) => {
			if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
				app.destroyApp();
			}

			if (freeze) {
				app.view.unfreeze();
			}

			fail.call(com, response);
		}).on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
			if (freeze) {
				app.view.unfreeze();
			}
			let response: iComResponse = {
				"error": 1,
				"msg"  : "OZ_ERROR_REQUEST_FAIL",
				"utime": OWebDate.timestamp()
			};

			response.neterror = true;

			fail.call(com, response);
		}).send();

		return com;
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
	 * Called when app should show the home page.
	 */
	abstract showHomePage(): this

	/**
	 * Called when the requested route was not found.
	 */
	abstract showNotFound(target: tRouteTarget): this

	/**
	 * Called when app should show the login page.
	 */
	abstract showLoginPage(): this

	/**
	 * Called when app should show the signup page.
	 */
	abstract showSignUpPage(): this
};
