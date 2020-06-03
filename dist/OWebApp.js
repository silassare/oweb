import OWebConfigs from './OWebConfigs';
import OWebCurrentUser from './OWebCurrentUser';
import OWebDataStore from './OWebDataStore';
import OWebEvent from './OWebEvent';
import OWebFormValidator from './OWebFormValidator';
import OWebRouter from './OWebRouter';
import OWebUrl from './OWebUrl';
import OWebView from './OWebView';
import OWebI18n from './OWebI18n';
import OWebPager from './OWebPager';
import { clone, id, logger } from './utils';
let OWebApp = /** @class */ (() => {
    class OWebApp extends OWebEvent {
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
            const ctx = this, baseUrl = this.configs.get('OW_APP_LOCAL_BASE_URL'), hashMode = false !== this.configs.get('OW_APP_ROUTER_HASH_MODE');
            this.router = new OWebRouter(baseUrl, hashMode, function (target) {
                ctx.trigger(OWebApp.EVT_NOT_FOUND, [target]);
            });
            this.i18n.setDefaultLang(this.configs.get('OW_APP_DEFAULT_LANG'));
            const apiKeyHeader = this.configs.get('OZ_API_KEY_HEADER_NAME');
            this._requestDefaultOptions.headers = {
                [apiKeyHeader]: this.configs.get('OZ_API_KEY'),
            };
        }
        /**
         * Get request default options
         */
        getRequestDefaultOptions() {
            return clone(this._requestDefaultOptions);
        }
        /**
         * Set session token
         */
        setSessionToken(token) {
            const headerName = this.configs.get('OZ_SESSION_TOKEN_HEADER_NAME');
            if (headerName && token) {
                this._requestDefaultOptions.headers[headerName] = token;
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
            const now = new Date().getTime(); // milliseconds
            const hour = 60 * 60; // seconds
            const expire = this.user.getSessionExpire() - hour; // seconds
            return expire * 1000 > now;
        }
        /**
         * Checks if the current user has been authenticated.
         */
        userVerified() {
            return Boolean(this.user.getCurrentUser() && this.sessionActive());
        }
        /**
         * To start the web app.
         */
        start() {
            logger.info('[OWebApp] app started!');
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
    OWebApp.SELF = id();
    OWebApp.EVT_APP_READY = id();
    OWebApp.EVT_NOT_FOUND = id();
    OWebApp.EVT_SHOW_HOME = id();
    OWebApp.EVT_SHOW_LOGIN = id();
    OWebApp.EVT_SHOW_REGISTRATION_PAGE = id();
    return OWebApp;
})();
export default OWebApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sV0FBNEIsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxVQUErQyxNQUFNLGNBQWMsQ0FBQztBQUMzRSxPQUFPLE9BQXFCLE1BQU0sV0FBVyxDQUFDO0FBQzlDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUU1QztJQUFBLE1BQXFCLE9BQVEsU0FBUSxTQUFTO1FBcUI3Qzs7Ozs7O1dBTUc7UUFDSCxZQUNrQixJQUFZLEVBQzdCLE9BQW9CLEVBQ3BCLElBQWM7WUFFZCxLQUFLLEVBQUUsQ0FBQztZQUpTLFNBQUksR0FBSixJQUFJLENBQVE7WUFyQmIsMkJBQXNCLEdBQVE7Z0JBQzlDLE9BQU8sRUFBRSxFQUFFO2FBQ1gsQ0FBQztZQXlCRCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFB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dXJjZXNDb250ZW50IjpbImltcG9ydCBPV2ViQ29uZmlncywgeyB0Q29uZmlnTGlzdCB9IGZyb20gJy4vT1dlYkNvbmZpZ3MnO1xuaW1wb3J0IE9XZWJDdXJyZW50VXNlciBmcm9tICcuL09XZWJDdXJyZW50VXNlcic7XG5pbXBvcnQgT1dlYkRhdGFTdG9yZSBmcm9tICcuL09XZWJEYXRhU3RvcmUnO1xuaW1wb3J0IE9XZWJFdmVudCBmcm9tICcuL09XZWJFdmVudCc7XG5pbXBvcnQgT1dlYkZvcm1WYWxpZGF0b3IgZnJvbSAnLi9PV2ViRm9ybVZhbGlkYXRvcic7XG5pbXBvcnQgT1dlYlJvdXRlciwgeyB0Um91dGVTdGF0ZU9iamVjdCwgdFJvdXRlVGFyZ2V0IH0gZnJvbSAnLi9PV2ViUm91dGVyJztcbmltcG9ydCBPV2ViVXJsLCB7IHRVcmxMaXN0IH0gZnJvbSAnLi9PV2ViVXJsJztcbmltcG9ydCBPV2ViVmlldyBmcm9tICcuL09XZWJWaWV3JztcbmltcG9ydCBPV2ViSTE4biBmcm9tICcuL09XZWJJMThuJztcbmltcG9ydCBPV2ViUGFnZXIgZnJvbSAnLi9PV2ViUGFnZXInO1xuaW1wb3J0IHsgY2xvbmUsIGlkLCBsb2dnZXIgfSBmcm9tICcuL3V0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkFwcCBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUFBfUkVBRFkgPSBpZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX05PVF9GT1VORCA9IGlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfU0hPV19IT01FID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX0xPR0lOID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX1JFR0lTVFJBVElPTl9QQUdFID0gaWQoKTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9yZXF1ZXN0RGVmYXVsdE9wdGlvbnM6IGFueSA9IHtcblx0XHRoZWFkZXJzOiB7fSxcblx0fTtcblxuXHRyZWFkb25seSB2aWV3OiBPV2ViVmlldztcblx0cmVhZG9ubHkgcGFnZXI6IE9XZWJQYWdlcjxhbnk+O1xuXHRyZWFkb25seSBsczogT1dlYkRhdGFTdG9yZTtcblx0cmVhZG9ubHkgcm91dGVyOiBPV2ViUm91dGVyO1xuXHRyZWFkb25seSB1c2VyOiBPV2ViQ3VycmVudFVzZXI7XG5cdHJlYWRvbmx5IGNvbmZpZ3M6IE9XZWJDb25maWdzO1xuXHRyZWFkb25seSB1cmw6IE9XZWJVcmw7XG5cdHJlYWRvbmx5IGkxOG46IE9XZWJJMThuO1xuXG5cdC8qKlxuXHQgKiBPV2ViQXBwIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSBUaGUgYXBwIG5hbWUuXG5cdCAqIEBwYXJhbSBjb25maWdzIFRoZSBhcHAgY29uZmlnLlxuXHQgKiBAcGFyYW0gdXJscyBUaGUgYXBwIHVybCBsaXN0LlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuXHRcdGNvbmZpZ3M6IHRDb25maWdMaXN0LFxuXHRcdHVybHM6IHRVcmxMaXN0LFxuXHQpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5scyA9IG5ldyBPV2ViRGF0YVN0b3JlKHRoaXMpO1xuXHRcdHRoaXMuY29uZmlncyA9IG5ldyBPV2ViQ29uZmlncyh0aGlzLCBjb25maWdzKTtcblx0XHR0aGlzLnVybCA9IG5ldyBPV2ViVXJsKHRoaXMsIHVybHMpO1xuXHRcdHRoaXMudXNlciA9IG5ldyBPV2ViQ3VycmVudFVzZXIodGhpcyk7XG5cdFx0dGhpcy52aWV3ID0gbmV3IE9XZWJWaWV3KCk7XG5cdFx0dGhpcy5wYWdlciA9IG5ldyBPV2ViUGFnZXIodGhpcyk7XG5cdFx0dGhpcy5pMThuID0gbmV3IE9XZWJJMThuKCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0YmFzZVVybCA9IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9MT0NBTF9CQVNFX1VSTCcpLFxuXHRcdFx0aGFzaE1vZGUgPSBmYWxzZSAhPT0gdGhpcy5jb25maWdzLmdldCgnT1dfQVBQX1JPVVRFUl9IQVNIX01PREUnKTtcblxuXHRcdHRoaXMucm91dGVyID0gbmV3IE9XZWJSb3V0ZXIoYmFzZVVybCwgaGFzaE1vZGUsIGZ1bmN0aW9uIChcblx0XHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdCkge1xuXHRcdFx0Y3R4LnRyaWdnZXIoT1dlYkFwcC5FVlRfTk9UX0ZPVU5ELCBbdGFyZ2V0XSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmkxOG4uc2V0RGVmYXVsdExhbmcodGhpcy5jb25maWdzLmdldCgnT1dfQVBQX0RFRkFVTFRfTEFORycpKTtcblxuXHRcdGNvbnN0IGFwaUtleUhlYWRlciA9IHRoaXMuY29uZmlncy5nZXQoJ09aX0FQSV9LRVlfSEVBREVSX05BTUUnKTtcblx0XHR0aGlzLl9yZXF1ZXN0RGVmYXVsdE9wdGlvbnMuaGVhZGVycyA9IHtcblx0XHRcdFthcGlLZXlIZWFkZXJdOiB0aGlzLmNvbmZpZ3MuZ2V0KCdPWl9BUElfS0VZJyksXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgcmVxdWVzdCBkZWZhdWx0IG9wdGlvbnNcblx0ICovXG5cdGdldFJlcXVlc3REZWZhdWx0T3B0aW9ucygpIHtcblx0XHRyZXR1cm4gY2xvbmUodGhpcy5fcmVxdWVzdERlZmF1bHRPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgc2Vzc2lvbiB0b2tlblxuXHQgKi9cblx0c2V0U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpIHtcblx0XHRjb25zdCBoZWFkZXJOYW1lID0gdGhpcy5jb25maWdzLmdldCgnT1pfU0VTU0lPTl9UT0tFTl9IRUFERVJfTkFNRScpO1xuXG5cdFx0aWYgKGhlYWRlck5hbWUgJiYgdG9rZW4pIHtcblx0XHRcdHRoaXMuX3JlcXVlc3REZWZhdWx0T3B0aW9ucy5oZWFkZXJzW2hlYWRlck5hbWVdID0gdG9rZW47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQXBwIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0QXBwTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHdlIGFyZSBydW5uaW5nIGluIG1vYmlsZSBhcHAuXG5cdCAqL1xuXHRpc01vYmlsZUFwcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gJ2NvcmRvdmEnIGluIHdpbmRvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG5ldyBmb3JtIHZhbGlkYXRvciBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm0gVGhlIGh0bWwgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyBuYW1lcyB0byBleGNsdWRlLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgRm9yY2UgdGhlIHZhbGlkYXRvciB0byBjaGVjayBhbGwgZmllbGRzLlxuXHQgKi9cblx0Z2V0Rm9ybVZhbGlkYXRvcihcblx0XHRmb3JtOiBIVE1MRm9ybUVsZW1lbnQsXG5cdFx0cmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0ZXhjbHVkZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0Y2hlY2tBbGw6IGJvb2xlYW4gPSBmYWxzZSxcblx0KSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViRm9ybVZhbGlkYXRvcih0aGlzLCBmb3JtLCByZXF1aXJlZCwgZXhjbHVkZWQsIGNoZWNrQWxsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3JjZSBsb2dpbi5cblx0ICpcblx0ICogPiBUaGlzIHdpbGwgY2xlYXIgYWxsIHNhdmVkIGRhdGEgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG5cdCAqL1xuXHRmb3JjZUxvZ2luKCkge1xuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnNob3dMb2dpblBhZ2Uoe30pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZCB0aGUgYXBwLlxuXHQgKi9cblx0cmVsb2FkQXBwKCkge1xuXHRcdC8vIFRPRE86IGluc3RlYWQgb2YgcmVsb2FkaW5nIHRoZSBjdXJyZW50IGxvY2F0aW9uLCBmaW5kIGEgd2F5IHRvIGJyb3dzZSB0byB3ZWIgYXBwIGVudHJ5IHBvaW50XG5cdFx0Ly8gZm9yIGFuZHJvaWQgJiBpb3MgcmVzdGFydCB0aGUgYXBwXG5cdFx0Ly8gd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcblx0XHR0aGlzLnNob3dIb21lUGFnZSh7fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveSB0aGUgYXBwLlxuXHQgKlxuXHQgKiA+IFRoaXMgd2lsbCBjbGVhciBhbGwgc2F2ZWQgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cblx0ICovXG5cdGRlc3Ryb3lBcHAoKSB7XG5cdFx0Ly8gZXJhc2UgZGF0YVxuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnJlbG9hZEFwcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlIGFwcC5cblx0ICovXG5cdGNsb3NlQXBwKCkge1xuXHRcdC8vIGNvcmRvdmFcblx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyBtaWxsaXNlY29uZHNcblx0XHRjb25zdCBob3VyID0gNjAgKiA2MDsgLy8gc2Vjb25kc1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMudXNlci5nZXRTZXNzaW9uRXhwaXJlKCkgLSBob3VyOyAvLyBzZWNvbmRzXG5cdFx0cmV0dXJuIGV4cGlyZSAqIDEwMDAgPiBub3c7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGJlZW4gYXV0aGVudGljYXRlZC5cblx0ICovXG5cdHVzZXJWZXJpZmllZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLnVzZXIuZ2V0Q3VycmVudFVzZXIoKSAmJiB0aGlzLnNlc3Npb25BY3RpdmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogVG8gc3RhcnQgdGhlIHdlYiBhcHAuXG5cdCAqL1xuXHRzdGFydCgpOiB0aGlzIHtcblx0XHRsb2dnZXIuaW5mbygnW09XZWJBcHBdIGFwcCBzdGFydGVkIScpO1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9BUFBfUkVBRFkpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgaG9tZSBwYWdlLlxuXHQgKi9cblx0c2hvd0hvbWVQYWdlKG9wdGlvbnM6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30pIHtcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkFwcC5FVlRfU0hPV19IT01FLCBbb3B0aW9uc10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgbG9naW4gcGFnZS5cblx0ICovXG5cdHNob3dMb2dpblBhZ2Uob3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSkge1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9TSE9XX0xPR0lOLCBbb3B0aW9uc10pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIGFwcCBzaG91bGQgc2hvdyB0aGUgcmVnaXN0cmF0aW9uIHBhZ2UuXG5cdCAqL1xuXHRzaG93UmVnaXN0cmF0aW9uUGFnZShvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9KSB7XG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJBcHAuRVZUX1NIT1dfTE9HSU4sIFtvcHRpb25zXSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfQVBQX1JFQURZIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblJlYWR5KGhhbmRsZXI6ICh0aGlzOiB0aGlzKSA9PiB2b2lkIHwgYm9vbGVhbikge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX0FQUF9SRUFEWSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfU0hPV19IT01FIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblNob3dIb21lUGFnZShcblx0XHRoYW5kbGVyOiAodGhpczogdGhpcywgb3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QpID0+IHZvaWQgfCBib29sZWFuLFxuXHQpIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQXBwLkVWVF9TSE9XX0hPTUUsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXIgZm9yIE9XZWJBcHAuRVZUX1NIT1dfTE9HSU4gZXZlbnRcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uU2hvd0xvZ2luUGFnZShcblx0XHRoYW5kbGVyOiAodGhpczogdGhpcywgb3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QpID0+IHZvaWQgfCBib29sZWFuLFxuXHQpIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQXBwLkVWVF9TSE9XX0xPR0lOLCBoYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBoYW5kbGVyIGZvciBPV2ViQXBwLkVWVF9TSE9XX1JFR0lTVFJBVElPTl9QQUdFIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblNob3dSZWdpc3RyYXRpb25QYWdlKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCkgPT4gdm9pZCB8IGJvb2xlYW4sXG5cdCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX1NIT1dfUkVHSVNUUkFUSU9OX1BBR0UsIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXIgZm9yIE9XZWJBcHAuRVZUX05PVF9GT1VORCBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25QYWdlTm90Rm91bmQoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkIHwgYm9vbGVhbixcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFwcC5FVlRfTk9UX0ZPVU5ELCBoYW5kbGVyKTtcblx0fVxufVxuIl19