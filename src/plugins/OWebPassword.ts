import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import {id} from '../utils';
import {ONetError, ONetResponse} from '../OWebNet';
import {OApiJSON} from '../ozone';

export default class OWebPassword extends OWebEvent {
	static readonly SELF                  = id();
	static readonly EVT_PASS_EDIT_SUCCESS = id();
	static readonly EVT_PASS_EDIT_FAIL    = id();

	constructor(private readonly _appContext: OWebApp) {
		super();
	}

	editPass(data: { cpass: string; pass: string; vpass: string }) {
		return this._sendForm({
			action: 'edit',
			cpass : data.cpass,
			vpass : data.vpass,
			pass  : data.pass,
		});
	}

	editPassAdmin(data: { uid: string; pass: string; vpass: string }) {
		return this._sendForm({
			action: 'edit',
			uid   : data.uid,
			pass  : data.pass,
			vpass : data.vpass,
		});
	}

	private _sendForm(data: FormData | object) {
		const m   = this,
			  url = m._appContext.url.get('OZ_SERVER_PASSWORD_SERVICE'),
			  net = m._appContext.oz.request<OApiJSON<any>>(url, {
				  method: 'POST',
				  body  : data,
			  });

		return net
			.onGoodNews(function (response) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
			})
			.onFail(function (err) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_FAIL, [err]);
			})
			.send();
	}

	onEditFail(
		handler: (this: this, err: ONetError) => void,
	): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_FAIL, handler);
	}

	onEditSuccess(
		handler: (
			this: this,
			response: ONetResponse<OApiJSON<any>>,
		) => void,
	): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
	}
}
