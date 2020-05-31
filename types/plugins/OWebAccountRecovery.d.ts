import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebAccountRecovery extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_AR_NEXT_STEP: string;
    static readonly EVT_AR_SUCCESS: string;
    static readonly EVT_AR_ERROR: string;
    static readonly AR_STEP_START = 1;
    static readonly AR_STEP_VALIDATE = 2;
    static readonly AR_STEP_END = 3;
    constructor(appContext: OWebApp);
    stepStart(form: HTMLFormElement): void;
    stepValidate(form: HTMLFormElement): void;
    stepEnd(form: HTMLFormElement): void;
    onError(handler: (response: IComResponse) => void): this;
    onNextStep(handler: (response: IComResponse, step: number) => void): this;
    onSuccess(handler: (response: IComResponse) => void): this;
    _sendForm(form: HTMLFormElement, data: any, nextStep?: number): void;
}
