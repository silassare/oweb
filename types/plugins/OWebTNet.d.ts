import { OWebApp, OWebEvent } from "../oweb";
export default class OWebTNet extends OWebEvent {
    private readonly app_context;
    static readonly STATE_UNKNOWN: number;
    static readonly STATE_NO_USER: number;
    static readonly STATE_OFFLINE_USER: number;
    static readonly STATE_VERIFIED_USER: number;
    static readonly STATE_SIGN_UP_PROCESS: number;
    static readonly EVT_TNET_READY: string;
    static readonly SELF: string;
    constructor(app_context: OWebApp);
    check(): this;
}
