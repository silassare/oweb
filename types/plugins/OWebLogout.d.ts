import OWebApp from "../OWebApp";
import { iComResponse } from "../OWebCom";
import OWebEvent from "../OWebEvent";
export default class OWebLogout extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_LOGOUT_ERROR: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    constructor(app_context: OWebApp);
    onError(handler: (response: iComResponse) => void): this;
    onSuccess(handler: (response: iComResponse) => void): this;
    logout(): void;
}
