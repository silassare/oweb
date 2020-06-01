import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { IOZoneApiJSON } from '../ozone';

export type tTNetResponseData = {
	ok: boolean;
	_current_user?: GoblSinglePKEntity;
	_info_sign_up?: any;
};

export default class OWebTNet extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_TNET_READY = id();

	static readonly STATE_UNKNOWN = id();
	static readonly STATE_NO_USER = id();
	static readonly STATE_OFFLINE_USER = id();
	static readonly STATE_VERIFIED_USER = id();
	static readonly STATE_SIGN_UP_PROCESS = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	check() {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_TNET_SERVICE'),
			net = m.appContext.net<IOZoneApiJSON<tTNetResponseData>>(url, {
				method: 'GET',
				isGoodNews(response) {
					return Boolean(response.json && response.json.error === 0);
				},
			});

		return net
			.onGoodNews(function (response) {
				const data = response.json?.data;
				let res;

				if (data?._current_user) {
					// user is verified
					res = [OWebTNet.STATE_VERIFIED_USER, data._current_user];
					m.appContext.user.setCurrentUser(data._current_user);
				} else if (data?._info_sign_up) {
					// user is in registration process
					res = [OWebTNet.STATE_SIGN_UP_PROCESS, data._info_sign_up];
				} else {
					// no user
					res = [OWebTNet.STATE_NO_USER];
				}

				m.trigger(OWebTNet.EVT_TNET_READY, res);
			})
			.onBadNews(function (response) {
				let state = OWebTNet.STATE_UNKNOWN;

				if (m.appContext.userVerified()) {
					state = OWebTNet.STATE_OFFLINE_USER;
				}

				m.trigger(OWebTNet.EVT_TNET_READY, [state]);
			})
			.send();
	}
}
