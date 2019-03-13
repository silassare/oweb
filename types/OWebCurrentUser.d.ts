import OWebApp from "./OWebApp";
import OWebEvent from "./OWebEvent";
export default class OWebCurrentUser extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_USER_DATA_UPDATE: string;
    private _key_store;
    constructor(app_context: OWebApp);
    /**
     * Returns current user data.
     */
    getCurrentUser(): any;
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrentUser(user: any): this;
    /**
     * Sets current user session expire time.
     *
     * @param expire
     */
    setSessionExpire(expire: number): this;
    /**
     * Returns current user session expire time.
     */
    getSessionExpire(): number;
    /**
     * Clear user data.
     */
    clear(): this;
    /**
     * Trigger notification for user data change.
     *
     * @private
     */
    private _notifyChange;
}
