"use strict";
import OWebEvent from "./OWebEvent";
import Utils from "./utils/Utils";
import OWebKeyStorage from "./OWebKeyStorage";
import OWebLogout from "./plugins/OWebLogout";
export default class OWebCurrentUser extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
        this._key_store = new OWebKeyStorage(app_context, OWebCurrentUser.SELF);
    }
    logout() {
        return (new OWebLogout(this.app_context)).logout();
    }
    getCurrentUserData(field) {
        let user_data = this._key_store.getItem("user_data");
        if (field !== undefined) {
            return user_data ? user_data[field] : undefined;
        }
        return user_data;
    }
    setCurrentUserData(data, overwrite = false) {
        let user_data = this._key_store.getItem("user_data");
        if (!overwrite && Utils.isPlainObject(user_data) && Utils.isPlainObject(data)) {
            data = Utils.assign(user_data, data);
        }
        this._key_store.setItem("user_data", data);
        return this._notifyChange();
    }
    setSessionExpire(expire) {
        this._key_store.setItem("session_expire", expire);
        return this;
    }
    getSessionExpire() {
        let expire = this._key_store.getItem("session_expire");
        return isNaN(expire) ? 0 : expire;
    }
    clear() {
        this._key_store.clear();
        return this._notifyChange();
    }
    _notifyChange() {
        this.trigger(OWebCurrentUser.EVT_USER_INFO_UPDATE, [this]);
        return this;
    }
}
OWebCurrentUser.SELF = "OWebCurrentUser";
OWebCurrentUser.EVT_USER_INFO_UPDATE = "OWebCurrentUser:update";
//# sourceMappingURL=OWebCurrentUser.js.map