import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebLogin extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_LOGIN_ERROR: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(appContext: OWebApp);
    loginWithEmail(form: HTMLFormElement): void;
    loginWithPhone(form: HTMLFormElement): void;
    onError(handler: (this: this, response: IComResponse) => void): this;
    onSuccess(handler: (this: this, response: IComResponse) => void): this;
    _tryLogin(data: any): void;
}
