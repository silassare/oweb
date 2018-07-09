"use strict";
import OWebEvent from "../OWebEvent";
export default class OWebLogout extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    logout() {
        let m = this, url = this.app_context.url.get("OZ_SERVER_LOGOUT_SERVICE");
        this.app_context.request("POST", url, null, function (response) {
            m.trigger(OWebLogout.EVT_LOGOUT_SUCCESS, [response]);
        }, function (response) {
            m.trigger(OWebLogout.EVT_LOGOUT_ERROR, [response]);
        }, true);
    }
}
OWebLogout.EVT_LOGOUT_ERROR = "OWebLogout:error";
OWebLogout.EVT_LOGOUT_SUCCESS = "OWebLogout:success";
OWebLogout.SELF = "OWebLogout";
;
//# sourceMappingURL=OWebLogout.js.map