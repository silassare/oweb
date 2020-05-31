import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';

export default class OWebSignUp extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_SIGN_UP_NEXT_STEP = id();
	static readonly EVT_SIGN_UP_SUCCESS = id();
	static readonly EVT_SIGN_UP_ERROR = id();

	static readonly SIGN_UP_STEP_START = 1;
	static readonly SIGN_UP_STEP_VALIDATE = 2;
	static readonly SIGN_UP_STEP_END = 3;

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	stepStart(form: HTMLFormElement) {
		const ofv = this.appContext.getFormValidator(form, ['phone']);

		if (ofv.validate()) {
			const formData = ofv.getFormData(['phone', 'cc2']);
			formData.set('step', String(OWebSignUp.SIGN_UP_STEP_START));
			this._sendForm(form, formData, OWebSignUp.SIGN_UP_STEP_VALIDATE);
		}
	}

	stepValidate(form: HTMLFormElement) {
		const ofv = this.appContext.getFormValidator(form, ['code']);

		if (ofv.validate()) {
			const code = ofv.getField('code');

			this._sendForm(
				form,
				{
					step: OWebSignUp.SIGN_UP_STEP_VALIDATE,
					code,
				},
				OWebSignUp.SIGN_UP_STEP_END,
			);
		}
	}

	stepEnd(form: HTMLFormElement) {
		const required = ['uname', 'pass', 'vpass', 'birth_date', 'gender'],
			excluded = [];
		let mailInput: HTMLInputElement | null,
			agreeChk: HTMLInputElement | null,
			ofv,
			formData;

		mailInput = form.querySelector('input[name=email]');

		if (mailInput) {
			if (!mailInput.value.trim().length) {
				excluded.push('email');
			} else {
				required.push('email');
			}
		}

		ofv = this.appContext.getFormValidator(form, required, excluded);

		if (ofv.validate()) {
			agreeChk = form.querySelector(
				'input[name=oweb_signup_cgu_agree_checkbox]',
			);

			if (agreeChk && !agreeChk.checked) {
				const error: IComResponse = {
					error: 1,
					msg: 'OZ_ERROR_SHOULD_ACCEPT_CGU',
					utime: 0,
				};
				this.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [error]);
				return false;
			}

			formData = ofv.getFormData(required);
			formData.set('step', String(OWebSignUp.SIGN_UP_STEP_END));

			this._sendForm(form, formData);
		}
	}

	onError(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_ERROR, handler);
	}

	onNextStep(
		handler: (this: this, response: IComResponse, step: number) => void,
	): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, handler);
	}

	onSuccess(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
	}

	_sendForm(form: HTMLFormElement, data: any, nextStep?: number) {
		const m = this,
			url = this.appContext.url.get('OZ_SERVER_SIGNUP_SERVICE');

		this.appContext.request(
			'POST',
			url,
			data,
			function (response: any) {
				if (nextStep) {
					m.trigger(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, [
						response,
						nextStep,
					]);
				} else {
					m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
				}
			},
			function (response: any) {
				m.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [response]);
			},
			true,
		);
	}
}
