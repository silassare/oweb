import OWebCom from './OWebCom';
import OWebConfigs from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter from './OWebRouter';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebDate from './plugins/OWebDate';
import Utils from './utils/Utils';
import OWebI18n from './OWebI18n';
import OWebPager from './OWebPager';
/**
 * @ignore
 */
const noop = () => { };
export default class OWebApp extends OWebEvent {
    /**
     * OWebApp constructor.
     *
     * @param name The app name.
     * @param configs The app config.
     * @param urls The app url list.
     */
    constructor(name, configs, urls) {
        super();
        this.name = name;
        this._requestDefaultOptions = {
            headers: {},
        };
        this.ls = new OWebDataStore(this);
        this.configs = new OWebConfigs(this, configs);
        this.url = new OWebUrl(this, urls);
        this.user = new OWebCurrentUser(this);
        this.view = new OWebView();
        this.pager = new OWebPager(this);
        this.i18n = new OWebI18n();
        const ctx = this, base_url = this.configs.get('OW_APP_LOCAL_BASE_URL'), hash_mode = false !== this.configs.get('OW_APP_ROUTER_HASH_MODE');
        this.router = new OWebRouter(base_url, hash_mode, function (target) {
            ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
        });
        this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));
        let api_key_header = this.configs.get('OZ_API_KEY_HEADER_NAME');
        this._requestDefaultOptions.headers = {
            [api_key_header]: this.configs.get('OZ_API_KEY'),
        };
    }
    /**
     * Get request default options
     */
    getRequestDefaultOptions() {
        return Utils.copy(this._requestDefaultOptions);
    }
    /**
     * Set session token
     */
    setSessionToken(token) {
        let header_name = this.configs.get('OZ_SESSION_TOKEN_HEADER_NAME');
        if (header_name && token) {
            this._requestDefaultOptions.headers[header_name] = token;
        }
        return this;
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
        return 'cordova' in window;
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
        this.showLoginPage({});
    }
    /**
     * Reload the app.
     */
    reloadApp() {
        // TODO: instead of reloading the current location, find a way to browse to web app entry point
        // for android & ios restart the app
        // window.location.reload(true);
        this.showHomePage({});
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
        let now = new Date().getTime(); // milliseconds
        let hour = 60 * 60; // seconds
        let expire = this.user.getSessionExpire() - hour; // seconds
        return expire * 1000 > now;
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
            badNewsShow: false,
        };
        let com = new OWebCom(this, options);
        com.on(OWebCom.EVT_COM_REQUEST_SUCCESS, (response) => {
            // setTimeout(function () {
            if (freeze) {
                app.view.unfreeze();
            }
            success.call(com, response);
            // }, 1000);
        })
            .on(OWebCom.EVT_COM_REQUEST_ERROR, (response) => {
            if (response['msg'] === 'OZ_ERROR_YOU_ARE_NOT_ADMIN') {
                app.destroyApp();
            }
            if (freeze) {
                app.view.unfreeze();
            }
            fail.call(com, response);
        })
            .on(OWebCom.EVT_COM_NETWORK_ERROR, () => {
            if (freeze) {
                app.view.unfreeze();
            }
            let response = {
                error: 1,
                msg: 'OZ_ERROR_REQUEST_FAIL',
                utime: OWebDate.timestamp(),
            };
            response.neterror = true;
            fail.call(com, response);
        })
            .send();
        return com;
    }
    /**
     * To start the web app.
     */
    start() {
        console.log('[OWebApp] app started!');
        this.trigger(OWebApp.EVT_APP_READY);
        return this;
    }
    /**
     * Called when app should show the home page.
     */
    showHomePage(options = {}) {
        this.trigger(OWebApp.EVT_SHOW_HOME, [options]);
    }
    /**
     * Called when app should show the login page.
     */
    showLoginPage(options = {}) {
        this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
    }
    /**
     * Called when app should show the registration page.
     */
    showRegistrationPage(options = {}) {
        this.trigger(OWebApp.EVT_SHOW_LOGIN, [options]);
    }
    /**
     * Register handler for OWebApp.EVT_APP_READY event
     *
     * @param handler
     */
    onReady(handler) {
        return this.on(OWebApp.EVT_APP_READY, handler);
    }
    /**
     * Register handler for OWebApp.EVT_SHOW_HOME event
     *
     * @param handler
     */
    onShowHomePage(handler) {
        return this.on(OWebApp.EVT_SHOW_HOME, handler);
    }
    /**
     * Register handler for OWebApp.EVT_SHOW_LOGIN event
     *
     * @param handler
     */
    onShowLoginPage(handler) {
        return this.on(OWebApp.EVT_SHOW_LOGIN, handler);
    }
    /**
     * Register handler for OWebApp.EVT_SHOW_REGISTRATION_PAGE event
     *
     * @param handler
     */
    onShowRegistrationPage(handler) {
        return this.on(OWebApp.EVT_SHOW_REGISTRATION_PAGE, handler);
    }
    /**
     * Register handler for OWebApp.EVT_NOT_FOUND event
     *
     * @param handler
     */
    onPageNotFound(handler) {
        return this.on(OWebApp.EVT_NOT_FOUND, handler);
    }
}
OWebApp.SELF = Utils.id();
OWebApp.EVT_APP_READY = Utils.id();
OWebApp.EVT_NOT_FOUND = Utils.id();
OWebApp.EVT_SHOW_HOME = Utils.id();
OWebApp.EVT_SHOW_LOGIN = Utils.id();
OWebApp.EVT_SHOW_REGISTRATION_PAGE = Utils.id();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBeUIsTUFBTSxXQUFXLENBQUM7QUFDbEQsT0FBTyxXQUE0QixNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLFVBQStDLE1BQU0sY0FBYyxDQUFDO0FBQzNFLE9BQU8sT0FBcUIsTUFBTSxXQUFXLENBQUM7QUFDOUMsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sUUFBUSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDOztHQUVHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0FBRXRCLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBUSxTQUFRLFNBQVM7SUFxQjdDOzs7Ozs7T0FNRztJQUNILFlBQ2tCLElBQVksRUFDN0IsT0FBb0IsRUFDcEIsSUFBYztRQUVkLEtBQUssRUFBRSxDQUFDO1FBSlMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQXJCYiwyQkFBc0IsR0FBUTtZQUM5QyxPQUFPLEVBQUUsRUFBRTtTQUNYLENBQUM7UUF5QkQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJ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QUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsY0FBYyxDQUNiLE9BQW1FO1FBRW5FLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUNkLE9BQW1FO1FBRW5FLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsc0JBQXNCLENBQ3JCLE9BQW1FO1FBRW5FLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxjQUFjLENBQ2IsT0FBNkQ7UUFFN0QsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7QUF2VmUsWUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNsQixxQkFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMzQixxQkFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMzQixxQkFBYSxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUMzQixzQkFBYyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUM1QixrQ0FBMEIsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkNvbSwgeyBpQ29tUmVzcG9uc2UgfSBmcm9tICcuL09XZWJDb20nO1xuaW1wb3J0IE9XZWJDb25maWdzLCB7IHRDb25maWdMaXN0IH0gZnJvbSAnLi9PV2ViQ29uZmlncyc7XG5pbXBvcnQgT1dlYkN1cnJlbnRVc2VyIGZyb20gJy4vT1dlYkN1cnJlbnRVc2VyJztcbmltcG9ydCBPV2ViRGF0YVN0b3JlIGZyb20gJy4vT1dlYkRhdGFTdG9yZSc7XG5pbXBvcnQgT1dlYkV2ZW50IGZyb20gJy4vT1dlYkV2ZW50JztcbmltcG9ydCBPV2ViRm9ybVZhbGlkYXRvciBmcm9tICcuL09XZWJGb3JtVmFsaWRhdG9yJztcbmltcG9ydCBPV2ViUm91dGVyLCB7IHRSb3V0ZVRhcmdldCwgdFJvdXRlU3RhdGVPYmplY3QgfSBmcm9tICcuL09XZWJSb3V0ZXInO1xuaW1wb3J0IE9XZWJVcmwsIHsgdFVybExpc3QgfSBmcm9tICcuL09XZWJVcmwnO1xuaW1wb3J0IE9XZWJWaWV3IGZyb20gJy4vT1dlYlZpZXcnO1xuaW1wb3J0IE9XZWJEYXRlIGZyb20gJy4vcGx1Z2lucy9PV2ViRGF0ZSc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYkkxOG4gZnJvbSAnLi9PV2ViSTE4bic7XG5pbXBvcnQgT1dlYlBhZ2VyIGZyb20gJy4vT1dlYlBhZ2VyJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkFwcCBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUFBfUkVBRFkgPSBVdGlscy5pZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX05PVF9GT1VORCA9IFV0aWxzLmlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfU0hPV19IT01FID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX0xPR0lOID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX1JFR0lTVFJBVElPTl9QQUdFID0gVXRpbHMuaWQoKTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9yZXF1ZXN0RGVmYXVsdE9wdGlvbnM6IGFueSA9IHtcblx0XHRoZWFkZXJzOiB7fSxcblx0fTtcblxuXHRyZWFkb25seSB2aWV3OiBPV2ViVmlldztcblx0cmVhZG9ubHkgcGFnZXI6IE9XZWJQYWdlcjxhbnk+O1xuXHRyZWFkb25seSBsczogT1dlYkRhdGFTdG9yZTtcblx0cmVhZG9ubHkgcm91dGVyOiBPV2ViUm91dGVyO1xuXHRyZWFkb25seSB1c2VyOiBPV2ViQ3VycmVudFVzZXI7XG5cdHJlYWRvbmx5IGNvbmZpZ3M6IE9XZWJDb25maWdzO1xuXHRyZWFkb25seSB1cmw6IE9XZWJVcmw7XG5cdHJlYWRvbmx5IGkxOG46IE9XZWJJMThuO1xuXG5cdC8qKlxuXHQgKiBPV2ViQXBwIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSBUaGUgYXBwIG5hbWUuXG5cdCAqIEBwYXJhbSBjb25maWdzIFRoZSBhcHAgY29uZmlnLlxuXHQgKiBAcGFyYW0gdXJscyBUaGUgYXBwIHVybCBsaXN0LlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuXHRcdGNvbmZpZ3M6IHRDb25maWdMaXN0LFxuXHRcdHVybHM6IHRVcmxMaXN0XG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmxzID0gbmV3IE9XZWJEYXRhU3RvcmUodGhpcyk7XG5cdFx0dGhpcy5jb25maWdzID0gbmV3IE9XZWJDb25maWdzKHRoaXMsIGNvbmZpZ3MpO1xuXHRcdHRoaXMudXJsID0gbmV3IE9XZWJVcmwodGhpcywgdXJscyk7XG5cdFx0dGhpcy51c2VyID0gbmV3IE9XZWJDdXJyZW50VXNlcih0aGlzKTtcblx0XHR0aGlzLnZpZXcgPSBuZXcgT1dlYlZpZXcoKTtcblx0XHR0aGlzLnBhZ2VyID0gbmV3IE9XZWJQYWdlcih0aGlzKTtcblx0XHR0aGlzLmkxOG4gPSBuZXcgT1dlYkkxOG4oKTtcblxuXHRcdGNvbnN0IGN0eCA9IHRoaXMsXG5cdFx0XHRiYXNlX3VybCA9IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9MT0NBTF9CQVNFX1VSTCcpLFxuXHRcdFx0aGFzaF9tb2RlID0gZmFsc2UgIT09IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9ST1VURVJfSEFTSF9NT0RFJyk7XG5cblx0XHR0aGlzLnJvdXRlciA9IG5ldyBPV2ViUm91dGVyKGJhc2VfdXJsLCBoYXNoX21vZGUsIGZ1bmN0aW9uKFxuXHRcdFx0dGFyZ2V0OiB0Um91dGVUYXJnZXRcblx0XHQpIHtcblx0XHRcdGN0eC50cmlnZ2VyKE9XZWJBcHAuRVZUX05PVF9GT1VORCwgW3RhcmdldF0pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5pMThuLnNldERlZmF1bHRMYW5nKHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9ERUZBVUxUX0xBTkcnKSk7XG5cblx0XHRsZXQgYXBpX2tleV9oZWFkZXIgPSB0aGlzLmNvbmZpZ3MuZ2V0KCdPWl9BUElfS0VZX0hFQURFUl9OQU1FJyk7XG5cdFx0dGhpcy5fcmVxdWVzdERlZmF1bHRPcHRpb25zLmhlYWRlcnMgPSB7XG5cdFx0XHRbYXBpX2tleV9oZWFkZXJdOiB0aGlzLmNvbmZpZ3MuZ2V0KCdPWl9BUElfS0VZJyksXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgcmVxdWVzdCBkZWZhdWx0IG9wdGlvbnNcblx0ICovXG5cdGdldFJlcXVlc3REZWZhdWx0T3B0aW9ucygpIHtcblx0XHRyZXR1cm4gVXRpbHMuY29weSh0aGlzLl9yZXF1ZXN0RGVmYXVsdE9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCBzZXNzaW9uIHRva2VuXG5cdCAqL1xuXHRzZXRTZXNzaW9uVG9rZW4odG9rZW46IHN0cmluZykge1xuXHRcdGxldCBoZWFkZXJfbmFtZSA9IHRoaXMuY29uZmlncy5nZXQoJ09aX1NFU1NJT05fVE9LRU5fSEVBREVSX05BTUUnKTtcblxuXHRcdGlmIChoZWFkZXJfbmFtZSAmJiB0b2tlbikge1xuXHRcdFx0dGhpcy5fcmVxdWVzdERlZmF1bHRPcHRpb25zLmhlYWRlcnNbaGVhZGVyX25hbWVdID0gdG9rZW47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQXBwIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0QXBwTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHdlIGFyZSBydW5uaW5nIGluIG1vYmlsZSBhcHAuXG5cdCAqL1xuXHRpc01vYmlsZUFwcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gJ2NvcmRvdmEnIGluIHdpbmRvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG5ldyBmb3JtIHZhbGlkYXRvciBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm0gVGhlIGh0bWwgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyBuYW1lcyB0byBleGNsdWRlLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgRm9yY2UgdGhlIHZhbGlkYXRvciB0byBjaGVjayBhbGwgZmllbGRzLlxuXHQgKi9cblx0Z2V0Rm9ybVZhbGlkYXRvcihcblx0XHRmb3JtOiBIVE1MRm9ybUVsZW1lbnQsXG5cdFx0cmVxdWlyZWQ6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRleGNsdWRlZDogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2Vcblx0KSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViRm9ybVZhbGlkYXRvcih0aGlzLCBmb3JtLCByZXF1aXJlZCwgZXhjbHVkZWQsIGNoZWNrQWxsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3JjZSBsb2dpbi5cblx0ICpcblx0ICogPiBUaGlzIHdpbGwgY2xlYXIgYWxsIHNhdmVkIGRhdGEgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG5cdCAqL1xuXHRmb3JjZUxvZ2luKCkge1xuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnNob3dMb2dpblBhZ2Uoe30pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZCB0aGUgYXBwLlxuXHQgKi9cblx0cmVsb2FkQXBwKCkge1xuXHRcdC8vIFRPRE86IGluc3RlYWQgb2YgcmVsb2FkaW5nIHRoZSBjdXJyZW50IGxvY2F0aW9uLCBmaW5kIGEgd2F5IHRvIGJyb3dzZSB0byB3ZWIgYXBwIGVudHJ5IHBvaW50XG5cdFx0Ly8gZm9yIGFuZHJvaWQgJiBpb3MgcmVzdGFydCB0aGUgYXBwXG5cdFx0Ly8gd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcblx0XHR0aGlzLnNob3dIb21lUGFnZSh7fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveSB0aGUgYXBwLlxuXHQgKlxuXHQgKiA+IFRoaXMgd2lsbCBjbGVhciBhbGwgc2F2ZWQgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cblx0ICovXG5cdGRlc3Ryb3lBcHAoKSB7XG5cdFx0Ly8gZXJhc2UgZGF0YVxuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnJlbG9hZEFwcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlIGFwcC5cblx0ICovXG5cdGNsb3NlQXBwKCkge1xuXHRcdC8vIGNvcmRvdmFcblx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGxldCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgLy8gbWlsbGlzZWNvbmRzXG5cdFx0bGV0IGhvdXIgPSA2MCAqIDYwOyAvLyBzZWNvbmRzXG5cdFx0bGV0IGV4cGlyZSA9IHRoaXMudXNlci5nZXRTZXNzaW9uRXhwaXJlKCkgLSBob3VyOyAvLyBzZWNvbmRzXG5cdFx0cmV0dXJuIGV4cGlyZSAqIDEwMDAgPiBub3c7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGJlZW4gYXV0aGVudGljYXRlZC5cblx0ICovXG5cdHVzZXJWZXJpZmllZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLnVzZXIuZ2V0Q3VycmVudFVzZXIoKSAmJiB0aGlzLnNlc3Npb25BY3RpdmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCByZXF1ZXN0IGFuZCByZXR1cm4gcHJvbWlzZS5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZCBUaGUgcmVxdWVzdCBtZXRob2QuXG5cdCAqIEBwYXJhbSB1cmwgVGhlIHJlcXVlc3QgdXJsLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgcmVxdWVzdCBwYXlsb2FkLlxuXHQgKiBAcGFyYW0gZnJlZXplIEZvcmNlIGFwcCB2aWV3IHRvIGJlIGZyb3plbi5cblx0ICovXG5cdHJlcXVlc3RQcm9taXNlKFxuXHRcdG1ldGhvZDogc3RyaW5nLFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdGRhdGE6IGFueSxcblx0XHRmcmVlemU6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBQcm9taXNlPGlDb21SZXNwb25zZT4ge1xuXHRcdGxldCBtID0gdGhpcztcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8aUNvbVJlc3BvbnNlPihmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRcdG0ucmVxdWVzdChtZXRob2QsIHVybCwgZGF0YSwgcmVzb2x2ZSwgcmVqZWN0LCBmcmVlemUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNlbmQgcmVxdWVzdC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGhvZCBUaGUgcmVxdWVzdCBtZXRob2QuXG5cdCAqIEBwYXJhbSB1cmwgVGhlIHJlcXVlc3QgdXJsLlxuXHQgKiBAcGFyYW0gZGF0YSBUaGUgcmVxdWVzdCBwYXlsb2FkLlxuXHQgKiBAcGFyYW0gc3VjY2VzcyBSZXF1ZXN0IHN1Y2Nlc3MgY2FsbGJhY2suXG5cdCAqIEBwYXJhbSBmYWlsIFJlcXVlc3QgZmFpbCBjYWxsYmFjay5cblx0ICogQHBhcmFtIGZyZWV6ZSBGb3JjZSBhcHAgdmlldyB0byBiZSBmcm96ZW4uXG5cdCAqL1xuXHRyZXF1ZXN0KFxuXHRcdG1ldGhvZDogc3RyaW5nLFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdGRhdGE6IGFueSxcblx0XHRzdWNjZXNzOiAodGhpczogT1dlYkNvbSwgcmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCA9IG5vb3AsXG5cdFx0ZmFpbDogKHRoaXM6IE9XZWJDb20sIHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHZvaWQgPSBub29wLFxuXHRcdGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IE9XZWJDb20ge1xuXHRcdGxldCBhcHAgPSB0aGlzO1xuXG5cdFx0aWYgKGZyZWV6ZSkge1xuXHRcdFx0YXBwLnZpZXcuZnJlZXplKCk7XG5cdFx0fVxuXG5cdFx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0XHR1cmw6IHVybCxcblx0XHRcdG1ldGhvZDogbWV0aG9kLFxuXHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdGJhZE5ld3NTaG93OiBmYWxzZSxcblx0XHR9O1xuXG5cdFx0bGV0IGNvbSA9IG5ldyBPV2ViQ29tKHRoaXMsIG9wdGlvbnMpO1xuXHRcdGNvbS5vbihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9TVUNDRVNTLCAocmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4ge1xuXHRcdFx0Ly8gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoZnJlZXplKSB7XG5cdFx0XHRcdGFwcC52aWV3LnVuZnJlZXplKCk7XG5cdFx0XHR9XG5cblx0XHRcdHN1Y2Nlc3MuY2FsbChjb20sIHJlc3BvbnNlKTtcblx0XHRcdC8vIH0sIDEwMDApO1xuXHRcdH0pXG5cdFx0XHQub24oT1dlYkNvbS5FVlRfQ09NX1JFUVVFU1RfRVJST1IsIChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGlmIChyZXNwb25zZVsnbXNnJ10gPT09ICdPWl9FUlJPUl9ZT1VfQVJFX05PVF9BRE1JTicpIHtcblx0XHRcdFx0XHRhcHAuZGVzdHJveUFwcCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGZyZWV6ZSkge1xuXHRcdFx0XHRcdGFwcC52aWV3LnVuZnJlZXplKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmYWlsLmNhbGwoY29tLCByZXNwb25zZSk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKE9XZWJDb20uRVZUX0NPTV9ORVRXT1JLX0VSUk9SLCAoKSA9PiB7XG5cdFx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0XHRhcHAudmlldy51bmZyZWV6ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCByZXNwb25zZTogaUNvbVJlc3BvbnNlID0ge1xuXHRcdFx0XHRcdGVycm9yOiAxLFxuXHRcdFx0XHRcdG1zZzogJ09aX0VSUk9SX1JFUVVFU1RfRkFJTCcsXG5cdFx0XHRcdFx0dXRpbWU6IE9XZWJEYXRlLnRpbWVzdGFtcCgpLFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJlc3BvbnNlLm5ldGVycm9yID0gdHJ1ZTtcblxuXHRcdFx0XHRmYWlsLmNhbGwoY29tLCByZXNwb25zZSk7XG5cdFx0XHR9KVxuXHRcdFx0LnNlbmQoKTtcblxuXHRcdHJldHVybiBjb207XG5cdH1cblxuXHQvKipcblx0ICogVG8gc3RhcnQgdGhlIHdlYiBhcHAuXG5cdCAqL1xuXHRzdGFydCgpOiB0aGlzIHtcblx0XHRjb25zb2xlLmxvZygnW09XZWJBcHBdIGFwcCBzdGFydGVkIScpO1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9BUFBfUkVBRFkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgaG9tZSBwYWdlLlxuXHQgKi9cblx0c2hvd0hvbWVQYWdlKG9wdGlvbnM6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30pIHtcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkFwcC5FVlRfU0hPV19IT01FLCBbb3B0aW9uc10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgbG9naW4gcGFnZS5cblx0ICovXG5cdHNob3dMb2dpblBhZ2Uob3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSkge1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9TSE9XX0xPR0lOLCBbb3B0aW9uc10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgcmVnaXN0cmF0aW9uIHBhZ2UuXG5cdCAqL1xuXHRzaG93UmVnaXN0cmF0aW9uUGFnZShvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9KSB7XG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJBcHAuRVZUX1NIT1dfTE9HSU4sIFtvcHRpb25zXSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfQVBQX1JFQURZIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblJlYWR5KGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkIHwgYm9vbGVhbikge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX0FQUF9SRUFEWSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfU0hPV19IT01FIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblNob3dIb21lUGFnZShcblx0XHRoYW5kbGVyOiAodGhpczogdGhpcywgb3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QpID0+IHZvaWQgfCBib29sZWFuXG5cdCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX1NIT1dfSE9NRSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfU0hPV19MT0dJTiBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25TaG93TG9naW5QYWdlKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCkgPT4gdm9pZCB8IGJvb2xlYW5cblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFwcC5FVlRfU0hPV19MT0dJTiwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfU0hPV19SRUdJU1RSQVRJT05fUEFHRSBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25TaG93UmVnaXN0cmF0aW9uUGFnZShcblx0XHRoYW5kbGVyOiAodGhpczogdGhpcywgb3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QpID0+IHZvaWQgfCBib29sZWFuXG5cdCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX1NIT1dfUkVHSVNUUkFUSU9OX1BBR0UsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXIgZm9yIE9XZWJBcHAuRVZUX05PVF9GT1VORCBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25QYWdlTm90Rm91bmQoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkIHwgYm9vbGVhblxuXHQpIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQXBwLkVWVF9OT1RfRk9VTkQsIGhhbmRsZXIpO1xuXHR9XG59XG4iXX0=