import {OWebApp, OWebEvent} from "../oweb";

export default class OWebSignUp extends OWebEvent {

	static readonly SIGN_UP_STEP_START    = 1;
	static readonly SIGN_UP_STEP_VALIDATE = 2;
	static readonly SIGN_UP_STEP_END      = 3;

	static readonly EVT_NEXT_STEP       = "OWebSignUp:next_step";
	static readonly EVT_SIGN_UP_SUCCESS = "OWebSignUp:success";
	static readonly EVT_SIGN_UP_ERROR   = "OWebSignUp:error";
	static readonly SELF                = "OWebSignUp";

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

			if ((agreeChk = form.querySelector("input[name=oweb_cgu_agree_checkbox]")) && !agreeChk.checked) {
				this.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, ["OZ_ERROR_SHOULD_ACCEPT_CGU", form]);
				return false;
			}

			formData = ofv.getFormData(required);
			formData.set("step", String(OWebSignUp.SIGN_UP_STEP_END));

			this._sendForm(form, formData);
		}

	}

	_sendForm(form: HTMLFormElement, data: any, next_step?: number) {
		let m   = this,
			url = this.app_context.url.get("OZ_SERVER_SIGNUP_SERVICE");

		this.app_context.request("POST", url, data, function (response: any) {
			if (next_step) {
				m.trigger(OWebSignUp.EVT_NEXT_STEP, [{"response": response, "step": next_step,}]);
			} else {
				m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [{"response": response}]);
			}
		}, function (response: any) {
			m.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [{"step": next_step, "response": response}]);
		}, true);
	}
};
