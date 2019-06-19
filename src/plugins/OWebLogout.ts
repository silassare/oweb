import OWebApp from "../OWebApp";
import {iComResponse} from "../OWebCom";
import OWebEvent from "../OWebEvent";
import Utils from "../utils/Utils";
import OWebCom from "../OWebCom";

export default class OWebLogout extends OWebEvent {

	static readonly SELF               = Utils.id();
	static readonly EVT_LOGOUT_ERROR   = Utils.id();
	static readonly EVT_LOGOUT_SUCCESS = Utils.id();

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	onError(handler: (this: this, response: iComResponse) => void): this {
		return this.on(OWebLogout.EVT_LOGOUT_ERROR, handler);
	}

	onSuccess(handler: (this: this, response: iComResponse) => void): this {
		return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
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
