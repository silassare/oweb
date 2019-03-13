import OWebCom from "./OWebCom";
import OWebConfigs from "./OWebConfigs";
import OWebCurrentUser from "./OWebCurrentUser";
import OWebDataStore from "./OWebDataStore";
import OWebEvent from "./OWebEvent";
import OWebFormValidator from "./OWebFormValidator";
import OWebRouter from "./OWebRouter";
import OWebUrl from "./OWebUrl";
import OWebView from "./OWebView";
import OWebDate from "./plugins/OWebDate";
import Utils from "./utils/Utils";
import OWebLang from "./OWebLang";
/**
 * @ignore
 */
const noop = () => {
};
export default class OWebApp extends OWebEvent {
    /**
     * OWebApp constructor.
     *
     * @param app_name The app name.
     * @param app_config_list The app config.
     * @param app_url_list The app url list.
     */
    constructor(app_name, app_config_list, app_url_list) {
        super();
        this.app_name = app_name;
        this.services = {};
        this.ls = new OWebDataStore(this);
        this.configs = new OWebConfigs(this, app_config_list);
        this.url = new OWebUrl(this, app_url_list);
        this.user = new OWebCurrentUser(this);
        this.view = new OWebView();
        this.i18n = new OWebLang(this);
        let base_url = this.configs.get("OW_APP_LOCAL_BASE_URL"), hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE");
        this.router = new OWebRouter(base_url, hash_mode);
    }
    /**
     * App name getter.
     */
    getAppName() {
        return this.app_name;
    }
    /**
     * Check if we are running in mobile app.
     */
    isMobileApp() {
        return "cordova" in window;
    }
    /**
     * To start the web app.
     */
    start() {
        console.log("[OWebApp] app started!");
        this.trigger(OWebApp.EVT_APP_READY);
        return this;
    }
    /**
     * Returns registered service with a given name.
     *
     * @param service_name The service name.
     */
    getService(service_name) {
        return this.services[service_name];
    }
    /**
     * Register a new service.
     *
     * @param service The service object.
     */
    registerService(service) {
        let service_name = service.getName();
        if (this.services[service_name]) {
            throw new Error(`A service with the name "${service_name}" already defined.`);
        }
        this.services[service_name] = service;
        return this;
    }
    /**
     * Returns new form validator instance.
     *
     * @param form The html form element.
     * @param required The required fields names list.
     * @param excluded The fields names to exclude.
     * @param checkAll Force the validator to check all fields.
     */
    getFormValidator(form, required = [], excluded = [], checkAll = false) {
        return new OWebFormValidator(this, form, required, excluded, checkAll);
    }
    /**
     * Force login.
     *
     * > This will clear all saved data in the local storage.
     */
    forceLogin() {
        this.ls.clear();
        this.showLoginPage();
    }
    /**
     * Reload the app.
     */
    reloadApp() {
        // TODO: instead of reloading the current location, find a way to browse to web app entry point
        // for android & ios restart the app
        // window.location.reload(true);
        this.showHomePage();
    }
    /**
     * Destroy the app.
     *
     * > This will clear all saved data in the local storage.
     */
    destroyApp() {
        // erase data
        this.ls.clear();
        this.reloadApp();
    }
    /**
     * Close app.
     */
    closeApp() {
        // cordova
        if (window.navigator && window.navigator.app) {
            window.navigator.app.exitApp();
        }
        else {
            window.close();
        }
    }
    /**
     * Check if user session is active.
     */
    sessionActive() {
        let now = (new Date()).getTime(); // milliseconds
        let hour = 60 * 60; // seconds
        let expire = this.user.getSessionExpire() - hour; // seconds
        return (expire * 1000) > now;
    }
    /**
     * Check if the current user has been authenticated.
     */
    userVerified() {
        return Boolean(this.user.getCurrentUser() && this.sessionActive());
    }
    /**
     * Sends request and return promise.
     *
     * @param method The request method.
     * @param url The request url.
     * @param data The request payload.
     * @param freeze Force app view to be frozen.
     */
    requestPromise(method, url, data, freeze = false) {
        let m = this;
        return new Promise(function (resolve, reject) {
            m.request(method, url, data, resolve, reject, freeze);
        });
    }
    /**
     * Send request.
     *
     * @param method The request method.
     * @param url The request url.
     * @param data The request payload.
     * @param success Request success callback.
     * @param fail Request fail callback.
     * @param freeze Force app view to be frozen.
     */
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
OWebApp.SELF = Utils.id();
OWebApp.EVT_APP_READY = Utils.id();
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBdUIsTUFBTSxXQUFXLENBQUM7QUFDaEQsT0FBTyxXQUEwQixNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLFVBQVUsTUFBTSxjQUFjLENBQUM7QUFFdEMsT0FBTyxPQUFtQixNQUFNLFdBQVcsQ0FBQztBQUM1QyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxRQUFRLE1BQU0sb0JBQW9CLENBQUM7QUFDMUMsT0FBTyxLQUFLLE1BQU0sZUFBZSxDQUFDO0FBQ2xDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUVsQzs7R0FFRztBQUNILE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUNsQixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsT0FBTyxjQUF3QixTQUFRLFNBQVM7SUFjdEQ7Ozs7OztPQU1HO0lBQ0gsWUFBdUMsUUFBZ0IsRUFBRSxlQUE0QixFQUFFLFlBQXNCO1FBQzVHLEtBQUssRUFBRSxDQUFDO1FBRDhCLGFBQVEsR0FBUixRQUFRLENBQVE7UUFWOUMsYUFBUSxHQUF3QyxFQUFFLENBQUM7UUFZM0QsSUFBSSxDQUFDLEVBQUUsR0FBUyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsT0FBTyxHQUFJLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsR0FBRyxHQUFRLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsSUFBSSxHQUFPLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxJQUFJLEdBQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsSUFBSSxHQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksUUFBUSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixDQUFDLEVBQ3hELFNBQVMsR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsTUFBTSxHQUFLLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILFdBQVc7UUFDVixPQUFPLFNBQVMsSUFBSSxNQUFNLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVSxDQUFVLFlBQW9CO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGVBQWUsQ0FBNkIsT0FBVTtRQUVyRCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFckMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLFlBQVksb0JBQW9CLENBQUMsQ0FBQztTQUM5RTtRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBRXRDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBQyxJQUFxQixFQUFFLFdBQTBCLEVBQUUsRUFBRSxXQUEwQixFQUFFLEVBQUUsV0FBb0IsS0FBSztRQUM1SCxPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVTtRQUNULElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUiwrRkFBK0Y7UUFDL0Ysb0NBQW9DO1FBQ3BDLGdDQUFnQztRQUNoQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVO1FBQ1QsYUFBYTtRQUNiLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDUCxVQUFVO1FBQ1YsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFLLE1BQU0sQ0FBQyxTQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNyRCxNQUFNLENBQUMsU0FBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDeEM7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNmO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLElBQUksR0FBRyxHQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUEsZUFBZTtRQUNuRCxJQUFJLElBQUksR0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUEsVUFBVTtRQUMvQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEsVUFBVTtRQUMzRCxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGNBQWMsQ0FBQyxNQUFjLEVBQUUsR0FBVyxFQUFFLElBQVMsRUFBRSxTQUFrQixLQUFLO1FBQzdFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLE9BQU8sSUFBSSxPQUFPLENBQWUsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUN6RCxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsT0FBTyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBUyxFQUFFLFVBQTRDLElBQUksRUFBRSxPQUF5QyxJQUFJLEVBQUUsU0FBa0IsS0FBSztRQUN2SyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFFZixJQUFJLE1BQU0sRUFBRTtZQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDbEI7UUFFRCxJQUFJLE9BQU8sR0FBRztZQUNiLEdBQUcsRUFBVSxHQUFHO1lBQ2hCLE1BQU0sRUFBTyxNQUFNO1lBQ25CLElBQUksRUFBUyxJQUFJO1lBQ2pCLFdBQVcsRUFBRSxLQUFLO1NBQ2xCLENBQUM7UUFFRixJQUFJLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDbEUsMkJBQTJCO1lBQzNCLElBQUksTUFBTSxFQUFFO2dCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEI7WUFFRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEIsWUFBWTtRQUNiLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDL0QsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssNEJBQTRCLEVBQUU7Z0JBQ3JELEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUNqQjtZQUVELElBQUksTUFBTSxFQUFFO2dCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEI7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7WUFDekMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNwQjtZQUNELElBQUksUUFBUSxHQUFpQjtnQkFDNUIsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsS0FBSyxFQUFJLHVCQUF1QjtnQkFDaEMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUU7YUFDN0IsQ0FBQztZQUVGLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBRXpCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVWLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQzs7QUFwT2UsWUFBSSxHQUFZLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMzQixxQkFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQW1QM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQ29tLCB7aUNvbVJlc3BvbnNlfSBmcm9tIFwiLi9PV2ViQ29tXCI7XG5pbXBvcnQgT1dlYkNvbmZpZ3MsIHt0Q29uZmlnTGlzdH0gZnJvbSBcIi4vT1dlYkNvbmZpZ3NcIjtcbmltcG9ydCBPV2ViQ3VycmVudFVzZXIgZnJvbSBcIi4vT1dlYkN1cnJlbnRVc2VyXCI7XG5pbXBvcnQgT1dlYkRhdGFTdG9yZSBmcm9tIFwiLi9PV2ViRGF0YVN0b3JlXCI7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gXCIuL09XZWJFdmVudFwiO1xuaW1wb3J0IE9XZWJGb3JtVmFsaWRhdG9yIGZyb20gXCIuL09XZWJGb3JtVmFsaWRhdG9yXCI7XG5pbXBvcnQgT1dlYlJvdXRlciBmcm9tIFwiLi9PV2ViUm91dGVyXCI7XG5pbXBvcnQgT1dlYlNlcnZpY2UgZnJvbSBcIi4vT1dlYlNlcnZpY2VcIjtcbmltcG9ydCBPV2ViVXJsLCB7dFVybExpc3R9IGZyb20gXCIuL09XZWJVcmxcIjtcbmltcG9ydCBPV2ViVmlldyBmcm9tIFwiLi9PV2ViVmlld1wiO1xuaW1wb3J0IE9XZWJEYXRlIGZyb20gXCIuL3BsdWdpbnMvT1dlYkRhdGVcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuaW1wb3J0IE9XZWJMYW5nIGZyb20gXCIuL09XZWJMYW5nXCI7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBub29wID0gKCkgPT4ge1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgT1dlYkFwcCBleHRlbmRzIE9XZWJFdmVudCB7XG5cblx0c3RhdGljIHJlYWRvbmx5IFNFTEYgICAgICAgICAgPSBVdGlscy5pZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX0FQUF9SRUFEWSA9IFV0aWxzLmlkKCk7XG5cblx0cmVhZG9ubHkgdmlldzogT1dlYlZpZXc7XG5cdHJlYWRvbmx5IGxzOiBPV2ViRGF0YVN0b3JlO1xuXHRyZWFkb25seSByb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cdHJlYWRvbmx5IHVzZXI6IE9XZWJDdXJyZW50VXNlcjtcblx0cmVhZG9ubHkgY29uZmlnczogT1dlYkNvbmZpZ3M7XG5cdHJlYWRvbmx5IHVybDogT1dlYlVybDtcblx0cmVhZG9ubHkgc2VydmljZXM6IHsgW2tleTogc3RyaW5nXTogT1dlYlNlcnZpY2U8YW55PiB9ID0ge307XG5cdHJlYWRvbmx5IGkxOG46IE9XZWJMYW5nO1xuXG5cdC8qKlxuXHQgKiBPV2ViQXBwIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYXBwX25hbWUgVGhlIGFwcCBuYW1lLlxuXHQgKiBAcGFyYW0gYXBwX2NvbmZpZ19saXN0IFRoZSBhcHAgY29uZmlnLlxuXHQgKiBAcGFyYW0gYXBwX3VybF9saXN0IFRoZSBhcHAgdXJsIGxpc3QuXG5cdCAqL1xuXHRwcm90ZWN0ZWQgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBhcHBfbmFtZTogc3RyaW5nLCBhcHBfY29uZmlnX2xpc3Q6IHRDb25maWdMaXN0LCBhcHBfdXJsX2xpc3Q6IHRVcmxMaXN0KSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmxzICAgICAgID0gbmV3IE9XZWJEYXRhU3RvcmUodGhpcyk7XG5cdFx0dGhpcy5jb25maWdzICA9IG5ldyBPV2ViQ29uZmlncyh0aGlzLCBhcHBfY29uZmlnX2xpc3QpO1xuXHRcdHRoaXMudXJsICAgICAgPSBuZXcgT1dlYlVybCh0aGlzLCBhcHBfdXJsX2xpc3QpO1xuXHRcdHRoaXMudXNlciAgICAgPSBuZXcgT1dlYkN1cnJlbnRVc2VyKHRoaXMpO1xuXHRcdHRoaXMudmlldyAgICAgPSBuZXcgT1dlYlZpZXcoKTtcblx0XHR0aGlzLmkxOG4gICAgID0gbmV3IE9XZWJMYW5nKHRoaXMpO1xuXHRcdGxldCBiYXNlX3VybCAgPSB0aGlzLmNvbmZpZ3MuZ2V0KFwiT1dfQVBQX0xPQ0FMX0JBU0VfVVJMXCIpLFxuXHRcdFx0aGFzaF9tb2RlID0gZmFsc2UgIT09IHRoaXMuY29uZmlncy5nZXQoXCJPV19BUFBfUk9VVEVSX0hBU0hfTU9ERVwiKTtcblx0XHR0aGlzLnJvdXRlciAgID0gbmV3IE9XZWJSb3V0ZXIoYmFzZV91cmwsIGhhc2hfbW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0QXBwTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmFwcF9uYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHdlIGFyZSBydW5uaW5nIGluIG1vYmlsZSBhcHAuXG5cdCAqL1xuXHRpc01vYmlsZUFwcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gXCJjb3Jkb3ZhXCIgaW4gd2luZG93O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRvIHN0YXJ0IHRoZSB3ZWIgYXBwLlxuXHQgKi9cblx0c3RhcnQoKTogdGhpcyB7XG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYkFwcF0gYXBwIHN0YXJ0ZWQhXCIpO1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9BUFBfUkVBRFkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgcmVnaXN0ZXJlZCBzZXJ2aWNlIHdpdGggYSBnaXZlbiBuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gc2VydmljZV9uYW1lIFRoZSBzZXJ2aWNlIG5hbWUuXG5cdCAqL1xuXHRnZXRTZXJ2aWNlPFQgPSBhbnk+KHNlcnZpY2VfbmFtZTogc3RyaW5nKTogT1dlYlNlcnZpY2U8VD4gfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLnNlcnZpY2VzW3NlcnZpY2VfbmFtZV07XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgYSBuZXcgc2VydmljZS5cblx0ICpcblx0ICogQHBhcmFtIHNlcnZpY2UgVGhlIHNlcnZpY2Ugb2JqZWN0LlxuXHQgKi9cblx0cmVnaXN0ZXJTZXJ2aWNlPFQgZXh0ZW5kcyBPV2ViU2VydmljZTxhbnk+PihzZXJ2aWNlOiBUKTogdGhpcyB7XG5cblx0XHRsZXQgc2VydmljZV9uYW1lID0gc2VydmljZS5nZXROYW1lKCk7XG5cblx0XHRpZiAodGhpcy5zZXJ2aWNlc1tzZXJ2aWNlX25hbWVdKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEEgc2VydmljZSB3aXRoIHRoZSBuYW1lIFwiJHtzZXJ2aWNlX25hbWV9XCIgYWxyZWFkeSBkZWZpbmVkLmApO1xuXHRcdH1cblxuXHRcdHRoaXMuc2VydmljZXNbc2VydmljZV9uYW1lXSA9IHNlcnZpY2U7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG5ldyBmb3JtIHZhbGlkYXRvciBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm0gVGhlIGh0bWwgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyBuYW1lcyB0byBleGNsdWRlLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgRm9yY2UgdGhlIHZhbGlkYXRvciB0byBjaGVjayBhbGwgZmllbGRzLlxuXHQgKi9cblx0Z2V0Rm9ybVZhbGlkYXRvcihmb3JtOiBIVE1MRm9ybUVsZW1lbnQsIHJlcXVpcmVkOiBBcnJheTxzdHJpbmc+ID0gW10sIGV4Y2x1ZGVkOiBBcnJheTxzdHJpbmc+ID0gW10sIGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRyZXR1cm4gbmV3IE9XZWJGb3JtVmFsaWRhdG9yKHRoaXMsIGZvcm0sIHJlcXVpcmVkLCBleGNsdWRlZCwgY2hlY2tBbGwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZvcmNlIGxvZ2luLlxuXHQgKlxuXHQgKiA+IFRoaXMgd2lsbCBjbGVhciBhbGwgc2F2ZWQgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cblx0ICovXG5cdGZvcmNlTG9naW4oKSB7XG5cdFx0dGhpcy5scy5jbGVhcigpO1xuXHRcdHRoaXMuc2hvd0xvZ2luUGFnZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZCB0aGUgYXBwLlxuXHQgKi9cblx0cmVsb2FkQXBwKCkge1xuXHRcdC8vIFRPRE86IGluc3RlYWQgb2YgcmVsb2FkaW5nIHRoZSBjdXJyZW50IGxvY2F0aW9uLCBmaW5kIGEgd2F5IHRvIGJyb3dzZSB0byB3ZWIgYXBwIGVudHJ5IHBvaW50XG5cdFx0Ly8gZm9yIGFuZHJvaWQgJiBpb3MgcmVzdGFydCB0aGUgYXBwXG5cdFx0Ly8gd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcblx0XHR0aGlzLnNob3dIb21lUGFnZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlc3Ryb3kgdGhlIGFwcC5cblx0ICpcblx0ICogPiBUaGlzIHdpbGwgY2xlYXIgYWxsIHNhdmVkIGRhdGEgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG5cdCAqL1xuXHRkZXN0cm95QXBwKCkge1xuXHRcdC8vIGVyYXNlIGRhdGFcblx0XHR0aGlzLmxzLmNsZWFyKCk7XG5cdFx0dGhpcy5yZWxvYWRBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbG9zZSBhcHAuXG5cdCAqL1xuXHRjbG9zZUFwcCgpIHtcblx0XHQvLyBjb3Jkb3ZhXG5cdFx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgKHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHApIHtcblx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBub3cgICAgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpOy8vIG1pbGxpc2Vjb25kc1xuXHRcdGxldCBob3VyICAgPSA2MCAqIDYwOy8vIHNlY29uZHNcblx0XHRsZXQgZXhwaXJlID0gdGhpcy51c2VyLmdldFNlc3Npb25FeHBpcmUoKSAtIGhvdXI7Ly8gc2Vjb25kc1xuXHRcdHJldHVybiAoZXhwaXJlICogMTAwMCkgPiBub3c7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIGN1cnJlbnQgdXNlciBoYXMgYmVlbiBhdXRoZW50aWNhdGVkLlxuXHQgKi9cblx0dXNlclZlcmlmaWVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMudXNlci5nZXRDdXJyZW50VXNlcigpICYmIHRoaXMuc2Vzc2lvbkFjdGl2ZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kcyByZXF1ZXN0IGFuZCByZXR1cm4gcHJvbWlzZS5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZCBUaGUgcmVxdWVzdCBtZXRob2QuXG5cdCAqIEBwYXJhbSB1cmwgVGhlIHJlcXVlc3QgdXJsLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgcmVxdWVzdCBwYXlsb2FkLlxuXHQgKiBAcGFyYW0gZnJlZXplIEZvcmNlIGFwcCB2aWV3IHRvIGJlIGZyb3plbi5cblx0ICovXG5cdHJlcXVlc3RQcm9taXNlKG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgZGF0YTogYW55LCBmcmVlemU6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8aUNvbVJlc3BvbnNlPiB7XG5cdFx0bGV0IG0gPSB0aGlzO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTxpQ29tUmVzcG9uc2U+KGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdG0ucmVxdWVzdChtZXRob2QsIHVybCwgZGF0YSwgcmVzb2x2ZSwgcmVqZWN0LCBmcmVlemUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmQgcmVxdWVzdC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZCBUaGUgcmVxdWVzdCBtZXRob2QuXG5cdCAqIEBwYXJhbSB1cmwgVGhlIHJlcXVlc3QgdXJsLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgcmVxdWVzdCBwYXlsb2FkLlxuXHQgKiBAcGFyYW0gc3VjY2VzcyBSZXF1ZXN0IHN1Y2Nlc3MgY2FsbGJhY2suXG5cdCAqIEBwYXJhbSBmYWlsIFJlcXVlc3QgZmFpbCBjYWxsYmFjay5cblx0ICogQHBhcmFtIGZyZWV6ZSBGb3JjZSBhcHAgdmlldyB0byBiZSBmcm96ZW4uXG5cdCAqL1xuXHRyZXF1ZXN0KG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgZGF0YTogYW55LCBzdWNjZXNzOiAocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCA9IG5vb3AsIGZhaWw6IChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkID0gbm9vcCwgZnJlZXplOiBib29sZWFuID0gZmFsc2UpOiBPV2ViQ29tIHtcblx0XHRsZXQgYXBwID0gdGhpcztcblxuXHRcdGlmIChmcmVlemUpIHtcblx0XHRcdGFwcC52aWV3LmZyZWV6ZSgpO1xuXHRcdH1cblxuXHRcdGxldCBvcHRpb25zID0ge1xuXHRcdFx0dXJsICAgICAgICA6IHVybCxcblx0XHRcdG1ldGhvZCAgICAgOiBtZXRob2QsXG5cdFx0XHRkYXRhICAgICAgIDogZGF0YSxcblx0XHRcdGJhZE5ld3NTaG93OiBmYWxzZVxuXHRcdH07XG5cblx0XHRsZXQgY29tID0gbmV3IE9XZWJDb20odGhpcywgb3B0aW9ucyk7XG5cdFx0Y29tLm9uKE9XZWJDb20uRVZUX0NPTV9SRVFVRVNUX1NVQ0NFU1MsIChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHQvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdH1cblxuXHRcdFx0c3VjY2VzcyhyZXNwb25zZSk7XG5cdFx0XHQvLyB9LCAxMDAwKTtcblx0XHR9KS5vbihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9FUlJPUiwgKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdGlmIChyZXNwb25zZVtcIm1zZ1wiXSA9PT0gXCJPWl9FUlJPUl9ZT1VfQVJFX05PVF9BRE1JTlwiKSB7XG5cdFx0XHRcdGFwcC5kZXN0cm95QXBwKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdH1cblxuXHRcdFx0ZmFpbChyZXNwb25zZSk7XG5cdFx0fSkub24oT1dlYkNvbS5FVlRfQ09NX05FVFdPUktfRVJST1IsICgpID0+IHtcblx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdH1cblx0XHRcdGxldCByZXNwb25zZTogaUNvbVJlc3BvbnNlID0ge1xuXHRcdFx0XHRcImVycm9yXCI6IDEsXG5cdFx0XHRcdFwibXNnXCIgIDogXCJPWl9FUlJPUl9SRVFVRVNUX0ZBSUxcIixcblx0XHRcdFx0XCJ1dGltZVwiOiBPV2ViRGF0ZS50aW1lc3RhbXAoKVxuXHRcdFx0fTtcblxuXHRcdFx0cmVzcG9uc2UubmV0ZXJyb3IgPSB0cnVlO1xuXG5cdFx0XHRmYWlsKHJlc3BvbnNlKTtcblx0XHR9KS5zZW5kKCk7XG5cblx0XHRyZXR1cm4gY29tO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgaG9tZSBwYWdlLlxuXHQgKi9cblx0YWJzdHJhY3Qgc2hvd0hvbWVQYWdlKCk6IHRoaXNcblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYXBwIHNob3VsZCBzaG93IHRoZSBsb2dpbiBwYWdlLlxuXHQgKi9cblx0YWJzdHJhY3Qgc2hvd0xvZ2luUGFnZSgpOiB0aGlzXG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgc2lnbnVwIHBhZ2UuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93U2lnblVwUGFnZSgpOiB0aGlzXG59O1xuIl19