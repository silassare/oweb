import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';

export default class OWebAccountRecovery extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_AR_NEXT_STEP = id();
	static readonly EVT_AR_SUCCESS = id();
	static readonly EVT_AR_ERROR = id();

	static readonly AR_STEP_START = 1;
	static readonly AR_STEP_VALIDATE = 2;
	static readonly AR_STEP_END = 3;

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	stepStart(form: HTMLFormElement) {
		const ofv = this.appContext.getFormValidator(form, ['phone']);
		let formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(['phone', 'cc2']);
			formData.set('step', String(OWebAccountRecovery.AR_STEP_START));
			this._sendForm(
				form,
				formData,
				OWebAccountRecovery.AR_STEP_VALIDATE,
			);
		}
	}

	stepValidate(form: HTMLFormElement) {
		const ofv = this.appContext.getFormValidator(form, ['code']);

		if (ofv.validate()) {
			this._sendForm(
				form,
				{
					step: OWebAccountRecovery.AR_STEP_VALIDATE,
					code: ofv.getField('code'),
				},
				OWebAccountRecovery.AR_STEP_END,
			);
		}
	}

	stepEnd(form: HTMLFormElement) {
		const required = ['pass', 'vpass'],
			ofv = this.appContext.getFormValidator(form, required);
		let formData;

		if (ofv.validate()) {
			formData = ofv.getFormData(required);
			formData.set('step', String(OWebAccountRecovery.AR_STEP_END));

			this._sendForm(form, formData);
		}
	}

	onError(handler: (response: IComResponse) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_ERROR, handler);
	}

	onNextStep(handler: (response: IComResponse, step: number) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_NEXT_STEP, handler);
	}

	onSuccess(handler: (response: IComResponse) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
	}

	_sendForm(form: HTMLFormElement, data: any, nextStep?: number) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE');

		m.appContext.request(
			'POST',
			url,
			data,
			function (response: any) {
				if (nextStep) {
					m.trigger(OWebAccountRecovery.EVT_AR_NEXT_STEP, [
						response,
						nextStep,
					]);
				} else {
					m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
				}
			},
			function (response: any) {
				m.trigger(OWebAccountRecovery.EVT_AR_ERROR, [response]);
			},
			true,
		);
	}
}
