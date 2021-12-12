import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
import { OWebFormData } from '../OWebForm';

export default class OWebSignUp<Start, Validate, End> extends OWebEvent {
	static readonly SELF = id();
	private static readonly EVT_SIGN_UP_SUCCESS = id();
	private static readonly EVT_SIGN_UP_FAIL = id();

	static readonly SIGN_UP_STEP_START = 1;
	static readonly SIGN_UP_STEP_VALIDATE = 2;
	static readonly SIGN_UP_STEP_END = 3;

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
				step: OWebSignUp.SIGN_UP_STEP_START,
			},
			OWebSignUp.SIGN_UP_STEP_VALIDATE
		);
	}

	stepValidate(data: {
		code: string;
	}): Promise<ONetResponse<OApiResponse<Validate>>> {
		return this._sendForm<Validate>(
			{
				step: OWebSignUp.SIGN_UP_STEP_VALIDATE,
				code: data.code,
			},
			OWebSignUp.SIGN_UP_STEP_END
		);
	}

	stepEnd(data: {
		uname: string;
		pass: string;
		vpass: string;
		birth_date: string;
		gender: string;
		email?: string;
	}): Promise<ONetResponse<OApiResponse<End>>> {
		const form = {
			step: OWebSignUp.SIGN_UP_STEP_END,
			...data,
		};

		if (!form.email) {
			delete form.email;
		}

		return this._sendForm<End>(form);
	}

	onSignUpFail(handler: (this: this, err: ONetError) => void): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_FAIL, handler);
	}

	onSignUpSuccess(
		handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void
	): this {
		return this.on(OWebSignUp.EVT_SIGN_UP_SUCCESS, handler);
	}

	private _sendForm<R>(data: OWebFormData, nextStep?: number) {
		const m = this,
			url = m._appContext.url.get('OZ_SERVER_SIGNUP_SERVICE'),
			net = m._appContext.oz.request<OApiResponse<R>>(url, {
				method: 'POST',
				body: data,
			});

		return net
			.onGoodNews(function goodNewsHandler(response) {
				if (!nextStep) {
					m.trigger(OWebSignUp.EVT_SIGN_UP_SUCCESS, [response]);
				}
			})
			.onFail(function failHandler(err) {
				m.trigger(OWebSignUp.EVT_SIGN_UP_FAIL, [err]);
			})
			.send();
	}
}
