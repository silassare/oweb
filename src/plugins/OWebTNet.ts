import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils';
import { OApiResponse } from '../ozone';
import { ONetResponse } from '../OWebNet';

export type OTNetResponseData<User> = {
	ok: boolean;
	_current_user?: User;
	_info_sign_up?: any;
};

export type OTNetReadyInfo<User> = {
	status: string;
	data: OTNetResponseData<User>;
};

export default class OWebTNet<
	App extends OWebApp,
	User = ReturnType<App['user']['getCurrentUser']>
> extends OWebEvent {
	static readonly SELF = id();
	private static readonly EVT_TNET_READY = id();

	static readonly STATE_UNKNOWN = id();
	static readonly STATE_NO_USER = id();
	static readonly STATE_OFFLINE_USER = id();
	static readonly STATE_VERIFIED_USER = id();
	static readonly STATE_SIGN_UP_PROCESS = id();

	constructor(private readonly _appContext: App) {
		super();
	}

	onReady(
		handler: (this: this, status: string, data?: OTNetReadyInfo<User>) => void
	): this {
		return this.on(OWebTNet.EVT_TNET_READY, handler);
	}

	check(): Promise<ONetResponse<OApiResponse<OTNetResponseData<User>>>> {
		const m = this,
			url = m._appContext.url.get('OZ_SERVER_TNET_SERVICE'),
			net = m._appContext.oz.request<OApiResponse<OTNetResponseData<User>>>(
				url,
				{
					method: 'GET',
				}
			);

		return net
			.onGoodNews(function goodNewsHandler(response) {
				const data = response.json.data;
				let status: string = OWebTNet.STATE_NO_USER;

				if (data._current_user) {
					// user is verified
					status = OWebTNet.STATE_VERIFIED_USER;
					m._appContext.user.setCurrentUser(data._current_user);
				} else if (data._info_sign_up) {
					// user is in registration process
					status = OWebTNet.STATE_SIGN_UP_PROCESS;
				}

				m.trigger(OWebTNet.EVT_TNET_READY, [status, data]);
			})
			.onFail(function failHandler() {
				let state = OWebTNet.STATE_UNKNOWN;

				if (m._appContext.user.userVerified()) {
					state = OWebTNet.STATE_OFFLINE_USER;
				}

				m.trigger(OWebTNet.EVT_TNET_READY, [state]);
			})
			.send();
	}
}
