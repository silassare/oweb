import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
export default class OWebAccountRecovery<Start, Validate, End> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_AR_SUCCESS;
    private static readonly EVT_AR_FAIL;
    static readonly AR_STEP_START = 1;
    static readonly AR_STEP_VALIDATE = 2;
    static readonly AR_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiResponse<Start>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiResponse<Validate>>>;
    stepEnd(data: {
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiResponse<End>>>;
    onRecoverySuccess(handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void): this;
    onRecoveryFail(handler: (this: this, err: ONetError) => void): this;
    private _sendForm;
}
