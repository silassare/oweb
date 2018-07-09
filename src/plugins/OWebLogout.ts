"use strict";

import OWebApp from "../OWebApp";
import OWebEvent from "../OWebEvent";

export default class OWebLogout extends OWebEvent {
	static readonly EVT_LOGOUT_ERROR   = "OWebLogout:error";
	static readonly EVT_LOGOUT_SUCCESS = "OWebLogout:success";
	static readonly SELF               = "OWebLogout";

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	logout() {
		let m   = this,
			url = this.app_context.url.get("OZ_SERVER_LOGOUT_SERVICE");

		this.app_context.request("POST", url, null, function (response: any) {
			m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
		}, function (response: any) {
			m.trigger(OWebLogout.EVT_LOGOUT_ERROR, [response]);
		}, true);
	}
};
