import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import Utils from '../utils/Utils';

export default class OWebTNet extends OWebEvent {
	static readonly SELF = Utils.id();
	static readonly EVT_TNET_READY = Utils.id();

	static readonly STATE_UNKNOWN = Utils.id();
	static readonly STATE_NO_USER = Utils.id();
	static readonly STATE_OFFLINE_USER = Utils.id();
	static readonly STATE_VERIFIED_USER = Utils.id();
	static readonly STATE_SIGN_UP_PROCESS = Utils.id();

	constructor(private readonly app_context: OWebApp) {
		super();
	}

	check() {
		let m = this,
			url = this.app_context.url.get('OZ_SERVER_TNET_SERVICE');

		this.app_context.request(
			'GET',
			url,
			null,
			function(response: any) {
				let data = response['data'],
					res;

				if (data['_current_user']) {
					// user is verified
					res = [OWebTNet.STATE_VERIFIED_USER, data['_current_user']];
					m.app_context.user.setCurrentUser(data['_current_user']);
				} else if (data['_info_sign_up']) {
					// user is in registration process
					res = [
						OWebTNet.STATE_SIGN_UP_PROCESS,
						data['_info_sign_up'],
					];
				} else {
					// no user
					res = [OWebTNet.STATE_NO_USER];
				}

				m.trigger(OWebTNet.EVT_TNET_READY, res);
			},
			function() {
				let state = OWebTNet.STATE_UNKNOWN;

				if (m.app_context.userVerified()) {
					state = OWebTNet.STATE_OFFLINE_USER;
				}

				m.trigger(OWebTNet.EVT_TNET_READY, [state]);
			}
		);

		return m;
	}
}
