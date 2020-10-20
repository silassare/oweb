import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import {id} from '../utils';
import {ONetError, ONetResponse} from '../OWebNet';
import {OApiJSON} from '../ozone';

export default class OWebLogin<User> extends OWebEvent {
	static readonly SELF              = id();
	static readonly EVT_LOGIN_FAIL    = id();
	static readonly EVT_LOGIN_SUCCESS = id();

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	loginWithEmail(data: { email: string; pass: string }) {
		return this._tryLogin({
			email: data.email,
			pass : data.pass,
		});
	}

	loginWithPhone(data: { phone: string; pass: string }) {
		return this._tryLogin({
			phone: data.phone,
			pass : data.pass,
		});
	}

	onLoginFail(
		handler: (this: this, err: ONetError) => void,
	): this {
		return this.on(OWebLogin.EVT_LOGIN_FAIL, handler);
	}

	onLoginSuccess(
		handler: (
			this: this,
			response: ONetResponse<OApiJSON<User>>,
		) => void,
	): this {
		return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
	}

	private _tryLogin(data: FormData | object) {
		const m   = this,
			  url = m._appContext.url.get('OZ_SERVER_LOGIN_SERVICE'),
			  net = m._appContext.oz.request<OApiJSON<User>>(url, {
				  method: 'POST',
				  body  : data,
			  });

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
			})
			.onFail(function (err) {
				m.trigger(OWebLogin.EVT_LOGIN_FAIL, [err]);
			})
			.send();
	}
}
