import { logger, preventDefault, safeOpen } from './utils';
import OWebRoute from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';
const wLoc = window.location, wDoc = window.document, wHistory = window.history, linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click', hashTagStr = '#!';
const which = function which(e) {
    e = e || window.event;
    return null == e.which ? e.button : e.which;
}, samePath = function samePath(url) {
    return url.pathname === wLoc.pathname && url.search === wLoc.search;
}, sameOrigin = function sameOrigin(href) {
    if (!href)
        return false;
    const url = new URL(href.toString(), wLoc.toString());
    return (wLoc.protocol === url.protocol &&
        wLoc.hostname === url.hostname &&
        wLoc.port === url.port);
}, leadingSlash = function leadingSlash(path) {
    if (!path.length || path === '/') {
        return '/';
    }
    return path[0] !== '/' ? '/' + path : path;
};
export default class OWebRouter {
    _baseUrl;
    _hashMode;
    _currentTarget = {
        parsed: '',
        href: '',
        path: '',
        fullPath: '',
    };
    _routes = [];
    _initialized = false;
    _listening = false;
    _notFound = undefined;
    _popStateListener;
    _linkClickListener;
    _dispatchId = 0;
    _notFoundLoopCount = 0;
    _currentDispatcher;
    _forceReplace = false;
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     * @param notFound called when a route is not found
     */
    constructor(baseUrl, hashMode = true, notFound) {
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
     * Add a route.
     *
     * @param route
     */
    addRoute(route) {
        this._routes.push(route);
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
                if (!this._notFoundLoopCount) {
                    this._notFoundLoopCount++;
                    this._notFound(target);
                }
                else {
                    throw new Error('[OWebRouter] "notFound" handler is redirecting to another missing route. This may cause infinite loop.');
                }
            }
            else {
                throw new Error('[OWebRouter] "notFound" handler is not defined.');
            }
            return this;
        }
        this._notFoundLoopCount = 0;
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
        let active = false;
        for (let i = 0; i < ctx._routes.length; i++) {
            const route = ctx._routes[i];
            if (route.is(target.path)) {
                found.push(route);
            }
        }
        const o = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN6RCxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQThCbEQsTUFBTSxJQUFJLEdBQWEsTUFBTSxDQUFDLFFBQVEsRUFDbkMsSUFBSSxHQUFhLE1BQU0sQ0FBQyxRQUFRLEVBQ2hDLFFBQVEsR0FBUyxNQUFNLENBQUMsT0FBTyxFQUMvQixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBTyxJQUFJLENBQUM7QUFFekIsTUFBTSxLQUFLLEdBQVUsU0FBUyxLQUFLLENBQUMsQ0FBTTtJQUN0QyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM3QyxDQUFDLEVBQ0QsUUFBUSxHQUFPLFNBQVMsUUFBUSxDQUFDLEdBQVE7SUFDeEMsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JFLENBQUMsRUFDRCxVQUFVLEdBQUssU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUs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QztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtsb2dnZXIsIHByZXZlbnREZWZhdWx0LCBzYWZlT3Blbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlLCB7XG5cdE9Sb3V0ZUFjdGlvbixcblx0T1JvdXRlUGF0aCxcblx0T1JvdXRlUGF0aE9wdGlvbnMsXG59IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCB0eXBlIE9Sb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVN0YXRlSXRlbSA9IHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgT1JvdXRlU3RhdGVPYmplY3Rcblx0fCBPUm91dGVTdGF0ZUl0ZW1bXTtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVN0YXRlT2JqZWN0ID0geyBba2V5OiBzdHJpbmddOiBPUm91dGVTdGF0ZUl0ZW0gfTtcblxuZXhwb3J0IGludGVyZmFjZSBPUm91dGVEaXNwYXRjaGVyIHtcblx0cmVhZG9ubHkgaWQ6IG51bWJlcjtcblx0cmVhZG9ubHkgY29udGV4dDogT1dlYlJvdXRlQ29udGV4dDtcblx0cmVhZG9ubHkgZm91bmQ6IE9XZWJSb3V0ZVtdO1xuXG5cdGlzQWN0aXZlKCk6IGJvb2xlYW47XG5cblx0ZGlzcGF0Y2goKTogdGhpcztcblxuXHRjYW5jZWwoKTogdGhpcztcbn1cblxuY29uc3Qgd0xvYyAgICAgICAgICAgPSB3aW5kb3cubG9jYXRpb24sXG5cdCAgd0RvYyAgICAgICAgICAgPSB3aW5kb3cuZG9jdW1lbnQsXG5cdCAgd0hpc3RvcnkgICAgICAgPSB3aW5kb3cuaGlzdG9yeSxcblx0ICBsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0ICBoYXNoVGFnU3RyICAgICA9ICcjISc7XG5cbmNvbnN0IHdoaWNoICAgICAgICA9IGZ1bmN0aW9uIHdoaWNoKGU6IGFueSk6IG51bWJlciB7XG5cdFx0ICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0ICByZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHQgIH0sXG5cdCAgc2FtZVBhdGggICAgID0gZnVuY3Rpb24gc2FtZVBhdGgodXJsOiBVUkwpIHtcblx0XHQgIHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdCAgfSxcblx0ICBzYW1lT3JpZ2luICAgPSBmdW5jdGlvbiBzYW1lT3JpZ2luKGhyZWY6IHN0cmluZykge1xuXHRcdCAgaWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0ICBjb25zdCB1cmwgPSBuZXcgVVJMKGhyZWYudG9TdHJpbmcoKSwgd0xvYy50b1N0cmluZygpKTtcblxuXHRcdCAgcmV0dXJuIChcblx0XHRcdCAgd0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHQgIHdMb2MuaG9zdG5hbWUgPT09IHVybC5ob3N0bmFtZSAmJlxuXHRcdFx0ICB3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0ICApO1xuXHQgIH0sXG5cdCAgbGVhZGluZ1NsYXNoID0gZnVuY3Rpb24gbGVhZGluZ1NsYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0ICBpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0ICByZXR1cm4gJy8nO1xuXHRcdCAgfVxuXG5cdFx0ICByZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdCAgfTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VVcmw6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSBfaGFzaE1vZGU6IGJvb2xlYW47XG5cdHByaXZhdGUgX2N1cnJlbnRUYXJnZXQ6IE9Sb3V0ZVRhcmdldCAgICAgICAgICAgICAgICAgICAgPSB7XG5cdFx0cGFyc2VkICA6ICcnLFxuXHRcdGhyZWYgICAgOiAnJyxcblx0XHRwYXRoICAgIDogJycsXG5cdFx0ZnVsbFBhdGg6ICcnLFxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9ub3RGb3VuZDpcblx0XHRcdFx0XHRcdCB8IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0IHwgKCh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZCkgPSB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3BvcFN0YXRlTGlzdGVuZXI6IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9saW5rQ2xpY2tMaXN0ZW5lcjogKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIF9kaXNwYXRjaElkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMDtcblx0cHJpdmF0ZSBfbm90Rm91bmRMb29wQ291bnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnREaXNwYXRjaGVyPzogT1JvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VSZXBsYWNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKiBAcGFyYW0gbm90Rm91bmQgY2FsbGVkIHdoZW4gYSByb3V0ZSBpcyBub3QgZm91bmRcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGJhc2VVcmw6IHN0cmluZyxcblx0XHRoYXNoTW9kZSA9IHRydWUsXG5cdFx0bm90Rm91bmQ6ICh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZFxuXHQpIHtcblx0XHRjb25zdCByICAgICAgICAgICAgICAgID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsICAgICAgICAgID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSAgICAgICAgID0gaGFzaE1vZGU7XG5cdFx0dGhpcy5fbm90Rm91bmQgICAgICAgICA9IG5vdEZvdW5kO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcG9wc3RhdGUnLCBlKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRsb2dnZXIuaW5mbygnW09XZWJSb3V0ZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB0aGUgcm91dGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlyc3RSdW4gZmlyc3QgcnVuIGZsYWdcblx0ICogQHBhcmFtIHRhcmdldCBpbml0aWFsIHRhcmdldCwgdXN1YWx5IHRoZSBlbnRyeSBwb2ludFxuXHQgKiBAcGFyYW0gc3RhdGUgaW5pdGlhbCBzdGF0ZVxuXHQgKi9cblx0c3RhcnQoXG5cdFx0Zmlyc3RSdW4gPSB0cnVlLFxuXHRcdHRhcmdldDogc3RyaW5nICAgID0gd0xvYy5ocmVmLFxuXHRcdHN0YXRlPzogT1JvdXRlU3RhdGVPYmplY3Rcblx0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIScpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gd2F0Y2hpbmcgcm91dGVzJywgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHJvdXRlciBhbHJlYWR5IHN0YXJ0ZWQhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcHMgdGhlIHJvdXRlci5cblx0ICovXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3RvcCByb3V0aW5nIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIGNhbGxlZCB0aGUgY3VycmVudCBoaXN0b3J5IHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIG5leHQgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdGZvcmNlTmV4dFJlcGxhY2UoKTogdGhpcyB7XG5cdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogT1JvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudFRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGV2ZW50IGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBPUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBjb250ZXh0LlxuXHQgKi9cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudERpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybCB0byBwYXJzZVxuXHQgKi9cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiBPUm91dGVUYXJnZXQge1xuXHRcdGNvbnN0IGJhc2VVcmwgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0ICBmdWxsVXJsID0gbmV3IFVSTCh1cmwudG9TdHJpbmcoKSwgYmFzZVVybCk7XG5cdFx0bGV0IHBhcnNlZDogT1JvdXRlVGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2hhc2hNb2RlKSB7XG5cdFx0XHRwYXJzZWQgPSB7XG5cdFx0XHRcdHBhcnNlZCAgOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZiAgICA6IGZ1bGxVcmwuaHJlZixcblx0XHRcdFx0cGF0aCAgICA6IGZ1bGxVcmwuaGFzaC5yZXBsYWNlKGhhc2hUYWdTdHIsICcnKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGZ1bGxVcmwuaGFzaCxcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBwYXRobmFtZSA9IGZ1bGxVcmwucGF0aG5hbWU7XG5cdFx0XHQvLyB3aGVuIHVzaW5nIHBhdGhuYW1lIG1ha2Ugc3VyZSB0byByZW1vdmVcblx0XHRcdC8vIGJhc2UgdXJpIHBhdGhuYW1lIGZvciBhcHAgaW4gc3ViZGlyZWN0b3J5XG5cdFx0XHRpZiAocGF0aG5hbWUuaW5kZXhPZihiYXNlVXJsLnBhdGhuYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRwYXRobmFtZSA9IHBhdGhuYW1lLnN1YnN0cihiYXNlVXJsLnBhdGhuYW1lLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkICA6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmICAgIDogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoICAgIDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChcblx0XHRcdFx0XHRwYXRobmFtZSArIGZ1bGxVcmwuc2VhcmNoICsgKGZ1bGxVcmwuaGFzaCB8fCAnJylcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCcsIHBhcnNlZCk7XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IE9Sb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IE9Sb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiBPUm91dGVBY3Rpb25cblx0KTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGEgcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0YWRkUm91dGUoXG5cdFx0cm91dGU6IE9XZWJSb3V0ZVxuXHQpOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChyb3V0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR28gYmFjay5cblx0ICpcblx0ICogQHBhcmFtIGRpc3RhbmNlIHRoZSBkaXN0YW5jZSBpbiBoaXN0b3J5XG5cdCAqL1xuXHRnb0JhY2soZGlzdGFuY2UgPSAxKTogdGhpcyB7XG5cdFx0aWYgKGRpc3RhbmNlID4gMCkge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gZ29pbmcgYmFjaycsIGRpc3RhbmNlKTtcblx0XHRcdGNvbnN0IGhMZW4gPSB3SGlzdG9yeS5sZW5ndGg7XG5cdFx0XHRpZiAoaExlbiA+IDEpIHtcblx0XHRcdFx0aWYgKGhMZW4gPj0gZGlzdGFuY2UpIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtZGlzdGFuY2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1oTGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29yZG92YVxuXHRcdFx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJyb3dzZSB0byBhIHNwZWNpZmljIGxvY2F0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIG5leHQgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZVxuXHQgKiBAcGFyYW0gcHVzaCBzaG91bGQgd2UgcHVzaCBpbnRvIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZ25vcmVTYW1lTG9jYXRpb24gIGlnbm9yZSBicm93c2luZyBhZ2FpbiB0byBzYW1lIGxvY2F0aW9uXG5cdCAqL1xuXHRicm93c2VUbyhcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogT1JvdXRlU3RhdGVPYmplY3QgICAgPSB7fSxcblx0XHRwdXNoICAgICAgICAgICAgICAgPSB0cnVlLFxuXHRcdGlnbm9yZVNhbWVMb2NhdGlvbiA9IGZhbHNlXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHQgIHRhcmdldCAgICA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0ICBfY2QgICAgICAgPSB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlcjtcblx0XHRsZXQgY2Q6IE9Sb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gYnJvd3NpbmcgdG8nLCB0YXJnZXQucGF0aCwge1xuXHRcdFx0c3RhdGUsXG5cdFx0XHRwdXNoLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdH0pO1xuXG5cdFx0aWYgKGlnbm9yZVNhbWVMb2NhdGlvbiAmJiB0aGlzLl9jdXJyZW50VGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbicsIHRhcmdldC5wYXRoKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmIChfY2QgJiYgX2NkLmlzQWN0aXZlKCkpIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gYnJvd3NlVG8gY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nJywgX2NkKTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2ZvcmNlUmVwbGFjZSkge1xuXHRcdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudERpc3BhdGNoZXIgPSBjZCA9IHRoaXMuY3JlYXRlRGlzcGF0Y2hlcihcblx0XHRcdHRhcmdldCxcblx0XHRcdHN0YXRlLFxuXHRcdFx0Kyt0aGlzLl9kaXNwYXRjaElkXG5cdFx0KTtcblxuXHRcdGlmICghY2QuZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0aWYgKHRoaXMuX25vdEZvdW5kKSB7XG5cdFx0XHRcdGlmICghdGhpcy5fbm90Rm91bmRMb29wQ291bnQpIHtcblx0XHRcdFx0XHR0aGlzLl9ub3RGb3VuZExvb3BDb3VudCsrO1xuXHRcdFx0XHRcdHRoaXMuX25vdEZvdW5kKHRhcmdldCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0J1tPV2ViUm91dGVyXSBcIm5vdEZvdW5kXCIgaGFuZGxlciBpcyByZWRpcmVjdGluZyB0byBhbm90aGVyIG1pc3Npbmcgcm91dGUuIFRoaXMgbWF5IGNhdXNlIGluZmluaXRlIGxvb3AuJ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHQnW09XZWJSb3V0ZXJdIFwibm90Rm91bmRcIiBoYW5kbGVyIGlzIG5vdCBkZWZpbmVkLidcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbm90Rm91bmRMb29wQ291bnQgPSAwO1xuXG5cdFx0Y2QuZGlzcGF0Y2goKTtcblxuXHRcdGlmIChjZC5pZCA9PT0gdGhpcy5fZGlzcGF0Y2hJZCAmJiAhY2QuY29udGV4dC5zdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3VjY2VzcycsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlID0gJydcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5wdXNoU3RhdGUoe3VybCwgZGF0YTogc3RhdGV9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlID0gJydcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5yZXBsYWNlU3RhdGUoe3VybCwgZGF0YTogc3RhdGV9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCcsXG5cdFx0XHR3SGlzdG9yeS5zdGF0ZSxcblx0XHRcdHVybFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgcm91dGUgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IHRoZSByb3V0ZSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZCB0aGUgZGlzcGF0Y2hlciBpZFxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKFxuXHRcdHRhcmdldDogT1JvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCxcblx0XHRpZDogbnVtYmVyXG5cdCk6IE9Sb3V0ZURpc3BhdGNoZXIge1xuXHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNyZWF0aW9uLmApO1xuXG5cdFx0Y29uc3QgY3R4ICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdCAgZm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHQgIHJvdXRlQ29udGV4dCAgICAgICA9IG5ldyBPV2ViUm91dGVDb250ZXh0KHRoaXMsIHRhcmdldCwgc3RhdGUpO1xuXHRcdGxldCBhY3RpdmUgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjdHguX3JvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgcm91dGUgPSBjdHguX3JvdXRlc1tpXTtcblxuXHRcdFx0aWYgKHJvdXRlLmlzKHRhcmdldC5wYXRoKSkge1xuXHRcdFx0XHRmb3VuZC5wdXNoKHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBvOiBPUm91dGVEaXNwYXRjaGVyID0ge1xuXHRcdFx0Y29udGV4dCA6IHJvdXRlQ29udGV4dCxcblx0XHRcdGlkLFxuXHRcdFx0Zm91bmQsXG5cdFx0XHRpc0FjdGl2ZTogKCkgPT4gYWN0aXZlLFxuXHRcdFx0Y2FuY2VsKCkge1xuXHRcdFx0XHRpZiAoYWN0aXZlKSB7XG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKFxuXHRcdFx0XHRcdFx0YFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIWAsXG5cdFx0XHRcdFx0XHRvXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsb2dnZXIuZXJyb3IoXG5cdFx0XHRcdFx0XHRgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQgd2hlbiBpbmFjdGl2ZS5gLFxuXHRcdFx0XHRcdFx0b1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGF0Y2goKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gc3RhcnRgLCBvKTtcblxuXHRcdFx0XHRcdGxldCBqICA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHQncG9wc3RhdGUnLFxuXHRcdFx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0bGlua0NsaWNrRXZlbnQsXG5cdFx0XHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdGNvbnN0IGV2ZW50UGF0aCAgICAgICAgICAgID1cblx0XHRcdFx0ICAoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdFx0ICAoKGUgYXMgYW55KS5jb21wb3NlZFBhdGggPyAoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCgpIDogbnVsbCk7XG5cblx0XHRpZiAoZXZlbnRQYXRoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50UGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ub2RlTmFtZSkgY29udGludWU7XG5cdFx0XHRcdGlmIChldmVudFBhdGhbaV0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gJ0EnKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0uaHJlZikgY29udGludWU7XG5cblx0XHRcdFx0ZWwgPSBldmVudFBhdGhbaV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBjb250aW51ZSBlbnN1cmUgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpXG5cdFx0XHRlbCA9IGVsLnBhcmVudE5vZGUgYXMgYW55O1xuXHRcdGlmICghZWwgfHwgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBpZiBsaW5rIGlzIGluc2lkZSBhbiBzdmdcblx0XHQvLyBpbiB0aGlzIGNhc2UsIGJvdGggaHJlZiBhbmQgdGFyZ2V0IGFyZSBhbHdheXMgaW5zaWRlIGFuIG9iamVjdFxuXHRcdGNvbnN0IHN2ZyA9XG5cdFx0XHRcdCAgdHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHRcdCAgKGVsIGFzIGFueSkuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXG5cdFx0Ly8gSWdub3JlIGlmIHRhZyBoYXNcblx0XHQvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG5cdFx0Ly8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcblx0XHRpZiAoXG5cdFx0XHRlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHxcblx0XHRcdGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCdcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcblx0XHRjb25zdCBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuX2hhc2hNb2RlICYmXG5cdFx0XHRzYW1lUGF0aChlbCBhcyBhbnkpICYmXG5cdFx0XHQoKGVsIGFzIGFueSkuaGFzaCB8fCAnIycgPT09IGxpbmspXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayB0YXJnZXRcblx0XHQvLyBzdmcgdGFyZ2V0IGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdC8vIHgtb3JpZ2luXG5cdFx0Ly8gbm90ZTogc3ZnIGxpbmtzIHRoYXQgYXJlIG5vdCByZWxhdGl2ZSBkb24ndCBjYWxsIGNsaWNrIGV2ZW50cyAoYW5kIHNraXAgcGFnZS5qcylcblx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0aWYgKCFzdmcgJiYgIXNhbWVPcmlnaW4oKGVsIGFzIGFueSkuaHJlZikpIHJldHVybjtcblxuXHRcdC8vIHJlYnVpbGQgcGF0aFxuXHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0Ly8gQWxzbywgc3ZnIGhyZWYgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGxldCB0YXJnZXRIcmVmID0gc3ZnID8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsIDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuXHRcdC8qXG5cdFx0IGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdCBpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHQgdGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHQgfVxuXHRcdCAqL1xuXG5cdFx0Y29uc3Qgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSB7XG5cdFx0XHRpZiAoZWwuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSA9PT0gJ19ibGFuaycpIHtcblx0XHRcdFx0c2FmZU9wZW4ob3JpZyk7XG5cdFx0XHRcdHByZXZlbnREZWZhdWx0KGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cHJldmVudERlZmF1bHQoZSk7XG5cblx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSBsaW5rIGNsaWNrZWQnLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlXG5cdFx0KTtcblx0XHR0aGlzLmJyb3dzZVRvKG9yaWcpO1xuXHR9XG59XG4iXX0=