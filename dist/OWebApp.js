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
        let base_url = this.configs.get('OW_APP_LOCAL_BASE_URL'), hash_mode = false !== this.configs.get('OW_APP_ROUTER_HASH_MODE');
        this.router = new OWebRouter(base_url, hash_mode);
        this.router.notFound(this.showNotFound.bind(this));
        this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));
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
     * To start the web app.
     */
    start() {
        console.log('[OWebApp] app started!');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBeUIsTUFBTSxXQUFXLENBQUM7QUFDbEQsT0FBTyxXQUE0QixNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQUNoRCxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLFNBQVMsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLFVBQTRCLE1BQU0sY0FBYyxDQUFDO0FBQ3hELE9BQU8sT0FBcUIsTUFBTSxXQUFXLENBQUM7QUFDOUMsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sUUFBUSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQUNsQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBRXBDOztHQUVHO0FBQ0gsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0FBRXRCLE1BQU0sQ0FBQyxPQUFPLE9BQWdCLE9BQVEsU0FBUSxTQUFTO0lBYXREOzs7Ozs7O09BT0c7SUFDSCxZQUNrQixJQUFZLEVBQzdCLE9BQW9CLEVBQ3BCLElBQWM7UUFFZCxLQUFLLEVBQUUsQ0FBQztRQUpTLFNBQUksR0FBSixJQUFJLENBQVE7UUFNN0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENB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QW5QZSxZQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ2xCLHFCQUFhLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9XZWJDb20sIHsgaUNvbVJlc3BvbnNlIH0gZnJvbSAnLi9PV2ViQ29tJztcbmltcG9ydCBPV2ViQ29uZmlncywgeyB0Q29uZmlnTGlzdCB9IGZyb20gJy4vT1dlYkNvbmZpZ3MnO1xuaW1wb3J0IE9XZWJDdXJyZW50VXNlciBmcm9tICcuL09XZWJDdXJyZW50VXNlcic7XG5pbXBvcnQgT1dlYkRhdGFTdG9yZSBmcm9tICcuL09XZWJEYXRhU3RvcmUnO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgT1dlYkZvcm1WYWxpZGF0b3IgZnJvbSAnLi9PV2ViRm9ybVZhbGlkYXRvcic7XG5pbXBvcnQgT1dlYlJvdXRlciwgeyB0Um91dGVUYXJnZXQgfSBmcm9tICcuL09XZWJSb3V0ZXInO1xuaW1wb3J0IE9XZWJVcmwsIHsgdFVybExpc3QgfSBmcm9tICcuL09XZWJVcmwnO1xuaW1wb3J0IE9XZWJWaWV3IGZyb20gJy4vT1dlYlZpZXcnO1xuaW1wb3J0IE9XZWJEYXRlIGZyb20gJy4vcGx1Z2lucy9PV2ViRGF0ZSc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYkkxOG4gZnJvbSAnLi9PV2ViSTE4bic7XG5pbXBvcnQgT1dlYlBhZ2VyIGZyb20gJy4vT1dlYlBhZ2VyJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgT1dlYkFwcCBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gVXRpbHMuaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUFBfUkVBRFkgPSBVdGlscy5pZCgpO1xuXG5cdHJlYWRvbmx5IHZpZXc6IE9XZWJWaWV3O1xuXHRyZWFkb25seSBwYWdlcjogT1dlYlBhZ2VyPGFueT47XG5cdHJlYWRvbmx5IGxzOiBPV2ViRGF0YVN0b3JlO1xuXHRyZWFkb25seSByb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cdHJlYWRvbmx5IHVzZXI6IE9XZWJDdXJyZW50VXNlcjtcblx0cmVhZG9ubHkgY29uZmlnczogT1dlYkNvbmZpZ3M7XG5cdHJlYWRvbmx5IHVybDogT1dlYlVybDtcblx0cmVhZG9ubHkgaTE4bjogT1dlYkkxOG47XG5cblx0LyoqXG5cdCAqIE9XZWJBcHAgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBuYW1lIFRoZSBhcHAgbmFtZS5cblx0ICogQHBhcmFtIGNvbmZpZ3MgVGhlIGFwcCBjb25maWcuXG5cdCAqIEBwYXJhbSB1cmxzIFRoZSBhcHAgdXJsIGxpc3QuXG5cdCAqIEBwYXJhbSBzdGF0ZSBUaGUgYXBwIHN0YXRlLlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuXHRcdGNvbmZpZ3M6IHRDb25maWdMaXN0LFxuXHRcdHVybHM6IHRVcmxMaXN0XG5cdCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHR0aGlzLmxzID0gbmV3IE9XZWJEYXRhU3RvcmUodGhpcyk7XG5cdFx0dGhpcy5jb25maWdzID0gbmV3IE9XZWJDb25maWdzKHRoaXMsIGNvbmZpZ3MpO1xuXHRcdHRoaXMudXJsID0gbmV3IE9XZWJVcmwodGhpcywgdXJscyk7XG5cdFx0dGhpcy51c2VyID0gbmV3IE9XZWJDdXJyZW50VXNlcih0aGlzKTtcblx0XHR0aGlzLnZpZXcgPSBuZXcgT1dlYlZpZXcoKTtcblx0XHR0aGlzLnBhZ2VyID0gbmV3IE9XZWJQYWdlcih0aGlzKTtcblx0XHR0aGlzLmkxOG4gPSBuZXcgT1dlYkkxOG4oKTtcblxuXHRcdGxldCBiYXNlX3VybCA9IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9MT0NBTF9CQVNFX1VSTCcpLFxuXHRcdFx0aGFzaF9tb2RlID0gZmFsc2UgIT09IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9ST1VURVJfSEFTSF9NT0RFJyk7XG5cblx0XHR0aGlzLnJvdXRlciA9IG5ldyBPV2ViUm91dGVyKGJhc2VfdXJsLCBoYXNoX21vZGUpO1xuXG5cdFx0dGhpcy5yb3V0ZXIubm90Rm91bmQodGhpcy5zaG93Tm90Rm91bmQuYmluZCh0aGlzKSk7XG5cblx0XHR0aGlzLmkxOG4uc2V0RGVmYXVsdExhbmcodGhpcy5jb25maWdzLmdldCgnT1dfQVBQX0RFRkFVTFRfTEFORycpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHAgbmFtZSBnZXR0ZXIuXG5cdCAqL1xuXHRnZXRBcHBOYW1lKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMubmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgd2UgYXJlIHJ1bm5pbmcgaW4gbW9iaWxlIGFwcC5cblx0ICovXG5cdGlzTW9iaWxlQXBwKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAnY29yZG92YScgaW4gd2luZG93O1xuXHR9XG5cblx0LyoqXG5cdCAqIFRvIHN0YXJ0IHRoZSB3ZWIgYXBwLlxuXHQgKi9cblx0c3RhcnQoKTogdGhpcyB7XG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViQXBwXSBhcHAgc3RhcnRlZCEnKTtcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkFwcC5FVlRfQVBQX1JFQURZKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG5ldyBmb3JtIHZhbGlkYXRvciBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm0gVGhlIGh0bWwgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyBuYW1lcyB0byBleGNsdWRlLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgRm9yY2UgdGhlIHZhbGlkYXRvciB0byBjaGVjayBhbGwgZmllbGRzLlxuXHQgKi9cblx0Z2V0Rm9ybVZhbGlkYXRvcihcblx0XHRmb3JtOiBIVE1MRm9ybUVsZW1lbnQsXG5cdFx0cmVxdWlyZWQ6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRleGNsdWRlZDogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdGNoZWNrQWxsOiBib29sZWFuID0gZmFsc2Vcblx0KSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViRm9ybVZhbGlkYXRvcih0aGlzLCBmb3JtLCByZXF1aXJlZCwgZXhjbHVkZWQsIGNoZWNrQWxsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3JjZSBsb2dpbi5cblx0ICpcblx0ICogPiBUaGlzIHdpbGwgY2xlYXIgYWxsIHNhdmVkIGRhdGEgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG5cdCAqL1xuXHRmb3JjZUxvZ2luKCkge1xuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnNob3dMb2dpblBhZ2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWxvYWQgdGhlIGFwcC5cblx0ICovXG5cdHJlbG9hZEFwcCgpIHtcblx0XHQvLyBUT0RPOiBpbnN0ZWFkIG9mIHJlbG9hZGluZyB0aGUgY3VycmVudCBsb2NhdGlvbiwgZmluZCBhIHdheSB0byBicm93c2UgdG8gd2ViIGFwcCBlbnRyeSBwb2ludFxuXHRcdC8vIGZvciBhbmRyb2lkICYgaW9zIHJlc3RhcnQgdGhlIGFwcFxuXHRcdC8vIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQodHJ1ZSk7XG5cdFx0dGhpcy5zaG93SG9tZVBhZ2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cm95IHRoZSBhcHAuXG5cdCAqXG5cdCAqID4gVGhpcyB3aWxsIGNsZWFyIGFsbCBzYXZlZCBkYXRhIGluIHRoZSBsb2NhbCBzdG9yYWdlLlxuXHQgKi9cblx0ZGVzdHJveUFwcCgpIHtcblx0XHQvLyBlcmFzZSBkYXRhXG5cdFx0dGhpcy5scy5jbGVhcigpO1xuXHRcdHRoaXMucmVsb2FkQXBwKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2UgYXBwLlxuXHQgKi9cblx0Y2xvc2VBcHAoKSB7XG5cdFx0Ly8gY29yZG92YVxuXHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHQod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcC5leGl0QXBwKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdXNlciBzZXNzaW9uIGlzIGFjdGl2ZS5cblx0ICovXG5cdHNlc3Npb25BY3RpdmUoKTogYm9vbGVhbiB7XG5cdFx0bGV0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyBtaWxsaXNlY29uZHNcblx0XHRsZXQgaG91ciA9IDYwICogNjA7IC8vIHNlY29uZHNcblx0XHRsZXQgZXhwaXJlID0gdGhpcy51c2VyLmdldFNlc3Npb25FeHBpcmUoKSAtIGhvdXI7IC8vIHNlY29uZHNcblx0XHRyZXR1cm4gZXhwaXJlICogMTAwMCA+IG5vdztcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGN1cnJlbnQgdXNlciBoYXMgYmVlbiBhdXRoZW50aWNhdGVkLlxuXHQgKi9cblx0dXNlclZlcmlmaWVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBCb29sZWFuKHRoaXMudXNlci5nZXRDdXJyZW50VXNlcigpICYmIHRoaXMuc2Vzc2lvbkFjdGl2ZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIHJlcXVlc3QgYW5kIHJldHVybiBwcm9taXNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0aG9kIFRoZSByZXF1ZXN0IG1ldGhvZC5cblx0ICogQHBhcmFtIHVybCBUaGUgcmVxdWVzdCB1cmwuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSByZXF1ZXN0IHBheWxvYWQuXG5cdCAqIEBwYXJhbSBmcmVlemUgRm9yY2UgYXBwIHZpZXcgdG8gYmUgZnJvemVuLlxuXHQgKi9cblx0cmVxdWVzdFByb21pc2UoXG5cdFx0bWV0aG9kOiBzdHJpbmcsXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0ZGF0YTogYW55LFxuXHRcdGZyZWV6ZTogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IFByb21pc2U8aUNvbVJlc3BvbnNlPiB7XG5cdFx0bGV0IG0gPSB0aGlzO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTxpQ29tUmVzcG9uc2U+KGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdFx0bS5yZXF1ZXN0KG1ldGhvZCwgdXJsLCBkYXRhLCByZXNvbHZlLCByZWplY3QsIGZyZWV6ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogU2VuZCByZXF1ZXN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gbWV0aG9kIFRoZSByZXF1ZXN0IG1ldGhvZC5cblx0ICogQHBhcmFtIHVybCBUaGUgcmVxdWVzdCB1cmwuXG5cdCAqIEBwYXJhbSBkYXRhIFRoZSByZXF1ZXN0IHBheWxvYWQuXG5cdCAqIEBwYXJhbSBzdWNjZXNzIFJlcXVlc3Qgc3VjY2VzcyBjYWxsYmFjay5cblx0ICogQHBhcmFtIGZhaWwgUmVxdWVzdCBmYWlsIGNhbGxiYWNrLlxuXHQgKiBAcGFyYW0gZnJlZXplIEZvcmNlIGFwcCB2aWV3IHRvIGJlIGZyb3plbi5cblx0ICovXG5cdHJlcXVlc3QoXG5cdFx0bWV0aG9kOiBzdHJpbmcsXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0ZGF0YTogYW55LFxuXHRcdHN1Y2Nlc3M6ICh0aGlzOiBPV2ViQ29tLCByZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB2b2lkID0gbm9vcCxcblx0XHRmYWlsOiAodGhpczogT1dlYkNvbSwgcmVzcG9uc2U6IGlDb21SZXNwb25zZSkgPT4gdm9pZCA9IG5vb3AsXG5cdFx0ZnJlZXplOiBib29sZWFuID0gZmFsc2Vcblx0KTogT1dlYkNvbSB7XG5cdFx0bGV0IGFwcCA9IHRoaXM7XG5cblx0XHRpZiAoZnJlZXplKSB7XG5cdFx0XHRhcHAudmlldy5mcmVlemUoKTtcblx0XHR9XG5cblx0XHRsZXQgb3B0aW9ucyA9IHtcblx0XHRcdHVybDogdXJsLFxuXHRcdFx0bWV0aG9kOiBtZXRob2QsXG5cdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0YmFkTmV3c1Nob3c6IGZhbHNlLFxuXHRcdH07XG5cblx0XHRsZXQgY29tID0gbmV3IE9XZWJDb20odGhpcywgb3B0aW9ucyk7XG5cdFx0Y29tLm9uKE9XZWJDb20uRVZUX0NPTV9SRVFVRVNUX1NVQ0NFU1MsIChyZXNwb25zZTogaUNvbVJlc3BvbnNlKSA9PiB7XG5cdFx0XHQvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChmcmVlemUpIHtcblx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdH1cblxuXHRcdFx0c3VjY2Vzcy5jYWxsKGNvbSwgcmVzcG9uc2UpO1xuXHRcdFx0Ly8gfSwgMTAwMCk7XG5cdFx0fSlcblx0XHRcdC5vbihPV2ViQ29tLkVWVF9DT01fUkVRVUVTVF9FUlJPUiwgKHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UpID0+IHtcblx0XHRcdFx0aWYgKHJlc3BvbnNlWydtc2cnXSA9PT0gJ09aX0VSUk9SX1lPVV9BUkVfTk9UX0FETUlOJykge1xuXHRcdFx0XHRcdGFwcC5kZXN0cm95QXBwKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZnJlZXplKSB7XG5cdFx0XHRcdFx0YXBwLnZpZXcudW5mcmVlemUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZhaWwuY2FsbChjb20sIHJlc3BvbnNlKTtcblx0XHRcdH0pXG5cdFx0XHQub24oT1dlYkNvbS5FVlRfQ09NX05FVFdPUktfRVJST1IsICgpID0+IHtcblx0XHRcdFx0aWYgKGZyZWV6ZSkge1xuXHRcdFx0XHRcdGFwcC52aWV3LnVuZnJlZXplKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJlc3BvbnNlOiBpQ29tUmVzcG9uc2UgPSB7XG5cdFx0XHRcdFx0ZXJyb3I6IDEsXG5cdFx0XHRcdFx0bXNnOiAnT1pfRVJST1JfUkVRVUVTVF9GQUlMJyxcblx0XHRcdFx0XHR1dGltZTogT1dlYkRhdGUudGltZXN0YW1wKCksXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0cmVzcG9uc2UubmV0ZXJyb3IgPSB0cnVlO1xuXG5cdFx0XHRcdGZhaWwuY2FsbChjb20sIHJlc3BvbnNlKTtcblx0XHRcdH0pXG5cdFx0XHQuc2VuZCgpO1xuXG5cdFx0cmV0dXJuIGNvbTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBoYW5kbGVyIGZvciBPV2ViQXBwLkVWVF9BUFBfUkVBRFkgZXZlbnRcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uUmVhZHkoaGFuZGxlcjogKHRoaXM6IHRoaXMpID0+IHZvaWQgfCBib29sZWFuKSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFwcC5FVlRfQVBQX1JFQURZLCBoYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhcHAgc2hvdWxkIHNob3cgdGhlIGhvbWUgcGFnZS5cblx0ICovXG5cdGFic3RyYWN0IHNob3dIb21lUGFnZSgpOiB0aGlzO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgcmVxdWVzdGVkIHJvdXRlIHdhcyBub3QgZm91bmQuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93Tm90Rm91bmQodGFyZ2V0OiB0Um91dGVUYXJnZXQpOiB0aGlzO1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhcHAgc2hvdWxkIHNob3cgdGhlIGxvZ2luIHBhZ2UuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93TG9naW5QYWdlKCk6IHRoaXM7XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgc2lnbnVwIHBhZ2UuXG5cdCAqL1xuXHRhYnN0cmFjdCBzaG93U2lnblVwUGFnZSgpOiB0aGlzO1xufVxuIl19