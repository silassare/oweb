import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import {id} from '../utils';
import {OApiJSON} from '../ozone';

export type OTNetResponseData<User> = {
	ok: boolean;
	_current_user?: User;
	_info_sign_up?: any;
};

export default class OWebTNet<App extends OWebApp, User = ReturnType<App['user']['getCurrentUser']>> extends OWebEvent {
	static readonly SELF           = id();
	static readonly EVT_TNET_READY = id();

	static readonly STATE_UNKNOWN         = id();
	static readonly STATE_NO_USER         = id();
	static readonly STATE_OFFLINE_USER    = id();
	static readonly STATE_VERIFIED_USER   = id();
	static readonly STATE_SIGN_UP_PROCESS = id();

	constructor(private readonly _appContext: App) {
		super();
	}

	check() {
		const m   = this,
			  url = m._appContext.url.get('OZ_SERVER_TNET_SERVICE'),
			  net = m._appContext.oz.request<OApiJSON<OTNetResponseData<User>>>(url, {
				  method: 'GET',
			  });

		return net.onGoodNews(function (response) {
			const data = response.json.data;
			let res;

			if (data._current_user) {
				// user is verified
				res = [OWebTNet.STATE_VERIFIED_USER, data._current_user];
				m._appContext.user.setCurrentUser(data._current_user);
			} else if (data._info_sign_up) {
				// user is in registration process
				res = [OWebTNet.STATE_SIGN_UP_PROCESS, data._info_sign_up];
			} else {
				// no user
				res = [OWebTNet.STATE_NO_USER];
			}

			m.trigger(OWebTNet.EVT_TNET_READY, res);
		})
				  .onFail(function () {
					  let state = OWebTNet.STATE_UNKNOWN;

					  if (m._appContext.user.userVerified()) {
						  state = OWebTNet.STATE_OFFLINE_USER;
					  }

					  m.trigger(OWebTNet.EVT_TNET_READY, [state]);
				  })
				  .send();
	}
}