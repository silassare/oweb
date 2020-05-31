import { preventDefault, safeOpen } from './utils/Utils';
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
            console.log('[OWebRouter] popstate', e);
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
        console.log('[OWebRouter] ready!');
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
            console.log('[OWebRouter] start routing!');
            console.log('[OWebRouter] watching routes ->', this._routes);
            firstRun && this.browseTo(target, state, false);
        }
        else {
            console.warn('[OWebRouter] router already started!');
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
            console.log('[OWebRouter] stop routing!');
        }
        else {
            console.warn('[OWebRouter] you should start routing first!');
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
        console.log('[OWebRouter] parsed url ->', parsed);
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
            console.log('[OWebRouter] going back -> ', distance);
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
        console.log('[OWebRouter] browsing to -> ', target.path, {
            state,
            push,
            target,
        });
        if (ignoreSameLocation && this._currentTarget.href === target.href) {
            console.log('[OWebRouter] ignore same location -> ', target.path);
            return this;
        }
        if (_cd && _cd.isActive()) {
            console.warn('[OWebRouter] browseTo called while dispatching -> ', _cd);
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
            console.warn('[OWebRouter] no route found for path ->', target.path);
            if (this._notFound) {
                this._notFound(target);
            }
            else {
                throw new Error('[OWebRouter] notFound action is not defined!');
            }
            return this;
        }
        cd.dispatch();
        if (cd.id === this._dispatchId && !cd.context.stopped()) {
            cd.context.save();
            console.log('[OWebRouter] success ->', target.path);
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
        console.warn('[OWebDispatchContext] history added', state, url);
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
        console.warn('[OWebDispatchContext] history replaced -> ', wHistory.state, url);
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
        console.log(`[OWebRouter][dispatcher-${id}] creation.`);
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
                    console.warn(`[OWebRouter][dispatcher-${id}] cancel called!`, o);
                }
                else {
                    console.error(`[OWebRouter][dispatcher-${id}] cancel called when inactive.`, o);
                }
                return o;
            },
            dispatch() {
                if (!active) {
                    console.log(`[OWebRouter][dispatcher-${id}] start ->`, o);
                    let j = -1;
                    active = true;
                    while (active && ++j < found.length) {
                        routeContext.actionRunner(found[j]);
                    }
                    active = false;
                }
                else {
                    console.warn(`[OWebRouter][dispatcher-${id}] is busy!`, o);
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
        console.log('[OWebRouter][click] ->', el, orig, targetHref, wHistory.state);
        this.browseTo(orig);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sU0FJTixNQUFNLGFBQWEsQ0FBQztBQUNyQixPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBK0JsRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxFQUMzQixJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQ3pCLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFDM0QsVUFBVSxHQUFHLElBQUksQ0FBQztBQUVuQixNQUFNLEtBQUssR0FBRyxVQUFVLENBQU07SUFDNUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3RCLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDN0MsQ0FBQyxFQUNELFFBQVEsR0FBRyxVQUFVLEdBQVE7SUFDNUIsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JFLENBQUMsRUFDRCxVQUFVLEdBQUcsVUFBVSxJQUFZO0lBQ2xDLElBQUksQ0FBQyxJQUFJO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDeEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRXRE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SUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyRDtRQUVELElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUN4QixJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUMzQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2YsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO1lBRUQsT0FBTztTQUNQO1FBRUQsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxCLE9BQU8sQ0FBQyxHQUFHLENBQ1Ysd0JBQXdCLEVBQ3hCLEVBQUUsRUFDRixJQUFJLEVBQ0osVUFBVSxFQUNWLFFBQVEsQ0FBQyxLQUFLLENBQ2QsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHJldmVudERlZmF1bHQsIHNhZmVPcGVuIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlLCB7XG5cdHRSb3V0ZVBhdGgsXG5cdHRSb3V0ZVBhdGhPcHRpb25zLFxuXHR0Um91dGVBY3Rpb24sXG59IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcbnR5cGUgX3RSb3V0ZVN0YXRlSXRlbSA9XG5cdHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgX3RSb3V0ZVN0YXRlSXRlbVtdO1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVPYmplY3QgPSB7IFtrZXk6IHN0cmluZ106IHRSb3V0ZVN0YXRlSXRlbSB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIElSb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0O1xuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW107XG5cblx0aXNBY3RpdmUoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdGNhbmNlbCgpOiB0aGlzO1xufVxuXG5jb25zdCB3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24gKGU6IGFueSkge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRyZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHR9LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdH0sXG5cdHNhbWVPcmlnaW4gPSBmdW5jdGlvbiAoaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0d0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHR3TG9jLmhvc3RuYW1lID09PSB1cmwuaG9zdG5hbWUgJiZcblx0XHRcdHdMb2MucG9ydCA9PT0gdXJsLnBvcnRcblx0XHQpO1xuXHR9LFxuXHRsZWFkaW5nU2xhc2ggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0XHRpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50VGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX25vdEZvdW5kOlxuXHRcdHwgdW5kZWZpbmVkXG5cdFx0fCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoSWQgPSAwO1xuXHRwcml2YXRlIF9jdXJyZW50RGlzcGF0Y2hlcj86IElSb3V0ZURpc3BhdGNoZXI7XG5cdHByaXZhdGUgX2ZvcmNlUmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKiBAcGFyYW0gbm90Rm91bmQgY2FsbGVkIHdoZW4gYSByb3V0ZSBpcyBub3QgZm91bmRcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGJhc2VVcmw6IHN0cmluZyxcblx0XHRoYXNoTW9kZTogYm9vbGVhbiA9IHRydWUsXG5cdFx0bm90Rm91bmQ6ICh0YXJnZXQ6IHRSb3V0ZVRhcmdldCkgPT4gdm9pZCxcblx0KSB7XG5cdFx0Y29uc3QgciA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgPSBoYXNoTW9kZTtcblx0XHR0aGlzLl9ub3RGb3VuZCA9IG5vdEZvdW5kO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBwb3BzdGF0ZScsIGUpO1xuXG5cdFx0XHRpZiAoZS5zdGF0ZSkge1xuXHRcdFx0XHRyLmJyb3dzZVRvKGUuc3RhdGUudXJsLCBlLnN0YXRlLmRhdGEsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8od0xvYy5ocmVmLCB1bmRlZmluZWQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcblx0XHRcdHIuX29uQ2xpY2soZSk7XG5cdFx0fTtcblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogU3RhcnRzIHRoZSByb3V0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaXJzdFJ1biBmaXJzdCBydW4gZmxhZ1xuXHQgKiBAcGFyYW0gdGFyZ2V0IGluaXRpYWwgdGFyZ2V0LCB1c3VhbHkgdGhlIGVudHJ5IHBvaW50XG5cdCAqIEBwYXJhbSBzdGF0ZSBpbml0aWFsIHN0YXRlXG5cdCAqL1xuXHRzdGFydChcblx0XHRmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsXG5cdFx0dGFyZ2V0OiBzdHJpbmcgPSB3TG9jLmhyZWYsXG5cdFx0c3RhdGU/OiB0Um91dGVTdGF0ZU9iamVjdCxcblx0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIScpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSB3YXRjaGluZyByb3V0ZXMgLT4nLCB0aGlzLl9yb3V0ZXMpO1xuXHRcdFx0Zmlyc3RSdW4gJiYgdGhpcy5icm93c2VUbyh0YXJnZXQsIHN0YXRlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJSb3V0ZXJdIHJvdXRlciBhbHJlYWR5IHN0YXJ0ZWQhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcHMgdGhlIHJvdXRlci5cblx0ICovXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBzdG9wIHJvdXRpbmchJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIGNhbGxlZCB0aGUgY3VycmVudCBoaXN0b3J5IHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIG5leHQgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdGZvcmNlTmV4dFJlcGxhY2UoKTogdGhpcyB7XG5cdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudFRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGV2ZW50IGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBJUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBjb250ZXh0LlxuXHQgKi9cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudERpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybCB0byBwYXJzZVxuXHQgKi9cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiB0Um91dGVUYXJnZXQge1xuXHRcdGNvbnN0IGJhc2VVcmwgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0ZnVsbFVybCA9IG5ldyBVUkwodXJsLnRvU3RyaW5nKCksIGJhc2VVcmwpO1xuXHRcdGxldCBwYXJzZWQ6IHRSb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0cGFyc2VkID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiBmdWxsVXJsLmhyZWYsXG5cdFx0XHRcdHBhdGg6IGZ1bGxVcmwuaGFzaC5yZXBsYWNlKGhhc2hUYWdTdHIsICcnKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGZ1bGxVcmwuaGFzaCxcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBwYXRobmFtZSA9IGZ1bGxVcmwucGF0aG5hbWU7XG5cdFx0XHQvLyB3aGVuIHVzaW5nIHBhdGhuYW1lIG1ha2Ugc3VyZSB0byByZW1vdmVcblx0XHRcdC8vIGJhc2UgdXJpIHBhdGhuYW1lIGZvciBhcHAgaW4gc3ViZGlyZWN0b3J5XG5cdFx0XHRpZiAocGF0aG5hbWUuaW5kZXhPZihiYXNlVXJsLnBhdGhuYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRwYXRobmFtZSA9IHBhdGhuYW1lLnN1YnN0cihiYXNlVXJsLnBhdGhuYW1lLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKFxuXHRcdFx0XHRcdHBhdGhuYW1lICsgZnVsbFVybC5zZWFyY2ggKyAoZnVsbFVybC5oYXNoIHx8ICcnKSxcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBwYXJzZWQgdXJsIC0+JywgcGFyc2VkKTtcblxuXHRcdHJldHVybiBwYXJzZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIHVybCB3aXRoIGEgZ2l2ZW4gcGF0aCBhbmQgYmFzZSB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBiYXNlIHRoZSBiYXNlIHVybFxuXHQgKi9cblx0cGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IFVSTCB7XG5cdFx0YmFzZSA9IGJhc2UgJiYgYmFzZS5sZW5ndGggPyBiYXNlIDogdGhpcy5fYmFzZVVybDtcblxuXHRcdGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QocGF0aCkpIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdHBhdGggPSB0aGlzLl9oYXNoTW9kZSA/IGhhc2hUYWdTdHIgKyBsZWFkaW5nU2xhc2gocGF0aCkgOiBwYXRoO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQXR0YWNoIGEgcm91dGUgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCB0byB3YXRjaFxuXHQgKiBAcGFyYW0gcnVsZXMgdGhlIHBhdGggcnVsZXNcblx0ICogQHBhcmFtIGFjdGlvbiB0aGUgYWN0aW9uIHRvIHJ1blxuXHQgKi9cblx0b24oXG5cdFx0cGF0aDogdFJvdXRlUGF0aCxcblx0XHRydWxlczogdFJvdXRlUGF0aE9wdGlvbnMgPSB7fSxcblx0XHRhY3Rpb246IHRSb3V0ZUFjdGlvbixcblx0KTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR28gYmFjay5cblx0ICpcblx0ICogQHBhcmFtIGRpc3RhbmNlIHRoZSBkaXN0YW5jZSBpbiBoaXN0b3J5XG5cdCAqL1xuXHRnb0JhY2soZGlzdGFuY2U6IG51bWJlciA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2sgLT4gJywgZGlzdGFuY2UpO1xuXHRcdFx0Y29uc3QgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnJvd3NlIHRvIGEgc3BlY2lmaWMgbG9jYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgbmV4dCB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBpbml0aWFsIHN0YXRlXG5cdCAqIEBwYXJhbSBwdXNoIHNob3VsZCB3ZSBwdXNoIGludG8gdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlnbm9yZVNhbWVMb2NhdGlvbiAgaWdub3JlIGJyb3dzaW5nIGFnYWluIHRvIHNhbWUgbG9jYXRpb25cblx0ICovXG5cdGJyb3dzZVRvKFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9LFxuXHRcdHB1c2g6IGJvb2xlYW4gPSB0cnVlLFxuXHRcdGlnbm9yZVNhbWVMb2NhdGlvbjogYm9vbGVhbiA9IGZhbHNlLFxuXHQpOiB0aGlzIHtcblx0XHRjb25zdCB0YXJnZXRVcmwgPSB0aGlzLnBhdGhUb1VSTCh1cmwpLFxuXHRcdFx0dGFyZ2V0ID0gdGhpcy5wYXJzZVVSTCh0YXJnZXRVcmwuaHJlZiksXG5cdFx0XHRfY2QgPSB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlcjtcblx0XHRsZXQgY2Q6IElSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBicm93c2luZyB0byAtPiAnLCB0YXJnZXQucGF0aCwge1xuXHRcdFx0c3RhdGUsXG5cdFx0XHRwdXNoLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdH0pO1xuXG5cdFx0aWYgKGlnbm9yZVNhbWVMb2NhdGlvbiAmJiB0aGlzLl9jdXJyZW50VGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uIC0+ICcsIHRhcmdldC5wYXRoKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmIChfY2QgJiYgX2NkLmlzQWN0aXZlKCkpIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J1tPV2ViUm91dGVyXSBicm93c2VUbyBjYWxsZWQgd2hpbGUgZGlzcGF0Y2hpbmcgLT4gJyxcblx0XHRcdFx0X2NkLFxuXHRcdFx0KTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2ZvcmNlUmVwbGFjZSkge1xuXHRcdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudERpc3BhdGNoZXIgPSBjZCA9IHRoaXMuY3JlYXRlRGlzcGF0Y2hlcihcblx0XHRcdHRhcmdldCxcblx0XHRcdHN0YXRlLFxuXHRcdFx0Kyt0aGlzLl9kaXNwYXRjaElkLFxuXHRcdCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoIC0+Jyxcblx0XHRcdFx0dGFyZ2V0LnBhdGgsXG5cdFx0XHQpO1xuXHRcdFx0aWYgKHRoaXMuX25vdEZvdW5kKSB7XG5cdFx0XHRcdHRoaXMuX25vdEZvdW5kKHRhcmdldCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBub3RGb3VuZCBhY3Rpb24gaXMgbm90IGRlZmluZWQhJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoSWQgJiYgIWNkLmNvbnRleHQuc3RvcHBlZCgpKSB7XG5cdFx0XHRjZC5jb250ZXh0LnNhdmUoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gc3VjY2VzcyAtPicsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlOiBzdHJpbmcgPSAnJyxcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5wdXNoU3RhdGUoeyB1cmwsIGRhdGE6IHN0YXRlIH0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSBhZGRlZCcsIHN0YXRlLCB1cmwpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZSB0aGUgY3VycmVudCBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRyZXBsYWNlSGlzdG9yeShcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0dGl0bGU6IHN0cmluZyA9ICcnLFxuXHQpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgcmVwbGFjZWQgLT4gJyxcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdFx0dXJsLFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgcm91dGUgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IHRoZSByb3V0ZSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZCB0aGUgZGlzcGF0Y2hlciBpZFxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKFxuXHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHRpZDogbnVtYmVyLFxuXHQpOiBJUm91dGVEaXNwYXRjaGVyIHtcblx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNyZWF0aW9uLmApO1xuXG5cdFx0Y29uc3QgY3R4ID0gdGhpcyxcblx0XHRcdGZvdW5kOiBPV2ViUm91dGVbXSA9IFtdLFxuXHRcdFx0cm91dGVDb250ZXh0ID0gbmV3IE9XZWJSb3V0ZUNvbnRleHQodGhpcywgdGFyZ2V0LCBzdGF0ZSk7XG5cdFx0bGV0IGFjdGl2ZSA9IGZhbHNlLFxuXHRcdFx0bzogSVJvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY3R4Ll9yb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHJvdXRlID0gY3R4Ll9yb3V0ZXNbaV07XG5cblx0XHRcdGlmIChyb3V0ZS5pcyh0YXJnZXQucGF0aCkpIHtcblx0XHRcdFx0Zm91bmQucHVzaChyb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0byA9IHtcblx0XHRcdGNvbnRleHQ6IHJvdXRlQ29udGV4dCxcblx0XHRcdGlkLFxuXHRcdFx0Zm91bmQsXG5cdFx0XHRpc0FjdGl2ZTogKCkgPT4gYWN0aXZlLFxuXHRcdFx0Y2FuY2VsKCkge1xuXHRcdFx0XHRpZiAoYWN0aXZlKSB7XG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcdFx0YFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIWAsXG5cdFx0XHRcdFx0XHRvLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCB3aGVuIGluYWN0aXZlLmAsXG5cdFx0XHRcdFx0XHRvLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGF0Y2goKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBzdGFydCAtPmAsIG8pO1xuXG5cdFx0XHRcdFx0bGV0IGogPSAtMTtcblx0XHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0d2hpbGUgKGFjdGl2ZSAmJiArK2ogPCBmb3VuZC5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHJvdXRlQ29udGV4dC5hY3Rpb25SdW5uZXIoZm91bmRbal0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGlzIGJ1c3khYCwgbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IHRydWU7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHQncG9wc3RhdGUnLFxuXHRcdFx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdCk7XG5cdFx0XHR3RG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBjbGljayBldmVudFxuXHQgKlxuXHQgKiBvbmNsaWNrIGZyb20gcGFnZS5qcyBsaWJyYXJ5OiBnaXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcblx0ICpcblx0ICogQHBhcmFtIGUgdGhlIGVudmVudCBvYmplY3Rcblx0ICovXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0Y29uc3QgZXZlbnRQYXRoID1cblx0XHRcdChlIGFzIGFueSkucGF0aCB8fFxuXHRcdFx0KChlIGFzIGFueSkuY29tcG9zZWRQYXRoID8gKGUgYXMgYW55KS5jb21wb3NlZFBhdGgoKSA6IG51bGwpO1xuXG5cdFx0aWYgKGV2ZW50UGF0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudFBhdGgubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoW2ldLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgY29udGludWU7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLmhyZWYpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGVsID0gZXZlbnRQYXRoW2ldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29udGludWUgZW5zdXJlIGxpbmtcblx0XHQvLyBlbC5ub2RlTmFtZSBmb3Igc3ZnIGxpbmtzIGFyZSAnYScgaW5zdGVhZCBvZiAnQSdcblx0XHR3aGlsZSAoZWwgJiYgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKVxuXHRcdFx0ZWwgPSBlbC5wYXJlbnROb2RlIGFzIGFueTtcblx0XHRpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRjb25zdCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChcblx0XHRcdGVsLmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fFxuXHRcdFx0ZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJ1xuXHRcdClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGNvbnN0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRjb25zdCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHtcblx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRzYWZlT3BlbihvcmlnKTtcblx0XHRcdFx0cHJldmVudERlZmF1bHQoZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0J1tPV2ViUm91dGVyXVtjbGlja10gLT4nLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdCk7XG5cdFx0dGhpcy5icm93c2VUbyhvcmlnKTtcblx0fVxufVxuIl19