import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { OApiResponse } from '../ozone';
import { ONetResponse } from '../OWebNet';
export declare type OTNetResponseData<User> = {
    ok: boolean;
    _current_user?: User;
    _info_sign_up?: any;
};
export declare type OTNetReadyInfo<User> = {
    status: string;
    data: OTNetResponseData<User>;
};
export default class OWebTNet<App extends OWebApp, User = ReturnType<App['user']['getCurrentUser']>> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_TNET_READY;
    static readonly STATE_UNKNOWN: string;
    static readonly STATE_NO_USER: string;
    static readonly STATE_OFFLINE_USER: string;
    static readonly STATE_VERIFIED_USER: string;
    static readonly STATE_SIGN_UP_PROCESS: string;
    constructor(_appContext: App);
    onReady(handler: (this: this, status: string, data?: OTNetReadyInfo<User>) => void): this;
    check(): Promise<ONetResponse<OApiResponse<OTNetResponseData<User>>>>;
}
//# sourceMappingURL=OWebTNet.d.ts.map