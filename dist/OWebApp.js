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
import { clone, id, logger } from './utils/Utils';
import OWebXHR from './OWebXHR';
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
         * Create net instance.
         *
         * @param url The request url.
         * @param options The request options.
         */
        net(url, options) {
            const event = function (type) {
                return function () {
                    logger.debug('[OWebApp][NET] intercepted ', type, ...arguments);
                };
            };
            return new OWebXHR(url, {
                isGoodNews(response) {
                    return Boolean(response.json && response.json.error === 0);
                },
                ...options,
            })
                .onGoodNews(event('onGoodNews'))
                .onBadNews(event('onBadNews'))
                .onFinished(event('onFinished'))
                .onError(event('onError'))
                .onDownloadProgress(event('onDownloadProgress'))
                .onUploadProgress(event('onUploadProgress'))
                .onHttpError(event('onHttpError'))
                .onHttpSuccess(event('onHttpSuccess'))
                .onResponse(event('onResponse'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYkFwcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViQXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sV0FBNEIsTUFBTSxlQUFlLENBQUM7QUFDekQsT0FBTyxlQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxhQUFhLE1BQU0saUJBQWlCLENBQUM7QUFDNUMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8saUJBQWlCLE1BQU0scUJBQXFCLENBQUM7QUFDcEQsT0FBTyxVQUErQyxNQUFNLGNBQWMsQ0FBQztBQUMzRSxPQUFPLE9BQXFCLE1BQU0sV0FBVyxDQUFDO0FBQzlDLE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQUNsQyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRCxPQUFPLE9BQU8sTUFBTSxXQUFXLENBQUM7QUFHaEM7SUFBQSxNQUFxQixPQUFRLFNBQVEsU0FBUztRQXFCN0M7Ozs7OztXQU1HO1FBQ0gsWUFDa0IsSUFBWSxFQUM3QixPQUFvQixFQUNwQixJQUFjO1lBRWQsS0FBSyxFQUFFLENBQUM7WUFKUyxTQUFJLEdBQUosSUFBSSxDQUFRO1lBckJiLDJCQUFzQixHQUFRO2dCQUM5QyxPQUFPLEVBQUUsRUFBRTthQUNYLENBQUM7WUF5QkQsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuQyxJQUFJLENB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LENBQUM7UUFDakQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxPQUFPLENBQUMsT0FBdUM7WUFDOUMsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxjQUFjLENBQ2IsT0FBbUU7WUFFbkUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxlQUFlLENBQ2QsT0FBbUU7WUFFbkUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVEOzs7O1dBSUc7UUFDSCxzQkFBc0IsQ0FDckIsT0FBbUU7WUFFbkUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILGNBQWMsQ0FDYixPQUE2RDtZQUU3RCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoRCxDQUFDOztJQTdSZSxZQUFJLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDWixxQkFBYSxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3JCLHFCQUFhLEdBQUcsRUFBRSxFQUFFLENBQUM7SUFDckIscUJBQWEsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUNyQixzQkFBYyxHQUFHLEVBQUUsRUFBRSxDQUFDO0lBQ3RCLGtDQUEwQixHQUFHLEVBQUUsRUFBRSxDQUFDO0lBeVJuRCxjQUFDO0tBQUE7ZUEvUm9CLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgT1dlYkNvbmZpZ3MsIHsgdENvbmZpZ0xpc3QgfSBmcm9tICcuL09XZWJDb25maWdzJztcbmltcG9ydCBPV2ViQ3VycmVudFVzZXIgZnJvbSAnLi9PV2ViQ3VycmVudFVzZXInO1xuaW1wb3J0IE9XZWJEYXRhU3RvcmUgZnJvbSAnLi9PV2ViRGF0YVN0b3JlJztcbmltcG9ydCBPV2ViRXZlbnQgZnJvbSAnLi9PV2ViRXZlbnQnO1xuaW1wb3J0IE9XZWJGb3JtVmFsaWRhdG9yIGZyb20gJy4vT1dlYkZvcm1WYWxpZGF0b3InO1xuaW1wb3J0IE9XZWJSb3V0ZXIsIHsgdFJvdXRlU3RhdGVPYmplY3QsIHRSb3V0ZVRhcmdldCB9IGZyb20gJy4vT1dlYlJvdXRlcic7XG5pbXBvcnQgT1dlYlVybCwgeyB0VXJsTGlzdCB9IGZyb20gJy4vT1dlYlVybCc7XG5pbXBvcnQgT1dlYlZpZXcgZnJvbSAnLi9PV2ViVmlldyc7XG5pbXBvcnQgT1dlYkkxOG4gZnJvbSAnLi9PV2ViSTE4bic7XG5pbXBvcnQgT1dlYlBhZ2VyIGZyb20gJy4vT1dlYlBhZ2VyJztcbmltcG9ydCB7IGNsb25lLCBpZCwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgeyBJTmV0UmVxdWVzdE9wdGlvbnMgfSBmcm9tICcuL09XZWJOZXQnO1xuaW1wb3J0IE9XZWJYSFIgZnJvbSAnLi9PV2ViWEhSJztcbmltcG9ydCB7IElPWm9uZUFwaUpTT04gfSBmcm9tICcuL296b25lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYkFwcCBleHRlbmRzIE9XZWJFdmVudCB7XG5cdHN0YXRpYyByZWFkb25seSBTRUxGID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9BUFBfUkVBRFkgPSBpZCgpO1xuXHRzdGF0aWMgcmVhZG9ubHkgRVZUX05PVF9GT1VORCA9IGlkKCk7XG5cdHN0YXRpYyByZWFkb25seSBFVlRfU0hPV19IT01FID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX0xPR0lOID0gaWQoKTtcblx0c3RhdGljIHJlYWRvbmx5IEVWVF9TSE9XX1JFR0lTVFJBVElPTl9QQUdFID0gaWQoKTtcblxuXHRwcml2YXRlIHJlYWRvbmx5IF9yZXF1ZXN0RGVmYXVsdE9wdGlvbnM6IGFueSA9IHtcblx0XHRoZWFkZXJzOiB7fSxcblx0fTtcblxuXHRyZWFkb25seSB2aWV3OiBPV2ViVmlldztcblx0cmVhZG9ubHkgcGFnZXI6IE9XZWJQYWdlcjxhbnk+O1xuXHRyZWFkb25seSBsczogT1dlYkRhdGFTdG9yZTtcblx0cmVhZG9ubHkgcm91dGVyOiBPV2ViUm91dGVyO1xuXHRyZWFkb25seSB1c2VyOiBPV2ViQ3VycmVudFVzZXI7XG5cdHJlYWRvbmx5IGNvbmZpZ3M6IE9XZWJDb25maWdzO1xuXHRyZWFkb25seSB1cmw6IE9XZWJVcmw7XG5cdHJlYWRvbmx5IGkxOG46IE9XZWJJMThuO1xuXG5cdC8qKlxuXHQgKiBPV2ViQXBwIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gbmFtZSBUaGUgYXBwIG5hbWUuXG5cdCAqIEBwYXJhbSBjb25maWdzIFRoZSBhcHAgY29uZmlnLlxuXHQgKiBAcGFyYW0gdXJscyBUaGUgYXBwIHVybCBsaXN0LlxuXHQgKi9cblx0cHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nLFxuXHRcdGNvbmZpZ3M6IHRDb25maWdMaXN0LFxuXHRcdHVybHM6IHRVcmxMaXN0LFxuXHQpIHtcblx0XHRzdXBlcigpO1xuXG5cdFx0dGhpcy5scyA9IG5ldyBPV2ViRGF0YVN0b3JlKHRoaXMpO1xuXHRcdHRoaXMuY29uZmlncyA9IG5ldyBPV2ViQ29uZmlncyh0aGlzLCBjb25maWdzKTtcblx0XHR0aGlzLnVybCA9IG5ldyBPV2ViVXJsKHRoaXMsIHVybHMpO1xuXHRcdHRoaXMudXNlciA9IG5ldyBPV2ViQ3VycmVudFVzZXIodGhpcyk7XG5cdFx0dGhpcy52aWV3ID0gbmV3IE9XZWJWaWV3KCk7XG5cdFx0dGhpcy5wYWdlciA9IG5ldyBPV2ViUGFnZXIodGhpcyk7XG5cdFx0dGhpcy5pMThuID0gbmV3IE9XZWJJMThuKCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0YmFzZVVybCA9IHRoaXMuY29uZmlncy5nZXQoJ09XX0FQUF9MT0NBTF9CQVNFX1VSTCcpLFxuXHRcdFx0aGFzaE1vZGUgPSBmYWxzZSAhPT0gdGhpcy5jb25maWdzLmdldCgnT1dfQVBQX1JPVVRFUl9IQVNIX01PREUnKTtcblxuXHRcdHRoaXMucm91dGVyID0gbmV3IE9XZWJSb3V0ZXIoYmFzZVVybCwgaGFzaE1vZGUsIGZ1bmN0aW9uIChcblx0XHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdCkge1xuXHRcdFx0Y3R4LnRyaWdnZXIoT1dlYkFwcC5FVlRfTk9UX0ZPVU5ELCBbdGFyZ2V0XSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmkxOG4uc2V0RGVmYXVsdExhbmcodGhpcy5jb25maWdzLmdldCgnT1dfQVBQX0RFRkFVTFRfTEFORycpKTtcblxuXHRcdGNvbnN0IGFwaUtleUhlYWRlciA9IHRoaXMuY29uZmlncy5nZXQoJ09aX0FQSV9LRVlfSEVBREVSX05BTUUnKTtcblx0XHR0aGlzLl9yZXF1ZXN0RGVmYXVsdE9wdGlvbnMuaGVhZGVycyA9IHtcblx0XHRcdFthcGlLZXlIZWFkZXJdOiB0aGlzLmNvbmZpZ3MuZ2V0KCdPWl9BUElfS0VZJyksXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgcmVxdWVzdCBkZWZhdWx0IG9wdGlvbnNcblx0ICovXG5cdGdldFJlcXVlc3REZWZhdWx0T3B0aW9ucygpIHtcblx0XHRyZXR1cm4gY2xvbmUodGhpcy5fcmVxdWVzdERlZmF1bHRPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgc2Vzc2lvbiB0b2tlblxuXHQgKi9cblx0c2V0U2Vzc2lvblRva2VuKHRva2VuOiBzdHJpbmcpIHtcblx0XHRjb25zdCBoZWFkZXJOYW1lID0gdGhpcy5jb25maWdzLmdldCgnT1pfU0VTU0lPTl9UT0tFTl9IRUFERVJfTkFNRScpO1xuXG5cdFx0aWYgKGhlYWRlck5hbWUgJiYgdG9rZW4pIHtcblx0XHRcdHRoaXMuX3JlcXVlc3REZWZhdWx0T3B0aW9ucy5oZWFkZXJzW2hlYWRlck5hbWVdID0gdG9rZW47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQXBwIG5hbWUgZ2V0dGVyLlxuXHQgKi9cblx0Z2V0QXBwTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLm5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHdlIGFyZSBydW5uaW5nIGluIG1vYmlsZSBhcHAuXG5cdCAqL1xuXHRpc01vYmlsZUFwcCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gJ2NvcmRvdmEnIGluIHdpbmRvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG5ldyBmb3JtIHZhbGlkYXRvciBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIGZvcm0gVGhlIGh0bWwgZm9ybSBlbGVtZW50LlxuXHQgKiBAcGFyYW0gcmVxdWlyZWQgVGhlIHJlcXVpcmVkIGZpZWxkcyBuYW1lcyBsaXN0LlxuXHQgKiBAcGFyYW0gZXhjbHVkZWQgVGhlIGZpZWxkcyBuYW1lcyB0byBleGNsdWRlLlxuXHQgKiBAcGFyYW0gY2hlY2tBbGwgRm9yY2UgdGhlIHZhbGlkYXRvciB0byBjaGVjayBhbGwgZmllbGRzLlxuXHQgKi9cblx0Z2V0Rm9ybVZhbGlkYXRvcihcblx0XHRmb3JtOiBIVE1MRm9ybUVsZW1lbnQsXG5cdFx0cmVxdWlyZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0ZXhjbHVkZWQ6IHN0cmluZ1tdID0gW10sXG5cdFx0Y2hlY2tBbGw6IGJvb2xlYW4gPSBmYWxzZSxcblx0KSB7XG5cdFx0cmV0dXJuIG5ldyBPV2ViRm9ybVZhbGlkYXRvcih0aGlzLCBmb3JtLCByZXF1aXJlZCwgZXhjbHVkZWQsIGNoZWNrQWxsKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb3JjZSBsb2dpbi5cblx0ICpcblx0ICogPiBUaGlzIHdpbGwgY2xlYXIgYWxsIHNhdmVkIGRhdGEgaW4gdGhlIGxvY2FsIHN0b3JhZ2UuXG5cdCAqL1xuXHRmb3JjZUxvZ2luKCkge1xuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnNob3dMb2dpblBhZ2Uoe30pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbG9hZCB0aGUgYXBwLlxuXHQgKi9cblx0cmVsb2FkQXBwKCkge1xuXHRcdC8vIFRPRE86IGluc3RlYWQgb2YgcmVsb2FkaW5nIHRoZSBjdXJyZW50IGxvY2F0aW9uLCBmaW5kIGEgd2F5IHRvIGJyb3dzZSB0byB3ZWIgYXBwIGVudHJ5IHBvaW50XG5cdFx0Ly8gZm9yIGFuZHJvaWQgJiBpb3MgcmVzdGFydCB0aGUgYXBwXG5cdFx0Ly8gd2luZG93LmxvY2F0aW9uLnJlbG9hZCh0cnVlKTtcblx0XHR0aGlzLnNob3dIb21lUGFnZSh7fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveSB0aGUgYXBwLlxuXHQgKlxuXHQgKiA+IFRoaXMgd2lsbCBjbGVhciBhbGwgc2F2ZWQgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZS5cblx0ICovXG5cdGRlc3Ryb3lBcHAoKSB7XG5cdFx0Ly8gZXJhc2UgZGF0YVxuXHRcdHRoaXMubHMuY2xlYXIoKTtcblx0XHR0aGlzLnJlbG9hZEFwcCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlIGFwcC5cblx0ICovXG5cdGNsb3NlQXBwKCkge1xuXHRcdC8vIGNvcmRvdmFcblx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHVzZXIgc2Vzc2lvbiBpcyBhY3RpdmUuXG5cdCAqL1xuXHRzZXNzaW9uQWN0aXZlKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpOyAvLyBtaWxsaXNlY29uZHNcblx0XHRjb25zdCBob3VyID0gNjAgKiA2MDsgLy8gc2Vjb25kc1xuXHRcdGNvbnN0IGV4cGlyZSA9IHRoaXMudXNlci5nZXRTZXNzaW9uRXhwaXJlKCkgLSBob3VyOyAvLyBzZWNvbmRzXG5cdFx0cmV0dXJuIGV4cGlyZSAqIDEwMDAgPiBub3c7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGJlZW4gYXV0aGVudGljYXRlZC5cblx0ICovXG5cdHVzZXJWZXJpZmllZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gQm9vbGVhbih0aGlzLnVzZXIuZ2V0Q3VycmVudFVzZXIoKSAmJiB0aGlzLnNlc3Npb25BY3RpdmUoKSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIG5ldCBpbnN0YW5jZS5cblx0ICpcblx0ICogQHBhcmFtIHVybCBUaGUgcmVxdWVzdCB1cmwuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSByZXF1ZXN0IG9wdGlvbnMuXG5cdCAqL1xuXHRuZXQ8UiBleHRlbmRzIElPWm9uZUFwaUpTT048YW55Pj4oXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogUGFydGlhbDxJTmV0UmVxdWVzdE9wdGlvbnM8Uj4+LFxuXHQpIHtcblx0XHRjb25zdCBldmVudCA9IGZ1bmN0aW9uICh0eXBlOiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJBcHBdW05FVF0gaW50ZXJjZXB0ZWQgJywgdHlwZSwgLi4uYXJndW1lbnRzKTtcblx0XHRcdH07XG5cdFx0fTtcblxuXHRcdHJldHVybiBuZXcgT1dlYlhIUjxSPih1cmwsIHtcblx0XHRcdGlzR29vZE5ld3MocmVzcG9uc2UpIHtcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4ocmVzcG9uc2UuanNvbiAmJiByZXNwb25zZS5qc29uLmVycm9yID09PSAwKTtcblx0XHRcdH0sXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH0pXG5cdFx0XHQub25Hb29kTmV3cyhldmVudCgnb25Hb29kTmV3cycpKVxuXHRcdFx0Lm9uQmFkTmV3cyhldmVudCgnb25CYWROZXdzJykpXG5cdFx0XHQub25GaW5pc2hlZChldmVudCgnb25GaW5pc2hlZCcpKVxuXHRcdFx0Lm9uRXJyb3IoZXZlbnQoJ29uRXJyb3InKSlcblx0XHRcdC5vbkRvd25sb2FkUHJvZ3Jlc3MoZXZlbnQoJ29uRG93bmxvYWRQcm9ncmVzcycpKVxuXHRcdFx0Lm9uVXBsb2FkUHJvZ3Jlc3MoZXZlbnQoJ29uVXBsb2FkUHJvZ3Jlc3MnKSlcblx0XHRcdC5vbkh0dHBFcnJvcihldmVudCgnb25IdHRwRXJyb3InKSlcblx0XHRcdC5vbkh0dHBTdWNjZXNzKGV2ZW50KCdvbkh0dHBTdWNjZXNzJykpXG5cdFx0XHQub25SZXNwb25zZShldmVudCgnb25SZXNwb25zZScpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUbyBzdGFydCB0aGUgd2ViIGFwcC5cblx0ICovXG5cdHN0YXJ0KCk6IHRoaXMge1xuXHRcdGxvZ2dlci5pbmZvKCdbT1dlYkFwcF0gYXBwIHN0YXJ0ZWQhJyk7XG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJBcHAuRVZUX0FQUF9SRUFEWSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYXBwIHNob3VsZCBzaG93IHRoZSBob21lIHBhZ2UuXG5cdCAqL1xuXHRzaG93SG9tZVBhZ2Uob3B0aW9uczogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSkge1xuXHRcdHRoaXMudHJpZ2dlcihPV2ViQXBwLkVWVF9TSE9XX0hPTUUsIFtvcHRpb25zXSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYXBwIHNob3VsZCBzaG93IHRoZSBsb2dpbiBwYWdlLlxuXHQgKi9cblx0c2hvd0xvZ2luUGFnZShvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9KSB7XG5cdFx0dGhpcy50cmlnZ2VyKE9XZWJBcHAuRVZUX1NIT1dfTE9HSU4sIFtvcHRpb25zXSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIHdoZW4gYXBwIHNob3VsZCBzaG93IHRoZSByZWdpc3RyYXRpb24gcGFnZS5cblx0ICovXG5cdHNob3dSZWdpc3RyYXRpb25QYWdlKG9wdGlvbnM6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30pIHtcblx0XHR0aGlzLnRyaWdnZXIoT1dlYkFwcC5FVlRfU0hPV19MT0dJTiwgW29wdGlvbnNdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBoYW5kbGVyIGZvciBPV2ViQXBwLkVWVF9BUFBfUkVBRFkgZXZlbnRcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uUmVhZHkoaGFuZGxlcjogKHRoaXM6IHRoaXMpID0+IHZvaWQgfCBib29sZWFuKSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFwcC5FVlRfQVBQX1JFQURZLCBoYW5kbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBoYW5kbGVyIGZvciBPV2ViQXBwLkVWVF9TSE9XX0hPTUUgZXZlbnRcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uU2hvd0hvbWVQYWdlKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCkgPT4gdm9pZCB8IGJvb2xlYW4sXG5cdCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX1NIT1dfSE9NRSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfU0hPV19MT0dJTiBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlclxuXHQgKi9cblx0b25TaG93TG9naW5QYWdlKFxuXHRcdGhhbmRsZXI6ICh0aGlzOiB0aGlzLCBvcHRpb25zOiB0Um91dGVTdGF0ZU9iamVjdCkgPT4gdm9pZCB8IGJvb2xlYW4sXG5cdCkge1xuXHRcdHJldHVybiB0aGlzLm9uKE9XZWJBcHAuRVZUX1NIT1dfTE9HSU4sIGhhbmRsZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGhhbmRsZXIgZm9yIE9XZWJBcHAuRVZUX1NIT1dfUkVHSVNUUkFUSU9OX1BBR0UgZXZlbnRcblx0ICpcblx0ICogQHBhcmFtIGhhbmRsZXJcblx0ICovXG5cdG9uU2hvd1JlZ2lzdHJhdGlvblBhZ2UoXG5cdFx0aGFuZGxlcjogKHRoaXM6IHRoaXMsIG9wdGlvbnM6IHRSb3V0ZVN0YXRlT2JqZWN0KSA9PiB2b2lkIHwgYm9vbGVhbixcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub24oT1dlYkFwcC5FVlRfU0hPV19SRUdJU1RSQVRJT05fUEFHRSwgaGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgaGFuZGxlciBmb3IgT1dlYkFwcC5FVlRfTk9UX0ZPVU5EIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyXG5cdCAqL1xuXHRvblBhZ2VOb3RGb3VuZChcblx0XHRoYW5kbGVyOiAodGhpczogdGhpcywgdGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWQgfCBib29sZWFuLFxuXHQpIHtcblx0XHRyZXR1cm4gdGhpcy5vbihPV2ViQXBwLkVWVF9OT1RfRk9VTkQsIGhhbmRsZXIpO1xuXHR9XG59XG4iXX0=