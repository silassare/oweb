import OWebApp from '../OWebApp';
import { iComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebLogin extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_LOGIN_ERROR: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(app_context: OWebApp);
    loginWithEmail(form: HTMLFormElement): void;
    loginWithPhone(form: HTMLFormElement): void;
    onError(handler: (this: this, response: iComResponse) => void): this;
    onSuccess(handler: (this: this, response: iComResponse) => void): this;
    _tryLogin(data: any): void;
}
