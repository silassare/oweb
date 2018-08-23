import { OWebApp, OWebEvent } from "./oweb";
export default class OWebCurrentUser extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_USER_INFO_UPDATE: string;
    private _key_store;
    constructor(app_context: OWebApp);
    getCurrentUser(): any;
    setCurrentUser(user: any): this;
    setSessionExpire(expire: number): this;
    getSessionExpire(): number;
    clear(): this;
    private _notifyChange;
}
