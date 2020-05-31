import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';

export default class OWebLogin extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_LOGIN_ERROR = id();
	static readonly EVT_LOGIN_SUCCESS = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	loginWithEmail(form: HTMLFormElement) {
		const m = this,
			ofv = this.appContext.getFormValidator(form, ['email', 'pass']);

		if (ofv.validate()) {
			m._tryLogin({
				email: ofv.getField('email'),
				pass: ofv.getField('pass'),
			});
		}
	}

	loginWithPhone(form: HTMLFormElement) {
		const m = this,
			ofv = this.appContext.getFormValidator(form, ['phone', 'pass']);

		if (ofv.validate()) {
			m._tryLogin({
				phone: ofv.getField('phone'),
				pass: ofv.getField('pass'),
			});
		}
	}

	onError(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebLogin.EVT_LOGIN_ERROR, handler);
	}

	onSuccess(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
	}

	_tryLogin(data: any) {
		const m = this,
			url = this.appContext.url.get('OZ_SERVER_LOGIN_SERVICE');

		this.appContext.request(
			'POST',
			url,
			data,
			function (response: IComResponse) {
				m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
			},
			function (response: any) {
				m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
			},
			true,
		);
	}
}
