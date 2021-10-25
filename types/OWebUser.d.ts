import OWebEvent from './OWebEvent';
import OWebApp, { OUser } from './OWebApp';
export default class OWebUser<UserEntity extends OUser> extends OWebEvent {
    private readonly _appContext;
    private _keyStore;
    constructor(_appContext: OWebApp);
    /**
     * Checks if user session is active.
     */
    sessionActive(): boolean;
    /**
     * Checks if the current user has been authenticated.
     */
    userVerified(): boolean;
    /**
     * Returns current user data.
     */
    getCurrentUser(): UserEntity | null;
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrentUser(user: UserEntity): this;
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
     * Sets current user session token.
     *
     * @param token
     */
    setSessionToken(token: string): this;
    /**
     * Returns current user session token.
     */
    getSessionToken(): string | null;
    /**
     * Clear user data.
     */
    clear(): this;
}
