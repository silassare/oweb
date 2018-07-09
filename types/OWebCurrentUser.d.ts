import OWebEvent from "./OWebEvent";
import OWebApp from "./OWebApp";
export declare type tUserData = {
    [key: string]: any;
};
export default class OWebCurrentUser extends OWebEvent {
    private readonly app_context;
    static readonly SELF: string;
    static readonly EVT_USER_INFO_UPDATE: string;
    private _key_store;
    constructor(app_context: OWebApp);
    logout(): void;
    getCurrentUserData(field?: string): any | tUserData;
    setCurrentUserData(data: tUserData, overwrite?: boolean): this;
    setSessionExpire(expire: number): this;
    getSessionExpire(): number;
    clear(): this;
    _notifyChange(): this;
}
