import OWebApp from "../OWebApp";
import { iComResponse } from "../OWebCom";
import OWebEvent from "../OWebEvent";
export default class OWebPassword extends OWebEvent {
    private readonly app_context;
    static readonly PASS_EDIT_STEP_START: number;
    static readonly PASS_EDIT_STEP_VALIDATE: number;
    static readonly PASS_EDIT_STEP_END: number;
    static readonly EVT_PASS_EDIT_NEXT_STEP: string;
    static readonly EVT_PASS_EDIT_SUCCESS: string;
    static readonly EVT_PASS_EDIT_ERROR: string;
    static readonly SELF: string;
    constructor(app_context: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): void;
    onError(handler: (response: iComResponse) => void): this;
    onNextStep(handler: (response: iComResponse, step: number) => void): this;
    onSuccess(handler: (response: iComResponse) => void): this;
    _sendForm(form: HTMLFormElement, data: any, next_step?: number): void;
}
