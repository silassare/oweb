import OWebApp from '../OWebApp';
import { IComResponse } from '../OWebCom';
import OWebEvent from '../OWebEvent';
export default class OWebLogout extends OWebEvent {
    private readonly appContext;
    static readonly SELF: string;
    static readonly EVT_LOGOUT_ERROR: string;
    static readonly EVT_LOGOUT_SUCCESS: string;
    constructor(appContext: OWebApp);
    onError(handler: (this: this, response: IComResponse) => void): this;
    onSuccess(handler: (this: this, response: IComResponse) => void): this;
    logout(): void;
}
