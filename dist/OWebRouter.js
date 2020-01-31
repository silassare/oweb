import Utils from './utils/Utils';
const tokenTypesRegMap = {
    num: /\d+/.source,
    alpha: /[a-zA-Z]+/.source,
    'alpha-u': /[a-z]+/.source,
    'alpha-l': /[A-Z]+/.source,
    'alpha-num': /[a-zA-Z0-9]+/.source,
    'alpha-num-l': /[a-z0-9]+/.source,
    'alpha-num-u': /[A-Z0-9]+/.source,
    any: /[^/]+/.source,
}, token_reg = /:([a-z][a-z0-9_]*)/i, wLoc = window.location, wDoc = window.document, wHistory = window.history, linkClickEvent = wDoc.ontouchstart ? 'touchstart' : 'click', hashTagStr = '#!';
const which = function (e) {
    e = e || window.event;
    return null == e.which ? e.button : e.which;
}, samePath = function (url) {
    return url.pathname === wLoc.pathname && url.search === wLoc.search;
}, sameOrigin = function (href) {
    if (!href)
        return false;
    let url = new URL(href.toString(), wLoc.toString());
    return (wLoc.protocol === url.protocol &&
        wLoc.hostname === url.hostname &&
        wLoc.port === url.port);
}, escapeString = function (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1');
}, stringReg = function (str) {
    return new RegExp(escapeString(str));
}, leadingSlash = (path) => {
    if (!path.length || path == '/') {
        return '/';
    }
    return path[0] != '/' ? '/' + path : path;
}, wrapReg = (str, capture = false) => capture ? '(' + str + ')' : '(?:' + str + ')';
export class OWebRoute {
    /**
     * OWebRoute Constructor.
     *
     * @param path The route path string or regexp.
     * @param options The route options.
     * @param action The route action function.
     */
    constructor(path, options, action) {
        if (path instanceof RegExp) {
            this.path = path.toString();
            this.reg = path;
            this.tokens = Utils.isArray(options) ? options : [];
        }
        else if (Utils.isString(path) && path.length) {
            options = ((Utils.isPlainObject(options) ? options : {}));
            let p = OWebRoute.parseDynamicPath(path, options);
            this.path = path;
            this.reg = p.reg;
            this.tokens = p.tokens;
        }
        else {
            throw new TypeError('[OWebRoute] invalid route path, string or RegExp required.');
        }
        if ('function' !== typeof action) {
            throw new TypeError(`[OWebRoute] invalid action type, got "${typeof action}" instead of "function".`);
        }
        this.action = action;
    }
    /**
     * Returns true if this route is dynamic false otherwise.
     */
    isDynamic() {
        return this.reg != null;
    }
    /**
     * Gets route action.
     */
    getAction() {
        return this.action;
    }
    /**
     * Checks if a given pathname match this route.
     *
     * @param pathname
     */
    is(pathname) {
        return this.reg ? this.reg.test(pathname) : this.path === pathname;
    }
    /**
     * Parse a given pathname.
     *
     * @param pathname
     */
    parse(pathname) {
        if (this.isDynamic()) {
            let founds = String(pathname).match(this.reg);
            if (founds) {
                return this.tokens.reduce((acc, key, index) => {
                    acc[key] = founds[index + 1];
                    return acc;
                }, {});
            }
        }
        return {};
    }
    /**
     * Parse dynamic path and returns appropriate regexp and tokens list.
     *
     * ```js
     * let format = "path/to/:id/file/:index/name.:format";
     * let options = {
     * 		id: "num",
     * 		index: "alpha",
     * 		format:	"alpha-num"
     * };
     * let info = parseDynamicPath(format,options);
     *
     * info === {
     *     reg: RegExp,
     *     tokens: ["id","index","format"]
     * };
     * ```
     * @param path The path format string.
     * @param options The path options.
     */
    static parseDynamicPath(path, options) {
        let tokens = [], reg = '', _path = path, match;
        while ((match = token_reg.exec(_path)) != null) {
            let found = match[0], token = match[1], rule = options[token] || 'any', head = _path.slice(0, match.index);
            if (head.length) {
                reg += wrapReg(stringReg(head).source);
            }
            if (typeof rule === 'string' && rule in tokenTypesRegMap) {
                reg += wrapReg(tokenTypesRegMap[rule], true);
            }
            else if (rule instanceof RegExp) {
                reg += wrapReg(rule.source, true);
            }
            else {
                throw new Error("Invalid rule for token ':" +
                    token +
                    "' in path '" +
                    path +
                    "'");
            }
            tokens.push(token);
            _path = _path.slice(match.index + found.length);
        }
        if (!reg.length) {
            return {
                reg: null,
                tokens: tokens,
            };
        }
        if (_path.length) {
            reg += wrapReg(stringReg(_path).source);
        }
        return {
            reg: new RegExp('^' + reg + '$'),
            tokens: tokens,
        };
    }
}
export class OWebRouteContext {
    /**
     * OWebRouteContext constructor.
     *
     * @param router
     * @param target
     * @param state
     */
    constructor(router, target, state) {
        this._stopped = false;
        this._target = target;
        this._tokens = {};
        this._state = state || {};
        this._router = router;
    }
    /**
     * Gets route token value
     *
     * @param token The token.
     */
    getToken(token) {
        return this._tokens[token];
    }
    /**
     * Gets a map of all tokens and values.
     */
    getTokens() {
        return Object.create(this._tokens);
    }
    /**
     * Gets the path.
     */
    getPath() {
        return this._target.path;
    }
    /**
     * Gets stored value in history state with a given key.
     *
     * @param key the state key
     */
    getStateItem(key) {
        return this._state[key];
    }
    /**
     * Sets a key in history state.
     *
     * @param key the state key
     * @param value  the state value
     */
    setStateItem(key, value) {
        this._state[key] = value;
        return this.save();
    }
    /**
     * Gets search param.
     *
     * @param param the param name
     */
    getSearchParam(param) {
        return new URL(this._target.href).searchParams.get(param);
    }
    /**
     * Check if the route dispatcher is stopped.
     */
    stopped() {
        return this._stopped;
    }
    /**
     * Stop the route dispatcher.
     */
    stop() {
        if (!this._stopped) {
            console.warn('[OWebDispatchContext] route context will stop.');
            this.save(); // save before stop
            this._stopped = true;
            this._router.getCurrentDispatcher().cancel();
            console.warn('[OWebDispatchContext] route context was stopped!');
        }
        else {
            console.warn('[OWebDispatchContext] route context already stopped!');
        }
        return this;
    }
    /**
     * Save history state.
     */
    save() {
        if (!this.stopped()) {
            console.log('[OWebDispatchContext] saving state...');
            this._router.replaceHistory(this._target.href, this._state);
        }
        else {
            console.error("[OWebDispatchContext] you shouldn't try to save when stopped.");
        }
        return this;
    }
    /**
     * Runs action attached to a given route.
     *
     * @param route
     */
    actionRunner(route) {
        this._tokens = route.parse(this._target.path);
        route.getAction()(this);
        return this;
    }
}
export default class OWebRouter {
    /**
     * OWebRouter constructor.
     *
     * @param baseUrl the base url
     * @param hashMode weather to use hash mode
     */
    constructor(baseUrl, hashMode = true, notFound) {
        this._current_target = {
            parsed: '',
            href: '',
            path: '',
            fullPath: '',
        };
        this._routes = [];
        this._initialized = false;
        this._listening = false;
        this._notFound = undefined;
        this._dispatch_id = 0;
        this._force_replace = false;
        let r = this;
        this._baseUrl = baseUrl;
        this._hashMode = hashMode;
        this._notFound = notFound;
        this._popStateListener = (e) => {
            console.log('[OWebRouter] popstate ->', arguments);
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
        this._force_replace = true;
        return this;
    }
    /**
     * Returns the current route target.
     */
    getCurrentTarget() {
        return this._current_target;
    }
    /**
     * Returns the current route event dispatcher.
     */
    getCurrentDispatcher() {
        return this._current_dispatcher;
    }
    /**
     * Returns the current route context.
     */
    getRouteContext() {
        if (!this._current_dispatcher) {
            throw new Error('[OWebRouter] no route context.');
        }
        return this._current_dispatcher.context;
    }
    /**
     * Parse a given url.
     *
     * @param url the url to parse
     */
    parseURL(url) {
        let b = new URL(this._baseUrl), u = new URL(url.toString(), b), _;
        if (this._hashMode) {
            _ = {
                parsed: url.toString(),
                href: u.href,
                path: u.hash.replace(hashTagStr, ''),
                fullPath: u.hash,
            };
        }
        else {
            let pathname = u.pathname;
            // when using pathname make sure to remove
            // base uri pathname for app in subdirectory
            if (pathname.indexOf(b.pathname) === 0) {
                pathname = pathname.substr(b.pathname.length);
            }
            _ = {
                parsed: url.toString(),
                href: u.href,
                path: leadingSlash(pathname),
                fullPath: leadingSlash(pathname + u.search + (u.hash || '')),
            };
        }
        console.log('[OWebRouter] parsed url ->', _);
        return _;
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
            let hLen = wHistory.length;
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
        let targetUrl = this.pathToURL(url), target = this.parseURL(targetUrl.href), _cd = this._current_dispatcher, cd;
        if (!sameOrigin(target.href)) {
            window.open(url);
            return this;
        }
        console.log('[OWebRouter] browsing to -> ', target.path, {
            state,
            push,
            target,
        });
        if (ignoreSameLocation && this._current_target.href === target.href) {
            console.log('[OWebRouter] ignore same location -> ', target.path);
            return this;
        }
        if (_cd && _cd.isActive()) {
            console.warn('[OWebRouter] browseTo called while dispatching -> ', _cd);
            _cd.cancel();
        }
        this._current_target = target;
        if (this._force_replace) {
            this._force_replace = false;
            this.replaceHistory(targetUrl.href, state);
        }
        else {
            push && this.addHistory(targetUrl.href, state);
        }
        this._current_dispatcher = cd = this.createDispatcher(target, state, ++this._dispatch_id);
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
        if (cd.id === this._dispatch_id && !cd.context.stopped()) {
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
        let ctx = this, found = [], active = false, routeContext = new OWebRouteContext(this, target, state), o;
        for (let i = 0; i < ctx._routes.length; i++) {
            let route = ctx._routes[i];
            if (route.is(target.path)) {
                found.push(route);
            }
        }
        o = {
            context: routeContext,
            id,
            found,
            isActive: () => active,
            cancel: function () {
                if (active) {
                    active = false;
                    console.warn(`[OWebRouter][dispatcher-${id}] cancel called!`, o);
                }
                else {
                    console.error(`[OWebRouter][dispatcher-${id}] cancel called when inactive.`, o);
                }
                return o;
            },
            dispatch: function () {
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
        let el = e.target, eventPath = e.path ||
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
        let svg = typeof el.href === 'object' &&
            el.href.constructor.name === 'SVGAnimatedString';
        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') ||
            el.getAttribute('rel') === 'external')
            return;
        // ensure non-hash for the same path
        let link = el.getAttribute('href');
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
        let orig = targetHref;
        if (targetHref.indexOf(this._baseUrl) === 0) {
            targetHref = targetHref.substr(this._baseUrl.length);
        }
        if (orig === targetHref)
            return;
        e.preventDefault();
        console.log('[OWebRouter][click] ->', el, orig, targetHref, wHistory.state);
        this.browseTo(orig);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXNDbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFDakIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTtJQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDMUIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxNQUFNO0lBQ2xDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ25CLEVBQ0QsU0FBUyxHQUFHLHFCQUFxQixFQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBUyxDQUFNO0lBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBUyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcs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QUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FDVix3QkFBd0IsRUFDeEIsRUFBRSxFQUNGLElBQUksRUFDSixVQUFVLEVBQ1YsUUFBUSxDQUFDLEtBQUssQ0FDZCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGggPSBzdHJpbmcgfCBSZWdFeHA7XG5leHBvcnQgdHlwZSB0Um91dGVQYXRoT3B0aW9ucyA9IHtcblx0W2tleTogc3RyaW5nXTogUmVnRXhwIHwga2V5b2YgdHlwZW9mIHRva2VuVHlwZXNSZWdNYXA7XG59O1xuZXhwb3J0IHR5cGUgdFJvdXRlVG9rZW5zTWFwID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZUFjdGlvbiA9IChjdHg6IE9XZWJSb3V0ZUNvbnRleHQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0Um91dGVJbmZvID0geyByZWc6IFJlZ0V4cCB8IG51bGw7IHRva2VuczogQXJyYXk8c3RyaW5nPiB9O1xudHlwZSBfdFJvdXRlU3RhdGVJdGVtID1cblx0fCBzdHJpbmdcblx0fCBudW1iZXJcblx0fCBib29sZWFuXG5cdHwgbnVsbFxuXHR8IHVuZGVmaW5lZFxuXHR8IERhdGVcblx0fCB0Um91dGVTdGF0ZU9iamVjdDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVN0YXRlSXRlbSA9IF90Um91dGVTdGF0ZUl0ZW0gfCBBcnJheTxfdFJvdXRlU3RhdGVJdGVtPjtcbmV4cG9ydCB0eXBlIHRSb3V0ZVN0YXRlT2JqZWN0ID0geyBba2V5OiBzdHJpbmddOiB0Um91dGVTdGF0ZUl0ZW0gfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBpUm91dGVEaXNwYXRjaGVyIHtcblx0cmVhZG9ubHkgaWQ6IG51bWJlcjtcblx0cmVhZG9ubHkgY29udGV4dDogT1dlYlJvdXRlQ29udGV4dDtcblx0cmVhZG9ubHkgZm91bmQ6IE9XZWJSb3V0ZVtdO1xuXG5cdGlzQWN0aXZlKCk6IGJvb2xlYW47XG5cblx0ZGlzcGF0Y2goKTogdGhpcztcblxuXHRjYW5jZWwoKTogdGhpcztcbn1cblxuY29uc3QgdG9rZW5UeXBlc1JlZ01hcCA9IHtcblx0XHRudW06IC9cXGQrLy5zb3VyY2UsXG5cdFx0YWxwaGE6IC9bYS16QS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtdSc6IC9bYS16XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbCc6IC9bQS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtJzogL1thLXpBLVowLTldKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0tbCc6IC9bYS16MC05XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtLXUnOiAvW0EtWjAtOV0rLy5zb3VyY2UsXG5cdFx0YW55OiAvW14vXSsvLnNvdXJjZSxcblx0fSxcblx0dG9rZW5fcmVnID0gLzooW2Etel1bYS16MC05X10qKS9pLFxuXHR3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24oZTogYW55KSB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdHJldHVybiBudWxsID09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG5cdH0sXG5cdHNhbWVQYXRoID0gZnVuY3Rpb24odXJsOiBVUkwpIHtcblx0XHRyZXR1cm4gdXJsLnBhdGhuYW1lID09PSB3TG9jLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IHdMb2Muc2VhcmNoO1xuXHR9LFxuXHRzYW1lT3JpZ2luID0gZnVuY3Rpb24oaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0bGV0IHVybCA9IG5ldyBVUkwoaHJlZi50b1N0cmluZygpLCB3TG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdHdMb2MucHJvdG9jb2wgPT09IHVybC5wcm90b2NvbCAmJlxuXHRcdFx0d0xvYy5ob3N0bmFtZSA9PT0gdXJsLmhvc3RuYW1lICYmXG5cdFx0XHR3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0KTtcblx0fSxcblx0ZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgJ1xcXFwkMScpO1xuXHR9LFxuXHRzdHJpbmdSZWcgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xuXHRcdHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZyhzdHIpKTtcblx0fSxcblx0bGVhZGluZ1NsYXNoID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0aWYgKCFwYXRoLmxlbmd0aCB8fCBwYXRoID09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPSAnLycgPyAnLycgKyBwYXRoIDogcGF0aDtcblx0fSxcblx0d3JhcFJlZyA9IChzdHI6IHN0cmluZywgY2FwdHVyZTogYm9vbGVhbiA9IGZhbHNlKSA9PlxuXHRcdGNhcHR1cmUgPyAnKCcgKyBzdHIgKyAnKScgOiAnKD86JyArIHN0ciArICcpJztcblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IHJlZzogUmVnRXhwIHwgbnVsbDtcblx0cHJpdmF0ZSB0b2tlbnM6IEFycmF5PHN0cmluZz47XG5cdHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uOiB0Um91dGVBY3Rpb247XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZSBDb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggVGhlIHJvdXRlIHBhdGggc3RyaW5nIG9yIHJlZ2V4cC5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHJvdXRlIG9wdGlvbnMuXG5cdCAqIEBwYXJhbSBhY3Rpb24gVGhlIHJvdXRlIGFjdGlvbiBmdW5jdGlvbi5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHBhdGg6IHN0cmluZyB8IFJlZ0V4cCxcblx0XHRvcHRpb25zOiB0Um91dGVQYXRoT3B0aW9ucyB8IEFycmF5PHN0cmluZz4sXG5cdFx0YWN0aW9uOiB0Um91dGVBY3Rpb25cblx0KSB7XG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGgudG9TdHJpbmcoKTtcblx0XHRcdHRoaXMucmVnID0gcGF0aDtcblx0XHRcdHRoaXMudG9rZW5zID0gVXRpbHMuaXNBcnJheShvcHRpb25zKSA/IG9wdGlvbnMgOiBbXTtcblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKHBhdGgpICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRvcHRpb25zID0gPHRSb3V0ZVBhdGhPcHRpb25zPihcblx0XHRcdFx0KFV0aWxzLmlzUGxhaW5PYmplY3Qob3B0aW9ucykgPyBvcHRpb25zIDoge30pXG5cdFx0XHQpO1xuXHRcdFx0bGV0IHAgPSBPV2ViUm91dGUucGFyc2VEeW5hbWljUGF0aChwYXRoLCBvcHRpb25zKTtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGg7XG5cdFx0XHR0aGlzLnJlZyA9IHAucmVnO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBwLnRva2Vucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViUm91dGVdIGludmFsaWQgcm91dGUgcGF0aCwgc3RyaW5nIG9yIFJlZ0V4cCByZXF1aXJlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgYWN0aW9uKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHRgW09XZWJSb3V0ZV0gaW52YWxpZCBhY3Rpb24gdHlwZSwgZ290IFwiJHt0eXBlb2YgYWN0aW9ufVwiIGluc3RlYWQgb2YgXCJmdW5jdGlvblwiLmBcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcm91dGUgaXMgZHluYW1pYyBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRpc0R5bmFtaWMoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVnICE9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyByb3V0ZSBhY3Rpb24uXG5cdCAqL1xuXHRnZXRBY3Rpb24oKTogdFJvdXRlQWN0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5hY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgZ2l2ZW4gcGF0aG5hbWUgbWF0Y2ggdGhpcyByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRpcyhwYXRobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMucmVnID8gdGhpcy5yZWcudGVzdChwYXRobmFtZSkgOiB0aGlzLnBhdGggPT09IHBhdGhuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gcGF0aG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRobmFtZVxuXHQgKi9cblx0cGFyc2UocGF0aG5hbWU6IHN0cmluZyk6IHRSb3V0ZVRva2Vuc01hcCB7XG5cdFx0aWYgKHRoaXMuaXNEeW5hbWljKCkpIHtcblx0XHRcdGxldCBmb3VuZHM6IGFueSA9IFN0cmluZyhwYXRobmFtZSkubWF0Y2godGhpcy5yZWcgYXMgUmVnRXhwKTtcblxuXHRcdFx0aWYgKGZvdW5kcykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy50b2tlbnMucmVkdWNlKFxuXHRcdFx0XHRcdChhY2M6IGFueSwga2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHtcblx0XHRcdFx0XHRcdGFjY1trZXldID0gZm91bmRzW2luZGV4ICsgMV07XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e31cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgZHluYW1pYyBwYXRoIGFuZCByZXR1cm5zIGFwcHJvcHJpYXRlIHJlZ2V4cCBhbmQgdG9rZW5zIGxpc3QuXG5cdCAqXG5cdCAqIGBgYGpzXG5cdCAqIGxldCBmb3JtYXQgPSBcInBhdGgvdG8vOmlkL2ZpbGUvOmluZGV4L25hbWUuOmZvcm1hdFwiO1xuXHQgKiBsZXQgb3B0aW9ucyA9IHtcblx0ICogXHRcdGlkOiBcIm51bVwiLFxuXHQgKiBcdFx0aW5kZXg6IFwiYWxwaGFcIixcblx0ICogXHRcdGZvcm1hdDpcdFwiYWxwaGEtbnVtXCJcblx0ICogfTtcblx0ICogbGV0IGluZm8gPSBwYXJzZUR5bmFtaWNQYXRoKGZvcm1hdCxvcHRpb25zKTtcblx0ICpcblx0ICogaW5mbyA9PT0ge1xuXHQgKiAgICAgcmVnOiBSZWdFeHAsXG5cdCAqICAgICB0b2tlbnM6IFtcImlkXCIsXCJpbmRleFwiLFwiZm9ybWF0XCJdXG5cdCAqIH07XG5cdCAqIGBgYFxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmb3JtYXQgc3RyaW5nLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcGF0aCBvcHRpb25zLlxuXHQgKi9cblx0c3RhdGljIHBhcnNlRHluYW1pY1BhdGgoXG5cdFx0cGF0aDogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IHRSb3V0ZVBhdGhPcHRpb25zXG5cdCk6IHRSb3V0ZUluZm8ge1xuXHRcdGxldCB0b2tlbnM6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRcdHJlZzogc3RyaW5nID0gJycsXG5cdFx0XHRfcGF0aDogc3RyaW5nID0gcGF0aCxcblx0XHRcdG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG5cdFx0d2hpbGUgKChtYXRjaCA9IHRva2VuX3JlZy5leGVjKF9wYXRoKSkgIT0gbnVsbCkge1xuXHRcdFx0bGV0IGZvdW5kOiBhbnkgPSBtYXRjaFswXSxcblx0XHRcdFx0dG9rZW46IGFueSA9IG1hdGNoWzFdLFxuXHRcdFx0XHRydWxlOiBhbnkgPSBvcHRpb25zW3Rva2VuXSB8fCAnYW55Jyxcblx0XHRcdFx0aGVhZDogc3RyaW5nID0gX3BhdGguc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG5cdFx0XHRpZiAoaGVhZC5sZW5ndGgpIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKGhlYWQpLnNvdXJjZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycgJiYgcnVsZSBpbiB0b2tlblR5cGVzUmVnTWFwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKCh0b2tlblR5cGVzUmVnTWFwIGFzIGFueSlbcnVsZV0sIHRydWUpO1xuXHRcdFx0fSBlbHNlIGlmIChydWxlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKHJ1bGUuc291cmNlLCB0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcIkludmFsaWQgcnVsZSBmb3IgdG9rZW4gJzpcIiArXG5cdFx0XHRcdFx0XHR0b2tlbiArXG5cdFx0XHRcdFx0XHRcIicgaW4gcGF0aCAnXCIgK1xuXHRcdFx0XHRcdFx0cGF0aCArXG5cdFx0XHRcdFx0XHRcIidcIlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHR0b2tlbnMucHVzaCh0b2tlbik7XG5cblx0XHRcdF9wYXRoID0gX3BhdGguc2xpY2UobWF0Y2guaW5kZXggKyBmb3VuZC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmICghcmVnLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cmVnOiBudWxsLFxuXHRcdFx0XHR0b2tlbnM6IHRva2Vucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKF9wYXRoLmxlbmd0aCkge1xuXHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKF9wYXRoKS5zb3VyY2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZWc6IG5ldyBSZWdFeHAoJ14nICsgcmVnICsgJyQnKSxcblx0XHRcdHRva2VuczogdG9rZW5zLFxuXHRcdH07XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IHRSb3V0ZVRva2Vuc01hcDtcblx0cHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IHRSb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZUNvbnRleHQgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZXJcblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJvdXRlcjogT1dlYlJvdXRlcixcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3Rcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdG9rZW5dO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBtYXAgb2YgYWxsIHRva2VucyBhbmQgdmFsdWVzLlxuXHQgKi9cblx0Z2V0VG9rZW5zKCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3Rva2Vucyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGF0aC5cblx0ICovXG5cdGdldFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0LnBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzdG9yZWQgdmFsdWUgaW4gaGlzdG9yeSBzdGF0ZSB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICovXG5cdGdldFN0YXRlSXRlbShrZXk6IHN0cmluZyk6IHRSb3V0ZVN0YXRlSXRlbSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlW2tleV07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGtleSBpbiBoaXN0b3J5IHN0YXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICogQHBhcmFtIHZhbHVlICB0aGUgc3RhdGUgdmFsdWVcblx0ICovXG5cdHNldFN0YXRlSXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHRSb3V0ZVN0YXRlSXRlbSk6IHRoaXMge1xuXHRcdHRoaXMuX3N0YXRlW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzZWFyY2ggcGFyYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXJhbSB0aGUgcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0ocGFyYW06IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiBuZXcgVVJMKHRoaXMuX3RhcmdldC5ocmVmKS5zZWFyY2hQYXJhbXMuZ2V0KHBhcmFtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgcm91dGUgZGlzcGF0Y2hlciBpcyBzdG9wcGVkLlxuXHQgKi9cblx0c3RvcHBlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RvcHBlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wIHRoZSByb3V0ZSBkaXNwYXRjaGVyLlxuXHQgKi9cblx0c3RvcCgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX3N0b3BwZWQpIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2lsbCBzdG9wLicpO1xuXHRcdFx0dGhpcy5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIHN0b3Bcblx0XHRcdHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCkhLmNhbmNlbCgpO1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3YXMgc3RvcHBlZCEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkISdcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmUgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdHNhdmUoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLnN0b3BwZWQoKSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBzYXZpbmcgc3RhdGUuLi4nKTtcblx0XHRcdHRoaXMuX3JvdXRlci5yZXBsYWNlSGlzdG9yeSh0aGlzLl90YXJnZXQuaHJlZiwgdGhpcy5fc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSB5b3Ugc2hvdWxkbid0IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC5cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhY3Rpb24gYXR0YWNoZWQgdG8gYSBnaXZlbiByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRhY3Rpb25SdW5uZXIocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3Rva2VucyA9IHJvdXRlLnBhcnNlKHRoaXMuX3RhcmdldC5wYXRoKTtcblxuXHRcdHJvdXRlLmdldEFjdGlvbigpKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VVcmw6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSBfaGFzaE1vZGU6IGJvb2xlYW47XG5cdHByaXZhdGUgX2N1cnJlbnRfdGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX25vdEZvdW5kOiB1bmRlZmluZWQgfCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoX2lkID0gMDtcblx0cHJpdmF0ZSBfY3VycmVudF9kaXNwYXRjaGVyPzogaVJvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VfcmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0YmFzZVVybDogc3RyaW5nLFxuXHRcdGhhc2hNb2RlOiBib29sZWFuID0gdHJ1ZSxcblx0XHRub3RGb3VuZDogKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkXG5cdCkge1xuXHRcdGxldCByID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX25vdEZvdW5kID0gbm90Rm91bmQ7XG5cdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lciA9IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHBvcHN0YXRlIC0+JywgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHJlYWR5IScpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB0aGUgcm91dGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlyc3RSdW4gZmlyc3QgcnVuIGZsYWdcblx0ICogQHBhcmFtIHRhcmdldCBpbml0aWFsIHRhcmdldCwgdXN1YWx5IHRoZSBlbnRyeSBwb2ludFxuXHQgKiBAcGFyYW0gc3RhdGUgaW5pdGlhbCBzdGF0ZVxuXHQgKi9cblx0c3RhcnQoXG5cdFx0Zmlyc3RSdW46IGJvb2xlYW4gPSB0cnVlLFxuXHRcdHRhcmdldDogc3RyaW5nID0gd0xvYy5ocmVmLFxuXHRcdHN0YXRlPzogdFJvdXRlU3RhdGVPYmplY3Rcblx0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIScpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSB3YXRjaGluZyByb3V0ZXMgLT4nLCB0aGlzLl9yb3V0ZXMpO1xuXHRcdFx0Zmlyc3RSdW4gJiYgdGhpcy5icm93c2VUbyh0YXJnZXQsIHN0YXRlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJSb3V0ZXJdIHJvdXRlciBhbHJlYWR5IHN0YXJ0ZWQhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcHMgdGhlIHJvdXRlci5cblx0ICovXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBzdG9wIHJvdXRpbmchJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIGNhbGxlZCB0aGUgY3VycmVudCBoaXN0b3J5IHdpbGwgYmUgcmVwbGFjZWQgYnkgdGhlIG5leHQgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdGZvcmNlTmV4dFJlcGxhY2UoKTogdGhpcyB7XG5cdFx0dGhpcy5fZm9yY2VfcmVwbGFjZSA9IHRydWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSB0YXJnZXQuXG5cdCAqL1xuXHRnZXRDdXJyZW50VGFyZ2V0KCk6IHRSb3V0ZVRhcmdldCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfdGFyZ2V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgZXZlbnQgZGlzcGF0Y2hlci5cblx0ICovXG5cdGdldEN1cnJlbnREaXNwYXRjaGVyKCk6IGlSb3V0ZURpc3BhdGNoZXIgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBjb250ZXh0LlxuXHQgKi9cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBubyByb3V0ZSBjb250ZXh0LicpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIuY29udGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIGdpdmVuIHVybC5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsIHRvIHBhcnNlXG5cdCAqL1xuXHRwYXJzZVVSTCh1cmw6IHN0cmluZyB8IFVSTCk6IHRSb3V0ZVRhcmdldCB7XG5cdFx0bGV0IGIgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0dSA9IG5ldyBVUkwodXJsLnRvU3RyaW5nKCksIGIpLFxuXHRcdFx0XzogdFJvdXRlVGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2hhc2hNb2RlKSB7XG5cdFx0XHRfID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiB1LmhyZWYsXG5cdFx0XHRcdHBhdGg6IHUuaGFzaC5yZXBsYWNlKGhhc2hUYWdTdHIsICcnKSxcblx0XHRcdFx0ZnVsbFBhdGg6IHUuaGFzaCxcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBwYXRobmFtZSA9IHUucGF0aG5hbWU7XG5cdFx0XHQvLyB3aGVuIHVzaW5nIHBhdGhuYW1lIG1ha2Ugc3VyZSB0byByZW1vdmVcblx0XHRcdC8vIGJhc2UgdXJpIHBhdGhuYW1lIGZvciBhcHAgaW4gc3ViZGlyZWN0b3J5XG5cdFx0XHRpZiAocGF0aG5hbWUuaW5kZXhPZihiLnBhdGhuYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRwYXRobmFtZSA9IHBhdGhuYW1lLnN1YnN0cihiLnBhdGhuYW1lLmxlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdF8gPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IHUuaHJlZixcblx0XHRcdFx0cGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChwYXRobmFtZSArIHUuc2VhcmNoICsgKHUuaGFzaCB8fCAnJykpLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHBhcnNlZCB1cmwgLT4nLCBfKTtcblxuXHRcdHJldHVybiBfO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyB1cmwgd2l0aCBhIGdpdmVuIHBhdGggYW5kIGJhc2UgdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aFxuXHQgKiBAcGFyYW0gYmFzZSB0aGUgYmFzZSB1cmxcblx0ICovXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlIGFjdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGggdG8gd2F0Y2hcblx0ICogQHBhcmFtIHJ1bGVzIHRoZSBwYXRoIHJ1bGVzXG5cdCAqIEBwYXJhbSBhY3Rpb24gdGhlIGFjdGlvbiB0byBydW5cblx0ICovXG5cdG9uKFxuXHRcdHBhdGg6IHRSb3V0ZVBhdGgsXG5cdFx0cnVsZXM6IHRSb3V0ZVBhdGhPcHRpb25zID0ge30sXG5cdFx0YWN0aW9uOiB0Um91dGVBY3Rpb25cblx0KTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR28gYmFjay5cblx0ICpcblx0ICogQHBhcmFtIGRpc3RhbmNlIHRoZSBkaXN0YW5jZSBpbiBoaXN0b3J5XG5cdCAqL1xuXHRnb0JhY2soZGlzdGFuY2U6IG51bWJlciA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2sgLT4gJywgZGlzdGFuY2UpO1xuXHRcdFx0bGV0IGhMZW4gPSB3SGlzdG9yeS5sZW5ndGg7XG5cdFx0XHRpZiAoaExlbiA+IDEpIHtcblx0XHRcdFx0aWYgKGhMZW4gPj0gZGlzdGFuY2UpIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtZGlzdGFuY2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1oTGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29yZG92YVxuXHRcdFx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJyb3dzZSB0byBhIHNwZWNpZmljIGxvY2F0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIG5leHQgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZVxuXHQgKiBAcGFyYW0gcHVzaCBzaG91bGQgd2UgcHVzaCBpbnRvIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZ25vcmVTYW1lTG9jYXRpb24gIGlnbm9yZSBicm93c2luZyBhZ2FpbiB0byBzYW1lIGxvY2F0aW9uXG5cdCAqL1xuXHRicm93c2VUbyhcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSxcblx0XHRwdXNoOiBib29sZWFuID0gdHJ1ZSxcblx0XHRpZ25vcmVTYW1lTG9jYXRpb246IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiB0aGlzIHtcblx0XHRsZXQgdGFyZ2V0VXJsID0gdGhpcy5wYXRoVG9VUkwodXJsKSxcblx0XHRcdHRhcmdldCA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0X2NkID0gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyLFxuXHRcdFx0Y2Q6IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBicm93c2luZyB0byAtPiAnLCB0YXJnZXQucGF0aCwge1xuXHRcdFx0c3RhdGUsXG5cdFx0XHRwdXNoLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdH0pO1xuXG5cdFx0aWYgKGlnbm9yZVNhbWVMb2NhdGlvbiAmJiB0aGlzLl9jdXJyZW50X3RhcmdldC5ocmVmID09PSB0YXJnZXQuaHJlZikge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbiAtPiAnLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoX2NkICYmIF9jZC5pc0FjdGl2ZSgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdCdbT1dlYlJvdXRlcl0gYnJvd3NlVG8gY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nIC0+ICcsXG5cdFx0XHRcdF9jZFxuXHRcdFx0KTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50X3RhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9mb3JjZV9yZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudF9kaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRzdGF0ZSxcblx0XHRcdCsrdGhpcy5fZGlzcGF0Y2hfaWRcblx0XHQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J1tPV2ViUm91dGVyXSBubyByb3V0ZSBmb3VuZCBmb3IgcGF0aCAtPicsXG5cdFx0XHRcdHRhcmdldC5wYXRoXG5cdFx0XHQpO1xuXHRcdFx0aWYgKHRoaXMuX25vdEZvdW5kKSB7XG5cdFx0XHRcdHRoaXMuX25vdEZvdW5kKHRhcmdldCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBub3RGb3VuZCBhY3Rpb24gaXMgbm90IGRlZmluZWQhJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoX2lkICYmICFjZC5jb250ZXh0LnN0b3BwZWQoKSkge1xuXHRcdFx0Y2QuY29udGV4dC5zYXZlKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN1Y2Nlc3MgLT4nLCB0YXJnZXQucGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRhZGRIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZTogc3RyaW5nID0gJydcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5wdXNoU3RhdGUoeyB1cmwsIGRhdGE6IHN0YXRlIH0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSBhZGRlZCcsIHN0YXRlLCB1cmwpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZSB0aGUgY3VycmVudCBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRyZXBsYWNlSGlzdG9yeShcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0dGl0bGU6IHN0cmluZyA9ICcnXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGNvbnNvbGUud2Fybihcblx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCAtPiAnLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGUsXG5cdFx0XHR1cmxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHJvdXRlIGV2ZW50IGRpc3BhdGNoZXJcblx0ICpcblx0ICogQHBhcmFtIHRhcmdldCB0aGUgcm91dGUgdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWQgdGhlIGRpc3BhdGNoZXIgaWRcblx0ICovXG5cdHByaXZhdGUgY3JlYXRlRGlzcGF0Y2hlcihcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0aWQ6IG51bWJlclxuXHQpOiBpUm91dGVEaXNwYXRjaGVyIHtcblx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNyZWF0aW9uLmApO1xuXG5cdFx0bGV0IGN0eCA9IHRoaXMsXG5cdFx0XHRmb3VuZDogT1dlYlJvdXRlW10gPSBbXSxcblx0XHRcdGFjdGl2ZSA9IGZhbHNlLFxuXHRcdFx0cm91dGVDb250ZXh0ID0gbmV3IE9XZWJSb3V0ZUNvbnRleHQodGhpcywgdGFyZ2V0LCBzdGF0ZSksXG5cdFx0XHRvOiBpUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjdHguX3JvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHJvdXRlID0gY3R4Ll9yb3V0ZXNbaV07XG5cblx0XHRcdGlmIChyb3V0ZS5pcyh0YXJnZXQucGF0aCkpIHtcblx0XHRcdFx0Zm91bmQucHVzaChyb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0byA9IHtcblx0XHRcdGNvbnRleHQ6IHJvdXRlQ29udGV4dCxcblx0XHRcdGlkLFxuXHRcdFx0Zm91bmQsXG5cdFx0XHRpc0FjdGl2ZTogKCkgPT4gYWN0aXZlLFxuXHRcdFx0Y2FuY2VsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCFgLFxuXHRcdFx0XHRcdFx0b1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCB3aGVuIGluYWN0aXZlLmAsXG5cdFx0XHRcdFx0XHRvXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0XHRkaXNwYXRjaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBzdGFydCAtPmAsIG8pO1xuXG5cdFx0XHRcdFx0bGV0IGogPSAtMTtcblx0XHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0d2hpbGUgKGFjdGl2ZSAmJiArK2ogPCBmb3VuZC5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHJvdXRlQ29udGV4dC5hY3Rpb25SdW5uZXIoZm91bmRbal0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGlzIGJ1c3khYCwgbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IHRydWU7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVW5yZWdpc3RlciBhbGwgRE9NIGV2ZW50cyBoYW5kbGVyLlxuXHQgKi9cblx0cHJpdmF0ZSB1bnJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IGZhbHNlO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdCdwb3BzdGF0ZScsXG5cdFx0XHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdFx0d0RvYy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBjbGljayBldmVudFxuXHQgKlxuXHQgKiBvbmNsaWNrIGZyb20gcGFnZS5qcyBsaWJyYXJ5OiBnaXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcblx0ICpcblx0ICogQHBhcmFtIGUgdGhlIGVudmVudCBvYmplY3Rcblx0ICovXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmUudGFyZ2V0LFxuXHRcdFx0ZXZlbnRQYXRoID1cblx0XHRcdFx0KGUgYXMgYW55KS5wYXRoIHx8XG5cdFx0XHRcdCgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLm5vZGVOYW1lKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGV2ZW50UGF0aFtpXS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSA8YW55PmVsLnBhcmVudE5vZGU7XG5cdFx0aWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGlmIGxpbmsgaXMgaW5zaWRlIGFuIHN2Z1xuXHRcdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdFx0bGV0IHN2ZyA9XG5cdFx0XHR0eXBlb2YgKGVsIGFzIGFueSkuaHJlZiA9PT0gJ29iamVjdCcgJiZcblx0XHRcdChlbCBhcyBhbnkpLmhyZWYuY29uc3RydWN0b3IubmFtZSA9PT0gJ1NWR0FuaW1hdGVkU3RyaW5nJztcblxuXHRcdC8vIElnbm9yZSBpZiB0YWcgaGFzXG5cdFx0Ly8gMS4gXCJkb3dubG9hZFwiIGF0dHJpYnV0ZVxuXHRcdC8vIDIuIHJlbD1cImV4dGVybmFsXCIgYXR0cmlidXRlXG5cdFx0aWYgKFxuXHRcdFx0ZWwuaGFzQXR0cmlidXRlKCdkb3dubG9hZCcpIHx8XG5cdFx0XHRlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG5cdFx0bGV0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRsZXQgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSByZXR1cm47XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSAtPicsXG5cdFx0XHRlbCxcblx0XHRcdG9yaWcsXG5cdFx0XHR0YXJnZXRIcmVmLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGVcblx0XHQpO1xuXHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdH1cbn1cbiJdfQ==