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
import OWebI18n from "./OWebI18n";
import OWebPager from "./OWebPager";
/**
 * @ignore
 */
const noop = () => {
};
export default class OWebApp extends OWebEvent {
    /**
     * OWebApp constructor.
     *
     * @param name The app name.
     * @param configs The app config.
     * @param urls The app url list.
     * @param state The app state.
     */
    constructor(name, configs, urls) {
        super();
        this.name = name;
        this.ls = new OWebDataStore(this);
        this.configs = new OWebConfigs(this, configs);
        this.url = new OWebUrl(this, urls);
        this.user = new OWebCurrentUser(this);
        this.view = new OWebView();
        this.pager = new OWebPager(this);
        this.i18n = new OWebI18n();
        let base_url = this.configs.get("OW_APP_LOCAL_BASE_URL"), hash_mode = false !== this.configs.get("OW_APP_ROUTER_HASH_MODE");
        this.router = new OWebRouter(base_url, hash_mode);
        this.router.notFound(this.showNotFound.bind(this));
        this.i18n.setDefaultLang(this.configs.get("OW_APP_DEFAULT_LANG"));
    }
    /**
     * App name getter.
     */
    getAppName() {
        return this.name;
    }
    /**
     * Checks if we are running in mobile app.
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
     * Checks if user session is active.
     */
    sessionActive() {
        let now = (new Date()).getTime(); // milliseconds
        let hour = 60 * 60; // seconds
        let expire = this.user.getSessionExpire() - hour; // seconds
        return (expire * 1000) > now;
    }
    /**
     * Checks if the current user has been authenticated.
     */
    userVerified() {
        return Boolean(this.user.getCurrentUser() && this.sessionActive());
    }
    /**
     * Send request and return promise.
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
            success.call(com, response);
            // }, 1000);
        }).on(OWebCom.EVT_COM_REQUEST_ERROR, (response) => {
            if (response["msg"] === "OZ_ERROR_YOU_ARE_NOT_ADMIN") {
                app.destroyApp();
            }
            if (freeze) {
                app.view.unfreeze();
            }
            fail.call(com, response);
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
            fail.call(com, response);
        }).send();
        return com;
    }
    /**
     * Register handler for OWebApp.EVT_APP_READY event
     *
     * @param handler
     */
    onReady(handler) {
        return this.on(OWebApp.EVT_APP_READY, handler);
    }
}
OWebApp.SELF = Utils.id();
OWebApp.EVT_APP_READY = Utils.id();
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBeUIsTUFBTSxXQUFXLENBQUM7QUFDbEQsT0FBTyxXQUE0QixNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLFVBQTRCLE1BQU0sY0FBYyxDQUFDO0FBQ3hELE9BQU8sT0FBcUIsTUFBTSxXQUFXLENBQUM7QUFDOUMsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sUUFBUSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDOztHQUVHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFO0FBQ2xCLENBQUMsQ0FBQztBQUdGLE1BQU0sQ0FBQyxPQUFPLGNBQXdCLFNBQVEsU0FBUztJQWN0RDs7Ozs7OztPQU9HO0lBQ0gsWUFBdUMsSUFBWSxFQUFFLE9BQW9CLEVBQUUsSUFBYztRQUN4RixLQUFLLEVBQUUsQ0FBQztRQUQ4QixTQUFJLEdBQUosSUFBSSxDQUFRO1FBR2xELElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFFM0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsRUFDdkQsU0FBUyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBRW5FLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRWxELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVU7UUFDVCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVztRQUNWLE9BQU8sU0FBUyxJQUFJLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLO1FBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBQyxJQUFxQixFQUFFLFdBQTBCLEVBQUUsRUFBRSxXQUEwQixFQUFFLEVBQUUsV0FBb0IsS0FBSztRQUM1SCxPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsVUFBVTtRQUNULElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVM7UUFDUiwrRkFBK0Y7UUFDL0Ysb0NBQW9DO1FBQ3BDLGdDQUFnQztRQUNoQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVO1FBQ1QsYUFBYTtRQUNiLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDUCxVQUFVO1FBQ1YsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFLLE1BQU0sQ0FBQyxTQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNyRCxNQUFNLENBQUMsU0FBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDeEM7YUFBTTtZQUNOLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNmO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0gsYUFBYTtRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUEsZUFBZTtRQUNoRCxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUEsVUFBVTtRQUM3QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUEsVUFBVTtRQUMzRCxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxZQUFZO1FBQ1gsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGNBQWMsQ0FBQyxNQUFjLEVBQUUsR0FBVyxFQUFFLElBQVMsRUFBRSxTQUFrQixLQUFLO1FBQzdFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLE9BQU8sSUFBSSxPQUFPLENBQWUsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUN6RCxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsT0FBTyxDQUFDLE1BQWMsRUFBRSxHQUFXLEVBQUUsSUFBUyxFQUFFLFVBQTJELElBQUksRUFBRSxPQUF3RCxJQUFJLEVBQUUsU0FBa0IsS0FBSztRQUNyTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFFZixJQUFJLE1BQU0sRUFBRTtZQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDbEI7UUFFRCxJQUFJLE9BQU8sR0FBRztZQUNiLEdBQUcsRUFBRSxHQUFHO1lBQ1IsTUFBTSxFQUFFLE1BQU07WUFDZCxJQUFJLEVBQUUsSUFBSTtZQUNWLFdBQVcsRUFBRSxLQUFLO1NBQ2xCLENBQUM7UUFFRixJQUFJLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxRQUFzQixFQUFFLEVBQUU7WUFDbEUsMkJBQTJCO1lBQzNCLElBQUksTUFBTSxFQUFFO2dCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEI7WUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM1QixZQUFZO1FBQ2IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLFFBQXNCLEVBQUUsRUFBRTtZQUMvRCxJQUFJLFFBQVEsQ0FBRSxLQUFLLENBQUUsS0FBSyw0QkFBNEIsRUFBRTtnQkFDdkQsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNwQjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLElBQUksTUFBTSxFQUFFO2dCQUNYLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEI7WUFDRCxJQUFJLFFBQVEsR0FBaUI7Z0JBQzVCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLE9BQU8sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFO2FBQzdCLENBQUM7WUFFRixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUV6QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVWLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsT0FBdUM7UUFDOUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7QUEzTmUsWUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNsQixxQkFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQStPM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQ29tLCB7IGlDb21SZXNwb25zZSB9IGZyb20gXCIuL09XZWJDb21cIjtcbmltcG9ydCBPV2ViQ29uZmlncywgeyB0Q29uZmlnTGlzdCB9IGZyb20gXCIuL09XZWJDb25maWdzXCI7XG5pbXBvcnQgT1dlYkN1cnJlbnRVc2VyIGZyb20gXCIuL09XZWJDdXJyZW50VXNlclwiO1xuaW1wb3J0IE9XZWJEYXRhU3RvcmUgZnJvbSBcIi4vT1dlYkRhdGFTdG9yZVwiO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tIFwiLi9PV2ViRXZlbnRcIjtcbmltcG9ydCBPV2ViRm9ybVZhbGlkYXRvciBmcm9tIFwiLi9PV2ViRm9ybVZhbGlkYXRvclwiO1xuaW1wb3J0IE9XZWJSb3V0ZXIsIHsgdFJvdXRlVGFyZ2V0IH0gZnJvbSBcIi4vT1dlYlJvdXRlclwiO1xuaW1wb3J0IE9XZWJVcmwsIHsgdFVybExpc3QgfSBmcm9tIFwiLi9PV2ViVXJsXCI7XG5pbXBvcnQgT1dlYlZpZXcgZnJvbSBcIi4vT1dlYlZpZXdcIjtcbmltcG9ydCBPV2ViRGF0ZSBmcm9tIFwiLi9wbHVnaW5zL09XZWJEYXRlXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcbmltcG9ydCBPV2ViSTE4biBmcm9tIFwiLi9PV2ViSTE4blwiO1xuaW1wb3J0IE9XZWJQYWdlciBmcm9tIFwiLi9PV2ViUGFnZXJcIjtcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IG5vb3AgPSAoKSA9PiB7XG59O1xuXG5cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIE9XZWJBcHAgZXh0ZW5kcyBPV2ViRXZlbnQge1xuXG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUFBfUkVBRFkgPSBVdGlscy5pZCgpO1xuXG5cdHJlYWRvbmx5IHZpZXc6IE9XZWJWaWV3O1xuXHRyZWFkb25seSBwYWdlcjogT1dlYlBhZ2VyPGFueT47XG5cdHJlYWRvbmx5IGxzOiBPV2ViRGF0YVN0b3JlO1xuXHRyZWFkb25seSByb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cdHJlYWRvbmx5IHVzZXI6IE9XZWJDdXJyZW50VXNlcjtcblx0cmVhZG9ubHkgY29uZmlnczogT1dlYkNvbmZpZ3M7XG5cdHJlYWRvbmx5IHVybDogT1dlYlVybDtcblx0cmVhZG9ubHkgaTE4bjogT1dlYkkxOG47XG5cblx0LyoqXG5cdCAqIE9XZWJBcHAgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSBhcHAgbmFtZS5cblx0ICogQHBhcmFtIGNvbmZpZ3MgVGhlIGFwcCBjb25maWcuXG5cdCAqIEBwYXJhbSB1cmxzIFRoZSBhcHAgdXJsIGxpc3QuXG5cdCAqIEBwYXJhbSBzdGF0ZSBUaGUgYXBwIHN0YXRlLlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLCBjb25maWdzOiB0Q29uZmlnTGlzdCwgdXJsczogdFVybExpc3QpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5scyA9IG5ldyBPV2ViRGF0YVN0b3JlKHRoaXMpO1xuXHRcdHRoaXMuY29uZmlncyA9IG5ldyBPV2ViQ29uZmlncyh0aGlzLCBjb25maWdzKTtcblx0XHR0aGlzLnVybCA9IG5ldyBPV2ViVXJsKHRoaXMsIHVybHMpO1xuXHRcdHRoaXMudXNlciA9IG5ldyBPV2ViQ3VycmVudFVzZXIodGhpcyk7XG5cdFx0dGhpcy52aWV3ID0gbmV3IE9XZWJWaWV3KCk7XG5cdFx0dGhpcy5wYWdlciA9IG5ldyBPV2ViUGFnZXIodGhpcyk7XG5cdFx0dGhpcy5pMThuID0gbmV3IE9XZWJJMThuKCk7XG5cblx0XHRsZXQgYmFzZV91cmwgPSB0aGlzLmNvbmZpZ3MuZ2V0KFwiT1dfQVBQX0xPQ0FMX0JBU0VfVVJMXCIpLFxuXHRcdFx0aGFzaF9tb2RlID0gZmFsc2UgIT09IHRoaXMuY29uZmlncy5nZXQoXCJPV19BUFBfUk9VVEVSX0hBU0hfTU9ERVwiKTtcblxuXHRcdHRoaXMucm91dGVyID0gbmV3IE9XZWJSb3V0ZXIoYmFzZV91cmwsIGhhc2hfbW9kZSk7XG5cblx0XHR0aGlzLnJvdXRlci5ub3RGb3VuZCh0aGlzLnNob3dOb3RGb3VuZC5iaW5kKHRoaXMpKTtcblxuXHRcdHRoaXMuaTE4bi5zZXREZWZhdWx0TGFuZyh0aGlzLmNvbmZpZ3MuZ2V0KFwiT1dfQVBQX0RFRkFVTFRfTEFOR1wiKSk7XG5cdH1cblxuXHQvKipcblx0ICogQXBwIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0QXBwTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHdlIGFyZSBydW5uaW5nIGluIG1vYmlsZSBhcHAuXG5cdCAqL1xuXHRpc01vYmlsZUFwcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gXCJjb3Jkb3ZhXCIgaW4gd2luZG93O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRvIHN0YXJ0IHRoZSB3ZWIgYXBwLlxuXHQgKi9cblx0c3RhcnQoKTogdGhpcyB7XG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYkFwcF0gYXBwIHN0YXJ0ZWQhXCIpO1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9BUFBfUkVBRFkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgbmV3IGZvcm0gdmFsaWRhdG9yIGluc3RhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybSBUaGUgaHRtbCBmb3JtIGVsZW1lbnQuXG5cdCAqIEBwYXJhbSByZXF1aXJlZCBUaGUgcmVxdWlyZWQgZmllbGRzIG5hbWVzIGxpc3QuXG5cdCAqIEBwYXJhbSBleGNsdWRlZCBUaGUgZmllbGRzIG5hbWVzIHRvIGV4Y2x1ZGUuXG5cdCAqIEBwYXJhbSBjaGVja0FsbCBGb3JjZSB0aGUgdmFsaWRhdG9yIHRvIGNoZWNrIGFsbCBmaWVsZHMuXG5cdCAqL1xuXHRnZXRGb3JtVmFsaWRhdG9yKGZvcm06IEhUTUxGb3JtRWxlbWVudCwgcmVxdWlyZWQ6IEFycmF5PHN0cmluZz4gPSBbXSwgZXhjbHVkZWQ6IEFycmF5PHN0cmluZz4gPSBbXSwgY2hlY2tBbGw6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdHJldHVybiBuZXcgT1dlYkZvcm1WYWxpZGF0b3IodGhpcywgZm9ybSwgcmVxdWlyZWQsIGV4Y2x1ZGVkLCBjaGVja0FsbCk7XG5cdH1cblxuXHQvKipcblx0ICogRm9yY2UgbG9naW4uXG5cdCAqXG5cdCAqID4gVGhpcyB3aWxsIGNsZWFyIGFsbCBzYXZlZCBkYXRhIGluIHRoZSBsb2NhbCBzdG9yYWdlLlxuXHQgKi9cblx0Zm9yY2VMb2dpbigpIHtcblx0XHR0aGlzLmxzLmNsZWFyKCk7XG5cdFx0dGhpcy5zaG93TG9naW5QYWdlKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVsb2FkIHRoZSBhcHAuXG5cdCAqL1xuXHRyZWxvYWRBcHAoKSB7XG5cdFx0Ly8gVE9ETzogaW5zdGVhZCBvZiByZWxvYWRpbmcgdGhlIGN1cnJlbnQgbG9jYXRpb24sIGZpbmQgYSB3YXkgdG8gYnJvd3NlIHRvIHdlYiBhcHAgZW50cnkgcG9pbnRcblx0XHQvLyBmb3IgYW5kcm9pZCAmIGlvcyByZXN0YXJ0IHRoZSBhcHBcblx0XHQvLyB3aW5kb3cubG9jYXRpb24ucmVsb2FkKHRydWUpO1xuXHRcdHRoaXMuc2hvd0hvbWVQYWdlKCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveSB0aGUgYXBwLlxuXHQgKlxuXHQgKiA+IFRoaXMgd2lsbCBjbGVhciBhbGwgc2F2ZWQgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cblx0ICovXG5cdGRlc3Ryb3lBcHAoKSB7XG5cdFx0Ly8gZXJhc2UgZGF0YVxuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnJlbG9hZEFwcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlIGFwcC5cblx0ICovXG5cdGNsb3NlQXBwKCkge1xuXHRcdC8vIGNvcmRvdmFcblx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBub3cgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpOy8vIG1pbGxpc2Vjb25kc1xuXHRcdGxldCBob3VyID0gNjAgKiA2MDsvLyBzZWNvbmRzXG5cdFx0bGV0IGV4cGlyZSA9IHRoaXMudXNlci5nZXRTZXNzaW9uRXhwaXJlKCkgLSBob3VyOy8vIHNlY29uZHNcblx0XHRyZXR1cm4gKGV4cGlyZSAqIDEwMDApID4gbm93O1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIGF1dGhlbnRpY2F0ZWQuXG5cdCAqL1xuXHR1c2VyVmVyaWZpZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIEJvb2xlYW4odGhpcy51c2VyLmdldEN1cnJlbnRVc2VyKCkgJiYgdGhpcy5zZXNzaW9uQWN0aXZlKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmQgcmVxdWVzdCBhbmQgcmV0dXJuIHByb21pc2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIHJlcXVlc3QgbWV0aG9kLlxuXHQgKiBAcGFyYW0gdXJsIFRoZSByZXF1ZXN0IHVybC5cblx0ICogQHBhcmFtIGRhdGEgVGhlIHJlcXVlc3QgcGF5bG9hZC5cblx0ICogQHBhcmFtIGZyZWV6ZSBGb3JjZSBhcHAgdmlldyB0byBiZSBmcm96ZW4uXG5cdCAqL1xuXHRyZXF1ZXN0UHJvbWlzZShtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIGRhdGE6IGFueSwgZnJlZXplOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPGlDb21SZXNwb25zZT4ge1xuXHRcdGxldCBtID0gdGhpcztcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8aUNvbVJlc3BvbnNlPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRtLnJlcXVlc3QobWV0aG9kLCB1cmwsIGRhdGEsIHJlc29sdmUsIHJlamVjdCwgZnJlZXplKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIHJlcXVlc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXRob2QgVGhlIHJlcXVlc3QgbWV0aG9kLlxuXHQgKiBAcGFyYW0gdXJsIFRoZSByZXF1ZXN0IHVybC5cblx0ICogQHBhcmFtIGRhdGEgVGhlIHJlcXVlc3QgcGF5bG9hZC5cblx0ICogQHBhcmFtIHN1Y2Nlc3MgUmVxdWVzdCBzdWNjZXNzIGNhbGxiYWNrLlxuXHQgKiBAcGFyYW0gZmFpbCBSZXF1ZXN0IGZhaWwgY2FsbGJhY2suXG5cdCAqIEBwYXJhbSBmcmVlemUgRm9yY2UgYXBwIHZpZXcgdG8gYmUgZnJvemVuLlxuXHQgKi9cblx0cmVxdWVzdChtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIGRhdGE6IGFueSwgc3VjY2VzczogKHRoaXM6IE9XZWJDb20sIHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHZvaWQgPSBub29wLCBmYWlsOiAodGhpczogT1dlYkNvbSwgcmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCA9IG5vb3AsIGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlKTogT1dlYkNvbSB7XG5cdFx0bGV0IGFwcCA9IHRoaXM7XG5cblx0XHRpZiAoZnJlZXplKSB7XG5cdFx0XHRhcHAudmlldy5mcmVlemUoKTtcblx0XHR9XG5cblx0XHRsZXQgb3B0aW9ucyA9IHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0YmFkTmV3c1Nob3c6IGZhbHNlXG5cdFx0fTtcblxuXHRcdGxldCBjb20gPSBuZXcgT1dlYkNvbSh0aGlzLCBvcHRpb25zKTtcblx0XHRjb20ub24oT1dlYkNvbS5FVlRfQ09NX1JFUVVFU1RfU1VDQ0VTUywgKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKGZyZWV6ZSkge1xuXHRcdFx0XHRhcHAudmlldy51bmZyZWV6ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRzdWNjZXNzLmNhbGwoY29tLCByZXNwb25zZSk7XG5cdFx0XHQvLyB9LCAxMDAwKTtcblx0XHR9KS5vbihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9FUlJPUiwgKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdGlmIChyZXNwb25zZVsgXCJtc2dcIiBdID09PSBcIk9aX0VSUk9SX1lPVV9BUkVfTk9UX0FETUlOXCIpIHtcblx0XHRcdFx0YXBwLmRlc3Ryb3lBcHAoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGZyZWV6ZSkge1xuXHRcdFx0XHRhcHAudmlldy51bmZyZWV6ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRmYWlsLmNhbGwoY29tLCByZXNwb25zZSk7XG5cdFx0fSkub24oT1dlYkNvbS5FVlRfQ09NX05FVFdPUktfRVJST1IsICgpID0+IHtcblx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdH1cblx0XHRcdGxldCByZXNwb25zZTogaUNvbVJlc3BvbnNlID0ge1xuXHRcdFx0XHRcImVycm9yXCI6IDEsXG5cdFx0XHRcdFwibXNnXCI6IFwiT1pfRVJST1JfUkVRVUVTVF9GQUlMXCIsXG5cdFx0XHRcdFwidXRpbWVcIjogT1dlYkRhdGUudGltZXN0YW1wKClcblx0XHRcdH07XG5cblx0XHRcdHJlc3BvbnNlLm5ldGVycm9yID0gdHJ1ZTtcblxuXHRcdFx0ZmFpbC5jYWxsKGNvbSwgcmVzcG9uc2UpO1xuXHRcdH0pLnNlbmQoKTtcblxuXHRcdHJldHVybiBjb207XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfQVBQX1JFQURZIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblJlYWR5KGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkIHwgYm9vbGVhbikge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX0FQUF9SRUFEWSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYXBwIHNob3VsZCBzaG93IHRoZSBob21lIHBhZ2UuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93SG9tZVBhZ2UoKTogdGhpc1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgcmVxdWVzdGVkIHJvdXRlIHdhcyBub3QgZm91bmQuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93Tm90Rm91bmQodGFyZ2V0OiB0Um91dGVUYXJnZXQpOiB0aGlzXG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgbG9naW4gcGFnZS5cblx0ICovXG5cdGFic3RyYWN0IHNob3dMb2dpblBhZ2UoKTogdGhpc1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhcHAgc2hvdWxkIHNob3cgdGhlIHNpZ251cCBwYWdlLlxuXHQgKi9cblx0YWJzdHJhY3Qgc2hvd1NpZ25VcFBhZ2UoKTogdGhpc1xufTtcbiJdfQ==