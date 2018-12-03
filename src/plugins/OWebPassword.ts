import OWebApp from "../OWebApp";
import {iComResponse} from "../OWebCom";
import OWebEvent from "../OWebEvent";
import Utils from "../utils/Utils";

export default class OWebPassword extends OWebEvent {

	static readonly SELF                  = Utils.id();
	static readonly EVT_PASS_EDIT_SUCCESS = Utils.id();
	static readonly EVT_PASS_EDIT_ERROR   = Utils.id();

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	editPass(form: HTMLFormElement, uid?: string) {
		let m        = this,
			url      = m.app_context.url.get("OZ_SERVER_PASSWORD_SERVICE"),
			required = uid ? ["pass", "vpass"] : ["cpass", "pass", "vpass"],
			ofv      = this.app_context.getFormValidator(form, required),
			formData;

		if (!ofv.validate()) {
			return;
		}

		formData = ofv.getFormData(required);
		formData.append("action", "edit");

		if (uid) {
			formData.append("uid", uid);
		}

		m.app_context.request("POST", url, formData, function (response: any) {
			m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
		}, function (response: any) {
			m.trigger(OWebPassword.EVT_PASS_EDIT_ERROR, [response]);
		}, true);
	}

	onError(handler: (response: iComResponse) => void): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_ERROR, handler);
	}

	onSuccess(handler: (response: iComResponse) => void): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
	}
};
