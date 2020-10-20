import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import {ONetError, ONetResponse} from '../OWebNet';
import { OApiJSON } from '../ozone';

export default class OWebLogout extends OWebEvent {
	static readonly SELF               = id();
	static readonly EVT_LOGOUT_FAIL    = id();
	static readonly EVT_LOGOUT_SUCCESS = id();

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	onLogoutFail(
		handler: (this: this, err: ONetError) => void,
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_FAIL, handler);
	}

	onLogoutSuccess(
		handler: (
			this: this,
			response: ONetResponse<OApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
	}

	logout() {
		const m = this,
			url = m._appContext.url.get('OZ_SERVER_LOGOUT_SERVICE'),
			net = m._appContext.oz.request<OApiJSON<any>>(url, {
				method: 'POST',
			});

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
			})
			.onFail(function (err) {
				m.trigger(OWebLogout.EVT_LOGOUT_FAIL, [err]);
			})
			.send();
	}
}
