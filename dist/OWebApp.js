"use strict";
import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebDataStore from "./OWebDataStore";
import Utils from "./utils/Utils";
import OWebCom from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs from "./OWebConfigs";
import OWebUrl from "./OWebUrl";
export default class OWebApp extends OWebEvent {
    constructor(app_name, app_config, app_url) {
        super();
        this.app_name = app_name;
        this.pages = {};
        this.services = {};
        this.configs = new OWebConfigs(this, app_config);
        this.url = new OWebUrl(this, app_url);
        this.user = new OWebCurrentUser(this);
        this.view = new OWebView();
    }
    getAppName() {
        return this.app_name;
    }
    start() {
        this.trigger(OWebApp.EVT_APP_READY);
    }
    getService(service_name) {
        return this.services[service_name];
    }
    registerService(service_name, item_id_name) {
        if (!this.services[service_name]) {
            this.services[service_name] = new OWebService(this, service_name, item_id_name);
        }
        return this;
    }
    registerPage(page) {
        let name = page.getPageName();
        if (name in this.pages) {
            console.warn(`OWebApp: page "${name}" will be redefined.`);
        }
        this.pages[name] = page;
        return this;
    }
    getPage(name) {
        return this.pages[name];
    }
    getFormValidator(form, required = [], excluded = []) {
        return new OWebFormValidator(this, form, required, excluded);
    }
    forceLogin() {
        OWebDataStore.clear();
        this.reloadApp();
    }
    reloadApp() {
        // TODO: instead of reloading the current location, find a way to browse to web app entry point
        window.location.reload(true);
    }
    destroyApp() {
        // erase data
        OWebDataStore.clear();
        this.reloadApp();
    }
    sessionActive() {
        let now = (new Date()).getTime(); // milliseconds
        let hour = 60 * 60; // seconds
        let expire = this.user.getSessionExpire() - hour; // seconds
        return (expire * 1000) > now;
    }
    userVerified() {
        let data = this.user.getCurrentUserData();
        return Utils.isPlainObject(data) && this.sessionActive();
    }
    /*
     getLoginPageName: function() {
     return "PAGE_USER_LOGIN";
     },
     logInFirst : function(then) {
     let app  = this;
     let next = function(user_data) {
     app.user.setCurrentUserData(user_data, true);
     Utils.callback(then, [user_data]);
     };

     if (!this.userVerified()) {
     OWebPage.showPage(this.getLoginPageName(), {"next": next}, null,
     false);
     } else {
     Utils.callback(then, [app.user.getCurrentUserData()]);
     }
     },
     */
    request(method, url, data, success, fail, freeze = false) {
        let app = this;
        if (freeze) {
            app.view.freeze();
        }
        let options = {
            url: url,
            method: method,
            data: data,
            badNewsShow: false
        };
        let com = new OWebCom(this, options);
        com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response) => {
            setTimeout(function () {
                if (freeze) {
                    app.view.unfreeze();
                }
                Utils.callback(success, [response]);
            }, 1000);
        }).on(OWebCom.EVT_COM_REQUEST_ERROR, (response) => {
            if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
                app.destroyApp();
            }
            if (freeze) {
                app.view.unfreeze();
            }
            Utils.callback(fail, [response]);
        }).on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
            if (freeze) {
                app.view.unfreeze();
            }
            Utils.callback(fail, [{ "error": 1, "msg": "OZ_ERROR_REQUEST_FAIL", "is_network": true }]);
        }).send();
        return com;
    }
}
OWebApp.EVT_APP_READY = "OWebApp:ready";
OWebApp.SELF = "OWebApp";
;
//# sourceMappingURL=OWebApp.js.map