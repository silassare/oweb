import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiJSON } from '../ozone';
export default class OWebAccountRecovery extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_AR_NEXT_STEP: string;
    static readonly EVT_AR_SUCCESS: string;
    static readonly EVT_AR_FAIL: string;
    static readonly AR_STEP_START = 1;
    static readonly AR_STEP_VALIDATE = 2;
    static readonly AR_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    stepEnd(data: {
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    onRecoverySuccess(handler: (this: this, response: ONetResponse<OApiJSON<any>>) => void): this;
    onRecoveryFail(handler: (this: this, err: ONetError) => void): this;
    onNextStep(handler: (this: this, response: ONetResponse<OApiJSON<any>>, step: number) => void): this;
    private _sendForm;
}
