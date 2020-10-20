import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import {id} from '../utils';
import {ONetError, ONetResponse} from '../OWebNet';
import {OApiJSON} from '../ozone';

export default class OWebAccountRecovery extends OWebEvent {
	static readonly SELF             = id();
	static readonly EVT_AR_NEXT_STEP = id();
	static readonly EVT_AR_SUCCESS   = id();
	static readonly EVT_AR_FAIL      = id();

	static readonly AR_STEP_START    = 1;
	static readonly AR_STEP_VALIDATE = 2;
	static readonly AR_STEP_END      = 3;

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	stepStart(data: { phone: string; cc2: string }) {
		return this._sendForm(
			{
				phone: data.phone,
				cc2  : data.cc2,
				step : OWebAccountRecovery.AR_STEP_START,
			},
			OWebAccountRecovery.AR_STEP_VALIDATE,
		);
	}

	stepValidate(data: { code: string }) {
		return this._sendForm(
			{
				step: OWebAccountRecovery.AR_STEP_VALIDATE,
				code: data.code,
			},
			OWebAccountRecovery.AR_STEP_END,
		);
	}

	stepEnd(data: { pass: string; vpass: string }) {
		return this._sendForm({
			pass : data.pass,
			vpass: data.vpass,
			step : String(OWebAccountRecovery.AR_STEP_END),
		});
	}

	onRecoverySuccess(
		handler: (
			this: this,
			response: ONetResponse<OApiJSON<any>>) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
	}

	onRecoveryFail(
		handler: (this: this, err: ONetError) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_FAIL, handler);
	}

	onNextStep(
		handler: (
			this: this,
			response: ONetResponse<OApiJSON<any>>,
			step: number,
		) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_NEXT_STEP, handler);
	}

	private _sendForm(data: FormData | object, nextStep?: number) {
		const m   = this,
			  url = m._appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE'),
			  net = m._appContext.oz.request<OApiJSON<any>>(url, {
				  method: 'POST',
				  body  : data,
			  });

		return net
			.onGoodNews(function (response) {
				if (nextStep) {
					m.trigger(OWebAccountRecovery.EVT_AR_NEXT_STEP, [
						response,
						nextStep,
					]);
				} else {
					m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
				}
			})
			.onFail(function (err) {
				m.trigger(OWebAccountRecovery.EVT_AR_FAIL, [err]);
			})
			.send();
	}
}
