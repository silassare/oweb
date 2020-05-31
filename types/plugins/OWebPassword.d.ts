import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebPassword extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_ERROR: string;
    constructor(appContext: OWebApp);
    editPass(form: HTMLFormElement, uid?: string): void;
    onError(handler: (this: this, response: IComResponse) => void): this;
    onSuccess(handler: (this: this, response: IComResponse) => void): this;
}
