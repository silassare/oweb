import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
export default class OWebLogout<Result> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_LOGOUT_FAIL: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    constructor(_appContext: OWebApp);
    onLogoutFail(handler: (this: this, err: ONetError) => void): this;
    onLogoutSuccess(handler: (this: this, response: ONetResponse<OApiResponse<Result>>) => void): this;
    logout(): Promise<ONetResponse<OApiResponse<Result>>>;
}
//# sourceMappingURL=OWebLogout.d.ts.map