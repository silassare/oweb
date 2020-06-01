import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';

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

	stepStart(data: { phone: string; cc2: string }) {
		return this._sendForm(
			{
				phone: data.phone,
				cc2: data.cc2,
				step: OWebAccountRecovery.AR_STEP_START,
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
			pass: data.pass,
			vpass: data.vpass,
			step: String(OWebAccountRecovery.AR_STEP_END),
		});
	}

	onError(
		handler: (response: INetResponse<IOZoneApiJSON<any>>) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_ERROR, handler);
	}

	onNextStep(
		handler: (
			response: INetResponse<IOZoneApiJSON<any>>,
			step: number,
		) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_NEXT_STEP, handler);
	}

	onSuccess(
		handler: (response: INetResponse<IOZoneApiJSON<any>>) => void,
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
	}

	private _sendForm(data: FormData | object, nextStep?: number) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE'),
			net = m.appContext.net<IOZoneApiJSON<any>>(url, {
				method: 'POST',
				body: data,
				isGoodNews(response) {
					return Boolean(response.json && response.json.error === 0);
				},
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
			.onBadNews(function (response) {
				m.trigger(OWebAccountRecovery.EVT_AR_ERROR, [response]);
			})
			.send();
	}
}
