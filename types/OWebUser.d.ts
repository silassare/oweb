import OWebEvent from './OWebEvent';
import OWebApp, { OUser } from './OWebApp';
import OWebSignUp from './plugins/OWebSignUp';
import OWebLogin from './plugins/OWebLogin';
import OWebLogout from './plugins/OWebLogout';
import OWebAccountRecovery from './plugins/OWebAccountRecovery';
import OWebPassword from './plugins/OWebPassword';
export default class OWebUser<UserEntity extends OUser> extends OWebEvent {
    protected _appContext: OWebApp;
    private _keyStore;
    constructor(_appContext: OWebApp);
    /**
     * Returns a new {@link OWebLogin} instance.
     */
    login(): OWebLogin<UserEntity>;
    /**
     * Returns a new {@link OWebLogout} instance.
     */
    logout(): OWebLogout<UserEntity>;
    /**
     * Returns a new {@link OWebSignUp} instance.
     */
    signUp<Start, Validate, End>(): OWebSignUp<Start, Validate, End>;
    /**
     * Returns a new {@link OWebPassword} instance.
     */
    password(): OWebPassword<UserEntity>;
    /**
     * Returns a new {@link OWebAccountRecovery} instance.
     */
    accountRecovery<Start, Validate, End>(): OWebAccountRecovery<Start, Validate, End>;
    /**
     * Checks if user session is active.
     */
    sessionActive(): boolean;
    /**
     * Checks if the current user has been authenticated.
     *
     * @deprecated use {@link OWebUser.isVerified }
     */
    userVerified(): boolean;
    /**
     * Sets current user data.
     *
     * @param user
     *
     * @deprecated use {@link OWebUser.setCurrent}
     */
    setCurrentUser(user: UserEntity): this;
    /**
     * Returns current user data.
     *
     * @deprecated use {@link OWebUser.getCurrent}
     */
    getCurrentUser(): UserEntity | null;
    /**
     * Checks if the current user has been authenticated.
     */
    isVerified(): boolean;
    /**
     * Returns current user data.
     */
    getCurrent(): UserEntity | null;
    /**
     * Sets current user data.
     *
     * @param user
     */
    setCurrent(user: UserEntity): this;
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
