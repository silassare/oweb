import OWebApp from '../OWebApp';
import OWebEvent from '../OWebEvent';
import { ONetError, ONetResponse } from '../OWebNet';
import { OApiJSON } from '../ozone';
export default class OWebPassword extends OWebEvent {
    private readonly _appContext;
    static readonly SELF: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_FAIL: string;
    constructor(_appContext: OWebApp);
    editPass(data: {
        cpass: string;
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    editPassAdmin(data: {
        uid: string;
        pass: string;
        vpass: string;
    }): Promise<ONetResponse<OApiJSON<any>>>;
    private _sendForm;
    onEditFail(handler: (this: this, err: ONetError) => void): this;
    onEditSuccess(handler: (this: this, response: ONetResponse<OApiJSON<any>>) => void): this;
}
