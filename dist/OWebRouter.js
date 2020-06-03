import { preventDefault, safeOpen, logger } from './utils/Utils';
import OWebRoute from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';
const wLoc = window.location, wDoc = window.document, wHistory = window.history, linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click', hashTagStr = '#!';
const which = function (e) {
    e = e || window.event;
    return null == e.which ? e.button : e.which;
}, samePath = function (url) {
    return url.pathname === wLoc.pathname && url.search === wLoc.search;
}, sameOrigin = function (href) {
    if (!href)
        return false;
    const url = new URL(href.toString(), wLoc.toString());
    return (wLoc.protocol === url.protocol &&
        wLoc.hostname === url.hostname &&
        wLoc.port === url.port);
}, leadingSlash = (path) => {
    if (!path.length || path === '/') {
        return '/';
    }
    return path[0] !== '/' ? '/' + path : path;
};
export default class OWebRouter {
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     * @param notFound called when a route is not found
     */
    constructor(baseUrl, hashMode = true, notFound) {
        this._currentTarget = {
            parsed: '',
            href: '',
            path: '',
            fullPath: '',
        };
        this._routes = [];
        this._initialized = false;
        this._listening = false;
        this._notFound = undefined;
        this._dispatchId = 0;
        this._forceReplace = false;
        const r = this;
        this._baseUrl = baseUrl;
        this._hashMode = hashMode;
        this._notFound = notFound;
        this._popStateListener = (e) => {
            logger.debug('[OWebRouter] popstate', e);
            if (e.state) {
                r.browseTo(e.state.url, e.state.data, false);
            }
            else {
                r.browseTo(wLoc.href, undefined, false);
            }
        };
        this._linkClickListener = (e) => {
            r._onClick(e);
        };
        logger.info('[OWebRouter] ready!');
    }
    /**
     * Starts the router.
     *
     * @param firstRun first run flag
     * @param target initial target, usualy the entry point
     * @param state initial state
     */
    start(firstRun = true, target = wLoc.href, state) {
        if (!this._initialized) {
            this._initialized = true;
            this.register();
            logger.info('[OWebRouter] start routing!');
            logger.debug('[OWebRouter] watching routes', this._routes);
            firstRun && this.browseTo(target, state, false);
        }
        else {
            logger.warn('[OWebRouter] router already started!');
        }
        return this;
    }
    /**
     * Stops the router.
     */
    stopRouting() {
        if (this._initialized) {
            this._initialized = false;
            this.unregister();
            logger.debug('[OWebRouter] stop routing!');
        }
        else {
            logger.warn('[OWebRouter] you should start routing first!');
        }
        return this;
    }
    /**
     * When called the current history will be replaced by the next history state.
     */
    forceNextReplace() {
        this._forceReplace = true;
        return this;
    }
    /**
     * Returns the current route target.
     */
    getCurrentTarget() {
        return this._currentTarget;
    }
    /**
     * Returns the current route event dispatcher.
     */
    getCurrentDispatcher() {
        return this._currentDispatcher;
    }
    /**
     * Returns the current route context.
     */
    getRouteContext() {
        if (!this._currentDispatcher) {
            throw new Error('[OWebRouter] no route context.');
        }
        return this._currentDispatcher.context;
    }
    /**
     * Parse a given url.
     *
     * @param url the url to parse
     */
    parseURL(url) {
        const baseUrl = new URL(this._baseUrl), fullUrl = new URL(url.toString(), baseUrl);
        let parsed;
        if (this._hashMode) {
            parsed = {
                parsed: url.toString(),
                href: fullUrl.href,
                path: fullUrl.hash.replace(hashTagStr, ''),
                fullPath: fullUrl.hash,
            };
        }
        else {
            let pathname = fullUrl.pathname;
            // when using pathname make sure to remove
            // base uri pathname for app in subdirectory
            if (pathname.indexOf(baseUrl.pathname) === 0) {
                pathname = pathname.substr(baseUrl.pathname.length);
            }
            parsed = {
                parsed: url.toString(),
                href: fullUrl.href,
                path: leadingSlash(pathname),
                fullPath: leadingSlash(pathname + fullUrl.search + (fullUrl.hash || '')),
            };
        }
        logger.debug('[OWebRouter] parsed url', parsed);
        return parsed;
    }
    /**
     * Builds url with a given path and base url.
     *
     * @param path the path
     * @param base the base url
     */
    pathToURL(path, base) {
        base = base && base.length ? base : this._baseUrl;
        if (path.indexOf(base) === 0) {
            return new URL(path);
        }
        if (/^https?:\/\//.test(path)) {
            return new URL(path);
        }
        path = this._hashMode ? hashTagStr + leadingSlash(path) : path;
        return new URL(path, base);
    }
    /**
     * Attach a route action.
     *
     * @param path the path to watch
     * @param rules the path rules
     * @param action the action to run
     */
    on(path, rules = {}, action) {
        this._routes.push(new OWebRoute(path, rules, action));
        return this;
    }
    /**
     * Go back.
     *
     * @param distance the distance in history
     */
    goBack(distance = 1) {
        if (distance > 0) {
            logger.debug('[OWebRouter] going back', distance);
            const hLen = wHistory.length;
            if (hLen > 1) {
                if (hLen >= distance) {
                    wHistory.go(-distance);
                }
                else {
                    wHistory.go(-hLen);
                }
            }
            else {
                // cordova
                if (window.navigator && window.navigator.app) {
                    window.navigator.app.exitApp();
                }
                else {
                    window.close();
                }
            }
        }
        return this;
    }
    /**
     * Browse to a specific location
     *
     * @param url the next url
     * @param state the initial state
     * @param push should we push into the history state
     * @param ignoreSameLocation  ignore browsing again to same location
     */
    browseTo(url, state = {}, push = true, ignoreSameLocation = false) {
        const targetUrl = this.pathToURL(url), target = this.parseURL(targetUrl.href), _cd = this._currentDispatcher;
        let cd;
        if (!sameOrigin(target.href)) {
            window.open(url);
            return this;
        }
        logger.debug('[OWebRouter] browsing to', target.path, {
            state,
            push,
            target,
        });
        if (ignoreSameLocation && this._currentTarget.href === target.href) {
            logger.debug('[OWebRouter] ignore same location', target.path);
            return this;
        }
        if (_cd && _cd.isActive()) {
            logger.warn('[OWebRouter] browseTo called while dispatching', _cd);
            _cd.cancel();
        }
        this._currentTarget = target;
        if (this._forceReplace) {
            this._forceReplace = false;
            this.replaceHistory(targetUrl.href, state);
        }
        else {
            push && this.addHistory(targetUrl.href, state);
        }
        this._currentDispatcher = cd = this.createDispatcher(target, state, ++this._dispatchId);
        if (!cd.found.length) {
            logger.warn('[OWebRouter] no route found for path', target.path);
            if (this._notFound) {
                this._notFound(target);
            }
            else {
                throw new Error('[OWebRouter] "notFound" handler is not defined.');
            }
            return this;
        }
        cd.dispatch();
        if (cd.id === this._dispatchId && !cd.context.stopped()) {
            cd.context.save();
            logger.debug('[OWebRouter] success', target.path);
        }
        return this;
    }
    /**
     * Adds history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    addHistory(url, state, title = '') {
        title = title && title.length ? title : wDoc.title;
        wHistory.pushState({ url, data: state }, title, url);
        logger.debug('[OWebDispatchContext] history added', state, url);
        return this;
    }
    /**
     * Replace the current history.
     *
     * @param url the url
     * @param state the history state
     * @param title the window title
     */
    replaceHistory(url, state, title = '') {
        title = title && title.length ? title : wDoc.title;
        wHistory.replaceState({ url, data: state }, title, url);
        logger.debug('[OWebDispatchContext] history replaced', wHistory.state, url);
        return this;
    }
    /**
     * Create route event dispatcher
     *
     * @param target the route target
     * @param state the history state
     * @param id the dispatcher id
     */
    createDispatcher(target, state, id) {
        logger.debug(`[OWebRouter][dispatcher-${id}] creation.`);
        const ctx = this, found = [], routeContext = new OWebRouteContext(this, target, state);
        let active = false, o;
        for (let i = 0; i < ctx._routes.length; i++) {
            const route = ctx._routes[i];
            if (route.is(target.path)) {
                found.push(route);
            }
        }
        o = {
            context: routeContext,
            id,
            found,
            isActive: () => active,
            cancel() {
                if (active) {
                    active = false;
                    logger.debug(`[OWebRouter][dispatcher-${id}] cancel called!`, o);
                }
                else {
                    logger.error(`[OWebRouter][dispatcher-${id}] cancel called when inactive.`, o);
                }
                return o;
            },
            dispatch() {
                if (!active) {
                    logger.debug(`[OWebRouter][dispatcher-${id}] start`, o);
                    let j = -1;
                    active = true;
                    while (active && ++j < found.length) {
                        routeContext.actionRunner(found[j]);
                    }
                    active = false;
                }
                else {
                    logger.warn(`[OWebRouter][dispatcher-${id}] is busy!`, o);
                }
                return o;
            },
        };
        return o;
    }
    /**
     * Register DOM events handler.
     */
    register() {
        if (!this._listening) {
            this._listening = true;
            window.addEventListener('popstate', this._popStateListener, false);
            wDoc.addEventListener(linkClickEvent, this._linkClickListener, false);
        }
        return this;
    }
    /**
     * Unregister all DOM events handler.
     */
    unregister() {
        if (this._listening) {
            this._listening = false;
            window.removeEventListener('popstate', this._popStateListener, false);
            wDoc.removeEventListener(linkClickEvent, this._linkClickListener, false);
        }
        return this;
    }
    /**
     * Handle click event
     *
     * onclick from page.js library: github.com/visionmedia/page.js
     *
     * @param e the envent object
     */
    _onClick(e) {
        if (1 !== which(e))
            return;
        if (e.metaKey || e.ctrlKey || e.shiftKey)
            return;
        if (e.defaultPrevented)
            return;
        // ensure link
        // use shadow dom when available if not, fall back to composedPath() for browsers that only have shady
        let el = e.target;
        const eventPath = e.path ||
            (e.composedPath ? e.composedPath() : null);
        if (eventPath) {
            for (let i = 0; i < eventPath.length; i++) {
                if (!eventPath[i].nodeName)
                    continue;
                if (eventPath[i].nodeName.toUpperCase() !== 'A')
                    continue;
                if (!eventPath[i].href)
                    continue;
                el = eventPath[i];
                break;
            }
        }
        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase())
            el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase())
            return;
        // we check if link is inside an svg
        // in this case, both href and target are always inside an object
        const svg = typeof el.href === 'object' &&
            el.href.constructor.name === 'SVGAnimatedString';
        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') ||
            el.getAttribute('rel') === 'external')
            return;
        // ensure non-hash for the same path
        const link = el.getAttribute('href');
        if (!this._hashMode &&
            samePath(el) &&
            (el.hash || '#' === link))
            return;
        // we check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1)
            return;
        // we check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target)
            return;
        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !sameOrigin(el.href))
            return;
        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        let targetHref = svg ? el.href.baseVal : el.href;
        // strip leading "/[drive letter]:" on NW.js on Windows
        /*
         let hasProcess = typeof process !== 'undefined';
         if (hasProcess && targetHref.match(/^\/[a-zA-Z]:\//)) {
         targetHref = targetHref.replace(/^\/[a-zA-Z]:\//, "/");
         }
         */
        const orig = targetHref;
        if (targetHref.indexOf(this._baseUrl) === 0) {
            targetHref = targetHref.substr(this._baseUrl.length);
        }
        if (orig === targetHref) {
            if (el.getAttribute('target') === '_blank') {
                safeOpen(orig);
                preventDefault(e);
            }
            return;
        }
        preventDefault(e);
        logger.debug('[OWebRouter][click] link clicked', el, orig, targetHref, wHistory.state);
        this.browseTo(orig);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqRSxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQStCbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFNO0lBQzVCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBVSxHQUFRO0lBQzVCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNyRSxDQUFDLEVBQ0QsVUFBVSxHQUFHLFVBQVUsSUFBWTtJQUNsQyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMs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QUFDO1FBRXhCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDeEIsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNmLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtZQUVELE9BQU87U0FDUDtRQUVELGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsS0FBSyxDQUNYLGtDQUFrQyxFQUNsQyxFQUFFLEVBQ0YsSUFBSSxFQUNKLFVBQVUsRUFDVixRQUFRLENBQUMsS0FBSyxDQUNkLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByZXZlbnREZWZhdWx0LCBzYWZlT3BlbiwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlLCB7XG5cdHRSb3V0ZVBhdGgsXG5cdHRSb3V0ZVBhdGhPcHRpb25zLFxuXHR0Um91dGVBY3Rpb24sXG59IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcbnR5cGUgX3RSb3V0ZVN0YXRlSXRlbSA9XG5cdHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgX3RSb3V0ZVN0YXRlSXRlbVtdO1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVPYmplY3QgPSB7IFtrZXk6IHN0cmluZ106IHRSb3V0ZVN0YXRlSXRlbSB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIElSb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0O1xuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW107XG5cblx0aXNBY3RpdmUoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdGNhbmNlbCgpOiB0aGlzO1xufVxuXG5jb25zdCB3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24gKGU6IGFueSkge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRyZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHR9LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdH0sXG5cdHNhbWVPcmlnaW4gPSBmdW5jdGlvbiAoaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0d0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHR3TG9jLmhvc3RuYW1lID09PSB1cmwuaG9zdG5hbWUgJiZcblx0XHRcdHdMb2MucG9ydCA9PT0gdXJsLnBvcnRcblx0XHQpO1xuXHR9LFxuXHRsZWFkaW5nU2xhc2ggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0XHRpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50VGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX25vdEZvdW5kOlxuXHRcdHwgdW5kZWZpbmVkXG5cdFx0fCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoSWQgPSAwO1xuXHRwcml2YXRlIF9jdXJyZW50RGlzcGF0Y2hlcj86IElSb3V0ZURpc3BhdGNoZXI7XG5cdHByaXZhdGUgX2ZvcmNlUmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKiBAcGFyYW0gbm90Rm91bmQgY2FsbGVkIHdoZW4gYSByb3V0ZSBpcyBub3QgZm91bmRcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGJhc2VVcmw6IHN0cmluZyxcblx0XHRoYXNoTW9kZTogYm9vbGVhbiA9IHRydWUsXG5cdFx0bm90Rm91bmQ6ICh0YXJnZXQ6IHRSb3V0ZVRhcmdldCkgPT4gdm9pZCxcblx0KSB7XG5cdFx0Y29uc3QgciA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgPSBoYXNoTW9kZTtcblx0XHR0aGlzLl9ub3RGb3VuZCA9IG5vdEZvdW5kO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcG9wc3RhdGUnLCBlKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRsb2dnZXIuaW5mbygnW09XZWJSb3V0ZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB0aGUgcm91dGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlyc3RSdW4gZmlyc3QgcnVuIGZsYWdcblx0ICogQHBhcmFtIHRhcmdldCBpbml0aWFsIHRhcmdldCwgdXN1YWx5IHRoZSBlbnRyeSBwb2ludFxuXHQgKiBAcGFyYW0gc3RhdGUgaW5pdGlhbCBzdGF0ZVxuXHQgKi9cblx0c3RhcnQoXG5cdFx0Zmlyc3RSdW46IGJvb2xlYW4gPSB0cnVlLFxuXHRcdHRhcmdldDogc3RyaW5nID0gd0xvYy5ocmVmLFxuXHRcdHN0YXRlPzogdFJvdXRlU3RhdGVPYmplY3QsXG5cdCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdHRoaXMucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5pbmZvKCdbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyEnKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcycsIHRoaXMuX3JvdXRlcyk7XG5cdFx0XHRmaXJzdFJ1biAmJiB0aGlzLmJyb3dzZVRvKHRhcmdldCwgc3RhdGUsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSByb3V0ZXIgYWxyZWFkeSBzdGFydGVkIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3BzIHRoZSByb3V0ZXIuXG5cdCAqL1xuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogV2hlbiBjYWxsZWQgdGhlIGN1cnJlbnQgaGlzdG9yeSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBuZXh0IGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRmb3JjZU5leHRSZXBsYWNlKCk6IHRoaXMge1xuXHRcdHRoaXMuX2ZvcmNlUmVwbGFjZSA9IHRydWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSB0YXJnZXQuXG5cdCAqL1xuXHRnZXRDdXJyZW50VGFyZ2V0KCk6IHRSb3V0ZVRhcmdldCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRUYXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBldmVudCBkaXNwYXRjaGVyLlxuXHQgKi9cblx0Z2V0Q3VycmVudERpc3BhdGNoZXIoKTogSVJvdXRlRGlzcGF0Y2hlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgY29udGV4dC5cblx0ICovXG5cdGdldFJvdXRlQ29udGV4dCgpOiBPV2ViUm91dGVDb250ZXh0IHtcblx0XHRpZiAoIXRoaXMuX2N1cnJlbnREaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBjb250ZXh0LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmwgdG8gcGFyc2Vcblx0ICovXG5cdHBhcnNlVVJMKHVybDogc3RyaW5nIHwgVVJMKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRjb25zdCBiYXNlVXJsID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdGZ1bGxVcmwgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiYXNlVXJsKTtcblx0XHRsZXQgcGFyc2VkOiB0Um91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBmdWxsVXJsLmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCAnJyksXG5cdFx0XHRcdGZ1bGxQYXRoOiBmdWxsVXJsLmhhc2gsXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcGF0aG5hbWUgPSBmdWxsVXJsLnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYmFzZVVybC5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYmFzZVVybC5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQgPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IGZ1bGxVcmwuaHJlZixcblx0XHRcdFx0cGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChcblx0XHRcdFx0XHRwYXRobmFtZSArIGZ1bGxVcmwuc2VhcmNoICsgKGZ1bGxVcmwuaGFzaCB8fCAnJyksXG5cdFx0XHRcdCksXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHBhcnNlZCB1cmwnLCBwYXJzZWQpO1xuXG5cdFx0cmV0dXJuIHBhcnNlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgdXJsIHdpdGggYSBnaXZlbiBwYXRoIGFuZCBiYXNlIHVybC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGhcblx0ICogQHBhcmFtIGJhc2UgdGhlIGJhc2UgdXJsXG5cdCAqL1xuXHRwYXRoVG9VUkwocGF0aDogc3RyaW5nLCBiYXNlPzogc3RyaW5nKTogVVJMIHtcblx0XHRiYXNlID0gYmFzZSAmJiBiYXNlLmxlbmd0aCA/IGJhc2UgOiB0aGlzLl9iYXNlVXJsO1xuXG5cdFx0aWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKC9eaHR0cHM/OlxcL1xcLy8udGVzdChwYXRoKSkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0cGF0aCA9IHRoaXMuX2hhc2hNb2RlID8gaGFzaFRhZ1N0ciArIGxlYWRpbmdTbGFzaChwYXRoKSA6IHBhdGg7XG5cblx0XHRyZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBdHRhY2ggYSByb3V0ZSBhY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoIHRvIHdhdGNoXG5cdCAqIEBwYXJhbSBydWxlcyB0aGUgcGF0aCBydWxlc1xuXHQgKiBAcGFyYW0gYWN0aW9uIHRoZSBhY3Rpb24gdG8gcnVuXG5cdCAqL1xuXHRvbihcblx0XHRwYXRoOiB0Um91dGVQYXRoLFxuXHRcdHJ1bGVzOiB0Um91dGVQYXRoT3B0aW9ucyA9IHt9LFxuXHRcdGFjdGlvbjogdFJvdXRlQWN0aW9uLFxuXHQpOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChuZXcgT1dlYlJvdXRlKHBhdGgsIHJ1bGVzLCBhY3Rpb24pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHbyBiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGlzdGFuY2UgdGhlIGRpc3RhbmNlIGluIGhpc3Rvcnlcblx0ICovXG5cdGdvQmFjayhkaXN0YW5jZTogbnVtYmVyID0gMSk6IHRoaXMge1xuXHRcdGlmIChkaXN0YW5jZSA+IDApIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2snLCBkaXN0YW5jZSk7XG5cdFx0XHRjb25zdCBoTGVuID0gd0hpc3RvcnkubGVuZ3RoO1xuXHRcdFx0aWYgKGhMZW4gPiAxKSB7XG5cdFx0XHRcdGlmIChoTGVuID49IGRpc3RhbmNlKSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWRpc3RhbmNlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtaExlbik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGNvcmRvdmFcblx0XHRcdFx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgKHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHApIHtcblx0XHRcdFx0XHQod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcC5leGl0QXBwKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBCcm93c2UgdG8gYSBzcGVjaWZpYyBsb2NhdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSBuZXh0IHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGluaXRpYWwgc3RhdGVcblx0ICogQHBhcmFtIHB1c2ggc2hvdWxkIHdlIHB1c2ggaW50byB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWdub3JlU2FtZUxvY2F0aW9uICBpZ25vcmUgYnJvd3NpbmcgYWdhaW4gdG8gc2FtZSBsb2NhdGlvblxuXHQgKi9cblx0YnJvd3NlVG8oXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30sXG5cdFx0cHVzaDogYm9vbGVhbiA9IHRydWUsXG5cdFx0aWdub3JlU2FtZUxvY2F0aW9uOiBib29sZWFuID0gZmFsc2UsXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHR0YXJnZXQgPSB0aGlzLnBhcnNlVVJMKHRhcmdldFVybC5ocmVmKSxcblx0XHRcdF9jZCA9IHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHRcdGxldCBjZDogSVJvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGlmICghc2FtZU9yaWdpbih0YXJnZXQuaHJlZikpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBicm93c2luZyB0bycsIHRhcmdldC5wYXRoLCB7XG5cdFx0XHRzdGF0ZSxcblx0XHRcdHB1c2gsXG5cdFx0XHR0YXJnZXQsXG5cdFx0fSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRUYXJnZXQuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiBfY2QuaXNBY3RpdmUoKSkge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSBicm93c2VUbyBjYWxsZWQgd2hpbGUgZGlzcGF0Y2hpbmcnLCBfY2QpO1xuXHRcdFx0X2NkLmNhbmNlbCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG5cblx0XHRpZiAodGhpcy5fZm9yY2VSZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZVJlcGxhY2UgPSBmYWxzZTtcblx0XHRcdHRoaXMucmVwbGFjZUhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHVzaCAmJiB0aGlzLmFkZEhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50RGlzcGF0Y2hlciA9IGNkID0gdGhpcy5jcmVhdGVEaXNwYXRjaGVyKFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0c3RhdGUsXG5cdFx0XHQrK3RoaXMuX2Rpc3BhdGNoSWQsXG5cdFx0KTtcblxuXHRcdGlmICghY2QuZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0aWYgKHRoaXMuX25vdEZvdW5kKSB7XG5cdFx0XHRcdHRoaXMuX25vdEZvdW5kKHRhcmdldCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0J1tPV2ViUm91dGVyXSBcIm5vdEZvdW5kXCIgaGFuZGxlciBpcyBub3QgZGVmaW5lZC4nLFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjZC5kaXNwYXRjaCgpO1xuXG5cdFx0aWYgKGNkLmlkID09PSB0aGlzLl9kaXNwYXRjaElkICYmICFjZC5jb250ZXh0LnN0b3BwZWQoKSkge1xuXHRcdFx0Y2QuY29udGV4dC5zYXZlKCk7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBzdWNjZXNzJywgdGFyZ2V0LnBhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0YWRkSGlzdG9yeShcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0dGl0bGU6IHN0cmluZyA9ICcnLFxuXHQpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnB1c2hTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IGFkZGVkJywgc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlIHRoZSBjdXJyZW50IGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdHJlcGxhY2VIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZTogc3RyaW5nID0gJycsXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCcsXG5cdFx0XHR3SGlzdG9yeS5zdGF0ZSxcblx0XHRcdHVybCxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHJvdXRlIGV2ZW50IGRpc3BhdGNoZXJcblx0ICpcblx0ICogQHBhcmFtIHRhcmdldCB0aGUgcm91dGUgdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWQgdGhlIGRpc3BhdGNoZXIgaWRcblx0ICovXG5cdHByaXZhdGUgY3JlYXRlRGlzcGF0Y2hlcihcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0aWQ6IG51bWJlcixcblx0KTogSVJvdXRlRGlzcGF0Y2hlciB7XG5cdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0Zm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKTtcblx0XHRsZXQgYWN0aXZlID0gZmFsc2UsXG5cdFx0XHRvOiBJUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjdHguX3JvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgcm91dGUgPSBjdHguX3JvdXRlc1tpXTtcblxuXHRcdFx0aWYgKHJvdXRlLmlzKHRhcmdldC5wYXRoKSkge1xuXHRcdFx0XHRmb3VuZC5wdXNoKHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvID0ge1xuXHRcdFx0Y29udGV4dDogcm91dGVDb250ZXh0LFxuXHRcdFx0aWQsXG5cdFx0XHRmb3VuZCxcblx0XHRcdGlzQWN0aXZlOiAoKSA9PiBhY3RpdmUsXG5cdFx0XHRjYW5jZWwoKSB7XG5cdFx0XHRcdGlmIChhY3RpdmUpIHtcblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHRcdFx0XHRgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQhYCxcblx0XHRcdFx0XHRcdG8sXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsb2dnZXIuZXJyb3IoXG5cdFx0XHRcdFx0XHRgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQgd2hlbiBpbmFjdGl2ZS5gLFxuXHRcdFx0XHRcdFx0byxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0YXJ0YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBVbnJlZ2lzdGVyIGFsbCBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHVucmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gZmFsc2U7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0J3BvcHN0YXRlJyxcblx0XHRcdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdFx0d0RvYy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdGNvbnN0IGV2ZW50UGF0aCA9XG5cdFx0XHQoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdCgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLm5vZGVOYW1lKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGV2ZW50UGF0aFtpXS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSlcblx0XHRcdGVsID0gZWwucGFyZW50Tm9kZSBhcyBhbnk7XG5cdFx0aWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGlmIGxpbmsgaXMgaW5zaWRlIGFuIHN2Z1xuXHRcdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdFx0Y29uc3Qgc3ZnID1cblx0XHRcdHR5cGVvZiAoZWwgYXMgYW55KS5ocmVmID09PSAnb2JqZWN0JyAmJlxuXHRcdFx0KGVsIGFzIGFueSkuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXG5cdFx0Ly8gSWdub3JlIGlmIHRhZyBoYXNcblx0XHQvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG5cdFx0Ly8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcblx0XHRpZiAoXG5cdFx0XHRlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHxcblx0XHRcdGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCdcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcblx0XHRjb25zdCBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuX2hhc2hNb2RlICYmXG5cdFx0XHRzYW1lUGF0aChlbCBhcyBhbnkpICYmXG5cdFx0XHQoKGVsIGFzIGFueSkuaGFzaCB8fCAnIycgPT09IGxpbmspXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayB0YXJnZXRcblx0XHQvLyBzdmcgdGFyZ2V0IGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdC8vIHgtb3JpZ2luXG5cdFx0Ly8gbm90ZTogc3ZnIGxpbmtzIHRoYXQgYXJlIG5vdCByZWxhdGl2ZSBkb24ndCBjYWxsIGNsaWNrIGV2ZW50cyAoYW5kIHNraXAgcGFnZS5qcylcblx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0aWYgKCFzdmcgJiYgIXNhbWVPcmlnaW4oKGVsIGFzIGFueSkuaHJlZikpIHJldHVybjtcblxuXHRcdC8vIHJlYnVpbGQgcGF0aFxuXHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0Ly8gQWxzbywgc3ZnIGhyZWYgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGxldCB0YXJnZXRIcmVmID0gc3ZnID8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsIDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuXHRcdC8qXG5cdFx0IGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdCBpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHQgdGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHQgfVxuXHRcdCAqL1xuXG5cdFx0Y29uc3Qgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSB7XG5cdFx0XHRpZiAoZWwuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSA9PT0gJ19ibGFuaycpIHtcblx0XHRcdFx0c2FmZU9wZW4ob3JpZyk7XG5cdFx0XHRcdHByZXZlbnREZWZhdWx0KGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cHJldmVudERlZmF1bHQoZSk7XG5cblx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSBsaW5rIGNsaWNrZWQnLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdCk7XG5cdFx0dGhpcy5icm93c2VUbyhvcmlnKTtcblx0fVxufVxuIl19