import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
export default class OWebLogin<User> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_LOGIN_FAIL: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(_appContext: OWebApp);
    loginWithEmail(data: {
        email: string;
        pass: string;
    }): Promise<ONetResponse<OApiResponse<User>>>;
    loginWithPhone(data: {
        phone: string;
        pass: string;
    }): Promise<ONetResponse<OApiResponse<User>>>;
    onLoginFail(handler: (this: this, err: ONetError) => void): this;
    onLoginSuccess(handler: (this: this, response: ONetResponse<OApiResponse<User>>) => void): this;
    private _tryLogin;
}
