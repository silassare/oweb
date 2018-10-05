import OWebApp from "../OWebApp";
import {iComResponse} from "../OWebCom";
import OWebEvent from "../OWebEvent";

export default class OWebSignUp extends OWebEvent {

	static readonly SIGN_UP_STEP_START    = 1;
	static readonly SIGN_UP_STEP_VALIDATE = 2;
	static readonly SIGN_UP_STEP_END      = 3;

	static readonly EVT_SIGN_UP_NEXT_STEP = "OWebSignUp:next_step";
	static readonly EVT_SIGN_UP_SUCCESS   = "OWebSignUp:success";
	static readonly EVT_SIGN_UP_ERROR     = "OWebSignUp:error";
	static readonly SELF                  = "OWebSignUp";

	constructor(private readonly app_context: OWebApp) {
		super()
	}

	stepStart(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["phone"]);

		if (ofv.validate()) {
			let form_data = ofv.getFormData(["phone", "cc2"]);
			form_data.set("step", String(OWebSignUp.SIGN_UP_STEP_START));
			this._sendForm(form, form_data, OWebSignUp.SIGN_UP_STEP_VALIDATE);
		}
	}

	stepValidate(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["code"]);

		if (ofv.validate()) {

			let code = ofv.getField("code");

			this._sendForm(form, {
				"step": OWebSignUp.SIGN_UP_STEP_VALIDATE,
				"code": code
			}, OWebSignUp.SIGN_UP_STEP_END);
		}

	}

	stepEnd(form: HTMLFormElement) {

		let required = ["uname", "pass", "vpass", "birth_date", "gender"],
			excluded = [],
			mailInput: HTMLInputElement | null,
			agreeChk: HTMLInputElement | null;

		if (mailInput = form.querySelector("input[name=email]")) {
			if (!mailInput.value.trim().length) {
				excluded.push("email");
			} else {
				required.push("email");
			}
		}

		let ofv = this.app_context.getFormValidator(form, required, excluded),
			formData;

		if (ofv.validate()) {

			if ((agreeChk = form.querySelector("input[name=oweb_signup_cgu_agree_checkbox]")) && !agreeChk.checked) {
				let error: iComResponse = {
					error: 1,
					msg  : "OZ_ERROR_SHOULD_ACCEPT_CGU",
					utime: 0
				};
				this.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [error]);
				return false;
			}

			formData = ofv.getFormData(required);
			formData.set("step", String(OWebSignUp.SIGN_UP_STEP_END));

			this._sendForm(form, formData);
		}

	}

	onError(handler: (response: iComResponse) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_ERROR, handler);
	}

	onNextStep(handler: (response: iComResponse, step: number) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, handler);
	}

	onSuccess(handler: (response: iComResponse) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
	}

	_sendForm(form: HTMLFormElement, data: any, next_step?: number) {
		let m   = this,
			url = this.app_context.url.get("OZ_SERVER_SIGNUP_SERVICE");

		this.app_context.request("POST", url, data, function (response: any) {
			if (next_step) {
				m.trigger(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, [response, next_step]);
			} else {
				m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
			}
		}, function (response: any) {
			m.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [response]);
		}, true);
	}
};
