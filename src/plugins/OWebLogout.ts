import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import {ONetError, ONetResponse} from '../OWebNet';
import { OApiResponse } from '../ozone';

export default class OWebLogout<Result> extends OWebEvent {
	static readonly SELF               = id();
	static readonly EVT_LOGOUT_FAIL    = id();
	static readonly EVT_LOGOUT_SUCCESS = id();

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	onLogoutFail(
		handler: (this: this, err: ONetError) => void
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_FAIL, handler);
	}

	onLogoutSuccess(
		handler: (
			this: this,
			response: ONetResponse<OApiResponse<Result>>,
		) => void
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
	}

	logout(): Promise<ONetResponse<OApiResponse<Result>>> {
		const m = this,
			url = m._appContext.url.get('OZ_SERVER_LOGOUT_SERVICE'),
			net = m._appContext.oz.request<OApiResponse<any>>(url, {
				method: 'POST',
			});

		return net
			.onGoodNews(function goodNewsHandler(response) {
				m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
			})
			.onFail(function failHandler(err) {
				m.trigger(OWebLogout.EVT_LOGOUT_FAIL, [err]);
			})
			.send();
	}
}
