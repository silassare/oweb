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
        this._notFoundLoopCount = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqRSxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQStCbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDM0IsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFNO0lBQzVCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBVSxHQUFRO0lBQzVCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNyRSxDQUFDLEVBQ0QsVUFBVSxHQUFHLFVBQVUsSUFBWTtJQUNsQyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUV0RCxPQUFPLENBQ04sSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHLENBQUMsUUFBUTtRQUM5QixJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxRQUFRO1FBQzlCLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FDdEIsQ0FBQztBQUNILENBQUMsRUFDRCxZQUFZLEdBQUcsQ0FBQyxJQUFZLEVBQVUsRUFBRTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO1FBQ2pDLE9BQU8sR0FBRyxDQUFDO0tBQ1g7SUFFRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM1QyxDQUFDLENBQUM7QUFFSCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFzQjlCOzs7Ozs7T0FNRztJQUNILFlBQ0MsT0FBZSxFQUNmLFdBQW9CLElBQUksRUFDeEIsUUFBd0M7UUE3QmpDLG1CQUFjLEdBQWlCO1lBQ3RDLE1BQU0sRUFBRSxFQUFFO1lBQ1YsSUFBSSxFQUFFLEVBQUU7WUFDUixJQUFJLEVBQUUsRUFBRTtZQUNSLFFBQVEsRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNNLFlBQU8sR0FBZ0IsRUFBRSxDQUFDO1FBQzFCLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBQzlCLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFDbkIsY0FBUyxHQUVZLFNBQVMsQ0FBQztRQUd4QyxnQkFBVyxHQUFHLENBQUMsQ0FBQztRQUNoQix1QkFBa0IsR0FBRyxDQUFDLENBQUM7UUFFdkIsa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFjdEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBZ0IsRUFBRSxFQUFFO1lBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO2dCQUNaLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ04sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUN4QztRQUNGLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQTBCLEVBQUUsRUFBRTtZQUN4RCxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDO1FBRUYsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQ0osV0FBb0IsSUFBSSxFQUN4QixTQUFpQixJQUFJLENBQUMsSUFBSSxFQUMxQixLQUF5QjtRQUV6QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNELFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUNwRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVztRQUNWLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTixNQUFNLENBQUMsSUFBSSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQjtRQUNmLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzFCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2YsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7T0FFRztJQUNILG9CQUFvQjtRQUNuQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxlQUFlO1FBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDbEQ7UUFFRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsR0FBaUI7UUFDekIsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNyQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLElBQUksTUFBb0IsQ0FBQztRQUV6QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsTUFBTSxHQUFHO2dCQUNSLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFO2dCQUN0QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7Z0JBQ2xCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO2dCQUMxQyxRQUFRLEVBQUUsT0FBTyxDQUFDLElBQUk7YUFDdEIsQ0FBQztTQUNGO2FBQU07WUFDTixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ2hDLDBDQUEwQztZQUMxQyw0Q0FBNEM7WUFDNUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEQ7WUFFRCxNQUFNLEdBQUc7Z0JBQ1IsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RCLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSTtnQkFDbEIsSUFBSSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUM7Z0JBQzVCLFFBQVEsRUFBRSxZQUFZLENBQ3JCLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FDaEQ7YUFDRCxDQUFDO1NBQ0Y7UUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRWhELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLElBQVksRUFBRSxJQUFhO1FBQ3BDLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRWxELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQjtRQUVELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCO1FBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUUvRCxPQUFPLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsRUFBRSxDQUNELElBQWdCLEVBQ2hCLFFBQTJCLEVBQUUsRUFDN0IsTUFBb0I7UUFFcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsV0FBbUIsQ0FBQztRQUMxQixJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7WUFDakIsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNsRCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDYixJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7b0JBQ3JCLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDdkI7cUJBQU07b0JBQ04sUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNuQjthQUNEO2lCQUFNO2dCQUNOLFVBQVU7Z0JBQ1YsSUFBSSxNQUFNLENBQUMsU0FBUyxJQUFLLE1BQU0sQ0FBQyxTQUFpQixDQUFDLEdBQUcsRUFBRTtvQkFDckQsTUFBTSxDQUFDLFNBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUN4QztxQkFBTTtvQkFDTixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ2Y7YUFDRDtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFFBQVEsQ0FDUCxHQUFXLEVBQ1gsUUFBMkIsRUFBRSxFQUM3QixPQUFnQixJQUFJLEVBQ3BCLHFCQUE4QixLQUFLO1FBRW5DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQ3BDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDdEMsR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUMvQixJQUFJLEVBQW9CLENBQUM7UUFFekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ3JELEtBQUs7WUFDTCxJQUFJO1lBQ0osTUFBTTtTQUNOLENBQUMsQ0FBQztRQUVILElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRTtZQUNuRSxNQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTixJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQ25ELE1BQU0sRUFDTixLQUFLLEVBQ0wsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUNsQixDQUFDO1FBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNOLE1BQU0sSUFBSSxLQUFLLENBQ2Qsd0dBQXdHLENBQ3hHLENBQUM7aUJBQ0Y7YUFDRDtpQkFBTTtnQkFDTixNQUFNLElBQUksS0FBSyxDQUNkLGlEQUFpRCxDQUNqRCxDQUFDO2FBQ0Y7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUU1QixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFZCxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDeEQsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFVBQVUsQ0FDVCxHQUFXLEVBQ1gsS0FBd0IsRUFDeEIsUUFBZ0IsRUFBRTtRQUVsQixLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVuRCxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFckQsTUFBTSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFaEUsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsY0FBYyxDQUNiLEdBQVcsRUFDWCxLQUF3QixFQUN4QixRQUFnQixFQUFFO1FBRWxCLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRW5ELFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV4RCxNQUFNLENBQUMsS0FBSyxDQUNYLHdDQUF3QyxFQUN4QyxRQUFRLENBQUMsS0FBSyxFQUNkLEdBQUcsQ0FDSCxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssZ0JBQWdCLENBQ3ZCLE1BQW9CLEVBQ3BCLEtBQXdCLEVBQ3hCLEVBQVU7UUFFVixNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXpELE1BQU0sR0FBRyxHQUFHLElBQUksRUFDZixLQUFLLEdBQWdCLEVBQUUsRUFDdkIsWUFBWSxHQUFHLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxJQUFJLE1BQU0sR0FBRyxLQUFLLEVBQ2pCLENBQW1CLENBQUM7UUFFckIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQjtTQUNEO1FBRUQsQ0FBQyxHQUFHO1lBQ0gsT0FBTyxFQUFFLFlBQVk7WUFDckIsRUFBRTtZQUNGLEtBQUs7WUFDTCxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTTtZQUN0QixNQUFNO2dCQUNMLElBQUksTUFBTSxFQUFFO29CQUNYLE1BQU0sR0FBRyxLQUFLLENBQUM7b0JBQ2YsTUFBTSxDQUFDLEtBQUssQ0FDWCwyQkFBMkIsRUFBRSxrQkFBa0IsRUFDL0MsQ0FBQyxDQUNELENBQUM7aUJBQ0Y7cUJBQU07b0JBQ04sTUFBTSxDQUFDLEtBQUssQ0FDWCwyQkFBMkIsRUFBRSxnQ0FBZ0MsRUFDN0QsQ0FBQyxDQUNELENBQUM7aUJBQ0Y7Z0JBQ0QsT0FBTyxDQUFDLENBQUM7WUFDVixDQUFDO1lBQ0QsUUFBUTtnQkFDUCxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUV4RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDWCxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUVkLE9BQU8sTUFBTSxJQUFJLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUU7d0JBQ3BDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3BDO29CQUVELE1BQU0sR0FBRyxLQUFLLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ04sTUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQzFEO2dCQUVELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztTQUNELENBQUM7UUFFRixPQUFPLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFRDs7T0FFRztJQUNLLFFBQVE7UUFDZixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsZ0JBQWdCLENBQ3BCLGNBQWMsRUFDZCxJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLEtBQUssQ0FDTCxDQUFDO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7T0FFRztJQUNLLFVBQVU7UUFDakIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FDekIsVUFBVSxFQUNWLElBQUksQ0FBQyxpQkFBaUIsRUFDdEIsS0FBSyxDQUNMLENBQUM7WUFDRixJQUFJLENBQUMsbUJBQW1CLENBQ3ZCLGNBQWMsRUFDZCxJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLEtBQUssQ0FDTCxDQUFDO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxRQUFRLENBQUMsQ0FBMEI7UUFDMUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU87UUFFM0IsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLFFBQVE7WUFBRSxPQUFPO1FBQ2pELElBQUksQ0FBQyxDQUFDLGdCQUFnQjtZQUFFLE9BQU87UUFFL0IsY0FBYztRQUNkLHNHQUFzRztRQUN0RyxJQUFJLEVBQUUsR0FBdUIsQ0FBQyxDQUFDLE1BQXFCLENBQUM7UUFDckQsTUFBTSxTQUFTLEdBQ2IsQ0FBUyxDQUFDLElBQUk7WUFDZixDQUFFLENBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFFLENBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUQsSUFBSSxTQUFTLEVBQUU7WUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRO29CQUFFLFNBQVM7Z0JBQ3JDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxHQUFHO29CQUFFLFNBQVM7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFBRSxTQUFTO2dCQUVqQyxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQixNQUFNO2FBQ047U0FDRDtRQUNELHVCQUF1QjtRQUN2QixtREFBbUQ7UUFDbkQsT0FBTyxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFO1lBQzdDLEVBQUUsR0FBRyxFQUFFLENBQUMsVUFBaUIsQ0FBQztRQUMzQixJQUFJLENBQUMsRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUFFLE9BQU87UUFFckQsb0NBQW9DO1FBQ3BDLGlFQUFpRTtRQUNqRSxNQUFNLEdBQUcsR0FDUixPQUFRLEVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUTtZQUNuQyxFQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLENBQUM7UUFFM0Qsb0JBQW9CO1FBQ3BCLDBCQUEwQjtRQUMxQiw4QkFBOEI7UUFDOUIsSUFDQyxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUMzQixFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLFVBQVU7WUFFckMsT0FBTztRQUVSLG9DQUFvQztRQUNwQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQ0MsQ0FBQyxJQUFJLENBQUMsU0FBUztZQUNmLFFBQVEsQ0FBQyxFQUFTLENBQUM7WUFDbkIsQ0FBRSxFQUFVLENBQUMsSUFBSSxJQUFJLEdBQUcsS0FBSyxJQUFJLENBQUM7WUFFbEMsT0FBTztRQUVSLG1DQUFtQztRQUNuQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUFFLE9BQU87UUFFakQsa0JBQWtCO1FBQ2xCLHdFQUF3RTtRQUN4RSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxNQUFNO1lBQUUsT0FBTztRQUVsRSxXQUFXO1FBQ1gsbUZBQW1GO1FBQ25GLHdGQUF3RjtRQUN4RixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBRWxELGVBQWU7UUFDZiw2RUFBNkU7UUFDN0UsNEVBQTRFO1FBQzVFLElBQUksVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7UUFFbkUsdURBQXVEO1FBQ3ZEOzs7OztXQUtHO1FBRUgsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBRXhCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDeEIsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDM0MsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNmLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtZQUVELE9BQU87U0FDUDtRQUVELGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQixNQUFNLENBQUMsS0FBSyxDQUNYLGtDQUFrQyxFQUNsQyxFQUFFLEVBQ0YsSUFBSSxFQUNKLFVBQVUsRUFDVixRQUFRLENBQUMsS0FBSyxDQUNkLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHByZXZlbnREZWZhdWx0LCBzYWZlT3BlbiwgbG9nZ2VyIH0gZnJvbSAnLi91dGlscy9VdGlscyc7XG5pbXBvcnQgT1dlYlJvdXRlLCB7XG5cdHRSb3V0ZVBhdGgsXG5cdHRSb3V0ZVBhdGhPcHRpb25zLFxuXHR0Um91dGVBY3Rpb24sXG59IGZyb20gJy4vT1dlYlJvdXRlJztcbmltcG9ydCBPV2ViUm91dGVDb250ZXh0IGZyb20gJy4vT1dlYlJvdXRlQ29udGV4dCc7XG5cbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcbnR5cGUgX3RSb3V0ZVN0YXRlSXRlbSA9XG5cdHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgX3RSb3V0ZVN0YXRlSXRlbVtdO1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVPYmplY3QgPSB7IFtrZXk6IHN0cmluZ106IHRSb3V0ZVN0YXRlSXRlbSB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIElSb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0O1xuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW107XG5cblx0aXNBY3RpdmUoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdGNhbmNlbCgpOiB0aGlzO1xufVxuXG5jb25zdCB3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24gKGU6IGFueSkge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRyZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHR9LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdH0sXG5cdHNhbWVPcmlnaW4gPSBmdW5jdGlvbiAoaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0d0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHR3TG9jLmhvc3RuYW1lID09PSB1cmwuaG9zdG5hbWUgJiZcblx0XHRcdHdMb2MucG9ydCA9PT0gdXJsLnBvcnRcblx0XHQpO1xuXHR9LFxuXHRsZWFkaW5nU2xhc2ggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0XHRpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50VGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX25vdEZvdW5kOlxuXHRcdHwgdW5kZWZpbmVkXG5cdFx0fCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoSWQgPSAwO1xuXHRwcml2YXRlIF9ub3RGb3VuZExvb3BDb3VudCA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnREaXNwYXRjaGVyPzogSVJvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VSZXBsYWNlOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZXIgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBiYXNlVXJsIHRoZSBiYXNlIHVybFxuXHQgKiBAcGFyYW0gaGFzaE1vZGUgd2VhdGhlciB0byB1c2UgaGFzaCBtb2RlXG5cdCAqIEBwYXJhbSBub3RGb3VuZCBjYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG5vdCBmb3VuZFxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YmFzZVVybDogc3RyaW5nLFxuXHRcdGhhc2hNb2RlOiBib29sZWFuID0gdHJ1ZSxcblx0XHRub3RGb3VuZDogKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkLFxuXHQpIHtcblx0XHRjb25zdCByID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX25vdEZvdW5kID0gbm90Rm91bmQ7XG5cdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lciA9IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBwb3BzdGF0ZScsIGUpO1xuXG5cdFx0XHRpZiAoZS5zdGF0ZSkge1xuXHRcdFx0XHRyLmJyb3dzZVRvKGUuc3RhdGUudXJsLCBlLnN0YXRlLmRhdGEsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8od0xvYy5ocmVmLCB1bmRlZmluZWQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcblx0XHRcdHIuX29uQ2xpY2soZSk7XG5cdFx0fTtcblxuXHRcdGxvZ2dlci5pbmZvKCdbT1dlYlJvdXRlcl0gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogU3RhcnRzIHRoZSByb3V0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaXJzdFJ1biBmaXJzdCBydW4gZmxhZ1xuXHQgKiBAcGFyYW0gdGFyZ2V0IGluaXRpYWwgdGFyZ2V0LCB1c3VhbHkgdGhlIGVudHJ5IHBvaW50XG5cdCAqIEBwYXJhbSBzdGF0ZSBpbml0aWFsIHN0YXRlXG5cdCAqL1xuXHRzdGFydChcblx0XHRmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsXG5cdFx0dGFyZ2V0OiBzdHJpbmcgPSB3TG9jLmhyZWYsXG5cdFx0c3RhdGU/OiB0Um91dGVTdGF0ZU9iamVjdCxcblx0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIScpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gd2F0Y2hpbmcgcm91dGVzJywgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHJvdXRlciBhbHJlYWR5IHN0YXJ0ZWQhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcHMgdGhlIHJvdXRlci5cblx0ICovXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3RvcCByb3V0aW5nIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIGNhbGxlZCB0aGUgY3VycmVudCBoaXN0b3J5IHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIG5leHQgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdGZvcmNlTmV4dFJlcGxhY2UoKTogdGhpcyB7XG5cdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudFRhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGV2ZW50IGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBJUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBjb250ZXh0LlxuXHQgKi9cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudERpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybCB0byBwYXJzZVxuXHQgKi9cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiB0Um91dGVUYXJnZXQge1xuXHRcdGNvbnN0IGJhc2VVcmwgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0ZnVsbFVybCA9IG5ldyBVUkwodXJsLnRvU3RyaW5nKCksIGJhc2VVcmwpO1xuXHRcdGxldCBwYXJzZWQ6IHRSb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0cGFyc2VkID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiBmdWxsVXJsLmhyZWYsXG5cdFx0XHRcdHBhdGg6IGZ1bGxVcmwuaGFzaC5yZXBsYWNlKGhhc2hUYWdTdHIsICcnKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGZ1bGxVcmwuaGFzaCxcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBwYXRobmFtZSA9IGZ1bGxVcmwucGF0aG5hbWU7XG5cdFx0XHQvLyB3aGVuIHVzaW5nIHBhdGhuYW1lIG1ha2Ugc3VyZSB0byByZW1vdmVcblx0XHRcdC8vIGJhc2UgdXJpIHBhdGhuYW1lIGZvciBhcHAgaW4gc3ViZGlyZWN0b3J5XG5cdFx0XHRpZiAocGF0aG5hbWUuaW5kZXhPZihiYXNlVXJsLnBhdGhuYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRwYXRobmFtZSA9IHBhdGhuYW1lLnN1YnN0cihiYXNlVXJsLnBhdGhuYW1lLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKFxuXHRcdFx0XHRcdHBhdGhuYW1lICsgZnVsbFVybC5zZWFyY2ggKyAoZnVsbFVybC5oYXNoIHx8ICcnKSxcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCcsIHBhcnNlZCk7XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IHRSb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IHRSb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiB0Um91dGVBY3Rpb24sXG5cdCk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKG5ldyBPV2ViUm91dGUocGF0aCwgcnVsZXMsIGFjdGlvbikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdvIGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSBkaXN0YW5jZSB0aGUgZGlzdGFuY2UgaW4gaGlzdG9yeVxuXHQgKi9cblx0Z29CYWNrKGRpc3RhbmNlOiBudW1iZXIgPSAxKTogdGhpcyB7XG5cdFx0aWYgKGRpc3RhbmNlID4gMCkge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gZ29pbmcgYmFjaycsIGRpc3RhbmNlKTtcblx0XHRcdGNvbnN0IGhMZW4gPSB3SGlzdG9yeS5sZW5ndGg7XG5cdFx0XHRpZiAoaExlbiA+IDEpIHtcblx0XHRcdFx0aWYgKGhMZW4gPj0gZGlzdGFuY2UpIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtZGlzdGFuY2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1oTGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29yZG92YVxuXHRcdFx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJyb3dzZSB0byBhIHNwZWNpZmljIGxvY2F0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIG5leHQgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZVxuXHQgKiBAcGFyYW0gcHVzaCBzaG91bGQgd2UgcHVzaCBpbnRvIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZ25vcmVTYW1lTG9jYXRpb24gIGlnbm9yZSBicm93c2luZyBhZ2FpbiB0byBzYW1lIGxvY2F0aW9uXG5cdCAqL1xuXHRicm93c2VUbyhcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSxcblx0XHRwdXNoOiBib29sZWFuID0gdHJ1ZSxcblx0XHRpZ25vcmVTYW1lTG9jYXRpb246IGJvb2xlYW4gPSBmYWxzZSxcblx0KTogdGhpcyB7XG5cdFx0Y29uc3QgdGFyZ2V0VXJsID0gdGhpcy5wYXRoVG9VUkwodXJsKSxcblx0XHRcdHRhcmdldCA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0X2NkID0gdGhpcy5fY3VycmVudERpc3BhdGNoZXI7XG5cdFx0bGV0IGNkOiBJUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0aWYgKCFzYW1lT3JpZ2luKHRhcmdldC5ocmVmKSkge1xuXHRcdFx0d2luZG93Lm9wZW4odXJsKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIGJyb3dzaW5nIHRvJywgdGFyZ2V0LnBhdGgsIHtcblx0XHRcdHN0YXRlLFxuXHRcdFx0cHVzaCxcblx0XHRcdHRhcmdldCxcblx0XHR9KTtcblxuXHRcdGlmIChpZ25vcmVTYW1lTG9jYXRpb24gJiYgdGhpcy5fY3VycmVudFRhcmdldC5ocmVmID09PSB0YXJnZXQuaHJlZikge1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gaWdub3JlIHNhbWUgbG9jYXRpb24nLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoX2NkICYmIF9jZC5pc0FjdGl2ZSgpKSB7XG5cdFx0XHRsb2dnZXIud2FybignW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZycsIF9jZCk7XG5cdFx0XHRfY2QuY2FuY2VsKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudFRhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9mb3JjZVJlcGxhY2UpIHtcblx0XHRcdHRoaXMuX2ZvcmNlUmVwbGFjZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5yZXBsYWNlSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwdXNoICYmIHRoaXMuYWRkSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnREaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRzdGF0ZSxcblx0XHRcdCsrdGhpcy5fZGlzcGF0Y2hJZCxcblx0XHQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgZm91bmQgZm9yIHBhdGgnLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRpZiAodGhpcy5fbm90Rm91bmQpIHtcblx0XHRcdFx0aWYgKCF0aGlzLl9ub3RGb3VuZExvb3BDb3VudCkge1xuXHRcdFx0XHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50Kys7XG5cdFx0XHRcdFx0dGhpcy5fbm90Rm91bmQodGFyZ2V0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XHQnW09XZWJSb3V0ZXJdIFwibm90Rm91bmRcIiBoYW5kbGVyIGlzIHJlZGlyZWN0aW5nIHRvIGFub3RoZXIgbWlzc2luZyByb3V0ZS4gVGhpcyBtYXkgY2F1c2UgaW5maW5pdGUgbG9vcC4nLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHQnW09XZWJSb3V0ZXJdIFwibm90Rm91bmRcIiBoYW5kbGVyIGlzIG5vdCBkZWZpbmVkLicsXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdHRoaXMuX25vdEZvdW5kTG9vcENvdW50ID0gMDtcblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoSWQgJiYgIWNkLmNvbnRleHQuc3RvcHBlZCgpKSB7XG5cdFx0XHRjZC5jb250ZXh0LnNhdmUoKTtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHN1Y2Nlc3MnLCB0YXJnZXQucGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRhZGRIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZTogc3RyaW5nID0gJycsXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlOiBzdHJpbmcgPSAnJyxcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5yZXBsYWNlU3RhdGUoeyB1cmwsIGRhdGE6IHN0YXRlIH0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0bG9nZ2VyLmRlYnVnKFxuXHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IHJlcGxhY2VkJyxcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdFx0dXJsLFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgcm91dGUgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IHRoZSByb3V0ZSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZCB0aGUgZGlzcGF0Y2hlciBpZFxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKFxuXHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHRpZDogbnVtYmVyLFxuXHQpOiBJUm91dGVEaXNwYXRjaGVyIHtcblx0XHRsb2dnZXIuZGVidWcoYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjcmVhdGlvbi5gKTtcblxuXHRcdGNvbnN0IGN0eCA9IHRoaXMsXG5cdFx0XHRmb3VuZDogT1dlYlJvdXRlW10gPSBbXSxcblx0XHRcdHJvdXRlQ29udGV4dCA9IG5ldyBPV2ViUm91dGVDb250ZXh0KHRoaXMsIHRhcmdldCwgc3RhdGUpO1xuXHRcdGxldCBhY3RpdmUgPSBmYWxzZSxcblx0XHRcdG86IElSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByb3V0ZSA9IGN0eC5fcm91dGVzW2ldO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG8gPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbCgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCFgLFxuXHRcdFx0XHRcdFx0byxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxvZ2dlci5lcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCB3aGVuIGluYWN0aXZlLmAsXG5cdFx0XHRcdFx0XHRvLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGF0Y2goKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gc3RhcnRgLCBvKTtcblxuXHRcdFx0XHRcdGxldCBqID0gLTE7XG5cdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdHdoaWxlIChhY3RpdmUgJiYgKytqIDwgZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRyb3V0ZUNvbnRleHQuYWN0aW9uUnVubmVyKGZvdW5kW2pdKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRsb2dnZXIud2FybihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGlzIGJ1c3khYCwgbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IHRydWU7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHQncG9wc3RhdGUnLFxuXHRcdFx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdCk7XG5cdFx0XHR3RG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBjbGljayBldmVudFxuXHQgKlxuXHQgKiBvbmNsaWNrIGZyb20gcGFnZS5qcyBsaWJyYXJ5OiBnaXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcblx0ICpcblx0ICogQHBhcmFtIGUgdGhlIGVudmVudCBvYmplY3Rcblx0ICovXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG5cdFx0Y29uc3QgZXZlbnRQYXRoID1cblx0XHRcdChlIGFzIGFueSkucGF0aCB8fFxuXHRcdFx0KChlIGFzIGFueSkuY29tcG9zZWRQYXRoID8gKGUgYXMgYW55KS5jb21wb3NlZFBhdGgoKSA6IG51bGwpO1xuXG5cdFx0aWYgKGV2ZW50UGF0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudFBhdGgubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoW2ldLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgY29udGludWU7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLmhyZWYpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGVsID0gZXZlbnRQYXRoW2ldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29udGludWUgZW5zdXJlIGxpbmtcblx0XHQvLyBlbC5ub2RlTmFtZSBmb3Igc3ZnIGxpbmtzIGFyZSAnYScgaW5zdGVhZCBvZiAnQSdcblx0XHR3aGlsZSAoZWwgJiYgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKVxuXHRcdFx0ZWwgPSBlbC5wYXJlbnROb2RlIGFzIGFueTtcblx0XHRpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRjb25zdCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChcblx0XHRcdGVsLmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fFxuXHRcdFx0ZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJ1xuXHRcdClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGNvbnN0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRjb25zdCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHtcblx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRzYWZlT3BlbihvcmlnKTtcblx0XHRcdFx0cHJldmVudERlZmF1bHQoZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRwcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdCdbT1dlYlJvdXRlcl1bY2xpY2tdIGxpbmsgY2xpY2tlZCcsXG5cdFx0XHRlbCxcblx0XHRcdG9yaWcsXG5cdFx0XHR0YXJnZXRIcmVmLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGUsXG5cdFx0KTtcblx0XHR0aGlzLmJyb3dzZVRvKG9yaWcpO1xuXHR9XG59XG4iXX0=