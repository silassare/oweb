import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
import { OWebFormData } from '../OWebForm';

export default class OWebAccountRecovery<
	Start,
	Validate,
	End
> extends OWebEvent {
	static readonly SELF = id();
	private static readonly EVT_AR_SUCCESS = id();
	private static readonly EVT_AR_FAIL = id();

	static readonly AR_STEP_START = 1;
	static readonly AR_STEP_VALIDATE = 2;
	static readonly AR_STEP_END = 3;

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	stepStart(data: {
		phone: string;
		cc2: string;
	}): Promise<ONetResponse<OApiResponse<Start>>> {
		return this._sendForm<Start>(
			{
				phone: data.phone,
				cc2: data.cc2,
				step: OWebAccountRecovery.AR_STEP_START,
			},
			OWebAccountRecovery.AR_STEP_VALIDATE
		);
	}

	stepValidate(data: {
		code: string;
	}): Promise<ONetResponse<OApiResponse<Validate>>> {
		return this._sendForm<Validate>(
			{
				step: OWebAccountRecovery.AR_STEP_VALIDATE,
				code: data.code,
			},
			OWebAccountRecovery.AR_STEP_END
		);
	}

	stepEnd(data: {
		pass: string;
		vpass: string;
	}): Promise<ONetResponse<OApiResponse<End>>> {
		return this._sendForm<End>({
			pass: data.pass,
			vpass: data.vpass,
			step: String(OWebAccountRecovery.AR_STEP_END),
		});
	}

	onRecoverySuccess(
		handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void
	): this {
		return this.on(OWebAccountRecovery.EVT_AR_SUCCESS, handler);
	}

	onRecoveryFail(handler: (this: this, err: ONetError) => void): this {
		return this.on(OWebAccountRecovery.EVT_AR_FAIL, handler);
	}

	private _sendForm<R>(data: OWebFormData, nextStep?: number) {
		const m = this,
			url = m._appContext.url.get('OZ_SERVER_ACCOUNT_RECOVERY_SERVICE'),
			net = m._appContext.oz.request<OApiResponse<R>>(url, {
				method: 'POST',
				body: data,
			});

		return net
			.onGoodNews(function goodNewsHandler(response) {
				if (!nextStep) {
					m.trigger(OWebAccountRecovery.EVT_AR_SUCCESS, [response]);
				}
			})
			.onFail(function failHandler(err) {
				m.trigger(OWebAccountRecovery.EVT_AR_FAIL, [err]);
			})
			.send();
	}
}
