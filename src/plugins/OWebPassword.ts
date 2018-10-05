import OWebApp from "../OWebApp";
import {iComResponse} from "../OWebCom";
import OWebEvent from "../OWebEvent";

export default class OWebPassword extends OWebEvent {

	static readonly PASS_EDIT_STEP_START    = 1;
	static readonly PASS_EDIT_STEP_VALIDATE = 2;
	static readonly PASS_EDIT_STEP_END      = 3;

	static readonly EVT_PASS_EDIT_NEXT_STEP = "OWebPassword:next_step";
	static readonly EVT_PASS_EDIT_SUCCESS   = "OWebPassword:success";
	static readonly EVT_PASS_EDIT_ERROR     = "OWebPassword:error";
	static readonly SELF                    = "OWebPassword";

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	stepStart(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["phone"]),
			formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(["phone", "cc2"]);
			formData.set("step", String(OWebPassword.PASS_EDIT_STEP_START));
			this._sendForm(form, formData, OWebPassword.PASS_EDIT_STEP_VALIDATE);
		}
	}

	stepValidate(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["code"]);

		if (ofv.validate()) {
			this._sendForm(form, {
				"step": OWebPassword.PASS_EDIT_STEP_VALIDATE,
				"code": ofv.getField("code")
			}, OWebPassword.PASS_EDIT_STEP_END);
		}

	}

	stepEnd(form: HTMLFormElement) {
		let required = ["pass", "vpass"],
			ofv      = this.app_context.getFormValidator(form, required),
			formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(required);
			formData.set("step", String(OWebPassword.PASS_EDIT_STEP_END));

			this._sendForm(form, formData);
		}
	}

	onError(handler: (response: iComResponse) => void):this {
		return this.on(OWebPassword.EVT_PASS_EDIT_ERROR, handler);
	}

	onNextStep(handler: (response: iComResponse, step: number) => void):this {
		return this.on(OWebPassword.EVT_PASS_EDIT_NEXT_STEP, handler);
	}

	onSuccess(handler: (response: iComResponse) => void) :this{
		return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
	}

	_sendForm(form: HTMLFormElement, data: any, next_step?: number) {
		let m   = this,
			url = m.app_context.url.get("OZ_SERVER_PASS_EDIT_SERVICE");

		m.app_context.request("POST", url, data, function (response: any) {
			if (next_step) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_NEXT_STEP, [response, next_step]);
			} else {
				m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
			}
		}, function (response: any) {
			m.trigger(OWebPassword.EVT_PASS_EDIT_ERROR, [response]);
		}, true);
	}
};
