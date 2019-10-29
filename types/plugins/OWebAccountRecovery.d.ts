import OWebApp from "../OWebApp";
import { iComResponse } from "../OWebCom";
import OWebEvent from "../OWebEvent";
export default class OWebAccountRecovery extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_AR_NEXT_STEP: string;
    static readonly EVT_AR_SUCCESS: string;
    static readonly EVT_AR_ERROR: string;
    static readonly AR_STEP_START = 1;
    static readonly AR_STEP_VALIDATE = 2;
    static readonly AR_STEP_END = 3;
    constructor(app_context: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): void;
    onError(handler: (response: iComResponse) => void): this;
    onNextStep(handler: (response: iComResponse, step: number) => void): this;
    onSuccess(handler: (response: iComResponse) => void): this;
    _sendForm(form: HTMLFormElement, data: any, next_step?: number): void;
}
