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
    constructor(baseUrl, hashMode = true) {
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
     * Attach a route
     *
     * @param handler the notfound handler
     */
    notFound(handler) {
        this._notFound = handler;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXNDbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFDakIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTtJQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDMUIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxNQUFNO0lBQ2xDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ25CLEVBQ0QsU0FBUyxHQUFHLHFCQUFxQixFQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBUyxDQUFNO0lBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBUyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcs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T0FBTztRQUVoQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FDVix3QkFBd0IsRUFDeEIsRUFBRSxFQUNGLElBQUksRUFDSixVQUFVLEVBQ1YsUUFBUSxDQUFDLEtBQUssQ0FDZCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVXRpbHMgZnJvbSAnLi91dGlscy9VdGlscyc7XG5cbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGggPSBzdHJpbmcgfCBSZWdFeHA7XG5leHBvcnQgdHlwZSB0Um91dGVQYXRoT3B0aW9ucyA9IHtcblx0W2tleTogc3RyaW5nXTogUmVnRXhwIHwga2V5b2YgdHlwZW9mIHRva2VuVHlwZXNSZWdNYXA7XG59O1xuZXhwb3J0IHR5cGUgdFJvdXRlVG9rZW5zTWFwID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZUFjdGlvbiA9IChjdHg6IE9XZWJSb3V0ZUNvbnRleHQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0Um91dGVJbmZvID0geyByZWc6IFJlZ0V4cCB8IG51bGw7IHRva2VuczogQXJyYXk8c3RyaW5nPiB9O1xudHlwZSBfdFJvdXRlU3RhdGVJdGVtID1cblx0fCBzdHJpbmdcblx0fCBudW1iZXJcblx0fCBib29sZWFuXG5cdHwgbnVsbFxuXHR8IHVuZGVmaW5lZFxuXHR8IERhdGVcblx0fCB0Um91dGVTdGF0ZU9iamVjdDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVN0YXRlSXRlbSA9IF90Um91dGVTdGF0ZUl0ZW0gfCBBcnJheTxfdFJvdXRlU3RhdGVJdGVtPjtcbmV4cG9ydCB0eXBlIHRSb3V0ZVN0YXRlT2JqZWN0ID0geyBba2V5OiBzdHJpbmddOiB0Um91dGVTdGF0ZUl0ZW0gfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHtcblx0cGFyc2VkOiBzdHJpbmc7XG5cdGhyZWY6IHN0cmluZztcblx0cGF0aDogc3RyaW5nO1xuXHRmdWxsUGF0aDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGludGVyZmFjZSBpUm91dGVEaXNwYXRjaGVyIHtcblx0cmVhZG9ubHkgaWQ6IG51bWJlcjtcblx0cmVhZG9ubHkgY29udGV4dDogT1dlYlJvdXRlQ29udGV4dDtcblx0cmVhZG9ubHkgZm91bmQ6IE9XZWJSb3V0ZVtdO1xuXG5cdGlzQWN0aXZlKCk6IGJvb2xlYW47XG5cblx0ZGlzcGF0Y2goKTogdGhpcztcblxuXHRjYW5jZWwoKTogdGhpcztcbn1cblxuY29uc3QgdG9rZW5UeXBlc1JlZ01hcCA9IHtcblx0XHRudW06IC9cXGQrLy5zb3VyY2UsXG5cdFx0YWxwaGE6IC9bYS16QS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtdSc6IC9bYS16XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbCc6IC9bQS1aXSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtJzogL1thLXpBLVowLTldKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0tbCc6IC9bYS16MC05XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtLXUnOiAvW0EtWjAtOV0rLy5zb3VyY2UsXG5cdFx0YW55OiAvW14vXSsvLnNvdXJjZSxcblx0fSxcblx0dG9rZW5fcmVnID0gLzooW2Etel1bYS16MC05X10qKS9pLFxuXHR3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJyxcblx0aGFzaFRhZ1N0ciA9ICcjISc7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24oZTogYW55KSB7XG5cdFx0ZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdHJldHVybiBudWxsID09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG5cdH0sXG5cdHNhbWVQYXRoID0gZnVuY3Rpb24odXJsOiBVUkwpIHtcblx0XHRyZXR1cm4gdXJsLnBhdGhuYW1lID09PSB3TG9jLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IHdMb2Muc2VhcmNoO1xuXHR9LFxuXHRzYW1lT3JpZ2luID0gZnVuY3Rpb24oaHJlZjogc3RyaW5nKSB7XG5cdFx0aWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0bGV0IHVybCA9IG5ldyBVUkwoaHJlZi50b1N0cmluZygpLCB3TG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdHdMb2MucHJvdG9jb2wgPT09IHVybC5wcm90b2NvbCAmJlxuXHRcdFx0d0xvYy5ob3N0bmFtZSA9PT0gdXJsLmhvc3RuYW1lICYmXG5cdFx0XHR3TG9jLnBvcnQgPT09IHVybC5wb3J0XG5cdFx0KTtcblx0fSxcblx0ZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgJ1xcXFwkMScpO1xuXHR9LFxuXHRzdHJpbmdSZWcgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xuXHRcdHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZyhzdHIpKTtcblx0fSxcblx0bGVhZGluZ1NsYXNoID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0aWYgKCFwYXRoLmxlbmd0aCB8fCBwYXRoID09ICcvJykge1xuXHRcdFx0cmV0dXJuICcvJztcblx0XHR9XG5cblx0XHRyZXR1cm4gcGF0aFswXSAhPSAnLycgPyAnLycgKyBwYXRoIDogcGF0aDtcblx0fSxcblx0d3JhcFJlZyA9IChzdHI6IHN0cmluZywgY2FwdHVyZTogYm9vbGVhbiA9IGZhbHNlKSA9PlxuXHRcdGNhcHR1cmUgPyAnKCcgKyBzdHIgKyAnKScgOiAnKD86JyArIHN0ciArICcpJztcblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IHJlZzogUmVnRXhwIHwgbnVsbDtcblx0cHJpdmF0ZSB0b2tlbnM6IEFycmF5PHN0cmluZz47XG5cdHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uOiB0Um91dGVBY3Rpb247XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZSBDb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggVGhlIHJvdXRlIHBhdGggc3RyaW5nIG9yIHJlZ2V4cC5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHJvdXRlIG9wdGlvbnMuXG5cdCAqIEBwYXJhbSBhY3Rpb24gVGhlIHJvdXRlIGFjdGlvbiBmdW5jdGlvbi5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHBhdGg6IHN0cmluZyB8IFJlZ0V4cCxcblx0XHRvcHRpb25zOiB0Um91dGVQYXRoT3B0aW9ucyB8IEFycmF5PHN0cmluZz4sXG5cdFx0YWN0aW9uOiB0Um91dGVBY3Rpb25cblx0KSB7XG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGgudG9TdHJpbmcoKTtcblx0XHRcdHRoaXMucmVnID0gcGF0aDtcblx0XHRcdHRoaXMudG9rZW5zID0gVXRpbHMuaXNBcnJheShvcHRpb25zKSA/IG9wdGlvbnMgOiBbXTtcblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKHBhdGgpICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRvcHRpb25zID0gPHRSb3V0ZVBhdGhPcHRpb25zPihcblx0XHRcdFx0KFV0aWxzLmlzUGxhaW5PYmplY3Qob3B0aW9ucykgPyBvcHRpb25zIDoge30pXG5cdFx0XHQpO1xuXHRcdFx0bGV0IHAgPSBPV2ViUm91dGUucGFyc2VEeW5hbWljUGF0aChwYXRoLCBvcHRpb25zKTtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGg7XG5cdFx0XHR0aGlzLnJlZyA9IHAucmVnO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBwLnRva2Vucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0J1tPV2ViUm91dGVdIGludmFsaWQgcm91dGUgcGF0aCwgc3RyaW5nIG9yIFJlZ0V4cCByZXF1aXJlZC4nXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGlmICgnZnVuY3Rpb24nICE9PSB0eXBlb2YgYWN0aW9uKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHRgW09XZWJSb3V0ZV0gaW52YWxpZCBhY3Rpb24gdHlwZSwgZ290IFwiJHt0eXBlb2YgYWN0aW9ufVwiIGluc3RlYWQgb2YgXCJmdW5jdGlvblwiLmBcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0cnVlIGlmIHRoaXMgcm91dGUgaXMgZHluYW1pYyBmYWxzZSBvdGhlcndpc2UuXG5cdCAqL1xuXHRpc0R5bmFtaWMoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVnICE9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyByb3V0ZSBhY3Rpb24uXG5cdCAqL1xuXHRnZXRBY3Rpb24oKTogdFJvdXRlQWN0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5hY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgZ2l2ZW4gcGF0aG5hbWUgbWF0Y2ggdGhpcyByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRpcyhwYXRobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMucmVnID8gdGhpcy5yZWcudGVzdChwYXRobmFtZSkgOiB0aGlzLnBhdGggPT09IHBhdGhuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gcGF0aG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRobmFtZVxuXHQgKi9cblx0cGFyc2UocGF0aG5hbWU6IHN0cmluZyk6IHRSb3V0ZVRva2Vuc01hcCB7XG5cdFx0aWYgKHRoaXMuaXNEeW5hbWljKCkpIHtcblx0XHRcdGxldCBmb3VuZHM6IGFueSA9IFN0cmluZyhwYXRobmFtZSkubWF0Y2godGhpcy5yZWcgYXMgUmVnRXhwKTtcblxuXHRcdFx0aWYgKGZvdW5kcykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy50b2tlbnMucmVkdWNlKFxuXHRcdFx0XHRcdChhY2M6IGFueSwga2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHtcblx0XHRcdFx0XHRcdGFjY1trZXldID0gZm91bmRzW2luZGV4ICsgMV07XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e31cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgZHluYW1pYyBwYXRoIGFuZCByZXR1cm5zIGFwcHJvcHJpYXRlIHJlZ2V4cCBhbmQgdG9rZW5zIGxpc3QuXG5cdCAqXG5cdCAqIGBgYGpzXG5cdCAqIGxldCBmb3JtYXQgPSBcInBhdGgvdG8vOmlkL2ZpbGUvOmluZGV4L25hbWUuOmZvcm1hdFwiO1xuXHQgKiBsZXQgb3B0aW9ucyA9IHtcblx0ICogXHRcdGlkOiBcIm51bVwiLFxuXHQgKiBcdFx0aW5kZXg6IFwiYWxwaGFcIixcblx0ICogXHRcdGZvcm1hdDpcdFwiYWxwaGEtbnVtXCJcblx0ICogfTtcblx0ICogbGV0IGluZm8gPSBwYXJzZUR5bmFtaWNQYXRoKGZvcm1hdCxvcHRpb25zKTtcblx0ICpcblx0ICogaW5mbyA9PT0ge1xuXHQgKiAgICAgcmVnOiBSZWdFeHAsXG5cdCAqICAgICB0b2tlbnM6IFtcImlkXCIsXCJpbmRleFwiLFwiZm9ybWF0XCJdXG5cdCAqIH07XG5cdCAqIGBgYFxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmb3JtYXQgc3RyaW5nLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcGF0aCBvcHRpb25zLlxuXHQgKi9cblx0c3RhdGljIHBhcnNlRHluYW1pY1BhdGgoXG5cdFx0cGF0aDogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IHRSb3V0ZVBhdGhPcHRpb25zXG5cdCk6IHRSb3V0ZUluZm8ge1xuXHRcdGxldCB0b2tlbnM6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRcdHJlZzogc3RyaW5nID0gJycsXG5cdFx0XHRfcGF0aDogc3RyaW5nID0gcGF0aCxcblx0XHRcdG1hdGNoOiBSZWdFeHBFeGVjQXJyYXkgfCBudWxsO1xuXG5cdFx0d2hpbGUgKChtYXRjaCA9IHRva2VuX3JlZy5leGVjKF9wYXRoKSkgIT0gbnVsbCkge1xuXHRcdFx0bGV0IGZvdW5kOiBhbnkgPSBtYXRjaFswXSxcblx0XHRcdFx0dG9rZW46IGFueSA9IG1hdGNoWzFdLFxuXHRcdFx0XHRydWxlOiBhbnkgPSBvcHRpb25zW3Rva2VuXSB8fCAnYW55Jyxcblx0XHRcdFx0aGVhZDogc3RyaW5nID0gX3BhdGguc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG5cdFx0XHRpZiAoaGVhZC5sZW5ndGgpIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKGhlYWQpLnNvdXJjZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gJ3N0cmluZycgJiYgcnVsZSBpbiB0b2tlblR5cGVzUmVnTWFwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKCh0b2tlblR5cGVzUmVnTWFwIGFzIGFueSlbcnVsZV0sIHRydWUpO1xuXHRcdFx0fSBlbHNlIGlmIChydWxlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKHJ1bGUuc291cmNlLCB0cnVlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcIkludmFsaWQgcnVsZSBmb3IgdG9rZW4gJzpcIiArXG5cdFx0XHRcdFx0XHR0b2tlbiArXG5cdFx0XHRcdFx0XHRcIicgaW4gcGF0aCAnXCIgK1xuXHRcdFx0XHRcdFx0cGF0aCArXG5cdFx0XHRcdFx0XHRcIidcIlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHR0b2tlbnMucHVzaCh0b2tlbik7XG5cblx0XHRcdF9wYXRoID0gX3BhdGguc2xpY2UobWF0Y2guaW5kZXggKyBmb3VuZC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmICghcmVnLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cmVnOiBudWxsLFxuXHRcdFx0XHR0b2tlbnM6IHRva2Vucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKF9wYXRoLmxlbmd0aCkge1xuXHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKF9wYXRoKS5zb3VyY2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZWc6IG5ldyBSZWdFeHAoJ14nICsgcmVnICsgJyQnKSxcblx0XHRcdHRva2VuczogdG9rZW5zLFxuXHRcdH07XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IHRSb3V0ZVRva2Vuc01hcDtcblx0cHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IHRSb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZUNvbnRleHQgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZXJcblx0ICogQHBhcmFtIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGVcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHJvdXRlcjogT1dlYlJvdXRlcixcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3Rcblx0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlID0gc3RhdGUgfHwge307XG5cdFx0dGhpcy5fcm91dGVyID0gcm91dGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgdG9rZW4gdmFsdWVcblx0ICpcblx0ICogQHBhcmFtIHRva2VuIFRoZSB0b2tlbi5cblx0ICovXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdG9rZW5dO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBtYXAgb2YgYWxsIHRva2VucyBhbmQgdmFsdWVzLlxuXHQgKi9cblx0Z2V0VG9rZW5zKCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3Rva2Vucyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcGF0aC5cblx0ICovXG5cdGdldFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0LnBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzdG9yZWQgdmFsdWUgaW4gaGlzdG9yeSBzdGF0ZSB3aXRoIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICovXG5cdGdldFN0YXRlSXRlbShrZXk6IHN0cmluZyk6IHRSb3V0ZVN0YXRlSXRlbSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlW2tleV07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyBhIGtleSBpbiBoaXN0b3J5IHN0YXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0ga2V5IHRoZSBzdGF0ZSBrZXlcblx0ICogQHBhcmFtIHZhbHVlICB0aGUgc3RhdGUgdmFsdWVcblx0ICovXG5cdHNldFN0YXRlSXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHRSb3V0ZVN0YXRlSXRlbSk6IHRoaXMge1xuXHRcdHRoaXMuX3N0YXRlW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcy5zYXZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBzZWFyY2ggcGFyYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXJhbSB0aGUgcGFyYW0gbmFtZVxuXHQgKi9cblx0Z2V0U2VhcmNoUGFyYW0ocGFyYW06IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRcdHJldHVybiBuZXcgVVJMKHRoaXMuX3RhcmdldC5ocmVmKS5zZWFyY2hQYXJhbXMuZ2V0KHBhcmFtKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiB0aGUgcm91dGUgZGlzcGF0Y2hlciBpcyBzdG9wcGVkLlxuXHQgKi9cblx0c3RvcHBlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RvcHBlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wIHRoZSByb3V0ZSBkaXNwYXRjaGVyLlxuXHQgKi9cblx0c3RvcCgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX3N0b3BwZWQpIHtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2lsbCBzdG9wLicpO1xuXHRcdFx0dGhpcy5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIHN0b3Bcblx0XHRcdHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCkhLmNhbmNlbCgpO1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3YXMgc3RvcHBlZCEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkISdcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNhdmUgaGlzdG9yeSBzdGF0ZS5cblx0ICovXG5cdHNhdmUoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLnN0b3BwZWQoKSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBzYXZpbmcgc3RhdGUuLi4nKTtcblx0XHRcdHRoaXMuX3JvdXRlci5yZXBsYWNlSGlzdG9yeSh0aGlzLl90YXJnZXQuaHJlZiwgdGhpcy5fc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSB5b3Ugc2hvdWxkbid0IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC5cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUnVucyBhY3Rpb24gYXR0YWNoZWQgdG8gYSBnaXZlbiByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlXG5cdCAqL1xuXHRhY3Rpb25SdW5uZXIocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3Rva2VucyA9IHJvdXRlLnBhcnNlKHRoaXMuX3RhcmdldC5wYXRoKTtcblxuXHRcdHJvdXRlLmdldEFjdGlvbigpKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VVcmw6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSBfaGFzaE1vZGU6IGJvb2xlYW47XG5cdHByaXZhdGUgX2N1cnJlbnRfdGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiAnJyxcblx0XHRocmVmOiAnJyxcblx0XHRwYXRoOiAnJyxcblx0XHRmdWxsUGF0aDogJycsXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gPSBbXTtcblx0cHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX25vdEZvdW5kOiB1bmRlZmluZWQgfCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoX2lkID0gMDtcblx0cHJpdmF0ZSBfY3VycmVudF9kaXNwYXRjaGVyPzogaVJvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VfcmVwbGFjZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVyIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmFzZVVybCB0aGUgYmFzZSB1cmxcblx0ICogQHBhcmFtIGhhc2hNb2RlIHdlYXRoZXIgdG8gdXNlIGhhc2ggbW9kZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoYmFzZVVybDogc3RyaW5nLCBoYXNoTW9kZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRsZXQgciA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgPSBoYXNoTW9kZTtcblx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyID0gKGU6IFBvcFN0YXRlRXZlbnQpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcG9wc3RhdGUgLT4nLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRpZiAoZS5zdGF0ZSkge1xuXHRcdFx0XHRyLmJyb3dzZVRvKGUuc3RhdGUudXJsLCBlLnN0YXRlLmRhdGEsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8od0xvYy5ocmVmLCB1bmRlZmluZWQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcblx0XHRcdHIuX29uQ2xpY2soZSk7XG5cdFx0fTtcblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogU3RhcnRzIHRoZSByb3V0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaXJzdFJ1biBmaXJzdCBydW4gZmxhZ1xuXHQgKiBAcGFyYW0gdGFyZ2V0IGluaXRpYWwgdGFyZ2V0LCB1c3VhbHkgdGhlIGVudHJ5IHBvaW50XG5cdCAqIEBwYXJhbSBzdGF0ZSBpbml0aWFsIHN0YXRlXG5cdCAqL1xuXHRzdGFydChcblx0XHRmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsXG5cdFx0dGFyZ2V0OiBzdHJpbmcgPSB3TG9jLmhyZWYsXG5cdFx0c3RhdGU/OiB0Um91dGVTdGF0ZU9iamVjdFxuXHQpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN0YXJ0IHJvdXRpbmchJyk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcyAtPicsIHRoaXMuX3JvdXRlcyk7XG5cdFx0XHRmaXJzdFJ1biAmJiB0aGlzLmJyb3dzZVRvKHRhcmdldCwgc3RhdGUsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYlJvdXRlcl0gcm91dGVyIGFscmVhZHkgc3RhcnRlZCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wcyB0aGUgcm91dGVyLlxuXHQgKi9cblx0c3RvcFJvdXRpbmcoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy51bnJlZ2lzdGVyKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYlJvdXRlcl0geW91IHNob3VsZCBzdGFydCByb3V0aW5nIGZpcnN0IScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZW4gY2FsbGVkIHRoZSBjdXJyZW50IGhpc3Rvcnkgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgbmV4dCBoaXN0b3J5IHN0YXRlLlxuXHQgKi9cblx0Zm9yY2VOZXh0UmVwbGFjZSgpOiB0aGlzIHtcblx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF90YXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBldmVudCBkaXNwYXRjaGVyLlxuXHQgKi9cblx0Z2V0Q3VycmVudERpc3BhdGNoZXIoKTogaVJvdXRlRGlzcGF0Y2hlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRSb3V0ZUNvbnRleHQoKTogT1dlYlJvdXRlQ29udGV4dCB7XG5cdFx0aWYgKCF0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmwgdG8gcGFyc2Vcblx0ICovXG5cdHBhcnNlVVJMKHVybDogc3RyaW5nIHwgVVJMKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRsZXQgYiA9IG5ldyBVUkwodGhpcy5fYmFzZVVybCksXG5cdFx0XHR1ID0gbmV3IFVSTCh1cmwudG9TdHJpbmcoKSwgYiksXG5cdFx0XHRfOiB0Um91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdF8gPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IHUuaHJlZixcblx0XHRcdFx0cGF0aDogdS5oYXNoLnJlcGxhY2UoaGFzaFRhZ1N0ciwgJycpLFxuXHRcdFx0XHRmdWxsUGF0aDogdS5oYXNoLFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IHBhdGhuYW1lID0gdS5wYXRobmFtZTtcblx0XHRcdC8vIHdoZW4gdXNpbmcgcGF0aG5hbWUgbWFrZSBzdXJlIHRvIHJlbW92ZVxuXHRcdFx0Ly8gYmFzZSB1cmkgcGF0aG5hbWUgZm9yIGFwcCBpbiBzdWJkaXJlY3Rvcnlcblx0XHRcdGlmIChwYXRobmFtZS5pbmRleE9mKGIucGF0aG5hbWUpID09PSAwKSB7XG5cdFx0XHRcdHBhdGhuYW1lID0gcGF0aG5hbWUuc3Vic3RyKGIucGF0aG5hbWUubGVuZ3RoKTtcblx0XHRcdH1cblxuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogdS5ocmVmLFxuXHRcdFx0XHRwYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lICsgdS5zZWFyY2ggKyAodS5oYXNoIHx8ICcnKSksXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCAtPicsIF8pO1xuXG5cdFx0cmV0dXJuIF87XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIHVybCB3aXRoIGEgZ2l2ZW4gcGF0aCBhbmQgYmFzZSB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBiYXNlIHRoZSBiYXNlIHVybFxuXHQgKi9cblx0cGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IFVSTCB7XG5cdFx0YmFzZSA9IGJhc2UgJiYgYmFzZS5sZW5ndGggPyBiYXNlIDogdGhpcy5fYmFzZVVybDtcblxuXHRcdGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QocGF0aCkpIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdHBhdGggPSB0aGlzLl9oYXNoTW9kZSA/IGhhc2hUYWdTdHIgKyBsZWFkaW5nU2xhc2gocGF0aCkgOiBwYXRoO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQXR0YWNoIGEgcm91dGUgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCB0byB3YXRjaFxuXHQgKiBAcGFyYW0gcnVsZXMgdGhlIHBhdGggcnVsZXNcblx0ICogQHBhcmFtIGFjdGlvbiB0aGUgYWN0aW9uIHRvIHJ1blxuXHQgKi9cblx0b24oXG5cdFx0cGF0aDogdFJvdXRlUGF0aCxcblx0XHRydWxlczogdFJvdXRlUGF0aE9wdGlvbnMgPSB7fSxcblx0XHRhY3Rpb246IHRSb3V0ZUFjdGlvblxuXHQpOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChuZXcgT1dlYlJvdXRlKHBhdGgsIHJ1bGVzLCBhY3Rpb24pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBdHRhY2ggYSByb3V0ZVxuXHQgKlxuXHQgKiBAcGFyYW0gaGFuZGxlciB0aGUgbm90Zm91bmQgaGFuZGxlclxuXHQgKi9cblx0bm90Rm91bmQoaGFuZGxlcjogKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0dGhpcy5fbm90Rm91bmQgPSBoYW5kbGVyO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdvIGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSBkaXN0YW5jZSB0aGUgZGlzdGFuY2UgaW4gaGlzdG9yeVxuXHQgKi9cblx0Z29CYWNrKGRpc3RhbmNlOiBudW1iZXIgPSAxKTogdGhpcyB7XG5cdFx0aWYgKGRpc3RhbmNlID4gMCkge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBnb2luZyBiYWNrIC0+ICcsIGRpc3RhbmNlKTtcblx0XHRcdGxldCBoTGVuID0gd0hpc3RvcnkubGVuZ3RoO1xuXHRcdFx0aWYgKGhMZW4gPiAxKSB7XG5cdFx0XHRcdGlmIChoTGVuID49IGRpc3RhbmNlKSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWRpc3RhbmNlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtaExlbik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGNvcmRvdmFcblx0XHRcdFx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgKHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHApIHtcblx0XHRcdFx0XHQod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcC5leGl0QXBwKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBCcm93c2UgdG8gYSBzcGVjaWZpYyBsb2NhdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSBuZXh0IHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGluaXRpYWwgc3RhdGVcblx0ICogQHBhcmFtIHB1c2ggc2hvdWxkIHdlIHB1c2ggaW50byB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWdub3JlU2FtZUxvY2F0aW9uICBpZ25vcmUgYnJvd3NpbmcgYWdhaW4gdG8gc2FtZSBsb2NhdGlvblxuXHQgKi9cblx0YnJvd3NlVG8oXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30sXG5cdFx0cHVzaDogYm9vbGVhbiA9IHRydWUsXG5cdFx0aWdub3JlU2FtZUxvY2F0aW9uOiBib29sZWFuID0gZmFsc2Vcblx0KTogdGhpcyB7XG5cdFx0bGV0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHR0YXJnZXQgPSB0aGlzLnBhcnNlVVJMKHRhcmdldFVybC5ocmVmKSxcblx0XHRcdF9jZCA9IHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlcixcblx0XHRcdGNkOiBpUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0aWYgKCFzYW1lT3JpZ2luKHRhcmdldC5ocmVmKSkge1xuXHRcdFx0d2luZG93Lm9wZW4odXJsKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gYnJvd3NpbmcgdG8gLT4gJywgdGFyZ2V0LnBhdGgsIHtcblx0XHRcdHN0YXRlLFxuXHRcdFx0cHVzaCxcblx0XHRcdHRhcmdldCxcblx0XHR9KTtcblxuXHRcdGlmIChpZ25vcmVTYW1lTG9jYXRpb24gJiYgdGhpcy5fY3VycmVudF90YXJnZXQuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gaWdub3JlIHNhbWUgbG9jYXRpb24gLT4gJywgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiBfY2QuaXNBY3RpdmUoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZyAtPiAnLFxuXHRcdFx0XHRfY2Rcblx0XHRcdCk7XG5cdFx0XHRfY2QuY2FuY2VsKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudF90YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHRpZiAodGhpcy5fZm9yY2VfcmVwbGFjZSkge1xuXHRcdFx0dGhpcy5fZm9yY2VfcmVwbGFjZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5yZXBsYWNlSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwdXNoICYmIHRoaXMuYWRkSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlciA9IGNkID0gdGhpcy5jcmVhdGVEaXNwYXRjaGVyKFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0c3RhdGUsXG5cdFx0XHQrK3RoaXMuX2Rpc3BhdGNoX2lkXG5cdFx0KTtcblxuXHRcdGlmICghY2QuZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgZm91bmQgZm9yIHBhdGggLT4nLFxuXHRcdFx0XHR0YXJnZXQucGF0aFxuXHRcdFx0KTtcblx0XHRcdGlmICh0aGlzLl9ub3RGb3VuZCkge1xuXHRcdFx0XHR0aGlzLl9ub3RGb3VuZCh0YXJnZXQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdbT1dlYlJvdXRlcl0gbm90Rm91bmQgYWN0aW9uIGlzIG5vdCBkZWZpbmVkIScpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjZC5kaXNwYXRjaCgpO1xuXG5cdFx0aWYgKGNkLmlkID09PSB0aGlzLl9kaXNwYXRjaF9pZCAmJiAhY2QuY29udGV4dC5zdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBzdWNjZXNzIC0+JywgdGFyZ2V0LnBhdGgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0YWRkSGlzdG9yeShcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0dGl0bGU6IHN0cmluZyA9ICcnXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucHVzaFN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGNvbnNvbGUud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWQnLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGhlIGN1cnJlbnQgaGlzdG9yeS5cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gdGl0bGUgdGhlIHdpbmRvdyB0aXRsZVxuXHQgKi9cblx0cmVwbGFjZUhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlOiBzdHJpbmcgPSAnJ1xuXHQpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHQnW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgcmVwbGFjZWQgLT4gJyxcblx0XHRcdHdIaXN0b3J5LnN0YXRlLFxuXHRcdFx0dXJsXG5cdFx0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSByb3V0ZSBldmVudCBkaXNwYXRjaGVyXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgdGhlIHJvdXRlIHRhcmdldFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlkIHRoZSBkaXNwYXRjaGVyIGlkXG5cdCAqL1xuXHRwcml2YXRlIGNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0dGFyZ2V0OiB0Um91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdGlkOiBudW1iZXJcblx0KTogaVJvdXRlRGlzcGF0Y2hlciB7XG5cdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjcmVhdGlvbi5gKTtcblxuXHRcdGxldCBjdHggPSB0aGlzLFxuXHRcdFx0Zm91bmQ6IE9XZWJSb3V0ZVtdID0gW10sXG5cdFx0XHRhY3RpdmUgPSBmYWxzZSxcblx0XHRcdHJvdXRlQ29udGV4dCA9IG5ldyBPV2ViUm91dGVDb250ZXh0KHRoaXMsIHRhcmdldCwgc3RhdGUpLFxuXHRcdFx0bzogaVJvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY3R4Ll9yb3V0ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCByb3V0ZSA9IGN0eC5fcm91dGVzW2ldO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG8gPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmIChhY3RpdmUpIHtcblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdFx0XHRgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQhYCxcblx0XHRcdFx0XHRcdG9cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXG5cdFx0XHRcdFx0XHRgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQgd2hlbiBpbmFjdGl2ZS5gLFxuXHRcdFx0XHRcdFx0b1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdFx0ZGlzcGF0Y2g6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gc3RhcnQgLT5gLCBvKTtcblxuXHRcdFx0XHRcdGxldCBqID0gLTE7XG5cdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdHdoaWxlIChhY3RpdmUgJiYgKytqIDwgZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRyb3V0ZUNvbnRleHQuYWN0aW9uUnVubmVyKGZvdW5kW2pdKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG87XG5cdFx0XHR9LFxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWdpc3RlciBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVucmVnaXN0ZXIgYWxsIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHQncG9wc3RhdGUnLFxuXHRcdFx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0bGlua0NsaWNrRXZlbnQsXG5cdFx0XHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgY2xpY2sgZXZlbnRcblx0ICpcblx0ICogb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdCAqXG5cdCAqIEBwYXJhbSBlIHRoZSBlbnZlbnQgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IDxIVE1MRWxlbWVudD5lLnRhcmdldCxcblx0XHRcdGV2ZW50UGF0aCA9XG5cdFx0XHRcdChlIGFzIGFueSkucGF0aCB8fFxuXHRcdFx0XHQoKGUgYXMgYW55KS5jb21wb3NlZFBhdGggPyAoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCgpIDogbnVsbCk7XG5cblx0XHRpZiAoZXZlbnRQYXRoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50UGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ub2RlTmFtZSkgY29udGludWU7XG5cdFx0XHRcdGlmIChldmVudFBhdGhbaV0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gJ0EnKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0uaHJlZikgY29udGludWU7XG5cblx0XHRcdFx0ZWwgPSBldmVudFBhdGhbaV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBjb250aW51ZSBlbnN1cmUgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIGVsID0gPGFueT5lbC5wYXJlbnROb2RlO1xuXHRcdGlmICghZWwgfHwgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBpZiBsaW5rIGlzIGluc2lkZSBhbiBzdmdcblx0XHQvLyBpbiB0aGlzIGNhc2UsIGJvdGggaHJlZiBhbmQgdGFyZ2V0IGFyZSBhbHdheXMgaW5zaWRlIGFuIG9iamVjdFxuXHRcdGxldCBzdmcgPVxuXHRcdFx0dHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09ICdvYmplY3QnICYmXG5cdFx0XHQoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTVkdBbmltYXRlZFN0cmluZyc7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChcblx0XHRcdGVsLmhhc0F0dHJpYnV0ZSgnZG93bmxvYWQnKSB8fFxuXHRcdFx0ZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJ1xuXHRcdClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGxldCBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cdFx0aWYgKFxuXHRcdFx0IXRoaXMuX2hhc2hNb2RlICYmXG5cdFx0XHRzYW1lUGF0aChlbCBhcyBhbnkpICYmXG5cdFx0XHQoKGVsIGFzIGFueSkuaGFzaCB8fCAnIycgPT09IGxpbmspXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayB0YXJnZXRcblx0XHQvLyBzdmcgdGFyZ2V0IGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdC8vIHgtb3JpZ2luXG5cdFx0Ly8gbm90ZTogc3ZnIGxpbmtzIHRoYXQgYXJlIG5vdCByZWxhdGl2ZSBkb24ndCBjYWxsIGNsaWNrIGV2ZW50cyAoYW5kIHNraXAgcGFnZS5qcylcblx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0aWYgKCFzdmcgJiYgIXNhbWVPcmlnaW4oKGVsIGFzIGFueSkuaHJlZikpIHJldHVybjtcblxuXHRcdC8vIHJlYnVpbGQgcGF0aFxuXHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0Ly8gQWxzbywgc3ZnIGhyZWYgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGxldCB0YXJnZXRIcmVmID0gc3ZnID8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsIDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuXHRcdC8qXG5cdFx0IGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdCBpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHQgdGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHQgfVxuXHRcdCAqL1xuXG5cdFx0bGV0IG9yaWcgPSB0YXJnZXRIcmVmO1xuXG5cdFx0aWYgKHRhcmdldEhyZWYuaW5kZXhPZih0aGlzLl9iYXNlVXJsKSA9PT0gMCkge1xuXHRcdFx0dGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYuc3Vic3RyKHRoaXMuX2Jhc2VVcmwubGVuZ3RoKTtcblx0XHR9XG5cblx0XHRpZiAob3JpZyA9PT0gdGFyZ2V0SHJlZikgcmV0dXJuO1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0J1tPV2ViUm91dGVyXVtjbGlja10gLT4nLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlXG5cdFx0KTtcblx0XHR0aGlzLmJyb3dzZVRvKG9yaWcpO1xuXHR9XG59XG4iXX0=