import OWebApp from "../OWebApp";
import { iComResponse } from "../OWebCom";
import OWebEvent from "../OWebEvent";
export default class OWebPassword extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_ERROR: string;
    constructor(app_context: OWebApp);
    editPass(form: HTMLFormElement, uid?: string): void;
    onError(handler: (response: iComResponse) => void): this;
    onSuccess(handler: (response: iComResponse) => void): this;
}
