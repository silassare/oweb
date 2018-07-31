"use strict";

import OWebEvent from "../OWebEvent";
import OWebApp from "../OWebApp";

export default class OWebLogin extends OWebEvent {

	static readonly SELF              = "OWebLogin";
	static readonly EVT_LOGIN_ERROR   = "OWebLogin:error";
	static readonly EVT_LOGIN_SUCCESS = "OWebLogin:success";

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	loginWithEmail(form: HTMLFormElement) {
		let m   = this,
			ofv = this.app_context.getFormValidator(form, ["email", "pass"]);

		if (ofv.validate()) {
			let data = {
				email: ofv.getField("email"),
				pass : ofv.getField("pass")
			};

			m._tryLogin(data);
		}
	}

	loginWithPhone(form: HTMLFormElement) {
		let m   = this,
			ofv = this.app_context.getFormValidator(form, ["phone", "pass"]);

		if (ofv.validate()) {
			let data = {
				phone: ofv.getField("phone"),
				pass : ofv.getField("pass")
			};

			m._tryLogin(data);
		}
	}

	_tryLogin(data: any) {
		let m   = this,
			url = this.app_context.url.get("OZ_SERVER_LOGIN_SERVICE");

		this.app_context.request("POST", url, data, function (response: any) {
			m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
		}, function (response: any) {
			m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
		}, true);
	}
};
