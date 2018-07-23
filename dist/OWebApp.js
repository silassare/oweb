"use strict";
import OWebEvent from "./OWebEvent";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebView from "./OWebView";
import OWebDataStore from "./OWebDataStore";
import OWebDate from "./plugins/OWebDate";
import Utils from "./utils/Utils";
import OWebCom from "./OWebCom";
import OWebFormValidator from "./OWebFormValidator";
import OWebService from "./OWebService";
import OWebConfigs from "./OWebConfigs";
import OWebUrl from "./OWebUrl";
import OWebRouter from "./OWebRouter";
const noop = () => {
};
export default class OWebApp extends OWebEvent {
    constructor(app_name, app_config_list, app_url_list) {
        super();
        this.app_name = app_name;
        this.services = {};
        this.configs = new OWebConfigs(this, app_config_list);
        this.url = new OWebUrl(this, app_url_list);
        this.user = new OWebCurrentUser(this);
        this.view = new OWebView();
        let base_url = this.configs.get("OW_APP_LOCAL_BASE_URL"), hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE");
        this.router = new OWebRouter(base_url, hash_mode);
    }
    getAppName() {
        return this.app_name;
    }
    start() {
        console.log("[OWebApp] app started!");
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
    getFormValidator(form, required = [], excluded = []) {
        return new OWebFormValidator(this, form, required, excluded);
    }
    forceLogin() {
        OWebDataStore.clear();
        this.reloadApp();
    }
    reloadApp() {
        // TODO: instead of reloading the current location, find a way to browse to web app entry point
        // for android & ios restart the app
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
    requestPromise(method, url, data, freeze = false) {
        let m = this;
        return new Promise(function (resolve, reject) {
            m.request(method, url, data, resolve, reject, freeze);
        });
    }
    request(method, url, data, success = noop, fail = noop, freeze = false) {
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
            // setTimeout(function () {
            if (freeze) {
                app.view.unfreeze();
            }
            success(response);
            // }, 1000);
        }).on(OWebCom.EVT_COM_REQUEST_ERROR, (response) => {
            if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
                app.destroyApp();
            }
            if (freeze) {
                app.view.unfreeze();
            }
            fail(response);
        }).on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
            if (freeze) {
                app.view.unfreeze();
            }
            let response = {
                "error": 1,
                "msg": "OZ_ERROR_REQUEST_FAIL",
                "utime": OWebDate.timestamp()
            };
            response.neterror = true;
            fail(response);
        }).send();
        return com;
    }
}
OWebApp.EVT_APP_READY = "OWebApp:ready";
OWebApp.SELF = "OWebApp";
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sU0FBUyxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxRQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sT0FBdUIsTUFBTSxXQUFXLENBQUM7QUFDaEQsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxXQUEwQixNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLE9BQW1CLE1BQU0sV0FBVyxDQUFDO0FBQzVDLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUV0QyxNQUFNLElBQUksR0FBRyxHQUFHLEVBQUU7QUFDbEIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFZN0MsWUFBNkIsUUFBZ0IsRUFBRSxlQUE0QixFQUFFLFlBQXNCO1FBQ2xHLEtBQUssRUFBRSxDQUFDO1FBRG9CLGFBQVEsR0FBUixRQUFRLENBQVE7UUFGcEMsYUFBUSxHQUF3QyxFQUFFLENBQUM7UUFJM0QsSUFBSSxDQUFDLE9BQU8sR0FBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLEdBQUcsR0FBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLElBQUksR0FBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLENB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