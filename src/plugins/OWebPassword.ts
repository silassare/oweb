import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';

export default class OWebPassword extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_PASS_EDIT_SUCCESS = id();
	static readonly EVT_PASS_EDIT_ERROR = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	editPass(data: { cpass: string; pass: string; vpass: string }) {
		return this._sendForm({
			action: 'edit',
			cpass: data.cpass,
			vpass: data.vpass,
			pass: data.pass,
		});
	}

	editPassAdmin(data: { uid: string; pass: string; vpass: string }) {
		return this._sendForm({
			action: 'edit',
			uid: data.uid,
			pass: data.pass,
			vpass: data.vpass,
		});
	}

	private _sendForm(data: FormData | object) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_PASSWORD_SERVICE'),
			net = m.appContext.net<IOZoneApiJSON<any>>(url, {
				method: 'POST',
				body: data,
				isGoodNews(response) {
					return Boolean(response.json && response.json.error === 0);
				},
			});

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
			})
			.onBadNews(function (response) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_ERROR, [response]);
			})
			.send();
	}

	onError(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_ERROR, handler);
	}

	onSuccess(
		handler: (
			this: this,
			response: INetResponse<IOZoneApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
	}
}
