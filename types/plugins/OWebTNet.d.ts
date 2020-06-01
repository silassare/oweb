import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { IOZoneApiJSON } from '../ozone';
export declare type tTNetResponseData = {
    ok: boolean;
    _current_user?: GoblSinglePKEntity;
    _info_sign_up?: any;
};
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
    check(): import("../OWebXHR").default<IOZoneApiJSON<tTNetResponseData>>;
}
