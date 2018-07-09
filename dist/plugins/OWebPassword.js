"use strict";
import OWebEvent from "../OWebEvent";
export default class OWebPassword extends OWebEvent {
    constructor(app_context) {
        super();
        this.app_context = app_context;
    }
    stepStart(form) {
        let ofv = this.app_context.getFormValidator(form, ["phone"]), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(["phone", "cc2"]);
            formData.set("step", String(OWebPassword.PASSWORD_EDIT_STEP_START));
            this._sendForm(form, formData, OWebPassword.PASSWORD_EDIT_STEP_VALIDATE);
        }
    }
    stepValidate(form) {
        let ofv = this.app_context.getFormValidator(form, ["code"]);
        if (ofv.validate()) {
            this._sendForm(form, {
                "step": OWebPassword.PASSWORD_EDIT_STEP_VALIDATE,
                "code": ofv.getField("code")
            }, OWebPassword.PASSWORD_EDIT_STEP_END);
        }
    }
    stepEnd(form) {
        let required = ["pass", "vpass"], ofv = this.app_context.getFormValidator(form, required), formData;
        if (ofv.validate()) {
            formData = ofv.getFormData(required);
            formData.set("step", String(OWebPassword.PASSWORD_EDIT_STEP_END));
            this._sendForm(form, formData);
        }
    }
    _sendForm(form, data, next_step) {
        let m = this, url = m.app_context.url.get("OZ_SERVER_PASSWORD_EDIT_SERVICE");
        m.app_context.request("POST", url, data, function (response) {
            if (next_step) {
                m.trigger(OWebPassword.EVT_NEXT_STEP, [{ "response": response, "step": next_step, }]);
            }
            else {
                m.trigger(OWebPassword.EVT_PASSWORD_EDIT_SUCCESS, [{ "response": response }]);
            }
        }, function (response) {
            m.trigger(OWebPassword.EVT_PASSWORD_EDIT_ERROR, [{ "response": response }]);
        }, true);
    }
}
OWebPassword.PASSWORD_EDIT_STEP_START = 1;
OWebPassword.PASSWORD_EDIT_STEP_VALIDATE = 2;
OWebPassword.PASSWORD_EDIT_STEP_END = 3;
OWebPassword.EVT_NEXT_STEP = "OWebPassword:next_step";
OWebPassword.EVT_PASSWORD_EDIT_SUCCESS = "OWebPassword:success";
OWebPassword.EVT_PASSWORD_EDIT_ERROR = "OWebPassword:error";
OWebPassword.SELF = "OWebPassword";
;
//# sourceMappingURL=OWebPassword.js.map