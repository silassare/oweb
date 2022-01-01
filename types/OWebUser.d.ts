import OWebEvent from './OWebEvent';
import OWebApp, { OUser } from './OWebApp';
export default class OWebUser<UserEntity extends OUser> extends OWebEvent {
    private _keyStore;
    constructor(appContext: OWebApp);
    sessionActive(): boolean;
    userVerified(): boolean;
    getCurrentUser(): UserEntity | null;
    setCurrentUser(user: UserEntity): this;
    setSessionExpire(expire: number): this;
    getSessionExpire(): number;
    setSessionToken(token: string): this;
    getSessionToken(): string | null;
    clear(): this;
}
