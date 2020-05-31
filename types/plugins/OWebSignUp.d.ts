import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebSignUp extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_SIGN_UP_NEXT_STEP: string;
    static readonly EVT_SIGN_UP_SUCCESS: string;
    static readonly EVT_SIGN_UP_ERROR: string;
    static readonly SIGN_UP_STEP_START = 1;
    static readonly SIGN_UP_STEP_VALIDATE = 2;
    static readonly SIGN_UP_STEP_END = 3;
    constructor(appContext: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): false | undefined;
    onError(handler: (this: this, response: IComResponse) => void): this;
    onNextStep(handler: (this: this, response: IComResponse, step: number) => void): this;
    onSuccess(handler: (this: this, response: IComResponse) => void): this;
    _sendForm(form: HTMLFormElement, data: any, nextStep?: number): void;
}
