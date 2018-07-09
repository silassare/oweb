import OWebApp from "../OWebApp";
import OWebEvent from "../OWebEvent";
export default class OWebLogout extends OWebEvent {
    private readonly app_context;
    static readonly EVT_LOGOUT_ERROR: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    static readonly SELF: string;
    constructor(app_context: OWebApp);
    logout(): void;
}
