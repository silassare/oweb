import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
import { id } from '../utils/Utils';

export default class OWebPassword extends OWebEvent {
	static readonly SELF = id();
	static readonly EVT_PASS_EDIT_SUCCESS = id();
	static readonly EVT_PASS_EDIT_ERROR = id();

	constructor(private readonly appContext: OWebApp) {
		super();
	}

	editPass(form: HTMLFormElement, uid?: string) {
		const m = this,
			url = m.appContext.url.get('OZ_SERVER_PASSWORD_SERVICE'),
			required = uid ? ['pass', 'vpass'] : ['cpass', 'pass', 'vpass'],
			ofv = this.appContext.getFormValidator(form, required);
		let formData;

		if (!ofv.validate()) {
			return;
		}

		formData = ofv.getFormData(required);
		formData.append('action', 'edit');

		if (uid) {
			formData.append('uid', uid);
		}

		m.appContext.request(
			'POST',
			url,
			formData,
			function (response: any) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_SUCCESS, [response]);
			},
			function (response: any) {
				m.trigger(OWebPassword.EVT_PASS_EDIT_ERROR, [response]);
			},
			true,
		);
	}

	onError(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_ERROR, handler);
	}

	onSuccess(handler: (this: this, response: IComResponse) => void): this {
		return this.on(OWebPassword.EVT_PASS_EDIT_SUCCESS, handler);
	}
}
