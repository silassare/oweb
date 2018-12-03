import OWebApp from "../OWebApp";
import {iComResponse} from "../OWebCom";
import OWebEvent from "../OWebEvent";
import Utils from "../utils/Utils";

export default class OWebAccountRecovery extends OWebEvent {

	static readonly SELF             = Utils.id();
	static readonly EVT_AR_NEXT_STEP = Utils.id();
	static readonly EVT_AR_SUCCESS   = Utils.id();
	static readonly EVT_AR_ERROR     = Utils.id();

	static readonly AR_STEP_START    = 1;
	static readonly AR_STEP_VALIDATE = 2;
	static readonly AR_STEP_END      = 3;

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	stepStart(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["phone"]),
			formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(["phone", "cc2"]);
			formData.set("step", String(OWebAccountRecovery.AR_STEP_START));
			this._sendForm(form, formData, OWebAccountRecovery.AR_STEP_VALIDATE);
		}
	}

	stepValidate(form: HTMLFormElement) {
		let ofv = this.app_context.getFormValidator(form, ["code"]);

		if (ofv.validate()) {
			this._sendForm(form, {
				"step": OWebAccountRecovery.AR_STEP_VALIDATE,
				"code": ofv.getField("code")
			}, OWebAccountRecovery.AR_STEP_END);
		}

	}

	stepEnd(form: HTMLFormElement) {
		let required = ["pass", "vpass"],
			ofv      = this.app_context.getFormValidator(form, required),
			formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(required);
			formData.set("step", String(OWebAccountRecovery.AR_STEP_END));

			this._sendForm(form, formData);
		}
	}

	onError(handler: (response: iComResponse) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_ERROR, handler);
	}

	onNextStep(handler: (response: iComResponse, step: number) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_NEXT_STEP, handler);
	}

	onSuccess(handler: (response: iComResponse) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
	}

	_sendForm(form: HTMLFormElement, data: any, next_step?: number) {
		let m   = this,
			url = m.app_context.url.get("OZ_SERVER_ACCOUNT_RECOVERY_SERVICE");

		m.app_context.request("POST", url, data, function (response: any) {
			if (next_step) {
				m.trigger(OWebAccountRecovery.EVT_AR_NEXT_STEP, [response, next_step]);
			} else {
				m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
			}
		}, function (response: any) {
			m.trigger(OWebAccountRecovery.EVT_AR_ERROR, [response]);
		}, true);
	}
};
