import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';

export default class OWebLogout extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_LOGOUT_ERROR = id();
	static readonly EVT_LOGOUT_SUCCESS = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	onError(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebLogout.EVT_LOGOUT_ERROR, handler);
	}

	onSuccess(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
	}

	logout() {
		const m = this,
			url = this.appContext.url.get('OZ_SERVER_LOGOUT_SERVICE');

		this.appContext.request(
			'POST',
			url,
			null,
			function (response: any) {
				m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
			},
			function (response: any) {
				m.trigger(OWebLogout.EVT_LOGOUT_ERROR, [response]);
			},
			true,
		);
	}
}
