"use strict";

import Utils from "../utils/Utils";
import OWebEvent from "../OWebEvent";
import OWebApp from "../OWebApp";

export default class OWebTNet extends OWebEvent {

	static readonly STATE_UNKNOWN         = -1;
	static readonly STATE_NO_USER         = 0;
	static readonly STATE_OFFLINE_USER    = 1;
	static readonly STATE_VERIFIED_USER   = 2;
	static readonly STATE_SIGN_UP_PROCESS = 3;

	static readonly EVT_TNET_READY = "OWebTNet:ready";
	static readonly SELF           = "OWebTNet";

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	check() {
		let m   = this,
			url = this.app_context.url.get("OZ_SERVER_TNET_SERVICE");

		this.app_context.request("GET", url, null, function (response: any) {
			let data = response["data"],
				res;

			if (Utils.isPlainObject(data["_current_user"])) {
				// user is verified
				res = [OWebTNet.STATE_VERIFIED_USER, data["_current_user"]];

				m.app_context.user.setCurrentUser(data["_current_user"]);

			} else if (Utils.isPlainObject(data["_info_sign_up"])) {
				// user is in registration process
				res = [OWebTNet.STATE_SIGN_UP_PROCESS,
					data["_info_sign_up"]];
			} else {
				// no user
				res = [OWebTNet.STATE_NO_USER];
			}

			m.trigger(OWebTNet.EVT_TNET_READY, res);
		}, function () {
			let state = OWebTNet.STATE_UNKNOWN;

			if (m.app_context.userVerified()) {
				state = OWebTNet.STATE_OFFLINE_USER;
			}

			m.trigger(OWebTNet.EVT_TNET_READY, [state]);
		});

		return m;
	}
};