import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiJSON } from '../ozone';
export default class OWebSignUp extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_SIGN_UP_NEXT_STEP: string;
    static readonly EVT_SIGN_UP_SUCCESS: string;
    static readonly EVT_SIGN_UP_FAIL: string;
    static readonly SIGN_UP_STEP_START = 1;
    static readonly SIGN_UP_STEP_VALIDATE = 2;
    static readonly SIGN_UP_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    stepEnd(data: {
        uname: string;
        pass: string;
        vpass: string;
        birth_date: string;
        gender: string;
        email?: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    onNextStep(handler: (this: this, response: ONetResponse<OApiJSON<any>>, step: number) => void): this;
    onSignUpFail(handler: (this: this, err: ONetError) => void): this;
    onSignUpSuccess(handler: (this: this, response: ONetResponse<OApiJSON<any>>) => void): this;
    private _sendForm;
}
