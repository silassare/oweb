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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUMzRCxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQStCbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsU0FBUyxLQUFLLENBQUMsQ0FBTTtJQUNqQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDdEIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM3QyxDQUFDLEVBQ0QsUUFBUSxHQUFHLFNBQVMsUUFBUSxDQUFDLEdBQVE7SUFDcEMsT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3JFLENBQUMsRUFDRCxVQUFVLEdBQUcsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM1QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUs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LENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxvZ2dlciwgcHJldmVudERlZmF1bHQsIHNhZmVPcGVuIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlLCB7XG5cdE9Sb3V0ZUFjdGlvbixcblx0T1JvdXRlUGF0aCxcblx0T1JvdXRlUGF0aE9wdGlvbnMsXG59IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCB0eXBlIE9Sb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVN0YXRlSXRlbSA9XG5cdHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgT1JvdXRlU3RhdGVPYmplY3Rcblx0fCBPUm91dGVTdGF0ZUl0ZW1bXTtcbmV4cG9ydCB0eXBlIE9Sb3V0ZVN0YXRlT2JqZWN0ID0geyBba2V5OiBzdHJpbmddOiBPUm91dGVTdGF0ZUl0ZW0gfTtcblxuZXhwb3J0IGludGVyZmFjZSBPUm91dGVEaXNwYXRjaGVyIHtcblx0cmVhZG9ubHkgaWQ6IG51bWJlcjtcblx0cmVhZG9ubHkgY29udGV4dDogT1dlYlJvdXRlQ29udGV4dDtcblx0cmVhZG9ubHkgZm91bmQ6IE9XZWJSb3V0ZVtdO1xuXG5cdGlzU3RvcHBlZCgpOiBib29sZWFuO1xuXG5cdGRpc3BhdGNoKCk6IHRoaXM7XG5cblx0c3RvcCgpOiB0aGlzO1xufVxuXG5jb25zdCB3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24gd2hpY2goZTogYW55KTogbnVtYmVyIHtcblx0XHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0cmV0dXJuIG51bGwgPT0gZS53aGljaCA/IGUuYnV0dG9uIDogZS53aGljaDtcblx0fSxcblx0c2FtZVBhdGggPSBmdW5jdGlvbiBzYW1lUGF0aCh1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdH0sXG5cdHNhbWVPcmlnaW4gPSBmdW5jdGlvbiBzYW1lT3JpZ2luKGhyZWY6IHN0cmluZykge1xuXHRcdGlmICghaHJlZikgcmV0dXJuIGZhbHNlO1xuXHRcdGNvbnN0IHVybCA9IG5ldyBVUkwoaHJlZi50b1N0cmluZygpLCB3TG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdHdMb2MucHJvdG9jb2wgPT09IHVybC5wcm90b2NvbCAmJlxuXHRcdFx0d0xvYy5ob3N0bmFtZSA9PT0gdXJsLmhvc3RuYW1lICYmXG5cdFx0XHR3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0KTtcblx0fSxcblx0bGVhZGluZ1NsYXNoID0gZnVuY3Rpb24gbGVhZGluZ1NsYXNoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCFwYXRoLmxlbmd0aCB8fCBwYXRoID09PSAnLycpIHtcblx0XHRcdHJldHVybiAnLyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGhbMF0gIT09ICcvJyA/ICcvJyArIHBhdGggOiBwYXRoO1xuXHR9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGVyIHtcblx0cHJpdmF0ZSByZWFkb25seSBfYmFzZVVybDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9oYXNoTW9kZTogYm9vbGVhbjtcblx0cHJpdmF0ZSBfY3VycmVudFRhcmdldDogT1JvdXRlVGFyZ2V0ID0ge1xuXHRcdHBhcnNlZDogJycsXG5cdFx0aHJlZjogJycsXG5cdFx0cGF0aDogJycsXG5cdFx0ZnVsbFBhdGg6ICcnLFxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdHByaXZhdGUgX2xpc3RlbmluZyA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9ub3RGb3VuZDogdW5kZWZpbmVkIHwgKCh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZCkgPVxuXHRcdHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoSWQgPSAwO1xuXHRwcml2YXRlIF9ub3RGb3VuZExvb3BDb3VudCA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnREaXNwYXRjaGVyPzogT1JvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VSZXBsYWNlID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZXIgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBiYXNlVXJsIHRoZSBiYXNlIHVybFxuXHQgKiBAcGFyYW0gaGFzaE1vZGUgd2VhdGhlciB0byB1c2UgaGFzaCBtb2RlXG5cdCAqIEBwYXJhbSBub3RGb3VuZCBjYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG5vdCBmb3VuZFxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YmFzZVVybDogc3RyaW5nLFxuXHRcdGhhc2hNb2RlID0gdHJ1ZSxcblx0XHRub3RGb3VuZDogKHRhcmdldDogT1JvdXRlVGFyZ2V0KSA9PiB2b2lkXG5cdCkge1xuXHRcdGNvbnN0IHIgPSB0aGlzO1xuXHRcdHRoaXMuX2Jhc2VVcmwgPSBiYXNlVXJsO1xuXHRcdHRoaXMuX2hhc2hNb2RlID0gaGFzaE1vZGU7XG5cdFx0dGhpcy5fbm90Rm91bmQgPSBub3RGb3VuZDtcblx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyID0gKGU6IFBvcFN0YXRlRXZlbnQpID0+IHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHBvcHN0YXRlJywgZSk7XG5cblx0XHRcdGlmIChlLnN0YXRlKSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8oZS5zdGF0ZS51cmwsIGUuc3RhdGUuZGF0YSwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ci5icm93c2VUbyh3TG9jLmhyZWYsIHVuZGVmaW5lZCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciA9IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuXHRcdFx0ci5fb25DbGljayhlKTtcblx0XHR9O1xuXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSByZWFkeSEnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydHMgdGhlIHJvdXRlci5cblx0ICpcblx0ICogQHBhcmFtIGZpcnN0UnVuIGZpcnN0IHJ1biBmbGFnXG5cdCAqIEBwYXJhbSB0YXJnZXQgaW5pdGlhbCB0YXJnZXQsIHVzdWFseSB0aGUgZW50cnkgcG9pbnRcblx0ICogQHBhcmFtIHN0YXRlIGluaXRpYWwgc3RhdGVcblx0ICovXG5cdHN0YXJ0KFxuXHRcdGZpcnN0UnVuID0gdHJ1ZSxcblx0XHR0YXJnZXQ6IHN0cmluZyA9IHdMb2MuaHJlZixcblx0XHRzdGF0ZT86IE9Sb3V0ZVN0YXRlT2JqZWN0XG5cdCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdHRoaXMucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5pbmZvKCdbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyEnKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcycsIHRoaXMuX3JvdXRlcyk7XG5cdFx0XHRmaXJzdFJ1biAmJiB0aGlzLmJyb3dzZVRvKHRhcmdldCwgc3RhdGUsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSByb3V0ZXIgYWxyZWFkeSBzdGFydGVkIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3BzIHRoZSByb3V0ZXIuXG5cdCAqL1xuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogV2hlbiBjYWxsZWQgdGhlIGN1cnJlbnQgaGlzdG9yeSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBuZXh0IGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRmb3JjZU5leHRSZXBsYWNlKCk6IHRoaXMge1xuXHRcdHRoaXMuX2ZvcmNlUmVwbGFjZSA9IHRydWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSB0YXJnZXQuXG5cdCAqL1xuXHRnZXRDdXJyZW50VGFyZ2V0KCk6IE9Sb3V0ZVRhcmdldCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRUYXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBldmVudCBkaXNwYXRjaGVyLlxuXHQgKi9cblx0Z2V0Q3VycmVudERpc3BhdGNoZXIoKTogT1JvdXRlRGlzcGF0Y2hlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgY29udGV4dC5cblx0ICovXG5cdGdldFJvdXRlQ29udGV4dCgpOiBPV2ViUm91dGVDb250ZXh0IHtcblx0XHRpZiAoIXRoaXMuX2N1cnJlbnREaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBjb250ZXh0LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmwgdG8gcGFyc2Vcblx0ICovXG5cdHBhcnNlVVJMKHVybDogc3RyaW5nIHwgVVJMKTogT1JvdXRlVGFyZ2V0IHtcblx0XHRjb25zdCBiYXNlVXJsID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdGZ1bGxVcmwgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiYXNlVXJsKTtcblx0XHRsZXQgcGFyc2VkOiBPUm91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBmdWxsVXJsLmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCAnJyksXG5cdFx0XHRcdGZ1bGxQYXRoOiBmdWxsVXJsLmhhc2gsXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcGF0aG5hbWUgPSBmdWxsVXJsLnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYmFzZVVybC5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYmFzZVVybC5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRwYXJzZWQgPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IGZ1bGxVcmwuaHJlZixcblx0XHRcdFx0cGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChcblx0XHRcdFx0XHRwYXRobmFtZSArIGZ1bGxVcmwuc2VhcmNoICsgKGZ1bGxVcmwuaGFzaCB8fCAnJylcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCcsIHBhcnNlZCk7XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IE9Sb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IE9Sb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiBPUm91dGVBY3Rpb25cblx0KTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGEgcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0YWRkUm91dGUocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKHJvdXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHbyBiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGlzdGFuY2UgdGhlIGRpc3RhbmNlIGluIGhpc3Rvcnlcblx0ICovXG5cdGdvQmFjayhkaXN0YW5jZSA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBnb2luZyBiYWNrJywgZGlzdGFuY2UpO1xuXHRcdFx0Y29uc3QgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnJvd3NlIHRvIGEgc3BlY2lmaWMgbG9jYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgbmV4dCB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBpbml0aWFsIHN0YXRlXG5cdCAqIEBwYXJhbSBwdXNoIHNob3VsZCB3ZSBwdXNoIGludG8gdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlnbm9yZVNhbWVMb2NhdGlvbiAgaWdub3JlIGJyb3dzaW5nIGFnYWluIHRvIHNhbWUgbG9jYXRpb25cblx0ICovXG5cdGJyb3dzZVRvKFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCA9IHt9LFxuXHRcdHB1c2ggPSB0cnVlLFxuXHRcdGlnbm9yZVNhbWVMb2NhdGlvbiA9IGZhbHNlXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHR0YXJnZXQgPSB0aGlzLnBhcnNlVVJMKHRhcmdldFVybC5ocmVmKSxcblx0XHRcdF9jZCA9IHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyO1xuXHRcdGxldCBjZDogT1JvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGlmICghc2FtZU9yaWdpbih0YXJnZXQuaHJlZikpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBicm93c2luZyB0bycsIHRhcmdldC5wYXRoLCB7XG5cdFx0XHRzdGF0ZSxcblx0XHRcdHB1c2gsXG5cdFx0XHR0YXJnZXQsXG5cdFx0fSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRUYXJnZXQuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiAhX2NkLmlzU3RvcHBlZCgpKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZycsIF9jZCk7XG5cdFx0XHRfY2Quc3RvcCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG5cblx0XHRpZiAodGhpcy5fZm9yY2VSZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZVJlcGxhY2UgPSBmYWxzZTtcblx0XHRcdHRoaXMucmVwbGFjZUhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHVzaCAmJiB0aGlzLmFkZEhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50RGlzcGF0Y2hlciA9IGNkID0gdGhpcy5jcmVhdGVEaXNwYXRjaGVyKFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0c3RhdGUsXG5cdFx0XHQrK3RoaXMuX2Rpc3BhdGNoSWRcblx0XHQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgZm91bmQgZm9yIHBhdGgnLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRpZiAodGhpcy5fbm90Rm91bmQpIHtcblx0XHRcdFx0aWYgKCF0aGlzLl9ub3RGb3VuZExvb3BDb3VudCkge1xuXHRcdFx0XHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50Kys7XG5cdFx0XHRcdFx0dGhpcy5fbm90Rm91bmQodGFyZ2V0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHQnW09XZWJSb3V0ZXJdIFwibm90Rm91bmRcIiBoYW5kbGVyIGlzIHJlZGlyZWN0aW5nIHRvIGFub3RoZXIgbWlzc2luZyByb3V0ZS4gVGhpcyBtYXkgY2F1c2UgaW5maW5pdGUgbG9vcC4nXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdbT1dlYlJvdXRlcl0gXCJub3RGb3VuZFwiIGhhbmRsZXIgaXMgbm90IGRlZmluZWQuJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50ID0gMDtcblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoSWQgJiYgIWNkLmNvbnRleHQuaXNTdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3VjY2VzcycsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCwgdGl0bGUgPSAnJyk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgcmVwbGFjZWQnLCB3SGlzdG9yeS5zdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSByb3V0ZSBldmVudCBkaXNwYXRjaGVyXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgdGhlIHJvdXRlIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlkIHRoZSBkaXNwYXRjaGVyIGlkXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0dGFyZ2V0OiBPUm91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdGlkOiBudW1iZXJcblx0KTogT1JvdXRlRGlzcGF0Y2hlciB7XG5cdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRjb25zdCBjdHggPSB0aGlzLFxuXHRcdFx0Zm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKTtcblx0XHRsZXQgYWN0aXZlID0gZmFsc2U7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByb3V0ZSA9IGN0eC5fcm91dGVzW2ldO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG86IE9Sb3V0ZURpc3BhdGNoZXIgPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNTdG9wcGVkOiAoKSA9PiAhYWN0aXZlLFxuXHRcdFx0c3RvcCgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0b3BwZWQhYCwgbyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmVycm9yKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gYWxyZWFkeSBzdG9wcGVkLmAsIG8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1ZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0YXJ0YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKGxpbmtDbGlja0V2ZW50LCB0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaW5rQ2xpY2tFdmVudCwgdGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdGNvbnN0IGV2ZW50UGF0aCA9XG5cdFx0XHQoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdCgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLm5vZGVOYW1lKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGV2ZW50UGF0aFtpXS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSBlbC5wYXJlbnROb2RlIGFzIGFueTtcblx0XHRpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRjb25zdCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJylcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGNvbnN0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRjb25zdCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHtcblx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRzYWZlT3BlbihvcmlnKTtcblx0XHRcdFx0cHJldmVudERlZmF1bHQoZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdCdbT1dlYlJvdXRlcl1bY2xpY2tdIGxpbmsgY2xpY2tlZCcsXG5cdFx0XHRlbCxcblx0XHRcdG9yaWcsXG5cdFx0XHR0YXJnZXRIcmVmLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGVcblx0XHQpO1xuXHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdH1cbn1cbiJdfQ==