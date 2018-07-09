import OWebEvent from "../OWebEvent";
import OWebApp from "../OWebApp";
export default class OWebPassword extends OWebEvent {
    private readonly app_context;
    static readonly PASSWORD_EDIT_STEP_START: number;
    static readonly PASSWORD_EDIT_STEP_VALIDATE: number;
    static readonly PASSWORD_EDIT_STEP_END: number;
    static readonly EVT_NEXT_STEP: string;
    static readonly EVT_PASSWORD_EDIT_SUCCESS: string;
    static readonly EVT_PASSWORD_EDIT_ERROR: string;
    static readonly SELF: string;
    constructor(app_context: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): void;
    _sendForm(form: HTMLFormElement, data: any, next_step?: number): void;
}
