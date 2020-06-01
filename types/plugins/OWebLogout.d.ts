import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';
export default class OWebLogout extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_LOGOUT_ERROR: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    constructor(appContext: OWebApp);
    onError(handler: (this: this, response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    onSuccess(handler: (this: this, response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    logout(): import("../OWebXHR").default<IOZoneApiJSON<any>>;
}
