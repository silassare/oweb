import { logger, preventDefault, safeOpen } from './utils';
import OWebRoute from './OWebRoute';
import OWebRouteContext from './OWebRouteContext';
const wLoc = window.location, wDoc = window.document, wHistory = window.history, linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click', hashTagStr = '#!';
const which = function which(e) {
    e = e || window.event;
    return null == e.which ? e.button : e.which;
}, samePath = function samePath(url) {
    url = new URL(url);
    return url.pathname === wLoc.pathname && url.search === wLoc.search;
}, sameOrigin = function sameOrigin(url) {
    if (!url)
        return false;
    url = new URL(url, wLoc.toString());
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
        if (_cd && !_cd.isStopped()) {
            logger.warn('[OWebRouter] browseTo called while dispatching', _cd);
            _cd.stop();
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
        if (cd.id === this._dispatchId && !cd.context.isStopped()) {
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
            isStopped: () => !active,
            stop() {
                if (active) {
                    active = false;
                    logger.debug(`[OWebRouter][dispatcher-${id}] stopped!`, o);
                }
                else {
                    logger.error(`[OWebRouter][dispatcher-${id}] already stopped.`, o);
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
     * @param e the event object
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
        // continue to ensure that link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase())
            el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase())
            return;
        // we check if link is inside a svg
        // in this case, both href and target are always inside an object
        const svg = typeof el.href === 'object' &&
            el.href.constructor.name === 'SVGAnimatedString';
        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external')
            return;
        // ensure non-hash for the same path
        const linkHref = el.getAttribute('href');
        if (linkHref) {
            const linkUrl = new URL(linkHref);
            if (!this._hashMode &&
                samePath(linkUrl) &&
                (linkUrl.hash || '#' === linkHref))
                return;
            // we check for mailto: in the href
            if (linkHref.indexOf('mailto:') > -1)
                return;
            // we check for tel: in the href
            if (linkHref.indexOf('tel:') > -1)
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
            let targetHref = svg
                ? el.href.baseVal
                : el.href;
            // strip leading "/[drive letter]:" on NW.js on Windows
            // const hasProcess = typeof process !== 'undefined';
            // if (hasProcess && targetHref.match(/^\/[a-zA-Z]:\//)) {
            // 	targetHref = targetHref.replace(/^\/[a-zA-Z]:\//, '/');
            // }
            const orig = targetHref;
            if (targetHref.indexOf(this._baseUrl) === 0) {
                targetHref = targetHref.slice(this._baseUrl.length);
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMzRCxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQStCbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsU0FBUyxLQUFLLENBQUMsQ0FBTTtJQUNqQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM3QyxDQUFDLEVBQ0QsUUFBUSxHQUFHLFNBQVMsUUFBUSxDQUFDLEdBQWlCO0lBQzdDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixPQUFPLEdBQUcsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDckUsQ0FBQyxFQUNELFVBQVUsR0FBRyxTQUFTLFVBQVUsQ0FBQyxHQUFpQjtJQUNqRCxJQUFJLENBQUMsR0FBRztRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3ZCLEdB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QkFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNmLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEI7Z0JBRUQsT0FBTzthQUNQO1lBRUQsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxCLE1BQU0sQ0FBQyxLQUFLLENBQ1gsa0NBQWtDLEVBQ2xDLEVBQUUsRUFDRixJQUFJLEVBQ0osVUFBVSxFQUNWLFFBQVEsQ0FBQyxLQUFLLENBQ2QsQ0FBQztZQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7SUFDRixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2dnZXIsIHByZXZlbnREZWZhdWx0LCBzYWZlT3BlbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJSb3V0ZSwge1xuXHRPUm91dGVBY3Rpb24sXG5cdE9Sb3V0ZVBhdGgsXG5cdE9Sb3V0ZVBhdGhPcHRpb25zLFxufSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlQ29udGV4dCBmcm9tICcuL09XZWJSb3V0ZUNvbnRleHQnO1xuXG5leHBvcnQgdHlwZSBPUm91dGVUYXJnZXQgPSB7XG5cdHBhcnNlZDogc3RyaW5nO1xuXHRocmVmOiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcblx0ZnVsbFBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBPUm91dGVTdGF0ZUl0ZW0gPVxuXHR8IHN0cmluZ1xuXHR8IG51bWJlclxuXHR8IGJvb2xlYW5cblx0fCBudWxsXG5cdHwgdW5kZWZpbmVkXG5cdHwgRGF0ZVxuXHR8IE9Sb3V0ZVN0YXRlT2JqZWN0XG5cdHwgT1JvdXRlU3RhdGVJdGVtW107XG5leHBvcnQgdHlwZSBPUm91dGVTdGF0ZU9iamVjdCA9IHsgW2tleTogc3RyaW5nXTogT1JvdXRlU3RhdGVJdGVtIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgT1JvdXRlRGlzcGF0Y2hlciB7XG5cdHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cdHJlYWRvbmx5IGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQ7XG5cdHJlYWRvbmx5IGZvdW5kOiBPV2ViUm91dGVbXTtcblxuXHRpc1N0b3BwZWQoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdHN0b3AoKTogdGhpcztcbn1cblxuY29uc3Qgd0xvYyA9IHdpbmRvdy5sb2NhdGlvbixcblx0d0RvYyA9IHdpbmRvdy5kb2N1bWVudCxcblx0d0hpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeSxcblx0bGlua0NsaWNrRXZlbnQgPSB3RG9jLm9udG91Y2hzdGFydCA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljaycsXG5cdGhhc2hUYWdTdHIgPSAnIyEnO1xuXG5jb25zdCB3aGljaCA9IGZ1bmN0aW9uIHdoaWNoKGU6IGFueSk6IG51bWJlciB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdHJldHVybiBudWxsID09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG5cdH0sXG5cdHNhbWVQYXRoID0gZnVuY3Rpb24gc2FtZVBhdGgodXJsOiBVUkwgfCBzdHJpbmcpIHtcblx0XHR1cmwgPSBuZXcgVVJMKHVybCk7XG5cdFx0cmV0dXJuIHVybC5wYXRobmFtZSA9PT0gd0xvYy5wYXRobmFtZSAmJiB1cmwuc2VhcmNoID09PSB3TG9jLnNlYXJjaDtcblx0fSxcblx0c2FtZU9yaWdpbiA9IGZ1bmN0aW9uIHNhbWVPcmlnaW4odXJsOiBVUkwgfCBzdHJpbmcpIHtcblx0XHRpZiAoIXVybCkgcmV0dXJuIGZhbHNlO1xuXHRcdHVybCA9IG5ldyBVUkwodXJsLCB3TG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdHdMb2MucHJvdG9jb2wgPT09IHVybC5wcm90b2NvbCAmJlxuXHRcdFx0d0xvYy5ob3N0bmFtZSA9PT0gdXJsLmhvc3RuYW1lICYmXG5cdFx0XHR3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0KTtcblx0fSxcblx0bGVhZGluZ1NsYXNoID0gZnVuY3Rpb24gbGVhZGluZ1NsYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCFwYXRoLmxlbmd0aCB8fCBwYXRoID09PSAnLycpIHtcblx0XHRcdHJldHVybiAnLyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGhbMF0gIT09ICcvJyA/ICcvJyArIHBhdGggOiBwYXRoO1xuXHR9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGVyIHtcblx0cHJpdmF0ZSByZWFkb25seSBfYmFzZVVybDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9oYXNoTW9kZTogYm9vbGVhbjtcblx0cHJpdmF0ZSBfY3VycmVudFRhcmdldDogT1JvdXRlVGFyZ2V0ID0ge1xuXHRcdHBhcnNlZDogJycsXG5cdFx0aHJlZjogJycsXG5cdFx0cGF0aDogJycsXG5cdFx0ZnVsbFBhdGg6ICcnLFxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdHByaXZhdGUgX2xpc3RlbmluZyA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9ub3RGb3VuZDogdW5kZWZpbmVkIHwgKCh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZCkgPVxuXHRcdHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoSWQgPSAwO1xuXHRwcml2YXRlIF9ub3RGb3VuZExvb3BDb3VudCA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnREaXNwYXRjaGVyPzogT1JvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VSZXBsYWNlID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZXIgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBiYXNlVXJsIHRoZSBiYXNlIHVybFxuXHQgKiBAcGFyYW0gaGFzaE1vZGUgd2VhdGhlciB0byB1c2UgaGFzaCBtb2RlXG5cdCAqIEBwYXJhbSBub3RGb3VuZCBjYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG5vdCBmb3VuZFxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YmFzZVVybDogc3RyaW5nLFxuXHRcdGhhc2hNb2RlID0gdHJ1ZSxcblx0XHRub3RGb3VuZDogKHRhcmdldDogT1JvdXRlVGFyZ2V0KSA9PiB2b2lkXG5cdCkge1xuXHRcdGNvbnN0IHIgPSB0aGlzO1xuXHRcdHRoaXMuX2Jhc2VVcmwgPSBiYXNlVXJsO1xuXHRcdHRoaXMuX2hhc2hNb2RlID0gaGFzaE1vZGU7XG5cdFx0dGhpcy5fbm90Rm91bmQgPSBub3RGb3VuZDtcblx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyID0gKGU6IFBvcFN0YXRlRXZlbnQpID0+IHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHBvcHN0YXRlJywgZSk7XG5cblx0XHRcdGlmIChlLnN0YXRlKSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8oZS5zdGF0ZS51cmwsIGUuc3RhdGUuZGF0YSwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ci5icm93c2VUbyh3TG9jLmhyZWYsIHVuZGVmaW5lZCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciA9IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuXHRcdFx0ci5fb25DbGljayhlKTtcblx0XHR9O1xuXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSByZWFkeSEnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydHMgdGhlIHJvdXRlci5cblx0ICpcblx0ICogQHBhcmFtIGZpcnN0UnVuIGZpcnN0IHJ1biBmbGFnXG5cdCAqIEBwYXJhbSB0YXJnZXQgaW5pdGlhbCB0YXJnZXQsIHVzdWFseSB0aGUgZW50cnkgcG9pbnRcblx0ICogQHBhcmFtIHN0YXRlIGluaXRpYWwgc3RhdGVcblx0ICovXG5cdHN0YXJ0KFxuXHRcdGZpcnN0UnVuID0gdHJ1ZSxcblx0XHR0YXJnZXQ6IHN0cmluZyA9IHdMb2MuaHJlZixcblx0XHRzdGF0ZT86IE9Sb3V0ZVN0YXRlT2JqZWN0XG5cdCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdHRoaXMucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5pbmZvKCdbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyEnKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcycsIHRoaXMuX3JvdXRlcyk7XG5cdFx0XHRmaXJzdFJ1biAmJiB0aGlzLmJyb3dzZVRvKHRhcmdldCwgc3RhdGUsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSByb3V0ZXIgYWxyZWFkeSBzdGFydGVkIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3BzIHRoZSByb3V0ZXIuXG5cdCAqL1xuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogV2hlbiBjYWxsZWQgdGhlIGN1cnJlbnQgaGlzdG9yeSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBuZXh0IGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRmb3JjZU5leHRSZXBsYWNlKCk6IHRoaXMge1xuXHRcdHRoaXMuX2ZvcmNlUmVwbGFjZSA9IHRydWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSB0YXJnZXQuXG5cdCAqL1xuXHRnZXRDdXJyZW50VGFyZ2V0KCk6IE9Sb3V0ZVRhcmdldCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRUYXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBldmVudCBkaXNwYXRjaGVyLlxuXHQgKi9cblx0Z2V0Q3VycmVudERpc3BhdGNoZXIoKTogT1JvdXRlRGlzcGF0Y2hlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgY29udGV4dC5cblx0ICovXG5cdGdldFJvdXRlQ29udGV4dCgpOiBPV2ViUm91dGVDb250ZXh0IHtcblx0XHRpZiAoIXRoaXMuX2N1cnJlbnREaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBjb250ZXh0LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmwgdG8gcGFyc2Vcblx0ICovXG5cdHBhcnNlVVJMKHVybDogc3RyaW5nIHwgVVJMKTogT1JvdXRlVGFyZ2V0IHtcblx0XHRjb25zdCBiYXNlVXJsID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdGZ1bGxVcmwgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiYXNlVXJsKTtcblx0XHRsZXQgcGFyc2VkOiBPUm91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBmdWxsVXJsLmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCAnJyksXG5cdFx0XHRcdGZ1bGxQYXRoOiBmdWxsVXJsLmhhc2gsXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcGF0aG5hbWUgPSBmdWxsVXJsLnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYmFzZVVybC5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYmFzZVVybC5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQgPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IGZ1bGxVcmwuaHJlZixcblx0XHRcdFx0cGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChcblx0XHRcdFx0XHRwYXRobmFtZSArIGZ1bGxVcmwuc2VhcmNoICsgKGZ1bGxVcmwuaGFzaCB8fCAnJylcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCcsIHBhcnNlZCk7XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IE9Sb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IE9Sb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiBPUm91dGVBY3Rpb25cblx0KTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGEgcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0YWRkUm91dGUocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKHJvdXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHbyBiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGlzdGFuY2UgdGhlIGRpc3RhbmNlIGluIGhpc3Rvcnlcblx0ICovXG5cdGdvQmFjayhkaXN0YW5jZSA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBnb2luZyBiYWNrJywgZGlzdGFuY2UpO1xuXHRcdFx0Y29uc3QgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnJvd3NlIHRvIGEgc3BlY2lmaWMgbG9jYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgbmV4dCB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBpbml0aWFsIHN0YXRlXG5cdCAqIEBwYXJhbSBwdXNoIHNob3VsZCB3ZSBwdXNoIGludG8gdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlnbm9yZVNhbWVMb2NhdGlvbiAgaWdub3JlIGJyb3dzaW5nIGFnYWluIHRvIHNhbWUgbG9jYXRpb25cblx0ICovXG5cdGJyb3dzZVRvKFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCA9IHt9LFxuXHRcdHB1c2ggPSB0cnVlLFxuXHRcdGlnbm9yZVNhbWVMb2NhdGlvbiA9IGZhbHNlXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHR0YXJnZXQgPSB0aGlzLnBhcnNlVVJMKHRhcmdldFVybC5ocmVmKSxcblx0XHRcdF9jZCA9IHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHRcdGxldCBjZDogT1JvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGlmICghc2FtZU9yaWdpbih0YXJnZXQuaHJlZikpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBicm93c2luZyB0bycsIHRhcmdldC5wYXRoLCB7XG5cdFx0XHRzdGF0ZSxcblx0XHRcdHB1c2gsXG5cdFx0XHR0YXJnZXQsXG5cdFx0fSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRUYXJnZXQuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiAhX2NkLmlzU3RvcHBlZCgpKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZycsIF9jZCk7XG5cdFx0XHRfY2Quc3RvcCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG5cblx0XHRpZiAodGhpcy5fZm9yY2VSZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZVJlcGxhY2UgPSBmYWxzZTtcblx0XHRcdHRoaXMucmVwbGFjZUhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHVzaCAmJiB0aGlzLmFkZEhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50RGlzcGF0Y2hlciA9IGNkID0gdGhpcy5jcmVhdGVEaXNwYXRjaGVyKFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0c3RhdGUsXG5cdFx0XHQrK3RoaXMuX2Rpc3BhdGNoSWRcblx0XHQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgZm91bmQgZm9yIHBhdGgnLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRpZiAodGhpcy5fbm90Rm91bmQpIHtcblx0XHRcdFx0aWYgKCF0aGlzLl9ub3RGb3VuZExvb3BDb3VudCkge1xuXHRcdFx0XHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50Kys7XG5cdFx0XHRcdFx0dGhpcy5fbm90Rm91bmQodGFyZ2V0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHQnW09XZWJSb3V0ZXJdIFwibm90Rm91bmRcIiBoYW5kbGVyIGlzIHJlZGlyZWN0aW5nIHRvIGFub3RoZXIgbWlzc2luZyByb3V0ZS4gVGhpcyBtYXkgY2F1c2UgaW5maW5pdGUgbG9vcC4nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdbT1dlYlJvdXRlcl0gXCJub3RGb3VuZFwiIGhhbmRsZXIgaXMgbm90IGRlZmluZWQuJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50ID0gMDtcblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoSWQgJiYgIWNkLmNvbnRleHQuaXNTdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3VjY2VzcycsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgcmVwbGFjZWQnLCB3SGlzdG9yeS5zdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSByb3V0ZSBldmVudCBkaXNwYXRjaGVyXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgdGhlIHJvdXRlIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlkIHRoZSBkaXNwYXRjaGVyIGlkXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0dGFyZ2V0OiBPUm91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdGlkOiBudW1iZXJcblx0KTogT1JvdXRlRGlzcGF0Y2hlciB7XG5cdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0Zm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKTtcblx0XHRsZXQgYWN0aXZlID0gZmFsc2U7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByb3V0ZSA9IGN0eC5fcm91dGVzW2ldO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG86IE9Sb3V0ZURpc3BhdGNoZXIgPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNTdG9wcGVkOiAoKSA9PiAhYWN0aXZlLFxuXHRcdFx0c3RvcCgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0b3BwZWQhYCwgbyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmVycm9yKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gYWxyZWFkeSBzdG9wcGVkLmAsIG8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0YXJ0YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKGxpbmtDbGlja0V2ZW50LCB0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaW5rQ2xpY2tFdmVudCwgdGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBldmVudCBvYmplY3Rcblx0ICovXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0Y29uc3QgZXZlbnRQYXRoID1cblx0XHRcdChlIGFzIGFueSkucGF0aCB8fFxuXHRcdFx0KChlIGFzIGFueSkuY29tcG9zZWRQYXRoID8gKGUgYXMgYW55KS5jb21wb3NlZFBhdGgoKSA6IG51bGwpO1xuXG5cdFx0aWYgKGV2ZW50UGF0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudFBhdGgubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoW2ldLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgY29udGludWU7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLmhyZWYpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGVsID0gZXZlbnRQYXRoW2ldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29udGludWUgdG8gZW5zdXJlIHRoYXQgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIGVsID0gZWwucGFyZW50Tm9kZSBhcyBhbnk7XG5cdFx0aWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGlmIGxpbmsgaXMgaW5zaWRlIGEgc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRjb25zdCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJylcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGNvbnN0IGxpbmtIcmVmID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cdFx0aWYgKGxpbmtIcmVmKSB7XG5cdFx0XHRjb25zdCBsaW5rVXJsID0gbmV3IFVSTChsaW5rSHJlZik7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCF0aGlzLl9oYXNoTW9kZSAmJlxuXHRcdFx0XHRzYW1lUGF0aChsaW5rVXJsKSAmJlxuXHRcdFx0XHQobGlua1VybC5oYXNoIHx8ICcjJyA9PT0gbGlua0hyZWYpXG5cdFx0XHQpXG5cdFx0XHRcdHJldHVybjtcblxuXHRcdFx0Ly8gd2UgY2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRcdGlmIChsaW5rSHJlZi5pbmRleE9mKCdtYWlsdG86JykgPiAtMSkgcmV0dXJuO1xuXG5cdFx0XHQvLyB3ZSBjaGVjayBmb3IgdGVsOiBpbiB0aGUgaHJlZlxuXHRcdFx0aWYgKGxpbmtIcmVmLmluZGV4T2YoJ3RlbDonKSA+IC0xKSByZXR1cm47XG5cblx0XHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdFx0Ly8gc3ZnIHRhcmdldCBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdFx0Ly8geC1vcmlnaW5cblx0XHRcdC8vIG5vdGU6IHN2ZyBsaW5rcyB0aGF0IGFyZSBub3QgcmVsYXRpdmUgZG9uJ3QgY2FsbCBjbGljayBldmVudHMgKGFuZCBza2lwIHBhZ2UuanMpXG5cdFx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0XHQvLyByZWJ1aWxkIHBhdGhcblx0XHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0XHRsZXQgdGFyZ2V0SHJlZjogc3RyaW5nID0gc3ZnXG5cdFx0XHRcdD8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsXG5cdFx0XHRcdDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0XHQvLyBjb25zdCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdFx0Ly8gaWYgKGhhc1Byb2Nlc3MgJiYgdGFyZ2V0SHJlZi5tYXRjaCgvXlxcL1thLXpBLVpdOlxcLy8pKSB7XG5cdFx0XHQvLyBcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnJlcGxhY2UoL15cXC9bYS16QS1aXTpcXC8vLCAnLycpO1xuXHRcdFx0Ly8gfVxuXG5cdFx0XHRjb25zdCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdFx0aWYgKHRhcmdldEhyZWYuaW5kZXhPZih0aGlzLl9iYXNlVXJsKSA9PT0gMCkge1xuXHRcdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zbGljZSh0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSB7XG5cdFx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRcdHNhZmVPcGVuKG9yaWcpO1xuXHRcdFx0XHRcdHByZXZlbnREZWZhdWx0KGUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRwcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdFx0bG9nZ2VyLmRlYnVnKFxuXHRcdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSBsaW5rIGNsaWNrZWQnLFxuXHRcdFx0XHRlbCxcblx0XHRcdFx0b3JpZyxcblx0XHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdFx0d0hpc3Rvcnkuc3RhdGVcblx0XHRcdCk7XG5cblx0XHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdFx0fVxuXHR9XG59XG4iXX0=