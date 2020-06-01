import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { INetResponse } from '../OWebNet';
import { IOZoneApiJSON } from '../ozone';
export default class OWebSignUp extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_SIGN_UP_NEXT_STEP: string;
    static readonly EVT_SIGN_UP_SUCCESS: string;
    static readonly EVT_SIGN_UP_ERROR: string;
    static readonly SIGN_UP_STEP_START = 1;
    static readonly SIGN_UP_STEP_VALIDATE = 2;
    static readonly SIGN_UP_STEP_END = 3;
    constructor(appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<any>>;
    stepValidate(data: {
        code: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<any>>;
    stepEnd(data: {
        uname: string;
        pass: string;
        vpass: string;
        birth_date: string;
        gender: string;
        email?: string;
    }): import("../OWebXHR").default<IOZoneApiJSON<any>>;
    onError(handler: (response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    onNextStep(handler: (response: INetResponse<IOZoneApiJSON<any>>, step: number) => void): this;
    onSuccess(handler: (response: INetResponse<IOZoneApiJSON<any>>) => void): this;
    private _sendForm;
}
