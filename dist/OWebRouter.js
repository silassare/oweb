import { logger, preventDefault, safeOpen } from './utils';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUN6RCxPQUFPLFNBSU4sTUFBTSxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQThCbEQsTUFBTSxJQUFJLEdBQWEsTUFBTSxDQUFDLFFBQVEsRUFDbkMsSUFBSSxHQUFhLE1BQU0sQ0FBQyxRQUFRLEVBQ2hDLFFBQVEsR0FBUyxNQUFNLENBQUMsT0FBTyxFQUMvQixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBTyxJQUFJLENBQUM7QUFFekIsTUFBTSxLQUFLLEdBQVUsVUFBVSxDQUFNO0lBQ2pDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQU8sVUFBVSxHQUFRO0lBQ2hDLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNyRSxDQUFDLEVBQ0QsVUFBVSxHQUFLLFVBQVUsSUFBWTtJQUNwQyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sS0FBSyxDQUFDO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUV0RCxPQUFPLENBQ04sSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHLENBQUMsUUFBUTtRQUM5QixJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxRQUFRO1FBQzlCLElBQUksQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FDdEIsQ0FBQztBQUNILENBQUMsRUFDRCxZQUFZLEdBQUcsQ0FBQyxJQUFZLEVBQVUsRUFBRTtJQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO1FBQ2pDLE9BQU8sR0FBRyxDQUFDO0tBQ1g7SUFFRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM1QyxDQUFDLENBQUM7QUFFTCxNQUFNLENBQUMsT0FBTyxPQUFPLFVBQVU7SUFzQjlCOzs7Ozs7T0FNRztJQUNILFlBQ0MsT0FBZSxFQUNmLFFBQVEsR0FBRyxJQUFJLEVBQ2YsUUFBd0M7UUE3QmpDLG1CQUFjLEdBQW9DO1lBQ3pELE1BQU0sRUFBSSxFQUFFO1lBQ1osSUFBSSxFQUFNLEVBQUU7WUFDWixJQUFJLEVBQU0sRUFBRTtZQUNaLFFBQVEsRUFBRSxFQUFFO1NBQ1osQ0FBQztRQUNNLFlBQU8sR0FBMkMsRUFBRSxDQUFDO1FBQ3JELGlCQUFZLEdBQTZCLEtBQUssQ0FBQztRQUMvQyxlQUFVLEdBQStCLEtBQUssQ0FBQztRQUN0QyxjQUFTLEdBRWlCLFNBQVMsQ0FBQztRQUc3QyxnQkFBVyxHQUF1QyxDQUFDLENBQUM7UUFDcEQsdUJBQWtCLEdBQWdDLENBQUMsQ0FBQztRQUVwRCxrQkFBYSxHQUE0QixLQUFLLENBQUM7UUFjdEQsTUFBTSxDQUFDLEdBQWtCLElBQUksQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFZLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsU0FBUyxHQUFXLFFBQVEsQ0FBQztRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFXLFFBQVEsQ0FBQztRQUNsQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFnQixFQUFFLEVBQUU7WUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ1osQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM3QztpQkFBTTtnQkFDTixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO1FBQ0YsQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBMEIsRUFBRSxFQUFFO1lBQ3hELENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFDLENBQUM7UUFFRixNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FDSixRQUFRLEdBQUcsSUFBSSxFQUNmLFNBQW9CLElBQUksQ0FBQyxJQUFJLEVBQzdCLEtBQXlCO1FBRXpCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNoRDthQUFNO1lBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXO1FBQ1YsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7U0FDM0M7YUFBTTtZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQztTQUM1RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSCxnQkFBZ0I7UUFDZixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsb0JBQW9CO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILGVBQWU7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztTQUNsRDtRQUVELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxHQUFpQjtRQUN6QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQ25DLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUMsSUFBSSxNQUFvQixDQUFDO1FBRXpCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixNQUFNLEdBQUc7Z0JBQ1IsTUFBTSxFQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3hCLElBQUksRUFBTSxPQUFPLENBQUMsSUFBSTtnQkFDdEIsSUFBSSxFQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7Z0JBQzlDLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSTthQUN0QixDQUFDO1NBQ0Y7YUFBTTtZQUNOLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDaEMsMENBQTBDO1lBQzFDLDRDQUE0QztZQUM1QyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDN0MsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNwRDtZQUVELE1BQU0sR0FBRztnQkFDUixNQUFNLEVBQUksR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDeEIsSUFBSSxFQUFNLE9BQU8sQ0FBQyxJQUFJO2dCQUN0QixJQUFJLEVBQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQztnQkFDaEMsUUFBUSxFQUFFLFlBQVksQ0FDckIsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUNoRDthQUNELENBQUM7U0FDRjtRQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFaEQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsSUFBWSxFQUFFLElBQWE7UUFDcEMsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFbEQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3QixPQUFPLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3JCO1FBRUQsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDckI7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRS9ELE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxFQUFFLENBQ0QsSUFBZ0IsRUFDaEIsUUFBMkIsRUFBRSxFQUM3QixNQUFvQjtRQUVwQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFFBQVEsQ0FDUCxLQUFnQjtRQUVoQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDO1FBQ2xCLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNqQixNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDN0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUNiLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRTtvQkFDckIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN2QjtxQkFBTTtvQkFDTixRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ25CO2FBQ0Q7aUJBQU07Z0JBQ04sVUFBVTtnQkFDVixJQUFJLE1BQU0sQ0FBQyxTQUFTLElBQUssTUFBTSxDQUFDLFNBQWlCLENBQUMsR0FBRyxFQUFFO29CQUNyRCxNQUFNLENBQUMsU0FBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ3hDO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDZjthQUNEO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsUUFBUSxDQUNQLEdBQVcsRUFDWCxRQUE4QixFQUFFLEVBQ2hDLElBQUksR0FBaUIsSUFBSSxFQUN6QixrQkFBa0IsR0FBRyxLQUFLO1FBRTFCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQ2xDLE1BQU0sR0FBTSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFDekMsR0FBRyxHQUFTLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUN2QyxJQUFJLEVBQW9CLENBQUM7UUFFekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNqQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ3JELEtBQUs7WUFDTCxJQUFJO1lBQ0osTUFBTTtTQUNOLENBQUMsQ0FBQztRQUVILElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRTtZQUNuRSxNQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0RBQWdELEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkUsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQztRQUU3QixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDM0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNDO2FBQU07WUFDTixJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQ25ELE1BQU0sRUFDTixLQUFLLEVBQ0wsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUNsQixDQUFDO1FBRUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pFLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7b0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNOLE1BQU0sSUFBSSxLQUFLLENBQ2Qsd0dBQXdHLENBQ3hHLENBQUM7aUJBQ0Y7YUFDRDtpQkFBTTtnQkFDTixNQUFNLElBQUksS0FBSyxDQUNkLGlEQUFpRCxDQUNqRCxDQUFDO2FBQ0Y7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUU1QixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFZCxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDeEQsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFVBQVUsQ0FDVCxHQUFXLEVBQ1gsS0FBd0IsRUFDeEIsS0FBSyxHQUFHLEVBQUU7UUFFVixLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUVuRCxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFaEUsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsY0FBYyxDQUNiLEdBQVcsRUFDWCxLQUF3QixFQUN4QixLQUFLLEdBQUcsRUFBRTtRQUVWLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRW5ELFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUV0RCxNQUFNLENBQUMsS0FBSyxDQUNYLHdDQUF3QyxFQUN4QyxRQUFRLENBQUMsS0FBSyxFQUNkLEdBQUcsQ0FDSCxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssZ0JBQWdCLENBQ3ZCLE1BQW9CLEVBQ3BCLEtBQXdCLEVBQ3hCLEVBQVU7UUFFVixNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRXpELE1BQU0sR0FBRyxHQUFrQixJQUFJLEVBQzVCLEtBQUssR0FBZ0IsRUFBRSxFQUN2QixZQUFZLEdBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLElBQUksTUFBTSxHQUFpQixLQUFLLENBQUM7UUFFakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVDLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFN0IsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDMUIsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNsQjtTQUNEO1FBRUQsTUFBTSxDQUFDLEdBQXFCO1lBQzNCLE9BQU8sRUFBRyxZQUFZO1lBQ3RCLEVBQUU7WUFDRixLQUFLO1lBQ0wsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLE1BQU07WUFDdEIsTUFBTTtnQkFDTCxJQUFJLE1BQU0sRUFBRTtvQkFDWCxNQUFNLEdBQUcsS0FBSyxDQUFDO29CQUNmLE1BQU0sQ0FBQyxLQUFLLENBQ1gsMkJBQTJCLEVBQUUsa0JBQWtCLEVBQy9DLENBQUMsQ0FDRCxDQUFDO2lCQUNGO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxLQUFLLENBQ1gsMkJBQTJCLEVBQUUsZ0NBQWdDLEVBQzdELENBQUMsQ0FDRCxDQUFDO2lCQUNGO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUNELFFBQVE7Z0JBQ1AsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWixNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFFeEQsSUFBSSxDQUFDLEdBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ1osTUFBTSxHQUFHLElBQUksQ0FBQztvQkFFZCxPQUFPLE1BQU0sSUFBSSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFO3dCQUNwQyxZQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNwQztvQkFFRCxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUNmO3FCQUFNO29CQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMxRDtnQkFFRCxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUM7U0FDRCxDQUFDO1FBRUYsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRUQ7O09BRUc7SUFDSyxRQUFRO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGdCQUFnQixDQUNwQixjQUFjLEVBQ2QsSUFBSSxDQUFDLGtCQUFrQixFQUN2QixLQUFLLENBQ0wsQ0FBQztTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSyxVQUFVO1FBQ2pCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztZQUN4QixNQUFNLENBQUMsbUJBQW1CLENBQ3pCLFVBQVUsRUFDVixJQUFJLENBQUMsaUJBQWlCLEVBQ3RCLEtBQUssQ0FDTCxDQUFDO1lBQ0YsSUFBSSxDQUFDLG1CQUFtQixDQUN2QixjQUFjLEVBQ2QsSUFBSSxDQUFDLGtCQUFrQixFQUN2QixLQUFLLENBQ0wsQ0FBQztTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssUUFBUSxDQUFDLENBQTBCO1FBQzFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFBRSxPQUFPO1FBRTNCLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUNqRCxJQUFJLENBQUMsQ0FBQyxnQkFBZ0I7WUFBRSxPQUFPO1FBRS9CLGNBQWM7UUFDZCxzR0FBc0c7UUFDdEcsSUFBSSxFQUFFLEdBQXVCLENBQUMsQ0FBQyxNQUFxQixDQUFDO1FBQ3JELE1BQU0sU0FBUyxHQUNWLENBQVMsQ0FBQyxJQUFJO1lBQ2YsQ0FBRSxDQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBRSxDQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpFLElBQUksU0FBUyxFQUFFO1lBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUTtvQkFBRSxTQUFTO2dCQUNyQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssR0FBRztvQkFBRSxTQUFTO2dCQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQUUsU0FBUztnQkFFakMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEIsTUFBTTthQUNOO1NBQ0Q7UUFDRCx1QkFBdUI7UUFDdkIsbURBQW1EO1FBQ25ELE9BQU8sRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUM3QyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQWlCLENBQUM7UUFDM0IsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFBRSxPQUFPO1FBRXJELG9DQUFvQztRQUNwQyxpRUFBaUU7UUFDakUsTUFBTSxHQUFHLEdBQ0wsT0FBUSxFQUFVLENBQUMsSUFBSSxLQUFLLFFBQVE7WUFDbkMsRUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLG1CQUFtQixDQUFDO1FBRTlELG9CQUFvQjtRQUNwQiwwQkFBMEI7UUFDMUIsOEJBQThCO1FBQzlCLElBQ0MsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7WUFDM0IsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsS0FBSyxVQUFVO1lBRXJDLE9BQU87UUFFUixvQ0FBb0M7UUFDcEMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUNDLENBQUMsSUFBSSxDQUFDLFNBQVM7WUFDZixRQUFRLENBQUMsRUFBUyxDQUFDO1lBQ25CLENBQUUsRUFBVSxDQUFDLElBQUksSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDO1lBRWxDLE9BQU87UUFFUixtQ0FBbUM7UUFDbkMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFBRSxPQUFPO1FBRWpELGtCQUFrQjtRQUNsQix3RUFBd0U7UUFDeEUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBRSxFQUFVLENBQUMsTUFBTTtZQUFFLE9BQU87UUFFbEUsV0FBVztRQUNYLG1GQUFtRjtRQUNuRix3RkFBd0Y7UUFDeEYsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBRSxFQUFVLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTztRQUVsRCxlQUFlO1FBQ2YsNkVBQTZFO1FBQzdFLDRFQUE0RTtRQUM1RSxJQUFJLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBRSxFQUFVLENBQUMsSUFBSSxDQUFDO1FBRW5FLHVEQUF1RDtRQUN2RDs7Ozs7V0FLRztRQUVILE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUV4QixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QyxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ3hCLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzNDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDZixjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7WUFFRCxPQUFPO1NBQ1A7UUFFRCxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbEIsTUFBTSxDQUFDLEtBQUssQ0FDWCxrQ0FBa0MsRUFDbEMsRUFBRSxFQUNGLElBQUksRUFDSixVQUFVLEVBQ1YsUUFBUSxDQUFDLEtBQUssQ0FDZCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2xvZ2dlciwgcHJldmVudERlZmF1bHQsIHNhZmVPcGVufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBPV2ViUm91dGUsIHtcblx0T1JvdXRlQWN0aW9uLFxuXHRPUm91dGVQYXRoLFxuXHRPUm91dGVQYXRoT3B0aW9ucyxcbn0gZnJvbSAnLi9PV2ViUm91dGUnO1xuaW1wb3J0IE9XZWJSb3V0ZUNvbnRleHQgZnJvbSAnLi9PV2ViUm91dGVDb250ZXh0JztcblxuZXhwb3J0IHR5cGUgT1JvdXRlVGFyZ2V0ID0ge1xuXHRwYXJzZWQ6IHN0cmluZztcblx0aHJlZjogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG5cdGZ1bGxQYXRoOiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgT1JvdXRlU3RhdGVJdGVtID0gfCBzdHJpbmdcblx0fCBudW1iZXJcblx0fCBib29sZWFuXG5cdHwgbnVsbFxuXHR8IHVuZGVmaW5lZFxuXHR8IERhdGVcblx0fCBPUm91dGVTdGF0ZU9iamVjdFxuXHR8IE9Sb3V0ZVN0YXRlSXRlbVtdO1xuZXhwb3J0IHR5cGUgT1JvdXRlU3RhdGVPYmplY3QgPSB7IFtrZXk6IHN0cmluZ106IE9Sb3V0ZVN0YXRlSXRlbSB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIE9Sb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0O1xuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW107XG5cblx0aXNBY3RpdmUoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdGNhbmNlbCgpOiB0aGlzO1xufVxuXG5jb25zdCB3TG9jICAgICAgICAgICA9IHdpbmRvdy5sb2NhdGlvbixcblx0ICB3RG9jICAgICAgICAgICA9IHdpbmRvdy5kb2N1bWVudCxcblx0ICB3SGlzdG9yeSAgICAgICA9IHdpbmRvdy5oaXN0b3J5LFxuXHQgIGxpbmtDbGlja0V2ZW50ID0gd0RvYy5vbnRvdWNoc3RhcnQgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snLFxuXHQgIGhhc2hUYWdTdHIgICAgID0gJyMhJztcblxuY29uc3Qgd2hpY2ggICAgICAgID0gZnVuY3Rpb24gKGU6IGFueSk6IG51bWJlciB7XG5cdFx0ICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0ICByZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHQgIH0sXG5cdCAgc2FtZVBhdGggICAgID0gZnVuY3Rpb24gKHVybDogVVJMKSB7XG5cdFx0ICByZXR1cm4gdXJsLnBhdGhuYW1lID09PSB3TG9jLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IHdMb2Muc2VhcmNoO1xuXHQgIH0sXG5cdCAgc2FtZU9yaWdpbiAgID0gZnVuY3Rpb24gKGhyZWY6IHN0cmluZykge1xuXHRcdCAgaWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0ICBjb25zdCB1cmwgPSBuZXcgVVJMKGhyZWYudG9TdHJpbmcoKSwgd0xvYy50b1N0cmluZygpKTtcblxuXHRcdCAgcmV0dXJuIChcblx0XHRcdCAgd0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHQgIHdMb2MuaG9zdG5hbWUgPT09IHVybC5ob3N0bmFtZSAmJlxuXHRcdFx0ICB3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0ICApO1xuXHQgIH0sXG5cdCAgbGVhZGluZ1NsYXNoID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0ICBpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT09ICcvJykge1xuXHRcdFx0ICByZXR1cm4gJy8nO1xuXHRcdCAgfVxuXG5cdFx0ICByZXR1cm4gcGF0aFswXSAhPT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdCAgfTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VVcmw6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSBfaGFzaE1vZGU6IGJvb2xlYW47XG5cdHByaXZhdGUgX2N1cnJlbnRUYXJnZXQ6IE9Sb3V0ZVRhcmdldCAgICAgICAgICAgICAgICAgICAgPSB7XG5cdFx0cGFyc2VkICA6ICcnLFxuXHRcdGhyZWYgICAgOiAnJyxcblx0XHRwYXRoICAgIDogJycsXG5cdFx0ZnVsbFBhdGg6ICcnLFxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9ub3RGb3VuZDpcblx0XHRcdFx0XHRcdCB8IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0IHwgKCh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZCkgPSB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3BvcFN0YXRlTGlzdGVuZXI6IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9saW5rQ2xpY2tMaXN0ZW5lcjogKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIF9kaXNwYXRjaElkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMDtcblx0cHJpdmF0ZSBfbm90Rm91bmRMb29wQ291bnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnREaXNwYXRjaGVyPzogT1JvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VSZXBsYWNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKiBAcGFyYW0gbm90Rm91bmQgY2FsbGVkIHdoZW4gYSByb3V0ZSBpcyBub3QgZm91bmRcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGJhc2VVcmw6IHN0cmluZyxcblx0XHRoYXNoTW9kZSA9IHRydWUsXG5cdFx0bm90Rm91bmQ6ICh0YXJnZXQ6IE9Sb3V0ZVRhcmdldCkgPT4gdm9pZCxcblx0KSB7XG5cdFx0Y29uc3QgciAgICAgICAgICAgICAgICA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCAgICAgICAgICA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgICAgICAgICA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX25vdEZvdW5kICAgICAgICAgPSBub3RGb3VuZDtcblx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyID0gKGU6IFBvcFN0YXRlRXZlbnQpID0+IHtcblx0XHRcdGxvZ2dlci5kZWJ1ZygnW09XZWJSb3V0ZXJdIHBvcHN0YXRlJywgZSk7XG5cblx0XHRcdGlmIChlLnN0YXRlKSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8oZS5zdGF0ZS51cmwsIGUuc3RhdGUuZGF0YSwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ci5icm93c2VUbyh3TG9jLmhyZWYsIHVuZGVmaW5lZCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciA9IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuXHRcdFx0ci5fb25DbGljayhlKTtcblx0XHR9O1xuXG5cdFx0bG9nZ2VyLmluZm8oJ1tPV2ViUm91dGVyXSByZWFkeSEnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydHMgdGhlIHJvdXRlci5cblx0ICpcblx0ICogQHBhcmFtIGZpcnN0UnVuIGZpcnN0IHJ1biBmbGFnXG5cdCAqIEBwYXJhbSB0YXJnZXQgaW5pdGlhbCB0YXJnZXQsIHVzdWFseSB0aGUgZW50cnkgcG9pbnRcblx0ICogQHBhcmFtIHN0YXRlIGluaXRpYWwgc3RhdGVcblx0ICovXG5cdHN0YXJ0KFxuXHRcdGZpcnN0UnVuID0gdHJ1ZSxcblx0XHR0YXJnZXQ6IHN0cmluZyAgICA9IHdMb2MuaHJlZixcblx0XHRzdGF0ZT86IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHQpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKCk7XG5cdFx0XHRsb2dnZXIuaW5mbygnW09XZWJSb3V0ZXJdIHN0YXJ0IHJvdXRpbmchJyk7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSB3YXRjaGluZyByb3V0ZXMnLCB0aGlzLl9yb3V0ZXMpO1xuXHRcdFx0Zmlyc3RSdW4gJiYgdGhpcy5icm93c2VUbyh0YXJnZXQsIHN0YXRlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gcm91dGVyIGFscmVhZHkgc3RhcnRlZCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wcyB0aGUgcm91dGVyLlxuXHQgKi9cblx0c3RvcFJvdXRpbmcoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy51bnJlZ2lzdGVyKCk7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBzdG9wIHJvdXRpbmchJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0geW91IHNob3VsZCBzdGFydCByb3V0aW5nIGZpcnN0IScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZW4gY2FsbGVkIHRoZSBjdXJyZW50IGhpc3Rvcnkgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgbmV4dCBoaXN0b3J5IHN0YXRlLlxuXHQgKi9cblx0Zm9yY2VOZXh0UmVwbGFjZSgpOiB0aGlzIHtcblx0XHR0aGlzLl9mb3JjZVJlcGxhY2UgPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgdGFyZ2V0LlxuXHQgKi9cblx0Z2V0Q3VycmVudFRhcmdldCgpOiBPUm91dGVUYXJnZXQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50VGFyZ2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgZXZlbnQgZGlzcGF0Y2hlci5cblx0ICovXG5cdGdldEN1cnJlbnREaXNwYXRjaGVyKCk6IE9Sb3V0ZURpc3BhdGNoZXIgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRSb3V0ZUNvbnRleHQoKTogT1dlYlJvdXRlQ29udGV4dCB7XG5cdFx0aWYgKCF0aGlzLl9jdXJyZW50RGlzcGF0Y2hlcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgY29udGV4dC4nKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudERpc3BhdGNoZXIuY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIGdpdmVuIHVybC5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsIHRvIHBhcnNlXG5cdCAqL1xuXHRwYXJzZVVSTCh1cmw6IHN0cmluZyB8IFVSTCk6IE9Sb3V0ZVRhcmdldCB7XG5cdFx0Y29uc3QgYmFzZVVybCA9IG5ldyBVUkwodGhpcy5fYmFzZVVybCksXG5cdFx0XHQgIGZ1bGxVcmwgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiYXNlVXJsKTtcblx0XHRsZXQgcGFyc2VkOiBPUm91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdHBhcnNlZCA9IHtcblx0XHRcdFx0cGFyc2VkICA6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmICAgIDogZnVsbFVybC5ocmVmLFxuXHRcdFx0XHRwYXRoICAgIDogZnVsbFVybC5oYXNoLnJlcGxhY2UoaGFzaFRhZ1N0ciwgJycpLFxuXHRcdFx0XHRmdWxsUGF0aDogZnVsbFVybC5oYXNoLFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IHBhdGhuYW1lID0gZnVsbFVybC5wYXRobmFtZTtcblx0XHRcdC8vIHdoZW4gdXNpbmcgcGF0aG5hbWUgbWFrZSBzdXJlIHRvIHJlbW92ZVxuXHRcdFx0Ly8gYmFzZSB1cmkgcGF0aG5hbWUgZm9yIGFwcCBpbiBzdWJkaXJlY3Rvcnlcblx0XHRcdGlmIChwYXRobmFtZS5pbmRleE9mKGJhc2VVcmwucGF0aG5hbWUpID09PSAwKSB7XG5cdFx0XHRcdHBhdGhuYW1lID0gcGF0aG5hbWUuc3Vic3RyKGJhc2VVcmwucGF0aG5hbWUubGVuZ3RoKTtcblx0XHRcdH1cblxuXHRcdFx0cGFyc2VkID0ge1xuXHRcdFx0XHRwYXJzZWQgIDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWYgICAgOiBmdWxsVXJsLmhyZWYsXG5cdFx0XHRcdHBhdGggICAgOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKFxuXHRcdFx0XHRcdHBhdGhuYW1lICsgZnVsbFVybC5zZWFyY2ggKyAoZnVsbFVybC5oYXNoIHx8ICcnKSxcblx0XHRcdFx0KSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCcsIHBhcnNlZCk7XG5cblx0XHRyZXR1cm4gcGFyc2VkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IE9Sb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IE9Sb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiBPUm91dGVBY3Rpb24sXG5cdCk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKG5ldyBPV2ViUm91dGUocGF0aCwgcnVsZXMsIGFjdGlvbikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdGFkZFJvdXRlKFxuXHRcdHJvdXRlOiBPV2ViUm91dGUsXG5cdCk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKHJvdXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHbyBiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGlzdGFuY2UgdGhlIGRpc3RhbmNlIGluIGhpc3Rvcnlcblx0ICovXG5cdGdvQmFjayhkaXN0YW5jZSA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBnb2luZyBiYWNrJywgZGlzdGFuY2UpO1xuXHRcdFx0Y29uc3QgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnJvd3NlIHRvIGEgc3BlY2lmaWMgbG9jYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgbmV4dCB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBpbml0aWFsIHN0YXRlXG5cdCAqIEBwYXJhbSBwdXNoIHNob3VsZCB3ZSBwdXNoIGludG8gdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlnbm9yZVNhbWVMb2NhdGlvbiAgaWdub3JlIGJyb3dzaW5nIGFnYWluIHRvIHNhbWUgbG9jYXRpb25cblx0ICovXG5cdGJyb3dzZVRvKFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCAgICA9IHt9LFxuXHRcdHB1c2ggICAgICAgICAgICAgICA9IHRydWUsXG5cdFx0aWdub3JlU2FtZUxvY2F0aW9uID0gZmFsc2UsXG5cdCk6IHRoaXMge1xuXHRcdGNvbnN0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHQgIHRhcmdldCAgICA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0ICBfY2QgICAgICAgPSB0aGlzLl9jdXJyZW50RGlzcGF0Y2hlcjtcblx0XHRsZXQgY2Q6IE9Sb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gYnJvd3NpbmcgdG8nLCB0YXJnZXQucGF0aCwge1xuXHRcdFx0c3RhdGUsXG5cdFx0XHRwdXNoLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdH0pO1xuXG5cdFx0aWYgKGlnbm9yZVNhbWVMb2NhdGlvbiAmJiB0aGlzLl9jdXJyZW50VGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbicsIHRhcmdldC5wYXRoKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmIChfY2QgJiYgX2NkLmlzQWN0aXZlKCkpIHtcblx0XHRcdGxvZ2dlci53YXJuKCdbT1dlYlJvdXRlcl0gYnJvd3NlVG8gY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nJywgX2NkKTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2ZvcmNlUmVwbGFjZSkge1xuXHRcdFx0dGhpcy5fZm9yY2VSZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudERpc3BhdGNoZXIgPSBjZCA9IHRoaXMuY3JlYXRlRGlzcGF0Y2hlcihcblx0XHRcdHRhcmdldCxcblx0XHRcdHN0YXRlLFxuXHRcdFx0Kyt0aGlzLl9kaXNwYXRjaElkLFxuXHRcdCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0bG9nZ2VyLndhcm4oJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBmb3VuZCBmb3IgcGF0aCcsIHRhcmdldC5wYXRoKTtcblx0XHRcdGlmICh0aGlzLl9ub3RGb3VuZCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuX25vdEZvdW5kTG9vcENvdW50KSB7XG5cdFx0XHRcdFx0dGhpcy5fbm90Rm91bmRMb29wQ291bnQrKztcblx0XHRcdFx0XHR0aGlzLl9ub3RGb3VuZCh0YXJnZXQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdCdbT1dlYlJvdXRlcl0gXCJub3RGb3VuZFwiIGhhbmRsZXIgaXMgcmVkaXJlY3RpbmcgdG8gYW5vdGhlciBtaXNzaW5nIHJvdXRlLiBUaGlzIG1heSBjYXVzZSBpbmZpbml0ZSBsb29wLicsXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdCdbT1dlYlJvdXRlcl0gXCJub3RGb3VuZFwiIGhhbmRsZXIgaXMgbm90IGRlZmluZWQuJyxcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbm90Rm91bmRMb29wQ291bnQgPSAwO1xuXG5cdFx0Y2QuZGlzcGF0Y2goKTtcblxuXHRcdGlmIChjZC5pZCA9PT0gdGhpcy5fZGlzcGF0Y2hJZCAmJiAhY2QuY29udGV4dC5zdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0bG9nZ2VyLmRlYnVnKCdbT1dlYlJvdXRlcl0gc3VjY2VzcycsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IE9Sb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlID0gJycsXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHt1cmwsIGRhdGE6IHN0YXRlfSwgdGl0bGUsIHVybCk7XG5cblx0XHRsb2dnZXIuZGVidWcoJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IGFkZGVkJywgc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlIHRoZSBjdXJyZW50IGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdHJlcGxhY2VIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZSA9ICcnLFxuXHQpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnJlcGxhY2VTdGF0ZSh7dXJsLCBkYXRhOiBzdGF0ZX0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0bG9nZ2VyLmRlYnVnKFxuXHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IHJlcGxhY2VkJyxcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdFx0dXJsLFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgcm91dGUgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IHRoZSByb3V0ZSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZCB0aGUgZGlzcGF0Y2hlciBpZFxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKFxuXHRcdHRhcmdldDogT1JvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiBPUm91dGVTdGF0ZU9iamVjdCxcblx0XHRpZDogbnVtYmVyLFxuXHQpOiBPUm91dGVEaXNwYXRjaGVyIHtcblx0XHRsb2dnZXIuZGVidWcoYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjcmVhdGlvbi5gKTtcblxuXHRcdGNvbnN0IGN0eCAgICAgICAgICAgICAgICA9IHRoaXMsXG5cdFx0XHQgIGZvdW5kOiBPV2ViUm91dGVbXSA9IFtdLFxuXHRcdFx0ICByb3V0ZUNvbnRleHQgICAgICAgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKTtcblx0XHRsZXQgYWN0aXZlICAgICAgICAgICAgICAgPSBmYWxzZTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY3R4Ll9yb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHJvdXRlID0gY3R4Ll9yb3V0ZXNbaV07XG5cblx0XHRcdGlmIChyb3V0ZS5pcyh0YXJnZXQucGF0aCkpIHtcblx0XHRcdFx0Zm91bmQucHVzaChyb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbzogT1JvdXRlRGlzcGF0Y2hlciA9IHtcblx0XHRcdGNvbnRleHQgOiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbCgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxvZ2dlci5kZWJ1Zyhcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCFgLFxuXHRcdFx0XHRcdFx0byxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxvZ2dlci5lcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCB3aGVuIGluYWN0aXZlLmAsXG5cdFx0XHRcdFx0XHRvLFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGF0Y2goKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0bG9nZ2VyLmRlYnVnKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gc3RhcnRgLCBvKTtcblxuXHRcdFx0XHRcdGxldCBqICA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bG9nZ2VyLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBVbnJlZ2lzdGVyIGFsbCBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHVucmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gZmFsc2U7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0J3BvcHN0YXRlJyxcblx0XHRcdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHQpO1xuXHRcdFx0d0RvYy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuXHRcdGNvbnN0IGV2ZW50UGF0aCAgICAgICAgICAgID1cblx0XHRcdFx0ICAoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdFx0ICAoKGUgYXMgYW55KS5jb21wb3NlZFBhdGggPyAoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCgpIDogbnVsbCk7XG5cblx0XHRpZiAoZXZlbnRQYXRoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50UGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ub2RlTmFtZSkgY29udGludWU7XG5cdFx0XHRcdGlmIChldmVudFBhdGhbaV0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gJ0EnKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0uaHJlZikgY29udGludWU7XG5cblx0XHRcdFx0ZWwgPSBldmVudFBhdGhbaV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBjb250aW51ZSBlbnN1cmUgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpXG5cdFx0XHRlbCA9IGVsLnBhcmVudE5vZGUgYXMgYW55O1xuXHRcdGlmICghZWwgfHwgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBpZiBsaW5rIGlzIGluc2lkZSBhbiBzdmdcblx0XHQvLyBpbiB0aGlzIGNhc2UsIGJvdGggaHJlZiBhbmQgdGFyZ2V0IGFyZSBhbHdheXMgaW5zaWRlIGFuIG9iamVjdFxuXHRcdGNvbnN0IHN2ZyA9XG5cdFx0XHRcdCAgdHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHRcdCAgKGVsIGFzIGFueSkuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXG5cdFx0Ly8gSWdub3JlIGlmIHRhZyBoYXNcblx0XHQvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG5cdFx0Ly8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcblx0XHRpZiAoXG5cdFx0XHRlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHxcblx0XHRcdGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCdcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcblx0XHRjb25zdCBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuX2hhc2hNb2RlICYmXG5cdFx0XHRzYW1lUGF0aChlbCBhcyBhbnkpICYmXG5cdFx0XHQoKGVsIGFzIGFueSkuaGFzaCB8fCAnIycgPT09IGxpbmspXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayB0YXJnZXRcblx0XHQvLyBzdmcgdGFyZ2V0IGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdC8vIHgtb3JpZ2luXG5cdFx0Ly8gbm90ZTogc3ZnIGxpbmtzIHRoYXQgYXJlIG5vdCByZWxhdGl2ZSBkb24ndCBjYWxsIGNsaWNrIGV2ZW50cyAoYW5kIHNraXAgcGFnZS5qcylcblx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0aWYgKCFzdmcgJiYgIXNhbWVPcmlnaW4oKGVsIGFzIGFueSkuaHJlZikpIHJldHVybjtcblxuXHRcdC8vIHJlYnVpbGQgcGF0aFxuXHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0Ly8gQWxzbywgc3ZnIGhyZWYgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGxldCB0YXJnZXRIcmVmID0gc3ZnID8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsIDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuXHRcdC8qXG5cdFx0IGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdCBpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHQgdGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHQgfVxuXHRcdCAqL1xuXG5cdFx0Y29uc3Qgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSB7XG5cdFx0XHRpZiAoZWwuZ2V0QXR0cmlidXRlKCd0YXJnZXQnKSA9PT0gJ19ibGFuaycpIHtcblx0XHRcdFx0c2FmZU9wZW4ob3JpZyk7XG5cdFx0XHRcdHByZXZlbnREZWZhdWx0KGUpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cHJldmVudERlZmF1bHQoZSk7XG5cblx0XHRsb2dnZXIuZGVidWcoXG5cdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSBsaW5rIGNsaWNrZWQnLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdCk7XG5cdFx0dGhpcy5icm93c2VUbyhvcmlnKTtcblx0fVxufVxuIl19