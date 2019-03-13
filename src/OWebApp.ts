import OWebCom, {iComResponse} from "./OWebCom";
import OWebConfigs, {tConfigList} from "./OWebConfigs";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebDataStore from "./OWebDataStore";
import OWebEvent from "./OWebEvent";
import OWebFormValidator from "./OWebFormValidator";
import OWebRouter from "./OWebRouter";
import OWebService from "./OWebService";
import OWebUrl, {tUrlList} from "./OWebUrl";
import OWebView from "./OWebView";
import OWebDate from "./plugins/OWebDate";
import Utils from "./utils/Utils";
import OWebLang from "./OWebLang";

/**
 * @ignore
 */
const noop = () => {
};

export default abstract class OWebApp extends OWebEvent {

	static readonly SELF          = Utils.id();
	static readonly EVT_APP_READY = Utils.id();

	readonly view: OWebView;
	readonly ls: OWebDataStore;
	readonly router: OWebRouter;
	readonly user: OWebCurrentUser;
	readonly configs: OWebConfigs;
	readonly url: OWebUrl;
	readonly services: { [key: string]: OWebService<any> } = {};
	readonly i18n: OWebLang;

	/**
	 * OWebApp constructor.
	 *
	 * @param app_name The app name.
	 * @param app_config_list The app config.
	 * @param app_url_list The app url list.
	 */
	protected constructor(private readonly app_name: string, app_config_list: tConfigList, app_url_list: tUrlList) {
		super();
		this.ls       = new OWebDataStore(this);
		this.configs  = new OWebConfigs(this, app_config_list);
		this.url      = new OWebUrl(this, app_url_list);
		this.user     = new OWebCurrentUser(this);
		this.view     = new OWebView();
		this.i18n     = new OWebLang(this);
		let base_url  = this.configs.get("OW_APP_LOCAL_BASE_URL"),
			hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE");
		this.router   = new OWebRouter(base_url, hash_mode);
	}

	/**
	 * App name getter.
	 */
	getAppName(): string {
		return this.app_name;
	}

	/**
	 * Check if we are running in mobile app.
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
	 * Check if user session is active.
	 */
	sessionActive(): boolean {
		let now    = (new Date()).getTime();// milliseconds
		let hour   = 60 * 60;// seconds
		let expire = this.user.getSessionExpire() - hour;// seconds
		return (expire * 1000) > now;
	}

	/**
	 * Check if the current user has been authenticated.
	 */
	userVerified(): boolean {
		return Boolean(this.user.getCurrentUser() && this.sessionActive());
	}

	/**
	 * Sends request and return promise.
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
	request(method: string, url: string, data: any, success: (response: iComResponse) => void = noop, fail: (response: iComResponse) => void = noop, freeze: boolean = false): OWebCom {
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

			success(response);
			// }, 1000);
		}).on(OWebCom.EVT_COM_REQUEST_ERROR, (response: iComResponse) => {
			if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
				app.destroyApp();
			}

			if (freeze) {
				app.view.unfreeze();
			}

			fail(response);
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

			fail(response);
		}).send();

		return com;
	}

	/**
	 * Called when app should show the home page.
	 */
	abstract showHomePage(): this

	/**
	 * Called when app should show the login page.
	 */
	abstract showLoginPage(): this

	/**
	 * Called when app should show the signup page.
	 */
	abstract showSignUpPage(): this
};
