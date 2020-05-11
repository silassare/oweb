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
     * @param notFound called when a route is not found
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
        if (orig === targetHref) {
            if (el.getAttribute('target') === '_blank') {
                Utils.safeOpen(orig);
                Utils.preventDefault(e);
            }
            return;
        }
        Utils.preventDefault(e);
        console.log('[OWebRouter][click] ->', el, orig, targetHref, wHistory.state);
        this.browseTo(orig);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXNDbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFDakIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTtJQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDMUIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxNQUFNO0lBQ2xDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ25CLEVBQ0QsU0FBUyxHQUFHLHFCQUFxQixFQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBUyxDQUFNO0lBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBUyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcs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QUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEVBQUU7Z0JBQzNDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JCLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEI7WUFFRCxPQUFPO1NBQ1A7UUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXhCLE9BQU8sQ0FBQyxHQUFHLENBQ1Ysd0JBQXdCLEVBQ3hCLEVBQUUsRUFDRixJQUFJLEVBQ0osVUFBVSxFQUNWLFFBQVEsQ0FBQyxLQUFLLENBQ2QsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckIsQ0FBQztDQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFV0aWxzIGZyb20gJy4vdXRpbHMvVXRpbHMnO1xuXG5leHBvcnQgdHlwZSB0Um91dGVQYXRoID0gc3RyaW5nIHwgUmVnRXhwO1xuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aE9wdGlvbnMgPSB7XG5cdFtrZXk6IHN0cmluZ106IFJlZ0V4cCB8IGtleW9mIHR5cGVvZiB0b2tlblR5cGVzUmVnTWFwO1xufTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRva2Vuc01hcCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5leHBvcnQgdHlwZSB0Um91dGVBY3Rpb24gPSAoY3R4OiBPV2ViUm91dGVDb250ZXh0KSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgdFJvdXRlSW5mbyA9IHsgcmVnOiBSZWdFeHAgfCBudWxsOyB0b2tlbnM6IEFycmF5PHN0cmluZz4gfTtcbnR5cGUgX3RSb3V0ZVN0YXRlSXRlbSA9XG5cdHwgc3RyaW5nXG5cdHwgbnVtYmVyXG5cdHwgYm9vbGVhblxuXHR8IG51bGxcblx0fCB1bmRlZmluZWRcblx0fCBEYXRlXG5cdHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgQXJyYXk8X3RSb3V0ZVN0YXRlSXRlbT47XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZU9iamVjdCA9IHsgW2tleTogc3RyaW5nXTogdFJvdXRlU3RhdGVJdGVtIH07XG5leHBvcnQgdHlwZSB0Um91dGVUYXJnZXQgPSB7XG5cdHBhcnNlZDogc3RyaW5nO1xuXHRocmVmOiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcblx0ZnVsbFBhdGg6IHN0cmluZztcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVJvdXRlRGlzcGF0Y2hlciB7XG5cdHJlYWRvbmx5IGlkOiBudW1iZXI7XG5cdHJlYWRvbmx5IGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQ7XG5cdHJlYWRvbmx5IGZvdW5kOiBPV2ViUm91dGVbXTtcblxuXHRpc0FjdGl2ZSgpOiBib29sZWFuO1xuXG5cdGRpc3BhdGNoKCk6IHRoaXM7XG5cblx0Y2FuY2VsKCk6IHRoaXM7XG59XG5cbmNvbnN0IHRva2VuVHlwZXNSZWdNYXAgPSB7XG5cdFx0bnVtOiAvXFxkKy8uc291cmNlLFxuXHRcdGFscGhhOiAvW2EtekEtWl0rLy5zb3VyY2UsXG5cdFx0J2FscGhhLXUnOiAvW2Etel0rLy5zb3VyY2UsXG5cdFx0J2FscGhhLWwnOiAvW0EtWl0rLy5zb3VyY2UsXG5cdFx0J2FscGhhLW51bSc6IC9bYS16QS1aMC05XSsvLnNvdXJjZSxcblx0XHQnYWxwaGEtbnVtLWwnOiAvW2EtejAtOV0rLy5zb3VyY2UsXG5cdFx0J2FscGhhLW51bS11JzogL1tBLVowLTldKy8uc291cmNlLFxuXHRcdGFueTogL1teL10rLy5zb3VyY2UsXG5cdH0sXG5cdHRva2VuX3JlZyA9IC86KFthLXpdW2EtejAtOV9dKikvaSxcblx0d0xvYyA9IHdpbmRvdy5sb2NhdGlvbixcblx0d0RvYyA9IHdpbmRvdy5kb2N1bWVudCxcblx0d0hpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeSxcblx0bGlua0NsaWNrRXZlbnQgPSB3RG9jLm9udG91Y2hzdGFydCA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljaycsXG5cdGhhc2hUYWdTdHIgPSAnIyEnO1xuXG5jb25zdCB3aGljaCA9IGZ1bmN0aW9uKGU6IGFueSkge1xuXHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblx0XHRyZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHR9LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uKHVybDogVVJMKSB7XG5cdFx0cmV0dXJuIHVybC5wYXRobmFtZSA9PT0gd0xvYy5wYXRobmFtZSAmJiB1cmwuc2VhcmNoID09PSB3TG9jLnNlYXJjaDtcblx0fSxcblx0c2FtZU9yaWdpbiA9IGZ1bmN0aW9uKGhyZWY6IHN0cmluZykge1xuXHRcdGlmICghaHJlZikgcmV0dXJuIGZhbHNlO1xuXHRcdGxldCB1cmwgPSBuZXcgVVJMKGhyZWYudG9TdHJpbmcoKSwgd0xvYy50b1N0cmluZygpKTtcblxuXHRcdHJldHVybiAoXG5cdFx0XHR3TG9jLnByb3RvY29sID09PSB1cmwucHJvdG9jb2wgJiZcblx0XHRcdHdMb2MuaG9zdG5hbWUgPT09IHVybC5ob3N0bmFtZSAmJlxuXHRcdFx0d0xvYy5wb3J0ID09PSB1cmwucG9ydFxuXHRcdCk7XG5cdH0sXG5cdGVzY2FwZVN0cmluZyA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcL10pL2csICdcXFxcJDEnKTtcblx0fSxcblx0c3RyaW5nUmVnID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmcoc3RyKSk7XG5cdH0sXG5cdGxlYWRpbmdTbGFzaCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRcdGlmICghcGF0aC5sZW5ndGggfHwgcGF0aCA9PSAnLycpIHtcblx0XHRcdHJldHVybiAnLyc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBhdGhbMF0gIT0gJy8nID8gJy8nICsgcGF0aCA6IHBhdGg7XG5cdH0sXG5cdHdyYXBSZWcgPSAoc3RyOiBzdHJpbmcsIGNhcHR1cmU6IGJvb2xlYW4gPSBmYWxzZSkgPT5cblx0XHRjYXB0dXJlID8gJygnICsgc3RyICsgJyknIDogJyg/OicgKyBzdHIgKyAnKSc7XG5cbmV4cG9ydCBjbGFzcyBPV2ViUm91dGUge1xuXHRwcml2YXRlIHJlYWRvbmx5IHBhdGg6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSByZWc6IFJlZ0V4cCB8IG51bGw7XG5cdHByaXZhdGUgdG9rZW5zOiBBcnJheTxzdHJpbmc+O1xuXHRwcml2YXRlIHJlYWRvbmx5IGFjdGlvbjogdFJvdXRlQWN0aW9uO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGUgQ29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSByb3V0ZSBwYXRoIHN0cmluZyBvciByZWdleHAuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSByb3V0ZSBvcHRpb25zLlxuXHQgKiBAcGFyYW0gYWN0aW9uIFRoZSByb3V0ZSBhY3Rpb24gZnVuY3Rpb24uXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRwYXRoOiBzdHJpbmcgfCBSZWdFeHAsXG5cdFx0b3B0aW9uczogdFJvdXRlUGF0aE9wdGlvbnMgfCBBcnJheTxzdHJpbmc+LFxuXHRcdGFjdGlvbjogdFJvdXRlQWN0aW9uXG5cdCkge1xuXHRcdGlmIChwYXRoIGluc3RhbmNlb2YgUmVnRXhwKSB7XG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoLnRvU3RyaW5nKCk7XG5cdFx0XHR0aGlzLnJlZyA9IHBhdGg7XG5cdFx0XHR0aGlzLnRva2VucyA9IFV0aWxzLmlzQXJyYXkob3B0aW9ucykgPyBvcHRpb25zIDogW107XG5cdFx0fSBlbHNlIGlmIChVdGlscy5pc1N0cmluZyhwYXRoKSAmJiBwYXRoLmxlbmd0aCkge1xuXHRcdFx0b3B0aW9ucyA9IDx0Um91dGVQYXRoT3B0aW9ucz4oXG5cdFx0XHRcdChVdGlscy5pc1BsYWluT2JqZWN0KG9wdGlvbnMpID8gb3B0aW9ucyA6IHt9KVxuXHRcdFx0KTtcblx0XHRcdGxldCBwID0gT1dlYlJvdXRlLnBhcnNlRHluYW1pY1BhdGgocGF0aCwgb3B0aW9ucyk7XG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoO1xuXHRcdFx0dGhpcy5yZWcgPSBwLnJlZztcblx0XHRcdHRoaXMudG9rZW5zID0gcC50b2tlbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdCdbT1dlYlJvdXRlXSBpbnZhbGlkIHJvdXRlIHBhdGgsIHN0cmluZyBvciBSZWdFeHAgcmVxdWlyZWQuJ1xuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRpZiAoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIGFjdGlvbikge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdFx0YFtPV2ViUm91dGVdIGludmFsaWQgYWN0aW9uIHR5cGUsIGdvdCBcIiR7dHlwZW9mIGFjdGlvbn1cIiBpbnN0ZWFkIG9mIFwiZnVuY3Rpb25cIi5gXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHJvdXRlIGlzIGR5bmFtaWMgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKi9cblx0aXNEeW5hbWljKCkge1xuXHRcdHJldHVybiB0aGlzLnJlZyAhPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgYWN0aW9uLlxuXHQgKi9cblx0Z2V0QWN0aW9uKCk6IHRSb3V0ZUFjdGlvbiB7XG5cdFx0cmV0dXJuIHRoaXMuYWN0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIGdpdmVuIHBhdGhuYW1lIG1hdGNoIHRoaXMgcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRobmFtZVxuXHQgKi9cblx0aXMocGF0aG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnJlZyA/IHRoaXMucmVnLnRlc3QocGF0aG5hbWUpIDogdGhpcy5wYXRoID09PSBwYXRobmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIGdpdmVuIHBhdGhuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aG5hbWVcblx0ICovXG5cdHBhcnNlKHBhdGhuYW1lOiBzdHJpbmcpOiB0Um91dGVUb2tlbnNNYXAge1xuXHRcdGlmICh0aGlzLmlzRHluYW1pYygpKSB7XG5cdFx0XHRsZXQgZm91bmRzOiBhbnkgPSBTdHJpbmcocGF0aG5hbWUpLm1hdGNoKHRoaXMucmVnIGFzIFJlZ0V4cCk7XG5cblx0XHRcdGlmIChmb3VuZHMpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zLnJlZHVjZShcblx0XHRcdFx0XHQoYWNjOiBhbnksIGtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0XHRhY2Nba2V5XSA9IGZvdW5kc1tpbmRleCArIDFdO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHt9XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGR5bmFtaWMgcGF0aCBhbmQgcmV0dXJucyBhcHByb3ByaWF0ZSByZWdleHAgYW5kIHRva2VucyBsaXN0LlxuXHQgKlxuXHQgKiBgYGBqc1xuXHQgKiBsZXQgZm9ybWF0ID0gXCJwYXRoL3RvLzppZC9maWxlLzppbmRleC9uYW1lLjpmb3JtYXRcIjtcblx0ICogbGV0IG9wdGlvbnMgPSB7XG5cdCAqIFx0XHRpZDogXCJudW1cIixcblx0ICogXHRcdGluZGV4OiBcImFscGhhXCIsXG5cdCAqIFx0XHRmb3JtYXQ6XHRcImFscGhhLW51bVwiXG5cdCAqIH07XG5cdCAqIGxldCBpbmZvID0gcGFyc2VEeW5hbWljUGF0aChmb3JtYXQsb3B0aW9ucyk7XG5cdCAqXG5cdCAqIGluZm8gPT09IHtcblx0ICogICAgIHJlZzogUmVnRXhwLFxuXHQgKiAgICAgdG9rZW5zOiBbXCJpZFwiLFwiaW5kZXhcIixcImZvcm1hdFwiXVxuXHQgKiB9O1xuXHQgKiBgYGBcblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggZm9ybWF0IHN0cmluZy5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHBhdGggb3B0aW9ucy5cblx0ICovXG5cdHN0YXRpYyBwYXJzZUR5bmFtaWNQYXRoKFxuXHRcdHBhdGg6IHN0cmluZyxcblx0XHRvcHRpb25zOiB0Um91dGVQYXRoT3B0aW9uc1xuXHQpOiB0Um91dGVJbmZvIHtcblx0XHRsZXQgdG9rZW5zOiBBcnJheTxzdHJpbmc+ID0gW10sXG5cdFx0XHRyZWc6IHN0cmluZyA9ICcnLFxuXHRcdFx0X3BhdGg6IHN0cmluZyA9IHBhdGgsXG5cdFx0XHRtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuXHRcdHdoaWxlICgobWF0Y2ggPSB0b2tlbl9yZWcuZXhlYyhfcGF0aCkpICE9IG51bGwpIHtcblx0XHRcdGxldCBmb3VuZDogYW55ID0gbWF0Y2hbMF0sXG5cdFx0XHRcdHRva2VuOiBhbnkgPSBtYXRjaFsxXSxcblx0XHRcdFx0cnVsZTogYW55ID0gb3B0aW9uc1t0b2tlbl0gfHwgJ2FueScsXG5cdFx0XHRcdGhlYWQ6IHN0cmluZyA9IF9wYXRoLnNsaWNlKDAsIG1hdGNoLmluZGV4KTtcblxuXHRcdFx0aWYgKGhlYWQubGVuZ3RoKSB7XG5cdFx0XHRcdHJlZyArPSB3cmFwUmVnKHN0cmluZ1JlZyhoZWFkKS5zb3VyY2UpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIHJ1bGUgPT09ICdzdHJpbmcnICYmIHJ1bGUgaW4gdG9rZW5UeXBlc1JlZ01hcCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZygodG9rZW5UeXBlc1JlZ01hcCBhcyBhbnkpW3J1bGVdLCB0cnVlKTtcblx0XHRcdH0gZWxzZSBpZiAocnVsZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZyhydWxlLnNvdXJjZSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0XCJJbnZhbGlkIHJ1bGUgZm9yIHRva2VuICc6XCIgK1xuXHRcdFx0XHRcdFx0dG9rZW4gK1xuXHRcdFx0XHRcdFx0XCInIGluIHBhdGggJ1wiICtcblx0XHRcdFx0XHRcdHBhdGggK1xuXHRcdFx0XHRcdFx0XCInXCJcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0dG9rZW5zLnB1c2godG9rZW4pO1xuXG5cdFx0XHRfcGF0aCA9IF9wYXRoLnNsaWNlKG1hdGNoLmluZGV4ICsgZm91bmQubGVuZ3RoKTtcblx0XHR9XG5cblx0XHRpZiAoIXJlZy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJlZzogbnVsbCxcblx0XHRcdFx0dG9rZW5zOiB0b2tlbnMsXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChfcGF0aC5sZW5ndGgpIHtcblx0XHRcdHJlZyArPSB3cmFwUmVnKHN0cmluZ1JlZyhfcGF0aCkuc291cmNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVnOiBuZXcgUmVnRXhwKCdeJyArIHJlZyArICckJyksXG5cdFx0XHR0b2tlbnM6IHRva2Vucyxcblx0XHR9O1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBPV2ViUm91dGVDb250ZXh0IHtcblx0cHJpdmF0ZSBfdG9rZW5zOiB0Um91dGVUb2tlbnNNYXA7XG5cdHByaXZhdGUgX3N0b3BwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSByZWFkb25seSBfdGFyZ2V0OiB0Um91dGVUYXJnZXQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlOiB0Um91dGVTdGF0ZU9iamVjdDtcblx0cHJpdmF0ZSByZWFkb25seSBfcm91dGVyOiBPV2ViUm91dGVyO1xuXG5cdC8qKlxuXHQgKiBPV2ViUm91dGVDb250ZXh0IGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVyXG5cdCAqIEBwYXJhbSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRyb3V0ZXI6IE9XZWJSb3V0ZXIsXG5cdFx0dGFyZ2V0OiB0Um91dGVUYXJnZXQsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0XG5cdCkge1xuXHRcdHRoaXMuX3RhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl90b2tlbnMgPSB7fTtcblx0XHR0aGlzLl9zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIHRva2VuIHZhbHVlXG5cdCAqXG5cdCAqIEBwYXJhbSB0b2tlbiBUaGUgdG9rZW4uXG5cdCAqL1xuXHRnZXRUb2tlbih0b2tlbjogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbWFwIG9mIGFsbCB0b2tlbnMgYW5kIHZhbHVlcy5cblx0ICovXG5cdGdldFRva2VucygpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLl90b2tlbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGguXG5cdCAqL1xuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc3RvcmVkIHZhbHVlIGluIGhpc3Rvcnkgc3RhdGUgd2l0aCBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqL1xuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcpOiB0Um91dGVTdGF0ZUl0ZW0ge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVtrZXldO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgYSBrZXkgaW4gaGlzdG9yeSBzdGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIGtleSB0aGUgc3RhdGUga2V5XG5cdCAqIEBwYXJhbSB2YWx1ZSAgdGhlIHN0YXRlIHZhbHVlXG5cdCAqL1xuXHRzZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcsIHZhbHVlOiB0Um91dGVTdGF0ZUl0ZW0pOiB0aGlzIHtcblx0XHR0aGlzLl9zdGF0ZVtrZXldID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2VhcmNoIHBhcmFtLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGFyYW0gdGhlIHBhcmFtIG5hbWVcblx0ICovXG5cdGdldFNlYXJjaFBhcmFtKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gbmV3IFVSTCh0aGlzLl90YXJnZXQuaHJlZikuc2VhcmNoUGFyYW1zLmdldChwYXJhbSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHJvdXRlIGRpc3BhdGNoZXIgaXMgc3RvcHBlZC5cblx0ICovXG5cdHN0b3BwZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0b3BwZWQ7XG5cdH1cblxuXHQvKipcblx0ICogU3RvcCB0aGUgcm91dGUgZGlzcGF0Y2hlci5cblx0ICovXG5cdHN0b3AoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9zdG9wcGVkKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdpbGwgc3RvcC4nKTtcblx0XHRcdHRoaXMuc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBzdG9wXG5cdFx0XHR0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3JvdXRlci5nZXRDdXJyZW50RGlzcGF0Y2hlcigpIS5jYW5jZWwoKTtcblx0XHRcdGNvbnNvbGUud2FybignW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2FzIHN0b3BwZWQhJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IGFscmVhZHkgc3RvcHBlZCEnXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRzYXZlKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5zdG9wcGVkKCkpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uJyk7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XCJbT1dlYkRpc3BhdGNoQ29udGV4dF0geW91IHNob3VsZG4ndCB0cnkgdG8gc2F2ZSB3aGVuIHN0b3BwZWQuXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJ1bnMgYWN0aW9uIGF0dGFjaGVkIHRvIGEgZ2l2ZW4gcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSByb3V0ZVxuXHQgKi9cblx0YWN0aW9uUnVubmVyKHJvdXRlOiBPV2ViUm91dGUpOiB0aGlzIHtcblx0XHR0aGlzLl90b2tlbnMgPSByb3V0ZS5wYXJzZSh0aGlzLl90YXJnZXQucGF0aCk7XG5cblx0XHRyb3V0ZS5nZXRBY3Rpb24oKSh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50X3RhcmdldDogdFJvdXRlVGFyZ2V0ID0ge1xuXHRcdHBhcnNlZDogJycsXG5cdFx0aHJlZjogJycsXG5cdFx0cGF0aDogJycsXG5cdFx0ZnVsbFBhdGg6ICcnLFxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2xpc3RlbmluZzogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9ub3RGb3VuZDogdW5kZWZpbmVkIHwgKCh0YXJnZXQ6IHRSb3V0ZVRhcmdldCkgPT4gdm9pZCkgPSB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3BvcFN0YXRlTGlzdGVuZXI6IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9saW5rQ2xpY2tMaXN0ZW5lcjogKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIF9kaXNwYXRjaF9pZCA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnRfZGlzcGF0Y2hlcj86IGlSb3V0ZURpc3BhdGNoZXI7XG5cdHByaXZhdGUgX2ZvcmNlX3JlcGxhY2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlciBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIGJhc2VVcmwgdGhlIGJhc2UgdXJsXG5cdCAqIEBwYXJhbSBoYXNoTW9kZSB3ZWF0aGVyIHRvIHVzZSBoYXNoIG1vZGVcblx0ICogQHBhcmFtIG5vdEZvdW5kIGNhbGxlZCB3aGVuIGEgcm91dGUgaXMgbm90IGZvdW5kXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihcblx0XHRiYXNlVXJsOiBzdHJpbmcsXG5cdFx0aGFzaE1vZGU6IGJvb2xlYW4gPSB0cnVlLFxuXHRcdG5vdEZvdW5kOiAodGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWRcblx0KSB7XG5cdFx0bGV0IHIgPSB0aGlzO1xuXHRcdHRoaXMuX2Jhc2VVcmwgPSBiYXNlVXJsO1xuXHRcdHRoaXMuX2hhc2hNb2RlID0gaGFzaE1vZGU7XG5cdFx0dGhpcy5fbm90Rm91bmQgPSBub3RGb3VuZDtcblx0XHR0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyID0gKGU6IFBvcFN0YXRlRXZlbnQpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcG9wc3RhdGUgLT4nLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRpZiAoZS5zdGF0ZSkge1xuXHRcdFx0XHRyLmJyb3dzZVRvKGUuc3RhdGUudXJsLCBlLnN0YXRlLmRhdGEsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8od0xvYy5ocmVmLCB1bmRlZmluZWQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcblx0XHRcdHIuX29uQ2xpY2soZSk7XG5cdFx0fTtcblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcmVhZHkhJyk7XG5cdH1cblxuXHQvKipcblx0ICogU3RhcnRzIHRoZSByb3V0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaXJzdFJ1biBmaXJzdCBydW4gZmxhZ1xuXHQgKiBAcGFyYW0gdGFyZ2V0IGluaXRpYWwgdGFyZ2V0LCB1c3VhbHkgdGhlIGVudHJ5IHBvaW50XG5cdCAqIEBwYXJhbSBzdGF0ZSBpbml0aWFsIHN0YXRlXG5cdCAqL1xuXHRzdGFydChcblx0XHRmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsXG5cdFx0dGFyZ2V0OiBzdHJpbmcgPSB3TG9jLmhyZWYsXG5cdFx0c3RhdGU/OiB0Um91dGVTdGF0ZU9iamVjdFxuXHQpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN0YXJ0IHJvdXRpbmchJyk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcyAtPicsIHRoaXMuX3JvdXRlcyk7XG5cdFx0XHRmaXJzdFJ1biAmJiB0aGlzLmJyb3dzZVRvKHRhcmdldCwgc3RhdGUsIGZhbHNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYlJvdXRlcl0gcm91dGVyIGFscmVhZHkgc3RhcnRlZCEnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTdG9wcyB0aGUgcm91dGVyLlxuXHQgKi9cblx0c3RvcFJvdXRpbmcoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy51bnJlZ2lzdGVyKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyEnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYlJvdXRlcl0geW91IHNob3VsZCBzdGFydCByb3V0aW5nIGZpcnN0IScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFdoZW4gY2FsbGVkIHRoZSBjdXJyZW50IGhpc3Rvcnkgd2lsbCBiZSByZXBsYWNlZCBieSB0aGUgbmV4dCBoaXN0b3J5IHN0YXRlLlxuXHQgKi9cblx0Zm9yY2VOZXh0UmVwbGFjZSgpOiB0aGlzIHtcblx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIHRhcmdldC5cblx0ICovXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF90YXJnZXQ7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCByb3V0ZSBldmVudCBkaXNwYXRjaGVyLlxuXHQgKi9cblx0Z2V0Q3VycmVudERpc3BhdGNoZXIoKTogaVJvdXRlRGlzcGF0Y2hlciB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRSb3V0ZUNvbnRleHQoKTogT1dlYlJvdXRlQ29udGV4dCB7XG5cdFx0aWYgKCF0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGNvbnRleHQuJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgZ2l2ZW4gdXJsLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmwgdG8gcGFyc2Vcblx0ICovXG5cdHBhcnNlVVJMKHVybDogc3RyaW5nIHwgVVJMKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRsZXQgYiA9IG5ldyBVUkwodGhpcy5fYmFzZVVybCksXG5cdFx0XHR1ID0gbmV3IFVSTCh1cmwudG9TdHJpbmcoKSwgYiksXG5cdFx0XHRfOiB0Um91dGVUYXJnZXQ7XG5cblx0XHRpZiAodGhpcy5faGFzaE1vZGUpIHtcblx0XHRcdF8gPSB7XG5cdFx0XHRcdHBhcnNlZDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWY6IHUuaHJlZixcblx0XHRcdFx0cGF0aDogdS5oYXNoLnJlcGxhY2UoaGFzaFRhZ1N0ciwgJycpLFxuXHRcdFx0XHRmdWxsUGF0aDogdS5oYXNoLFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IHBhdGhuYW1lID0gdS5wYXRobmFtZTtcblx0XHRcdC8vIHdoZW4gdXNpbmcgcGF0aG5hbWUgbWFrZSBzdXJlIHRvIHJlbW92ZVxuXHRcdFx0Ly8gYmFzZSB1cmkgcGF0aG5hbWUgZm9yIGFwcCBpbiBzdWJkaXJlY3Rvcnlcblx0XHRcdGlmIChwYXRobmFtZS5pbmRleE9mKGIucGF0aG5hbWUpID09PSAwKSB7XG5cdFx0XHRcdHBhdGhuYW1lID0gcGF0aG5hbWUuc3Vic3RyKGIucGF0aG5hbWUubGVuZ3RoKTtcblx0XHRcdH1cblxuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogdS5ocmVmLFxuXHRcdFx0XHRwYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lICsgdS5zZWFyY2ggKyAodS5oYXNoIHx8ICcnKSksXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCAtPicsIF8pO1xuXG5cdFx0cmV0dXJuIF87XG5cdH1cblxuXHQvKipcblx0ICogQnVpbGRzIHVybCB3aXRoIGEgZ2l2ZW4gcGF0aCBhbmQgYmFzZSB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoXG5cdCAqIEBwYXJhbSBiYXNlIHRoZSBiYXNlIHVybFxuXHQgKi9cblx0cGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IFVSTCB7XG5cdFx0YmFzZSA9IGJhc2UgJiYgYmFzZS5sZW5ndGggPyBiYXNlIDogdGhpcy5fYmFzZVVybDtcblxuXHRcdGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QocGF0aCkpIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdHBhdGggPSB0aGlzLl9oYXNoTW9kZSA/IGhhc2hUYWdTdHIgKyBsZWFkaW5nU2xhc2gocGF0aCkgOiBwYXRoO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSk7XG5cdH1cblxuXHQvKipcblx0ICogQXR0YWNoIGEgcm91dGUgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCB0aGUgcGF0aCB0byB3YXRjaFxuXHQgKiBAcGFyYW0gcnVsZXMgdGhlIHBhdGggcnVsZXNcblx0ICogQHBhcmFtIGFjdGlvbiB0aGUgYWN0aW9uIHRvIHJ1blxuXHQgKi9cblx0b24oXG5cdFx0cGF0aDogdFJvdXRlUGF0aCxcblx0XHRydWxlczogdFJvdXRlUGF0aE9wdGlvbnMgPSB7fSxcblx0XHRhY3Rpb246IHRSb3V0ZUFjdGlvblxuXHQpOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChuZXcgT1dlYlJvdXRlKHBhdGgsIHJ1bGVzLCBhY3Rpb24pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBHbyBiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGlzdGFuY2UgdGhlIGRpc3RhbmNlIGluIGhpc3Rvcnlcblx0ICovXG5cdGdvQmFjayhkaXN0YW5jZTogbnVtYmVyID0gMSk6IHRoaXMge1xuXHRcdGlmIChkaXN0YW5jZSA+IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gZ29pbmcgYmFjayAtPiAnLCBkaXN0YW5jZSk7XG5cdFx0XHRsZXQgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQnJvd3NlIHRvIGEgc3BlY2lmaWMgbG9jYXRpb25cblx0ICpcblx0ICogQHBhcmFtIHVybCB0aGUgbmV4dCB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBpbml0aWFsIHN0YXRlXG5cdCAqIEBwYXJhbSBwdXNoIHNob3VsZCB3ZSBwdXNoIGludG8gdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIGlnbm9yZVNhbWVMb2NhdGlvbiAgaWdub3JlIGJyb3dzaW5nIGFnYWluIHRvIHNhbWUgbG9jYXRpb25cblx0ICovXG5cdGJyb3dzZVRvKFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9LFxuXHRcdHB1c2g6IGJvb2xlYW4gPSB0cnVlLFxuXHRcdGlnbm9yZVNhbWVMb2NhdGlvbjogYm9vbGVhbiA9IGZhbHNlXG5cdCk6IHRoaXMge1xuXHRcdGxldCB0YXJnZXRVcmwgPSB0aGlzLnBhdGhUb1VSTCh1cmwpLFxuXHRcdFx0dGFyZ2V0ID0gdGhpcy5wYXJzZVVSTCh0YXJnZXRVcmwuaHJlZiksXG5cdFx0XHRfY2QgPSB0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIsXG5cdFx0XHRjZDogaVJvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGlmICghc2FtZU9yaWdpbih0YXJnZXQuaHJlZikpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGJyb3dzaW5nIHRvIC0+ICcsIHRhcmdldC5wYXRoLCB7XG5cdFx0XHRzdGF0ZSxcblx0XHRcdHB1c2gsXG5cdFx0XHR0YXJnZXQsXG5cdFx0fSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRfdGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uIC0+ICcsIHRhcmdldC5wYXRoKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmIChfY2QgJiYgX2NkLmlzQWN0aXZlKCkpIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J1tPV2ViUm91dGVyXSBicm93c2VUbyBjYWxsZWQgd2hpbGUgZGlzcGF0Y2hpbmcgLT4gJyxcblx0XHRcdFx0X2NkXG5cdFx0XHQpO1xuXHRcdFx0X2NkLmNhbmNlbCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRfdGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2ZvcmNlX3JlcGxhY2UpIHtcblx0XHRcdHRoaXMuX2ZvcmNlX3JlcGxhY2UgPSBmYWxzZTtcblx0XHRcdHRoaXMucmVwbGFjZUhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHVzaCAmJiB0aGlzLmFkZEhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIgPSBjZCA9IHRoaXMuY3JlYXRlRGlzcGF0Y2hlcihcblx0XHRcdHRhcmdldCxcblx0XHRcdHN0YXRlLFxuXHRcdFx0Kyt0aGlzLl9kaXNwYXRjaF9pZFxuXHRcdCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHQnW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoIC0+Jyxcblx0XHRcdFx0dGFyZ2V0LnBhdGhcblx0XHRcdCk7XG5cdFx0XHRpZiAodGhpcy5fbm90Rm91bmQpIHtcblx0XHRcdFx0dGhpcy5fbm90Rm91bmQodGFyZ2V0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignW09XZWJSb3V0ZXJdIG5vdEZvdW5kIGFjdGlvbiBpcyBub3QgZGVmaW5lZCEnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y2QuZGlzcGF0Y2goKTtcblxuXHRcdGlmIChjZC5pZCA9PT0gdGhpcy5fZGlzcGF0Y2hfaWQgJiYgIWNkLmNvbnRleHQuc3RvcHBlZCgpKSB7XG5cdFx0XHRjZC5jb250ZXh0LnNhdmUoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gc3VjY2VzcyAtPicsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdGFkZEhpc3RvcnkoXG5cdFx0dXJsOiBzdHJpbmcsXG5cdFx0c3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LFxuXHRcdHRpdGxlOiBzdHJpbmcgPSAnJ1xuXHQpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnB1c2hTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IGFkZGVkJywgc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlIHRoZSBjdXJyZW50IGhpc3RvcnkuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybFxuXHQgKiBAcGFyYW0gc3RhdGUgdGhlIGhpc3Rvcnkgc3RhdGVcblx0ICogQHBhcmFtIHRpdGxlIHRoZSB3aW5kb3cgdGl0bGVcblx0ICovXG5cdHJlcGxhY2VIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZTogc3RyaW5nID0gJydcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5yZXBsYWNlU3RhdGUoeyB1cmwsIGRhdGE6IHN0YXRlIH0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0J1tPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IHJlcGxhY2VkIC0+ICcsXG5cdFx0XHR3SGlzdG9yeS5zdGF0ZSxcblx0XHRcdHVybFxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgcm91dGUgZXZlbnQgZGlzcGF0Y2hlclxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IHRoZSByb3V0ZSB0YXJnZXRcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZCB0aGUgZGlzcGF0Y2hlciBpZFxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKFxuXHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHRpZDogbnVtYmVyXG5cdCk6IGlSb3V0ZURpc3BhdGNoZXIge1xuXHRcdGNvbnNvbGUubG9nKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRsZXQgY3R4ID0gdGhpcyxcblx0XHRcdGZvdW5kOiBPV2ViUm91dGVbXSA9IFtdLFxuXHRcdFx0YWN0aXZlID0gZmFsc2UsXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKSxcblx0XHRcdG86IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcm91dGUgPSBjdHguX3JvdXRlc1tpXTtcblxuXHRcdFx0aWYgKHJvdXRlLmlzKHRhcmdldC5wYXRoKSkge1xuXHRcdFx0XHRmb3VuZC5wdXNoKHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvID0ge1xuXHRcdFx0Y29udGV4dDogcm91dGVDb250ZXh0LFxuXHRcdFx0aWQsXG5cdFx0XHRmb3VuZCxcblx0XHRcdGlzQWN0aXZlOiAoKSA9PiBhY3RpdmUsXG5cdFx0XHRjYW5jZWw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoYWN0aXZlKSB7XG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKFxuXHRcdFx0XHRcdFx0YFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIWAsXG5cdFx0XHRcdFx0XHRvXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKFxuXHRcdFx0XHRcdFx0YFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIHdoZW4gaW5hY3RpdmUuYCxcblx0XHRcdFx0XHRcdG9cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCFhY3RpdmUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIHN0YXJ0IC0+YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gaXMgYnVzeSFgLCBvKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBvO1xuXHRcdFx0fSxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIG87XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXIgRE9NIGV2ZW50cyBoYW5kbGVyLlxuXHQgKi9cblx0cHJpdmF0ZSByZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gdHJ1ZTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MuYWRkRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0bGlua0NsaWNrRXZlbnQsXG5cdFx0XHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBVbnJlZ2lzdGVyIGFsbCBET00gZXZlbnRzIGhhbmRsZXIuXG5cdCAqL1xuXHRwcml2YXRlIHVucmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gZmFsc2U7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcblx0XHRcdFx0J3BvcHN0YXRlJyxcblx0XHRcdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0XHR3RG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlIGNsaWNrIGV2ZW50XG5cdCAqXG5cdCAqIG9uY2xpY2sgZnJvbSBwYWdlLmpzIGxpYnJhcnk6IGdpdGh1Yi5jb20vdmlzaW9ubWVkaWEvcGFnZS5qc1xuXHQgKlxuXHQgKiBAcGFyYW0gZSB0aGUgZW52ZW50IG9iamVjdFxuXHQgKi9cblx0cHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuXHRcdGlmICgxICE9PSB3aGljaChlKSkgcmV0dXJuO1xuXG5cdFx0aWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuXHRcdGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBsaW5rXG5cdFx0Ly8gdXNlIHNoYWRvdyBkb20gd2hlbiBhdmFpbGFibGUgaWYgbm90LCBmYWxsIGJhY2sgdG8gY29tcG9zZWRQYXRoKCkgZm9yIGJyb3dzZXJzIHRoYXQgb25seSBoYXZlIHNoYWR5XG5cdFx0bGV0IGVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSA8SFRNTEVsZW1lbnQ+ZS50YXJnZXQsXG5cdFx0XHRldmVudFBhdGggPVxuXHRcdFx0XHQoZSBhcyBhbnkpLnBhdGggfHxcblx0XHRcdFx0KChlIGFzIGFueSkuY29tcG9zZWRQYXRoID8gKGUgYXMgYW55KS5jb21wb3NlZFBhdGgoKSA6IG51bGwpO1xuXG5cdFx0aWYgKGV2ZW50UGF0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudFBhdGgubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoW2ldLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgY29udGludWU7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLmhyZWYpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGVsID0gZXZlbnRQYXRoW2ldO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gY29udGludWUgZW5zdXJlIGxpbmtcblx0XHQvLyBlbC5ub2RlTmFtZSBmb3Igc3ZnIGxpbmtzIGFyZSAnYScgaW5zdGVhZCBvZiAnQSdcblx0XHR3aGlsZSAoZWwgJiYgJ0EnICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSBlbCA9IDxhbnk+ZWwucGFyZW50Tm9kZTtcblx0XHRpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRsZXQgc3ZnID1cblx0XHRcdHR5cGVvZiAoZWwgYXMgYW55KS5ocmVmID09PSAnb2JqZWN0JyAmJlxuXHRcdFx0KGVsIGFzIGFueSkuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXG5cdFx0Ly8gSWdub3JlIGlmIHRhZyBoYXNcblx0XHQvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG5cdFx0Ly8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcblx0XHRpZiAoXG5cdFx0XHRlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHxcblx0XHRcdGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCdcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcblx0XHRsZXQgbGluayA9IGVsLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuXHRcdGlmIChcblx0XHRcdCF0aGlzLl9oYXNoTW9kZSAmJlxuXHRcdFx0c2FtZVBhdGgoZWwgYXMgYW55KSAmJlxuXHRcdFx0KChlbCBhcyBhbnkpLmhhc2ggfHwgJyMnID09PSBsaW5rKVxuXHRcdClcblx0XHRcdHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG5cdFx0aWYgKGxpbmsgJiYgbGluay5pbmRleE9mKCdtYWlsdG86JykgPiAtMSkgcmV0dXJuO1xuXG5cdFx0Ly8gd2UgY2hlY2sgdGFyZ2V0XG5cdFx0Ly8gc3ZnIHRhcmdldCBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0aWYgKHN2ZyA/IChlbCBhcyBhbnkpLnRhcmdldC5iYXNlVmFsIDogKGVsIGFzIGFueSkudGFyZ2V0KSByZXR1cm47XG5cblx0XHQvLyB4LW9yaWdpblxuXHRcdC8vIG5vdGU6IHN2ZyBsaW5rcyB0aGF0IGFyZSBub3QgcmVsYXRpdmUgZG9uJ3QgY2FsbCBjbGljayBldmVudHMgKGFuZCBza2lwIHBhZ2UuanMpXG5cdFx0Ly8gY29uc2VxdWVudGx5LCBhbGwgc3ZnIGxpbmtzIHRlc3RlZCBpbnNpZGUgcGFnZS5qcyBhcmUgcmVsYXRpdmUgYW5kIGluIHRoZSBzYW1lIG9yaWdpblxuXHRcdGlmICghc3ZnICYmICFzYW1lT3JpZ2luKChlbCBhcyBhbnkpLmhyZWYpKSByZXR1cm47XG5cblx0XHQvLyByZWJ1aWxkIHBhdGhcblx0XHQvLyBUaGVyZSBhcmVuJ3QgLnBhdGhuYW1lIGFuZCAuc2VhcmNoIHByb3BlcnRpZXMgaW4gc3ZnIGxpbmtzLCBzbyB3ZSB1c2UgaHJlZlxuXHRcdC8vIEFsc28sIHN2ZyBocmVmIGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRsZXQgdGFyZ2V0SHJlZiA9IHN2ZyA/IChlbCBhcyBhbnkpLmhyZWYuYmFzZVZhbCA6IChlbCBhcyBhbnkpLmhyZWY7XG5cblx0XHQvLyBzdHJpcCBsZWFkaW5nIFwiL1tkcml2ZSBsZXR0ZXJdOlwiIG9uIE5XLmpzIG9uIFdpbmRvd3Ncblx0XHQvKlxuXHRcdCBsZXQgaGFzUHJvY2VzcyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJztcblx0XHQgaWYgKGhhc1Byb2Nlc3MgJiYgdGFyZ2V0SHJlZi5tYXRjaCgvXlxcL1thLXpBLVpdOlxcLy8pKSB7XG5cdFx0IHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnJlcGxhY2UoL15cXC9bYS16QS1aXTpcXC8vLCBcIi9cIik7XG5cdFx0IH1cblx0XHQgKi9cblxuXHRcdGxldCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHtcblx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpID09PSAnX2JsYW5rJykge1xuXHRcdFx0XHRVdGlscy5zYWZlT3BlbihvcmlnKTtcblx0XHRcdFx0VXRpbHMucHJldmVudERlZmF1bHQoZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRVdGlscy5wcmV2ZW50RGVmYXVsdChlKTtcblxuXHRcdGNvbnNvbGUubG9nKFxuXHRcdFx0J1tPV2ViUm91dGVyXVtjbGlja10gLT4nLFxuXHRcdFx0ZWwsXG5cdFx0XHRvcmlnLFxuXHRcdFx0dGFyZ2V0SHJlZixcblx0XHRcdHdIaXN0b3J5LnN0YXRlXG5cdFx0KTtcblx0XHR0aGlzLmJyb3dzZVRvKG9yaWcpO1xuXHR9XG59XG4iXX0=