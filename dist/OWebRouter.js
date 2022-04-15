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
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMzRCxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQStCbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsU0FBUyxLQUFLLENBQUMsQ0FBTTtJQUNqQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM3QyxDQUFDLEVBQ0QsUUFBUSxHQUFHLFNBQVMsUUFBUSxDQUFDLEdBQVE7SUFDcEMsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JFLENBQUMsRUFDRCxVQUFVLEdBQUcsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM1QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUs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QVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2dnZXIsIHByZXZlbnREZWZhdWx0LCBzYWZlT3BlbiB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IE9XZWJSb3V0ZSwge1xuXHRPUm91dGVBY3Rpb24sXG5cdE9Sb3V0ZVBhdGgsXG5cdE9Sb3V0ZVBhdGhPcHRpb25zLFxufSBmcm9tICcuL09XZWJSb3V0ZSc7XG5pbXBvcnQgT1dlYlJvdXRlQ29udGV4dCBmcm9tICcuL09XZWJSb3V0ZUNvbnRleHQnO1xuXG5leHBvcnQgdHlwZSBPUm91dGVUYXJnZXQgPSB7XG5cdHBhcnNlZDogc3RyaW5nO1xuXHRocmVmOiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcblx0ZnVsbFBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBPUm91dGVTdGF0ZUl0ZW0gPVxuXHR8IHN0cmluZ1xuXHR8IG51bWJlclxuXHR8IGJvb2xlYW5cblx0fCBudWxsXG5cdHwgdW5kZWZpbmVkXG5cdHwgRGF0ZVxuXHR8IE9Sb3V0ZVN0YXRlT2JqZWN0XG5cdHwgT1JvdXRlU3RhdGVJdGVtW107XG5leHBvcnQgdHlwZSBPUm91dGVTdGF0ZU9iamVjdCA9IHsgW2tleTogc3RyaW5nXTogT1JvdXRlU3RhdGVJdGVtIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgT1JvdXRlRGlzcGF0Y2hlciB7XG5cdHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cdHJlYWRvbmx5IGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQ7XG5cdHJlYWRvbmx5IGZvdW5kOiBPV2ViUm91dGVbXTtcblxuXHRpc0FjdGl2ZSgpOiBib29sZWFuO1xuXG5cdGRpc3BhdGNoKCk6IHRoaXM7XG5cblx0Y2FuY2VsKCk6IHRoaXM7XG59XG5cbmNvbnN0IHdMb2MgPSB3aW5kb3cubG9jYXRpb24sXG5cdHdEb2MgPSB3aW5kb3cuZG9jdW1lbnQsXG5cdHdIaXN0b3J5ID0gd2luZG93Lmhpc3RvcnksXG5cdGxpbmtDbGlja0V2ZW50ID0gd0RvYy5vbnRvdWNoc3RhcnQgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snLFxuXHRoYXNoVGFnU3RyID0gJyMhJztcblxuY29uc3Qgd2hpY2ggPSBmdW5jdGlvbiB3aGljaChlOiBhbnkpOiBudW1iZXIge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRyZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHR9LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uIHNhbWVQYXRoKHVybDogVVJMKSB7XG5cdFx0cmV0dXJuIHVybC5wYXRobmFtZSA9PT0gd0xvYy5wYXRobmFtZSAmJiB1cmwuc2VhcmNoID09PSB3TG9jLnNlYXJjaDtcblx0fSxcblx0c2FtZU9yaWdpbiA9IGZ1bmN0aW9uIHNhbWVPcmlnaW4oaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0d0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHR3TG9jLmhvc3RuYW1lID09PSB1cmwuaG9zdG5hbWUgJiZcblx0XHRcdHdMb2MucG9ydCA9PT0gdXJsLnBvcnRcblx0XHQpO1xuXHR9LFxuXHRsZWFkaW5nU2xhc2ggPSBmdW5jdGlvbiBsZWFkaW5nU2xhc2gocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50VGFyZ2V0OiBPUm91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX25vdEZvdW5kOiB1bmRlZmluZWQgfCAoKHRhcmdldDogT1JvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9XG5cdFx0dW5kZWZpbmVkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9wb3BTdGF0ZUxpc3RlbmVyOiAoZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSByZWFkb25seSBfbGlua0NsaWNrTGlzdGVuZXI6IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBfZGlzcGF0Y2hJZCA9IDA7XG5cdHByaXZhdGUgX25vdEZvdW5kTG9vcENvdW50ID0gMDtcblx0cHJpdmF0ZSBfY3VycmVudERpc3BhdGNoZXI/OiBPUm91dGVEaXNwYXRjaGVyO1xuXHRwcml2YXRlIF9mb3JjZVJlcGxhY2UgPSBmYWxzZTtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlciBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIGJhc2VVcmwgdGhlIGJhc2UgdXJsXG5cdCAqIEBwYXJhbSBoYXNoTW9kZSB3ZWF0aGVyIHRvIHVzZSBoYXNoIG1vZGVcblx0ICogQHBhcmFtIG5vdEZvdW5kIGNhbGxlZCB3aGVuIGEgcm91dGUgaXMgbm90IGZvdW5kXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRiYXNlVXJsOiBzdHJpbmcsXG5cdFx0aGFzaE1vZGUgPSB0cnVlLFxuXHRcdG5vdEZvdW5kOiAodGFyZ2V0OiBPUm91dGVUYXJnZXQpID0+IHZvaWRcblx0KSB7XG5cdFx0Y29uc3QgciA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgPSBoYXNoTW9kZTtcblx0XHR0aGlzLl9ub3RGb3VuZCA9IG5vdEZvdW5kO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcG9wc3RhdGUnLCBlKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRsb2dnZXIuaW5mbygnW09XZWJSb3V0ZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB0aGUgcm91dGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlyc3RSdW4gZmlyc3QgcnVuIGZsYWdcblx0ICogQHBhcmFtIHRhcmdldCBpbml0aWFsIHRhcmdldCwgdXN1YWx5IHRoZSBlbnRyeSBwb2ludFxuXHQgKiBAcGFyYW0gc3RhdGUgaW5pdGlhbCBzdGF0ZVxuXHQgKi9cblx0c3RhcnQoXG5cdFx0Zmlyc3RSdW4gPSB0cnVlLFxuXHRcdHRhcmdldDogc3RyaW5nID0gd0xvYy5ocmVmLFxuXHRcdHN0YXRlPzogT1JvdXRlU3RhdGVPYmplY3Rcblx0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIScpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gd2F0Y2hpbmcgcm91dGVzJywgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHJvdXRlciBhbHJlYWR5IHN0YXJ0ZWQhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcHMgdGhlIHJvdXRlci5cblx0ICovXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3RvcCByb3V0aW5nIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIGNhbGxlZCB0aGUgY3VycmVudCBoaXN0b3J5IHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIG5leHQgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdGZvcmNlTmV4dFJlcGxhY2UoKTogdGhpcyB7XG5cdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogT1JvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudFRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGV2ZW50IGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBPUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBjb250ZXh0LlxuXHQgKi9cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudERpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybCB0byBwYXJzZVxuXHQgKi9cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiBPUm91dGVUYXJnZXQge1xuXHRcdGNvbnN0IGJhc2VVcmwgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0ZnVsbFVybCA9IG5ldyBVUkwodXJsLnRvU3RyaW5nKCksIGJhc2VVcmwpO1xuXHRcdGxldCBwYXJzZWQ6IE9Sb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0cGFyc2VkID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiBmdWxsVXJsLmhyZWYsXG5cdFx0XHRcdHBhdGg6IGZ1bGxVcmwuaGFzaC5yZXBsYWNlKGhhc2hUYWdTdHIsICcnKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGZ1bGxVcmwuaGFzaCxcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBwYXRobmFtZSA9IGZ1bGxVcmwucGF0aG5hbWU7XG5cdFx0XHQvLyB3aGVuIHVzaW5nIHBhdGhuYW1lIG1ha2Ugc3VyZSB0byByZW1vdmVcblx0XHRcdC8vIGJhc2UgdXJpIHBhdGhuYW1lIGZvciBhcHAgaW4gc3ViZGlyZWN0b3J5XG5cdFx0XHRpZiAocGF0aG5hbWUuaW5kZXhPZihiYXNlVXJsLnBhdGhuYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRwYXRobmFtZSA9IHBhdGhuYW1lLnN1YnN0cihiYXNlVXJsLnBhdGhuYW1lLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKFxuXHRcdFx0XHRcdHBhdGhuYW1lICsgZnVsbFVybC5zZWFyY2ggKyAoZnVsbFVybC5oYXNoIHx8ICcnKVxuXHRcdFx0XHQpLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBwYXJzZWQgdXJsJywgcGFyc2VkKTtcblxuXHRcdHJldHVybiBwYXJzZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIHVybCB3aXRoIGEgZ2l2ZW4gcGF0aCBhbmQgYmFzZSB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBiYXNlIHRoZSBiYXNlIHVybFxuXHQgKi9cblx0cGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IFVSTCB7XG5cdFx0YmFzZSA9IGJhc2UgJiYgYmFzZS5sZW5ndGggPyBiYXNlIDogdGhpcy5fYmFzZVVybDtcblxuXHRcdGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QocGF0aCkpIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdHBhdGggPSB0aGlzLl9oYXNoTW9kZSA/IGhhc2hUYWdTdHIgKyBsZWFkaW5nU2xhc2gocGF0aCkgOiBwYXRoO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQXR0YWNoIGEgcm91dGUgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCB0byB3YXRjaFxuXHQgKiBAcGFyYW0gcnVsZXMgdGhlIHBhdGggcnVsZXNcblx0ICogQHBhcmFtIGFjdGlvbiB0aGUgYWN0aW9uIHRvIHJ1blxuXHQgKi9cblx0b24oXG5cdFx0cGF0aDogT1JvdXRlUGF0aCxcblx0XHRydWxlczogT1JvdXRlUGF0aE9wdGlvbnMgPSB7fSxcblx0XHRhY3Rpb246IE9Sb3V0ZUFjdGlvblxuXHQpOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChuZXcgT1dlYlJvdXRlKHBhdGgsIHJ1bGVzLCBhY3Rpb24pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYSByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRhZGRSb3V0ZShyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gocm91dGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdvIGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSBkaXN0YW5jZSB0aGUgZGlzdGFuY2UgaW4gaGlzdG9yeVxuXHQgKi9cblx0Z29CYWNrKGRpc3RhbmNlID0gMSk6IHRoaXMge1xuXHRcdGlmIChkaXN0YW5jZSA+IDApIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2snLCBkaXN0YW5jZSk7XG5cdFx0XHRjb25zdCBoTGVuID0gd0hpc3RvcnkubGVuZ3RoO1xuXHRcdFx0aWYgKGhMZW4gPiAxKSB7XG5cdFx0XHRcdGlmIChoTGVuID49IGRpc3RhbmNlKSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWRpc3RhbmNlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtaExlbik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGNvcmRvdmFcblx0XHRcdFx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgKHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHApIHtcblx0XHRcdFx0XHQod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcC5leGl0QXBwKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBCcm93c2UgdG8gYSBzcGVjaWZpYyBsb2NhdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSBuZXh0IHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGluaXRpYWwgc3RhdGVcblx0ICogQHBhcmFtIHB1c2ggc2hvdWxkIHdlIHB1c2ggaW50byB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWdub3JlU2FtZUxvY2F0aW9uICBpZ25vcmUgYnJvd3NpbmcgYWdhaW4gdG8gc2FtZSBsb2NhdGlvblxuXHQgKi9cblx0YnJvd3NlVG8oXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0ID0ge30sXG5cdFx0cHVzaCA9IHRydWUsXG5cdFx0aWdub3JlU2FtZUxvY2F0aW9uID0gZmFsc2Vcblx0KTogdGhpcyB7XG5cdFx0Y29uc3QgdGFyZ2V0VXJsID0gdGhpcy5wYXRoVG9VUkwodXJsKSxcblx0XHRcdHRhcmdldCA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0X2NkID0gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdFx0bGV0IGNkOiBPUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0aWYgKCFzYW1lT3JpZ2luKHRhcmdldC5ocmVmKSkge1xuXHRcdFx0d2luZG93Lm9wZW4odXJsKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGJyb3dzaW5nIHRvJywgdGFyZ2V0LnBhdGgsIHtcblx0XHRcdHN0YXRlLFxuXHRcdFx0cHVzaCxcblx0XHRcdHRhcmdldCxcblx0XHR9KTtcblxuXHRcdGlmIChpZ25vcmVTYW1lTG9jYXRpb24gJiYgdGhpcy5fY3VycmVudFRhcmdldC5ocmVmID09PSB0YXJnZXQuaHJlZikge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gaWdub3JlIHNhbWUgbG9jYXRpb24nLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoX2NkICYmIF9jZC5pc0FjdGl2ZSgpKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZycsIF9jZCk7XG5cdFx0XHRfY2QuY2FuY2VsKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudFRhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9mb3JjZVJlcGxhY2UpIHtcblx0XHRcdHRoaXMuX2ZvcmNlUmVwbGFjZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5yZXBsYWNlSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwdXNoICYmIHRoaXMuYWRkSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRzdGF0ZSxcblx0XHRcdCsrdGhpcy5fZGlzcGF0Y2hJZFxuXHRcdCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBmb3VuZCBmb3IgcGF0aCcsIHRhcmdldC5wYXRoKTtcblx0XHRcdGlmICh0aGlzLl9ub3RGb3VuZCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuX25vdEZvdW5kTG9vcENvdW50KSB7XG5cdFx0XHRcdFx0dGhpcy5fbm90Rm91bmRMb29wQ291bnQrKztcblx0XHRcdFx0XHR0aGlzLl9ub3RGb3VuZCh0YXJnZXQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdCdbT1dlYlJvdXRlcl0gXCJub3RGb3VuZFwiIGhhbmRsZXIgaXMgcmVkaXJlY3RpbmcgdG8gYW5vdGhlciBtaXNzaW5nIHJvdXRlLiBUaGlzIG1heSBjYXVzZSBpbmZpbml0ZSBsb29wLidcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBcIm5vdEZvdW5kXCIgaGFuZGxlciBpcyBub3QgZGVmaW5lZC4nKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbm90Rm91bmRMb29wQ291bnQgPSAwO1xuXG5cdFx0Y2QuZGlzcGF0Y2goKTtcblxuXHRcdGlmIChjZC5pZCA9PT0gdGhpcy5fZGlzcGF0Y2hJZCAmJiAhY2QuY29udGV4dC5zdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3VjY2VzcycsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgcmVwbGFjZWQnLCB3SGlzdG9yeS5zdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSByb3V0ZSBldmVudCBkaXNwYXRjaGVyXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgdGhlIHJvdXRlIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlkIHRoZSBkaXNwYXRjaGVyIGlkXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0dGFyZ2V0OiBPUm91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdGlkOiBudW1iZXJcblx0KTogT1JvdXRlRGlzcGF0Y2hlciB7XG5cdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0Zm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKTtcblx0XHRsZXQgYWN0aXZlID0gZmFsc2U7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByb3V0ZSA9IGN0eC5fcm91dGVzW2ldO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG86IE9Sb3V0ZURpc3BhdGNoZXIgPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbCgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQhYCwgbyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmVycm9yKFxuXHRcdFx0XHRcdFx0YFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIHdoZW4gaW5hY3RpdmUuYCxcblx0XHRcdFx0XHRcdG9cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0YXJ0YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKGxpbmtDbGlja0V2ZW50LCB0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaW5rQ2xpY2tFdmVudCwgdGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdGNvbnN0IGV2ZW50UGF0aCA9XG5cdFx0XHQoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdCgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLm5vZGVOYW1lKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGV2ZW50UGF0aFtpXS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSBlbC5wYXJlbnROb2RlIGFzIGFueTtcblx0XHRpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRjb25zdCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJylcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGNvbnN0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRjb25zdCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHtcblx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRzYWZlT3BlbihvcmlnKTtcblx0XHRcdFx0cHJldmVudERlZmF1bHQoZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdCdbT1dlYlJvdXRlcl1bY2xpY2tdIGxpbmsgY2xpY2tlZCcsXG5cdFx0XHRlbCxcblx0XHRcdG9yaWcsXG5cdFx0XHR0YXJnZXRIcmVmLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGVcblx0XHQpO1xuXHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdH1cbn1cbiJdfQ==