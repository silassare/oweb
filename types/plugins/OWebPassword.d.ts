import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';
export default class OWebPassword extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_ERROR: string;
    constructor(appContext: OWebApp);
    editPass(data: {
        cpass: string;
        pass: string;
        vpass: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<any>>;
    editPassAdmin(data: {
        uid: string;
        pass: string;
        vpass: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<any>>;
    private _sendForm;
    onError(handler: (this: this, response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    onSuccess(handler: (this: this, response: INetResponse<IOZoneApiJSON<any>>) => void): this;
}
