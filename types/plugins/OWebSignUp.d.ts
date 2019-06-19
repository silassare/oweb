import OWebApp from "../OWebApp";
import { iComResponse } from "../OWebCom";
import OWebEvent from "../OWebEvent";
export default class OWebSignUp extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_SIGN_UP_NEXT_STEP: string;
    static readonly EVT_SIGN_UP_SUCCESS: string;
    static readonly EVT_SIGN_UP_ERROR: string;
    static readonly SIGN_UP_STEP_START: number;
    static readonly SIGN_UP_STEP_VALIDATE: number;
    static readonly SIGN_UP_STEP_END: number;
    constructor(app_context: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): false | undefined;
    onError(handler: (this: this, response: iComResponse) => void): this;
    onNextStep(handler: (this: this, response: iComResponse, step: number) => void): this;
    onSuccess(handler: (this: this, response: iComResponse) => void): this;
    _sendForm(form: HTMLFormElement, data: any, next_step?: number): void;
}
