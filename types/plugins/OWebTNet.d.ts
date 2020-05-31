import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
export default class OWebTNet extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_TNET_READY: string;
    static readonly STATE_UNKNOWN: string;
    static readonly STATE_NO_USER: string;
    static readonly STATE_OFFLINE_USER: string;
    static readonly STATE_VERIFIED_USER: string;
    static readonly STATE_SIGN_UP_PROCESS: string;
    constructor(appContext: OWebApp);
    check(): this;
}
