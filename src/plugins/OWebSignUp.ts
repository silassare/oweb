import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';

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

	stepStart(data: { phone: string; cc2: string }) {
		return this._sendForm(
			{
				phone: data.phone,
				cc2: data.cc2,
				step: OWebSignUp.SIGN_UP_STEP_START,
			},
			OWebSignUp.SIGN_UP_STEP_VALIDATE,
		);
	}

	stepValidate(data: { code: string }) {
		return this._sendForm(
			{
				step: OWebSignUp.SIGN_UP_STEP_VALIDATE,
				code: data.code,
			},
			OWebSignUp.SIGN_UP_STEP_END,
		);
	}

	stepEnd(data: {
		uname: string;
		pass: string;
		vpass: string;
		birth_date: string;
		gender: string;
		email?: string;
	}) {
		return this._sendForm({
			step: OWebSignUp.SIGN_UP_STEP_END,
		});
	}

	onError(
		handler: (response: INetResponse<IOZoneApiJSON<any>>) => void,
	): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_ERROR, handler);
	}

	onNextStep(
		handler: (
			response: INetResponse<IOZoneApiJSON<any>>,
			step: number,
		) => void,
	): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, handler);
	}

	onSuccess(
		handler: (response: INetResponse<IOZoneApiJSON<any>>) => void,
	): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
	}

	private _sendForm(data: FormData | object, nextStep?: number) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_SIGNUP_SERVICE'),
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
					m.trigger(OWebSignUp.EVT_SIGN_UP_NEXT_STEP, [
						response,
						nextStep,
					]);
				} else {
					m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
				}
			})
			.onBadNews(function (response) {
				m.trigger(OWebSignUp.EVT_SIGN_UP_ERROR, [response]);
			})
			.send();
	}
}
