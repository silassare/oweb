import {
	OWebConfigs,
	OWebEvent,
	OWebCurrentUser,
	OWebView,
	OWebDataStore,
	OWebDate,
	OWebCom,
	OWebFormValidator,
	OWebService,
	tConfigList,
	OWebUrl,
	OWebRouter,
	tUrlList,
	iComResponse
} from "./oweb";

const noop = () => {
};

export default abstract class OWebApp extends OWebEvent {

	static readonly EVT_APP_READY = "OWebApp:ready";
	static readonly SELF          = "OWebApp";

	readonly view: OWebView;
	readonly router: OWebRouter;
	readonly user: OWebCurrentUser;
	readonly configs: OWebConfigs;
	readonly url: OWebUrl;
	readonly services: { [key: string]: OWebService<any> } = {};

	protected constructor(private readonly app_name: string, app_config_list: tConfigList, app_url_list: tUrlList) {
		super();
		this.configs  = new OWebConfigs(this, app_config_list);
		this.url      = new OWebUrl(this, app_url_list);
		this.user     = new OWebCurrentUser(this);
		this.view     = new OWebView();
		let base_url  = this.configs.get("OW_APP_LOCAL_BASE_URL"),
			hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE");
		this.router   = new OWebRouter(base_url, hash_mode);
	}

	getAppName() {
		return this.app_name;
	}

	start() {
		console.log("[OWebApp] app started!");
		this.trigger(OWebApp.EVT_APP_READY);
	}

	getService<T = any>(service_name: string): OWebService<T> | undefined {
		return this.services[service_name];
	}

	registerService<T extends OWebService<any>>(service: T): this {

		let service_name = service.getName();

		if (this.services[service_name]) {
			throw new Error(`A service with the name "${service_name}" already defined.`);
		}

		this.services[service_name] = service;

		return this;
	}

	getFormValidator(form: HTMLFormElement, required: Array<string> = [], excluded: Array<string> = []) {
		return new OWebFormValidator(this, form, required, excluded);
	}

	forceLogin() {
		OWebDataStore.clear();
		this.reloadApp();
	}

	reloadApp() {
		// TODO: instead of reloading the current location, find a way to browse to web app entry point
		// for android & ios restart the app
		window.location.reload(true);
	}

	destroyApp() {
		// erase data
		OWebDataStore.clear();
		this.reloadApp();
	}

	sessionActive(): boolean {
		let now    = (new Date()).getTime();// milliseconds
		let hour   = 60 * 60;// seconds
		let expire = this.user.getSessionExpire() - hour;// seconds
		return (expire * 1000) > now;
	}

	userVerified(): boolean {
		return this.user.getCurrentUser() && this.sessionActive();
	}

	requestPromise(method: string, url: string, data: any, freeze: boolean = false): Promise<iComResponse> {
		let m = this;
		return new Promise<iComResponse>(function (resolve, reject) {
			m.request(method, url, data, resolve, reject, freeze);
		});
	}

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

	abstract showHomePage(): this

	abstract showLoginPage(): this

	abstract showSignUpPage(): this
};
