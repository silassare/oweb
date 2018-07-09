"use strict";
import OWebEvent from "../OWebEvent";
export default class OWebLogin extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    loginWithEmail(form) {
        let m = this, ofv = this.app_context.getFormValidator(form, ["email", "pass"]);
        if (ofv.validate()) {
            let data = {
                email: ofv.getField("email"),
                pass: ofv.getField("pass")
            };
            m._tryLogin(data);
        }
    }
    loginWithPhone(form) {
        let m = this, ofv = this.app_context.getFormValidator(form, ["phone", "pass"]);
        if (ofv.validate()) {
            let data = {
                phone: ofv.getField("phone"),
                pass: ofv.getField("pass")
            };
            m._tryLogin(data);
        }
    }
    _tryLogin(data) {
        let m = this, url = this.app_context.url.get("OZ_SERVER_LOGIN_SERVICE");
        this.app_context.request("POST", url, data, function (response) {
            m.trigger(OWebLogin.EVT_LOGIN_SUCCESS, [response]);
        }, function (response) {
            m.trigger(OWebLogin.EVT_LOGIN_ERROR, [response]);
        }, true);
    }
}
OWebLogin.SELF = "OWebLogin";
OWebLogin.EVT_LOGIN_ERROR = "OWebLogin:error";
OWebLogin.EVT_LOGIN_SUCCESS = "OWebLogin:success";
;
//# sourceMappingURL=OWebLogin.js.map