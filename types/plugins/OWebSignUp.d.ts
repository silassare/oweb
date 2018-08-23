import { OWebApp, OWebEvent } from "../oweb";
export default class OWebSignUp extends OWebEvent {
    private readonly app_context;
    static readonly SIGN_UP_STEP_START: number;
    static readonly SIGN_UP_STEP_VALIDATE: number;
    static readonly SIGN_UP_STEP_END: number;
    static readonly EVT_NEXT_STEP: string;
    static readonly EVT_SIGN_UP_SUCCESS: string;
    static readonly EVT_SIGN_UP_ERROR: string;
    static readonly SELF: string;
    constructor(app_context: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): false | undefined;
    _sendForm(form: HTMLFormElement, data: any, next_step?: number): void;
}
