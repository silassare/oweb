import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiResponse } from '../ozone';
export default class OWebSignUp<Start, Validate, End> extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    private static readonly EVT_SIGN_UP_SUCCESS;
    private static readonly EVT_SIGN_UP_FAIL;
    static readonly SIGN_UP_STEP_START = 1;
    static readonly SIGN_UP_STEP_VALIDATE = 2;
    static readonly SIGN_UP_STEP_END = 3;
    constructor(_appContext: OWebApp);
    stepStart(data: {
        phone: string;
        cc2: string;
    }): Promise<ONetResponse<OApiResponse<Start>>>;
    stepValidate(data: {
        code: string;
    }): Promise<ONetResponse<OApiResponse<Validate>>>;
    stepEnd(data: {
        uname: string;
        pass: string;
        vpass: string;
        birth_date: string;
        gender: string;
        email?: string;
    }): Promise<ONetResponse<OApiResponse<End>>>;
    onSignUpFail(handler: (this: this, err: ONetError) => void): this;
    onSignUpSuccess(handler: (this: this, response: ONetResponse<OApiResponse<End>>) => void): this;
    private _sendForm;
}
