"use strict";

import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebDataStore from "./OWebDataStore";
import OWebDate from "./plugins/OWebDate";
import Utils from "./utils/Utils";
import OWebCom, {tComResponse} from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs, {tConfigList} from "./OWebConfigs";
import OWebUrl, {tUrlList} from "./OWebUrl";
import OWebRouter from "./OWebRouter";

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

	getService<T>(service_name: string): OWebService<T> {
		return this.services[service_name];
	}

	registerService(service_name: string): this {

		if (!this.services[service_name]) {
			this.services[service_name] = new OWebService(this, service_name);
		}

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

	requestPromise(method: string, url: string, data: any, freeze: boolean = false): Promise<tComResponse> {
		let m = this;
		return new Promise<tComResponse>(function (resolve, reject) {
			m.request(method, url, data, resolve, reject, freeze);
		});
	}

	request(method: string, url: string, data: any, success: (response: tComResponse) => void = noop, fail: (response: tComResponse) => void = noop, freeze: boolean = false): OWebCom {
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
		com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response: tComResponse) => {
			// setTimeout(function () {
			if (freeze) {
				app.view.unfreeze();
			}

			success(response);
			// }, 1000);
		}).on(OWebCom.EVT_COM_REQUEST_ERROR, (response: tComResponse) => {
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
			let response: tComResponse = {
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
