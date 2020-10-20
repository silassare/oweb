import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { OApiJSON } from '../ozone';
export declare type OTNetResponseData<User> = {
    ok: boolean;
    _current_user?: User;
    _info_sign_up?: any;
};
export default class OWebTNet<App extends OWebApp, User = ReturnType<App['user']['getCurrentUser']>> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_TNET_READY: string;
    static readonly STATE_UNKNOWN: string;
    static readonly STATE_NO_USER: string;
    static readonly STATE_OFFLINE_USER: string;
    static readonly STATE_VERIFIED_USER: string;
    static readonly STATE_SIGN_UP_PROCESS: string;
    constructor(_appContext: App);
    check(): Promise<import("../OWebNet").ONetResponse<OApiJSON<OTNetResponseData<User>>>>;
}
