"use strict";

import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebDataStore from "./OWebDataStore";
import Utils from "./utils/Utils";
import OWebCom from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs, {tConfigList} from "./OWebConfigs";
import {iPage, default as OWebPage} from "./OWebPage";
import OWebUrl, {tUrlList} from "./OWebUrl";

export default class OWebApp extends OWebEvent {

	static readonly EVT_APP_READY = "OWebApp:ready";
	static readonly SELF          = "OWebApp";

	private readonly pages: { [key: string]: iPage } = {};

	readonly view: OWebView;
	readonly user: OWebCurrentUser;
	readonly configs: OWebConfigs;
	readonly url: OWebUrl;
	readonly services: { [key: string]: OWebService } = {};

	constructor(private readonly app_name: string, app_config: tConfigList, app_url: tUrlList) {
		super();
		this.configs = new OWebConfigs(this, app_config);
		this.url     = new OWebUrl(this, app_url);
		this.user    = new OWebCurrentUser(this);
		this.view    = new OWebView();
	}

	getAppName() {
		return this.app_name;
	}

	start() {
		this.trigger(OWebApp.EVT_APP_READY);
	}

	getService(service_name: string): OWebService {
		return this.services[service_name];
	}

	registerService(service_name: string, item_id_name: string): this {

		if (!this.services[service_name]) {
			this.services[service_name] = new OWebService(this, service_name, item_id_name);
		}

		return this;
	}

	registerPage(page: OWebPage): this {
		let name = page.getPageName();
		if (name in this.pages) {
			console.warn(`OWebApp: page "${name}" will be redefined.`);
		}

		this.pages[name] = page;
		return this;
	}

	getPage(name: string): iPage {
		return this.pages[name];
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
		let data = this.user.getCurrentUserData();
		return Utils.isPlainObject(data) && this.sessionActive();
	}

	/*
	 getLoginPageName: function() {
	 return "PAGE_USER_LOGIN";
	 },
	 logInFirst : function(then) {
	 let app  = this;
	 let next = function(user_data) {
	 app.user.setCurrentUserData(user_data, true);
	 Utils.callback(then, [user_data]);
	 };

	 if (!this.userVerified()) {
	 OWebPage.showPage(this.getLoginPageName(), {"next": next}, null,
	 false);
	 } else {
	 Utils.callback(then, [app.user.getCurrentUserData()]);
	 }
	 },
	 */
	request(method: string, url: string, data: any, success?: Function, fail?: Function, freeze: boolean = false): OWebCom {
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
		com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response: any) => {
			setTimeout(function () {
				if (freeze) {
					app.view.unfreeze();
				}

				Utils.callback(success, [response]);
			}, 1000);
		}).on(OWebCom.EVT_COM_REQUEST_ERROR, (response: any) => {
			if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
				app.destroyApp();
			}

			if (freeze) {
				app.view.unfreeze();
			}

			Utils.callback(fail, [response]);
		}).on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
			if (freeze) {
				app.view.unfreeze();
			}

			Utils.callback(fail, [{"error": 1, "msg": "OZ_ERROR_REQUEST_FAIL", "is_network": true}]);
		}).send();

		return com;
	}
};
