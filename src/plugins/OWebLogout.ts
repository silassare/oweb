import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';

export default class OWebLogout extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_LOGOUT_ERROR = id();
	static readonly EVT_LOGOUT_SUCCESS = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	onError(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_ERROR, handler);
	}

	onSuccess(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebLogout.EVT_LOGOUT_SUCCESS, handler);
	}

	logout() {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_LOGOUT_SERVICE'),
			net = m.appContext.net<IOZoneApiJSON<any>>(url, {
				method: 'POST',
				isGoodNews(response) {
					return Boolean(response.json && response.json.error === 0);
				},
			});

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
			})
			.onBadNews(function (response) {
				m.trigger(OWebLogout.EVT_LOGOUT_ERROR, [response]);
			})
			.send();
	}
}
