import { OWebApp, OWebEvent } from "../oweb";
export default class OWebLogin extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_LOGIN_ERROR: string;
    static readonly EVT_LOGIN_SUCCESS: string;
    constructor(app_context: OWebApp);
    loginWithEmail(form: HTMLFormElement): void;
    loginWithPhone(form: HTMLFormElement): void;
    _tryLogin(data: any): void;
}
