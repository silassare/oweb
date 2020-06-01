import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { INetResponse } from '../OWebNet';
import { GoblSinglePKEntity } from 'gobl-utils-ts';
import { IOZoneApiJSON } from '../ozone';
export declare type tLoginResponseData = GoblSinglePKEntity;
export default class OWebLogin extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_LOGIN_ERROR: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(appContext: OWebApp);
    loginWithEmail(data: {
        email: string;
        pass: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<GoblSinglePKEntity>>;
    loginWithPhone(data: {
        phone: string;
        pass: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<GoblSinglePKEntity>>;
    onError(handler: (this: this, response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    onSuccess(handler: (this: this, response: INetResponse<IOZoneApiJSON<tLoginResponseData>>) => void): this;
    private _tryLogin;
}
