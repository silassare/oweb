import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { INetResponse } from '../OWebNet';
import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { IOZoneApiJSON } from '../ozone';

export type tLoginResponseData = GoblSinglePKEntity;

export default class OWebLogin extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_LOGIN_ERROR = id();
	static readonly EVT_LOGIN_SUCCESS = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	loginWithEmail(data: { email: string; pass: string }) {
		return this._tryLogin({
			email: data.email,
			pass: data.pass,
		});
	}

	loginWithPhone(data: { phone: string; pass: string }) {
		return this._tryLogin({
			phone: data.phone,
			pass: data.pass,
		});
	}

	onError(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebLogin.EVT_LOGIN_ERROR, handler);
	}

	onSuccess(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<tLoginResponseData>>,
		) => void,
	): this {
		return this.on(OWebLogin.EVT_LOGIN_SUCCESS, handler);
	}

	private _tryLogin(data: FormData | object) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_LOGIN_SERVICE'),
			net = m.appContext.net<IOZoneApiJSON<tLoginResponseData>>(url, {
				method: 'POST',
				body: data,
				isGoodNews(response) {
					return Boolean(response.json && response.json.error === 0);
				},
			});

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
			})
			.onBadNews(function (response) {
				m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
			})
			.send();
	}
}
