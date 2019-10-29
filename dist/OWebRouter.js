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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXNDbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixHQUFHLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFDakIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQ3pCLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTtJQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDMUIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxNQUFNO0lBQ2xDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ25CLEVBQ0QsU0FBUyxHQUFHLHFCQUFxQixFQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBUyxDQUFNO0lBQzNCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQUcsVUFBUyxHQUFRO0lBQzNCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLEdBQUcs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QUNyRDtRQUVELElBQUksSUFBSSxLQUFLLFVBQVU7WUFBRSxPQUFPO1FBRWhDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUNWLHdCQUF3QixFQUN4QixFQUFFLEVBQ0YsSUFBSSxFQUNKLFVBQVUsRUFDVixRQUFRLENBQUMsS0FBSyxDQUNkLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBVdGlscyBmcm9tICcuL3V0aWxzL1V0aWxzJztcblxuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aCA9IHN0cmluZyB8IFJlZ0V4cDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGhPcHRpb25zID0ge1xuXHRba2V5OiBzdHJpbmddOiBSZWdFeHAgfCBrZXlvZiB0eXBlb2YgdG9rZW5UeXBlc1JlZ01hcDtcbn07XG5leHBvcnQgdHlwZSB0Um91dGVUb2tlbnNNYXAgPSB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlQWN0aW9uID0gKGN0eDogT1dlYlJvdXRlQ29udGV4dCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIHRSb3V0ZUluZm8gPSB7IHJlZzogUmVnRXhwIHwgbnVsbDsgdG9rZW5zOiBBcnJheTxzdHJpbmc+IH07XG50eXBlIF90Um91dGVTdGF0ZUl0ZW0gPVxuXHR8IHN0cmluZ1xuXHR8IG51bWJlclxuXHR8IGJvb2xlYW5cblx0fCBudWxsXG5cdHwgdW5kZWZpbmVkXG5cdHwgRGF0ZVxuXHR8IHRSb3V0ZVN0YXRlT2JqZWN0O1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVJdGVtID0gX3RSb3V0ZVN0YXRlSXRlbSB8IEFycmF5PF90Um91dGVTdGF0ZUl0ZW0+O1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVPYmplY3QgPSB7IFtrZXk6IHN0cmluZ106IHRSb3V0ZVN0YXRlSXRlbSB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlVGFyZ2V0ID0ge1xuXHRwYXJzZWQ6IHN0cmluZztcblx0aHJlZjogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG5cdGZ1bGxQYXRoOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIGlSb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyO1xuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0O1xuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW107XG5cblx0aXNBY3RpdmUoKTogYm9vbGVhbjtcblxuXHRkaXNwYXRjaCgpOiB0aGlzO1xuXG5cdGNhbmNlbCgpOiB0aGlzO1xufVxuXG5jb25zdCB0b2tlblR5cGVzUmVnTWFwID0ge1xuXHRcdG51bTogL1xcZCsvLnNvdXJjZSxcblx0XHRhbHBoYTogL1thLXpBLVpdKy8uc291cmNlLFxuXHRcdCdhbHBoYS11JzogL1thLXpdKy8uc291cmNlLFxuXHRcdCdhbHBoYS1sJzogL1tBLVpdKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0nOiAvW2EtekEtWjAtOV0rLy5zb3VyY2UsXG5cdFx0J2FscGhhLW51bS1sJzogL1thLXowLTldKy8uc291cmNlLFxuXHRcdCdhbHBoYS1udW0tdSc6IC9bQS1aMC05XSsvLnNvdXJjZSxcblx0XHRhbnk6IC9bXi9dKy8uc291cmNlLFxuXHR9LFxuXHR0b2tlbl9yZWcgPSAvOihbYS16XVthLXowLTlfXSopL2ksXG5cdHdMb2MgPSB3aW5kb3cubG9jYXRpb24sXG5cdHdEb2MgPSB3aW5kb3cuZG9jdW1lbnQsXG5cdHdIaXN0b3J5ID0gd2luZG93Lmhpc3RvcnksXG5cdGxpbmtDbGlja0V2ZW50ID0gd0RvYy5vbnRvdWNoc3RhcnQgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snLFxuXHRoYXNoVGFnU3RyID0gJyMhJztcblxuY29uc3Qgd2hpY2ggPSBmdW5jdGlvbihlOiBhbnkpIHtcblx0XHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0cmV0dXJuIG51bGwgPT0gZS53aGljaCA/IGUuYnV0dG9uIDogZS53aGljaDtcblx0fSxcblx0c2FtZVBhdGggPSBmdW5jdGlvbih1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiYgdXJsLnNlYXJjaCA9PT0gd0xvYy5zZWFyY2g7XG5cdH0sXG5cdHNhbWVPcmlnaW4gPSBmdW5jdGlvbihocmVmOiBzdHJpbmcpIHtcblx0XHRpZiAoIWhyZWYpIHJldHVybiBmYWxzZTtcblx0XHRsZXQgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0d0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHR3TG9jLmhvc3RuYW1lID09PSB1cmwuaG9zdG5hbWUgJiZcblx0XHRcdHdMb2MucG9ydCA9PT0gdXJsLnBvcnRcblx0XHQpO1xuXHR9LFxuXHRlc2NhcGVTdHJpbmcgPSBmdW5jdGlvbihzdHI6IHN0cmluZykge1xuXHRcdHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCAnXFxcXCQxJyk7XG5cdH0sXG5cdHN0cmluZ1JlZyA9IGZ1bmN0aW9uKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG5ldyBSZWdFeHAoZXNjYXBlU3RyaW5nKHN0cikpO1xuXHR9LFxuXHRsZWFkaW5nU2xhc2ggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0XHRpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT0gJy8nKSB7XG5cdFx0XHRyZXR1cm4gJy8nO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoWzBdICE9ICcvJyA/ICcvJyArIHBhdGggOiBwYXRoO1xuXHR9LFxuXHR3cmFwUmVnID0gKHN0cjogc3RyaW5nLCBjYXB0dXJlOiBib29sZWFuID0gZmFsc2UpID0+XG5cdFx0Y2FwdHVyZSA/ICcoJyArIHN0ciArICcpJyA6ICcoPzonICsgc3RyICsgJyknO1xuXG5leHBvcnQgY2xhc3MgT1dlYlJvdXRlIHtcblx0cHJpdmF0ZSByZWFkb25seSBwYXRoOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgcmVnOiBSZWdFeHAgfCBudWxsO1xuXHRwcml2YXRlIHRva2VuczogQXJyYXk8c3RyaW5nPjtcblx0cHJpdmF0ZSByZWFkb25seSBhY3Rpb246IHRSb3V0ZUFjdGlvbjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlIENvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcm91dGUgcGF0aCBzdHJpbmcgb3IgcmVnZXhwLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcm91dGUgb3B0aW9ucy5cblx0ICogQHBhcmFtIGFjdGlvbiBUaGUgcm91dGUgYWN0aW9uIGZ1bmN0aW9uLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cGF0aDogc3RyaW5nIHwgUmVnRXhwLFxuXHRcdG9wdGlvbnM6IHRSb3V0ZVBhdGhPcHRpb25zIHwgQXJyYXk8c3RyaW5nPixcblx0XHRhY3Rpb246IHRSb3V0ZUFjdGlvblxuXHQpIHtcblx0XHRpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aC50b1N0cmluZygpO1xuXHRcdFx0dGhpcy5yZWcgPSBwYXRoO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBVdGlscy5pc0FycmF5KG9wdGlvbnMpID8gb3B0aW9ucyA6IFtdO1xuXHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNTdHJpbmcocGF0aCkgJiYgcGF0aC5sZW5ndGgpIHtcblx0XHRcdG9wdGlvbnMgPSA8dFJvdXRlUGF0aE9wdGlvbnM+KFxuXHRcdFx0XHQoVXRpbHMuaXNQbGFpbk9iamVjdChvcHRpb25zKSA/IG9wdGlvbnMgOiB7fSlcblx0XHRcdCk7XG5cdFx0XHRsZXQgcCA9IE9XZWJSb3V0ZS5wYXJzZUR5bmFtaWNQYXRoKHBhdGgsIG9wdGlvbnMpO1xuXHRcdFx0dGhpcy5wYXRoID0gcGF0aDtcblx0XHRcdHRoaXMucmVnID0gcC5yZWc7XG5cdFx0XHR0aGlzLnRva2VucyA9IHAudG9rZW5zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFxuXHRcdFx0XHQnW09XZWJSb3V0ZV0gaW52YWxpZCByb3V0ZSBwYXRoLCBzdHJpbmcgb3IgUmVnRXhwIHJlcXVpcmVkLidcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBhY3Rpb24pIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRcdGBbT1dlYlJvdXRlXSBpbnZhbGlkIGFjdGlvbiB0eXBlLCBnb3QgXCIke3R5cGVvZiBhY3Rpb259XCIgaW5zdGVhZCBvZiBcImZ1bmN0aW9uXCIuYFxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHR0aGlzLmFjdGlvbiA9IGFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyByb3V0ZSBpcyBkeW5hbWljIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdGlzRHluYW1pYygpIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgIT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHJvdXRlIGFjdGlvbi5cblx0ICovXG5cdGdldEFjdGlvbigpOiB0Um91dGVBY3Rpb24ge1xuXHRcdHJldHVybiB0aGlzLmFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBnaXZlbiBwYXRobmFtZSBtYXRjaCB0aGlzIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aG5hbWVcblx0ICovXG5cdGlzKHBhdGhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5yZWcgPyB0aGlzLnJlZy50ZXN0KHBhdGhuYW1lKSA6IHRoaXMucGF0aCA9PT0gcGF0aG5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiBwYXRobmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHBhdGhuYW1lXG5cdCAqL1xuXHRwYXJzZShwYXRobmFtZTogc3RyaW5nKTogdFJvdXRlVG9rZW5zTWFwIHtcblx0XHRpZiAodGhpcy5pc0R5bmFtaWMoKSkge1xuXHRcdFx0bGV0IGZvdW5kczogYW55ID0gU3RyaW5nKHBhdGhuYW1lKS5tYXRjaCh0aGlzLnJlZyBhcyBSZWdFeHApO1xuXG5cdFx0XHRpZiAoZm91bmRzKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRva2Vucy5yZWR1Y2UoXG5cdFx0XHRcdFx0KGFjYzogYW55LCBrZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRcdFx0YWNjW2tleV0gPSBmb3VuZHNbaW5kZXggKyAxXTtcblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7fVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBkeW5hbWljIHBhdGggYW5kIHJldHVybnMgYXBwcm9wcmlhdGUgcmVnZXhwIGFuZCB0b2tlbnMgbGlzdC5cblx0ICpcblx0ICogYGBganNcblx0ICogbGV0IGZvcm1hdCA9IFwicGF0aC90by86aWQvZmlsZS86aW5kZXgvbmFtZS46Zm9ybWF0XCI7XG5cdCAqIGxldCBvcHRpb25zID0ge1xuXHQgKiBcdFx0aWQ6IFwibnVtXCIsXG5cdCAqIFx0XHRpbmRleDogXCJhbHBoYVwiLFxuXHQgKiBcdFx0Zm9ybWF0Olx0XCJhbHBoYS1udW1cIlxuXHQgKiB9O1xuXHQgKiBsZXQgaW5mbyA9IHBhcnNlRHluYW1pY1BhdGgoZm9ybWF0LG9wdGlvbnMpO1xuXHQgKlxuXHQgKiBpbmZvID09PSB7XG5cdCAqICAgICByZWc6IFJlZ0V4cCxcblx0ICogICAgIHRva2VuczogW1wiaWRcIixcImluZGV4XCIsXCJmb3JtYXRcIl1cblx0ICogfTtcblx0ICogYGBgXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGZvcm1hdCBzdHJpbmcuXG5cdCAqIEBwYXJhbSBvcHRpb25zIFRoZSBwYXRoIG9wdGlvbnMuXG5cdCAqL1xuXHRzdGF0aWMgcGFyc2VEeW5hbWljUGF0aChcblx0XHRwYXRoOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogdFJvdXRlUGF0aE9wdGlvbnNcblx0KTogdFJvdXRlSW5mbyB7XG5cdFx0bGV0IHRva2VuczogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdFx0cmVnOiBzdHJpbmcgPSAnJyxcblx0XHRcdF9wYXRoOiBzdHJpbmcgPSBwYXRoLFxuXHRcdFx0bWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cblx0XHR3aGlsZSAoKG1hdGNoID0gdG9rZW5fcmVnLmV4ZWMoX3BhdGgpKSAhPSBudWxsKSB7XG5cdFx0XHRsZXQgZm91bmQ6IGFueSA9IG1hdGNoWzBdLFxuXHRcdFx0XHR0b2tlbjogYW55ID0gbWF0Y2hbMV0sXG5cdFx0XHRcdHJ1bGU6IGFueSA9IG9wdGlvbnNbdG9rZW5dIHx8ICdhbnknLFxuXHRcdFx0XHRoZWFkOiBzdHJpbmcgPSBfcGF0aC5zbGljZSgwLCBtYXRjaC5pbmRleCk7XG5cblx0XHRcdGlmIChoZWFkLmxlbmd0aCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoaGVhZCkuc291cmNlKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHR5cGVvZiBydWxlID09PSAnc3RyaW5nJyAmJiBydWxlIGluIHRva2VuVHlwZXNSZWdNYXApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoKHRva2VuVHlwZXNSZWdNYXAgYXMgYW55KVtydWxlXSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcocnVsZS5zb3VyY2UsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFwiSW52YWxpZCBydWxlIGZvciB0b2tlbiAnOlwiICtcblx0XHRcdFx0XHRcdHRva2VuICtcblx0XHRcdFx0XHRcdFwiJyBpbiBwYXRoICdcIiArXG5cdFx0XHRcdFx0XHRwYXRoICtcblx0XHRcdFx0XHRcdFwiJ1wiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblxuXHRcdFx0X3BhdGggPSBfcGF0aC5zbGljZShtYXRjaC5pbmRleCArIGZvdW5kLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFyZWcubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZWc6IG51bGwsXG5cdFx0XHRcdHRva2VuczogdG9rZW5zLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoX3BhdGgubGVuZ3RoKSB7XG5cdFx0XHRyZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoX3BhdGgpLnNvdXJjZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlZzogbmV3IFJlZ0V4cCgnXicgKyByZWcgKyAnJCcpLFxuXHRcdFx0dG9rZW5zOiB0b2tlbnMsXG5cdFx0fTtcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgT1dlYlJvdXRlQ29udGV4dCB7XG5cdHByaXZhdGUgX3Rva2VuczogdFJvdXRlVG9rZW5zTWFwO1xuXHRwcml2YXRlIF9zdG9wcGVkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3RhcmdldDogdFJvdXRlVGFyZ2V0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9zdGF0ZTogdFJvdXRlU3RhdGVPYmplY3Q7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3JvdXRlcjogT1dlYlJvdXRlcjtcblxuXHQvKipcblx0ICogT1dlYlJvdXRlQ29udGV4dCBjb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHBhcmFtIHJvdXRlclxuXHQgKiBAcGFyYW0gdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZVxuXHQgKi9cblx0Y29uc3RydWN0b3IoXG5cdFx0cm91dGVyOiBPV2ViUm91dGVyLFxuXHRcdHRhcmdldDogdFJvdXRlVGFyZ2V0LFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdFxuXHQpIHtcblx0XHR0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG5cdFx0dGhpcy5fdG9rZW5zID0ge307XG5cdFx0dGhpcy5fc3RhdGUgPSBzdGF0ZSB8fCB7fTtcblx0XHR0aGlzLl9yb3V0ZXIgPSByb3V0ZXI7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyByb3V0ZSB0b2tlbiB2YWx1ZVxuXHQgKlxuXHQgKiBAcGFyYW0gdG9rZW4gVGhlIHRva2VuLlxuXHQgKi9cblx0Z2V0VG9rZW4odG9rZW46IHN0cmluZyk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuX3Rva2Vuc1t0b2tlbl07XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBhIG1hcCBvZiBhbGwgdG9rZW5zIGFuZCB2YWx1ZXMuXG5cdCAqL1xuXHRnZXRUb2tlbnMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5jcmVhdGUodGhpcy5fdG9rZW5zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBwYXRoLlxuXHQgKi9cblx0Z2V0UGF0aCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl90YXJnZXQucGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHN0b3JlZCB2YWx1ZSBpbiBoaXN0b3J5IHN0YXRlIHdpdGggYSBnaXZlbiBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgdGhlIHN0YXRlIGtleVxuXHQgKi9cblx0Z2V0U3RhdGVJdGVtKGtleTogc3RyaW5nKTogdFJvdXRlU3RhdGVJdGVtIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhdGVba2V5XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIGEga2V5IGluIGhpc3Rvcnkgc3RhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgdGhlIHN0YXRlIGtleVxuXHQgKiBAcGFyYW0gdmFsdWUgIHRoZSBzdGF0ZSB2YWx1ZVxuXHQgKi9cblx0c2V0U3RhdGVJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogdFJvdXRlU3RhdGVJdGVtKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RhdGVba2V5XSA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHNlYXJjaCBwYXJhbS5cblx0ICpcblx0ICogQHBhcmFtIHBhcmFtIHRoZSBwYXJhbSBuYW1lXG5cdCAqL1xuXHRnZXRTZWFyY2hQYXJhbShwYXJhbTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIG5ldyBVUkwodGhpcy5fdGFyZ2V0LmhyZWYpLnNlYXJjaFBhcmFtcy5nZXQocGFyYW0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHRoZSByb3V0ZSBkaXNwYXRjaGVyIGlzIHN0b3BwZWQuXG5cdCAqL1xuXHRzdG9wcGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9zdG9wcGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3AgdGhlIHJvdXRlIGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRzdG9wKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fc3RvcHBlZCkge1xuXHRcdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3aWxsIHN0b3AuJyk7XG5cdFx0XHR0aGlzLnNhdmUoKTsgLy8gc2F2ZSBiZWZvcmUgc3RvcFxuXHRcdFx0dGhpcy5fc3RvcHBlZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9yb3V0ZXIuZ2V0Q3VycmVudERpc3BhdGNoZXIoKSEuY2FuY2VsKCk7XG5cdFx0XHRjb25zb2xlLndhcm4oJ1tPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdhcyBzdG9wcGVkIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCBhbHJlYWR5IHN0b3BwZWQhJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZSBoaXN0b3J5IHN0YXRlLlxuXHQgKi9cblx0c2F2ZSgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuc3RvcHBlZCgpKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJEaXNwYXRjaENvbnRleHRdIHNhdmluZyBzdGF0ZS4uLicpO1xuXHRcdFx0dGhpcy5fcm91dGVyLnJlcGxhY2VIaXN0b3J5KHRoaXMuX3RhcmdldC5ocmVmLCB0aGlzLl9zdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXG5cdFx0XHRcdFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHlvdSBzaG91bGRuJ3QgdHJ5IHRvIHNhdmUgd2hlbiBzdG9wcGVkLlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIGFjdGlvbiBhdHRhY2hlZCB0byBhIGdpdmVuIHJvdXRlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm91dGVcblx0ICovXG5cdGFjdGlvblJ1bm5lcihyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fdG9rZW5zID0gcm91dGUucGFyc2UodGhpcy5fdGFyZ2V0LnBhdGgpO1xuXG5cdFx0cm91dGUuZ2V0QWN0aW9uKCkodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGVyIHtcblx0cHJpdmF0ZSByZWFkb25seSBfYmFzZVVybDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9oYXNoTW9kZTogYm9vbGVhbjtcblx0cHJpdmF0ZSBfY3VycmVudF90YXJnZXQ6IHRSb3V0ZVRhcmdldCA9IHtcblx0XHRwYXJzZWQ6ICcnLFxuXHRcdGhyZWY6ICcnLFxuXHRcdHBhdGg6ICcnLFxuXHRcdGZ1bGxQYXRoOiAnJyxcblx0fTtcblx0cHJpdmF0ZSBfcm91dGVzOiBPV2ViUm91dGVbXSA9IFtdO1xuXHRwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9saXN0ZW5pbmc6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbm90Rm91bmQ6IHVuZGVmaW5lZCB8ICgodGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWQpID0gdW5kZWZpbmVkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9wb3BTdGF0ZUxpc3RlbmVyOiAoZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSByZWFkb25seSBfbGlua0NsaWNrTGlzdGVuZXI6IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBfZGlzcGF0Y2hfaWQgPSAwO1xuXHRwcml2YXRlIF9jdXJyZW50X2Rpc3BhdGNoZXI/OiBpUm91dGVEaXNwYXRjaGVyO1xuXHRwcml2YXRlIF9mb3JjZV9yZXBsYWNlOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIE9XZWJSb3V0ZXIgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBiYXNlVXJsIHRoZSBiYXNlIHVybFxuXHQgKiBAcGFyYW0gaGFzaE1vZGUgd2VhdGhlciB0byB1c2UgaGFzaCBtb2RlXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihiYXNlVXJsOiBzdHJpbmcsIGhhc2hNb2RlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdGxldCByID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBwb3BzdGF0ZSAtPicsIGFyZ3VtZW50cyk7XG5cblx0XHRcdGlmIChlLnN0YXRlKSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8oZS5zdGF0ZS51cmwsIGUuc3RhdGUuZGF0YSwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ci5icm93c2VUbyh3TG9jLmhyZWYsIHVuZGVmaW5lZCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciA9IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xuXHRcdFx0ci5fb25DbGljayhlKTtcblx0XHR9O1xuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSByZWFkeSEnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTdGFydHMgdGhlIHJvdXRlci5cblx0ICpcblx0ICogQHBhcmFtIGZpcnN0UnVuIGZpcnN0IHJ1biBmbGFnXG5cdCAqIEBwYXJhbSB0YXJnZXQgaW5pdGlhbCB0YXJnZXQsIHVzdWFseSB0aGUgZW50cnkgcG9pbnRcblx0ICogQHBhcmFtIHN0YXRlIGluaXRpYWwgc3RhdGVcblx0ICovXG5cdHN0YXJ0KFxuXHRcdGZpcnN0UnVuOiBib29sZWFuID0gdHJ1ZSxcblx0XHR0YXJnZXQ6IHN0cmluZyA9IHdMb2MuaHJlZixcblx0XHRzdGF0ZT86IHRSb3V0ZVN0YXRlT2JqZWN0XG5cdCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRcdHRoaXMucmVnaXN0ZXIoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyEnKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gd2F0Y2hpbmcgcm91dGVzIC0+JywgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oJ1tPV2ViUm91dGVyXSByb3V0ZXIgYWxyZWFkeSBzdGFydGVkIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFN0b3BzIHRoZSByb3V0ZXIuXG5cdCAqL1xuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGNvbnNvbGUubG9nKCdbT1dlYlJvdXRlcl0gc3RvcCByb3V0aW5nIScpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oJ1tPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogV2hlbiBjYWxsZWQgdGhlIGN1cnJlbnQgaGlzdG9yeSB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBuZXh0IGhpc3Rvcnkgc3RhdGUuXG5cdCAqL1xuXHRmb3JjZU5leHRSZXBsYWNlKCk6IHRoaXMge1xuXHRcdHRoaXMuX2ZvcmNlX3JlcGxhY2UgPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgdGFyZ2V0LlxuXHQgKi9cblx0Z2V0Q3VycmVudFRhcmdldCgpOiB0Um91dGVUYXJnZXQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50X3RhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHJvdXRlIGV2ZW50IGRpc3BhdGNoZXIuXG5cdCAqL1xuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBpUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgcm91dGUgY29udGV4dC5cblx0ICovXG5cdGdldFJvdXRlQ29udGV4dCgpOiBPV2ViUm91dGVDb250ZXh0IHtcblx0XHRpZiAoIXRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdbT1dlYlJvdXRlcl0gbm8gcm91dGUgY29udGV4dC4nKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBnaXZlbiB1cmwuXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIHVybCB0byBwYXJzZVxuXHQgKi9cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiB0Um91dGVUYXJnZXQge1xuXHRcdGxldCBiID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdHUgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiKSxcblx0XHRcdF86IHRSb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogdS5ocmVmLFxuXHRcdFx0XHRwYXRoOiB1Lmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCAnJyksXG5cdFx0XHRcdGZ1bGxQYXRoOiB1Lmhhc2gsXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgcGF0aG5hbWUgPSB1LnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYi5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYi5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRfID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiB1LmhyZWYsXG5cdFx0XHRcdHBhdGg6IGxlYWRpbmdTbGFzaChwYXRobmFtZSksXG5cdFx0XHRcdGZ1bGxQYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUgKyB1LnNlYXJjaCArICh1Lmhhc2ggfHwgJycpKSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBwYXJzZWQgdXJsIC0+JywgXyk7XG5cblx0XHRyZXR1cm4gXztcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgdXJsIHdpdGggYSBnaXZlbiBwYXRoIGFuZCBiYXNlIHVybC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggdGhlIHBhdGhcblx0ICogQHBhcmFtIGJhc2UgdGhlIGJhc2UgdXJsXG5cdCAqL1xuXHRwYXRoVG9VUkwocGF0aDogc3RyaW5nLCBiYXNlPzogc3RyaW5nKTogVVJMIHtcblx0XHRiYXNlID0gYmFzZSAmJiBiYXNlLmxlbmd0aCA/IGJhc2UgOiB0aGlzLl9iYXNlVXJsO1xuXG5cdFx0aWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKC9eaHR0cHM/OlxcL1xcLy8udGVzdChwYXRoKSkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0cGF0aCA9IHRoaXMuX2hhc2hNb2RlID8gaGFzaFRhZ1N0ciArIGxlYWRpbmdTbGFzaChwYXRoKSA6IHBhdGg7XG5cblx0XHRyZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBdHRhY2ggYSByb3V0ZSBhY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRoIHRoZSBwYXRoIHRvIHdhdGNoXG5cdCAqIEBwYXJhbSBydWxlcyB0aGUgcGF0aCBydWxlc1xuXHQgKiBAcGFyYW0gYWN0aW9uIHRoZSBhY3Rpb24gdG8gcnVuXG5cdCAqL1xuXHRvbihcblx0XHRwYXRoOiB0Um91dGVQYXRoLFxuXHRcdHJ1bGVzOiB0Um91dGVQYXRoT3B0aW9ucyA9IHt9LFxuXHRcdGFjdGlvbjogdFJvdXRlQWN0aW9uXG5cdCk6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKG5ldyBPV2ViUm91dGUocGF0aCwgcnVsZXMsIGFjdGlvbikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEF0dGFjaCBhIHJvdXRlXG5cdCAqXG5cdCAqIEBwYXJhbSBoYW5kbGVyIHRoZSBub3Rmb3VuZCBoYW5kbGVyXG5cdCAqL1xuXHRub3RGb3VuZChoYW5kbGVyOiAodGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWQpOiB0aGlzIHtcblx0XHR0aGlzLl9ub3RGb3VuZCA9IGhhbmRsZXI7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR28gYmFjay5cblx0ICpcblx0ICogQHBhcmFtIGRpc3RhbmNlIHRoZSBkaXN0YW5jZSBpbiBoaXN0b3J5XG5cdCAqL1xuXHRnb0JhY2soZGlzdGFuY2U6IG51bWJlciA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2sgLT4gJywgZGlzdGFuY2UpO1xuXHRcdFx0bGV0IGhMZW4gPSB3SGlzdG9yeS5sZW5ndGg7XG5cdFx0XHRpZiAoaExlbiA+IDEpIHtcblx0XHRcdFx0aWYgKGhMZW4gPj0gZGlzdGFuY2UpIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtZGlzdGFuY2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1oTGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29yZG92YVxuXHRcdFx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJyb3dzZSB0byBhIHNwZWNpZmljIGxvY2F0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSB1cmwgdGhlIG5leHQgdXJsXG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaW5pdGlhbCBzdGF0ZVxuXHQgKiBAcGFyYW0gcHVzaCBzaG91bGQgd2UgcHVzaCBpbnRvIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSBpZ25vcmVTYW1lTG9jYXRpb24gIGlnbm9yZSBicm93c2luZyBhZ2FpbiB0byBzYW1lIGxvY2F0aW9uXG5cdCAqL1xuXHRicm93c2VUbyhcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSxcblx0XHRwdXNoOiBib29sZWFuID0gdHJ1ZSxcblx0XHRpZ25vcmVTYW1lTG9jYXRpb246IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiB0aGlzIHtcblx0XHRsZXQgdGFyZ2V0VXJsID0gdGhpcy5wYXRoVG9VUkwodXJsKSxcblx0XHRcdHRhcmdldCA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0X2NkID0gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyLFxuXHRcdFx0Y2Q6IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBicm93c2luZyB0byAtPiAnLCB0YXJnZXQucGF0aCwge1xuXHRcdFx0c3RhdGUsXG5cdFx0XHRwdXNoLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdH0pO1xuXG5cdFx0aWYgKGlnbm9yZVNhbWVMb2NhdGlvbiAmJiB0aGlzLl9jdXJyZW50X3RhcmdldC5ocmVmID09PSB0YXJnZXQuaHJlZikge1xuXHRcdFx0Y29uc29sZS5sb2coJ1tPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbiAtPiAnLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoX2NkICYmIF9jZC5pc0FjdGl2ZSgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXG5cdFx0XHRcdCdbT1dlYlJvdXRlcl0gYnJvd3NlVG8gY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nIC0+ICcsXG5cdFx0XHRcdF9jZFxuXHRcdFx0KTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50X3RhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9mb3JjZV9yZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudF9kaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIoXG5cdFx0XHR0YXJnZXQsXG5cdFx0XHRzdGF0ZSxcblx0XHRcdCsrdGhpcy5fZGlzcGF0Y2hfaWRcblx0XHQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0J1tPV2ViUm91dGVyXSBubyByb3V0ZSBmb3VuZCBmb3IgcGF0aCAtPicsXG5cdFx0XHRcdHRhcmdldC5wYXRoXG5cdFx0XHQpO1xuXHRcdFx0aWYgKHRoaXMuX25vdEZvdW5kKSB7XG5cdFx0XHRcdHRoaXMuX25vdEZvdW5kKHRhcmdldCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1tPV2ViUm91dGVyXSBub3RGb3VuZCBhY3Rpb24gaXMgbm90IGRlZmluZWQhJyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoX2lkICYmICFjZC5jb250ZXh0LnN0b3BwZWQoKSkge1xuXHRcdFx0Y2QuY29udGV4dC5zYXZlKCk7XG5cdFx0XHRjb25zb2xlLmxvZygnW09XZWJSb3V0ZXJdIHN1Y2Nlc3MgLT4nLCB0YXJnZXQucGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRhZGRIaXN0b3J5KFxuXHRcdHVybDogc3RyaW5nLFxuXHRcdHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCxcblx0XHR0aXRsZTogc3RyaW5nID0gJydcblx0KTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5wdXNoU3RhdGUoeyB1cmwsIGRhdGE6IHN0YXRlIH0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0Y29uc29sZS53YXJuKCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSBhZGRlZCcsIHN0YXRlLCB1cmwpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVwbGFjZSB0aGUgY3VycmVudCBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdXJsIHRoZSB1cmxcblx0ICogQHBhcmFtIHN0YXRlIHRoZSBoaXN0b3J5IHN0YXRlXG5cdCAqIEBwYXJhbSB0aXRsZSB0aGUgd2luZG93IHRpdGxlXG5cdCAqL1xuXHRyZXBsYWNlSGlzdG9yeShcblx0XHR1cmw6IHN0cmluZyxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0dGl0bGU6IHN0cmluZyA9ICcnXG5cdCk6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHsgdXJsLCBkYXRhOiBzdGF0ZSB9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGNvbnNvbGUud2Fybihcblx0XHRcdCdbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCAtPiAnLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGUsXG5cdFx0XHR1cmxcblx0XHQpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHJvdXRlIGV2ZW50IGRpc3BhdGNoZXJcblx0ICpcblx0ICogQHBhcmFtIHRhcmdldCB0aGUgcm91dGUgdGFyZ2V0XG5cdCAqIEBwYXJhbSBzdGF0ZSB0aGUgaGlzdG9yeSBzdGF0ZVxuXHQgKiBAcGFyYW0gaWQgdGhlIGRpc3BhdGNoZXIgaWRcblx0ICovXG5cdHByaXZhdGUgY3JlYXRlRGlzcGF0Y2hlcihcblx0XHR0YXJnZXQ6IHRSb3V0ZVRhcmdldCxcblx0XHRzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsXG5cdFx0aWQ6IG51bWJlclxuXHQpOiBpUm91dGVEaXNwYXRjaGVyIHtcblx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNyZWF0aW9uLmApO1xuXG5cdFx0bGV0IGN0eCA9IHRoaXMsXG5cdFx0XHRmb3VuZDogT1dlYlJvdXRlW10gPSBbXSxcblx0XHRcdGFjdGl2ZSA9IGZhbHNlLFxuXHRcdFx0cm91dGVDb250ZXh0ID0gbmV3IE9XZWJSb3V0ZUNvbnRleHQodGhpcywgdGFyZ2V0LCBzdGF0ZSksXG5cdFx0XHRvOiBpUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjdHguX3JvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHJvdXRlID0gY3R4Ll9yb3V0ZXNbaV07XG5cblx0XHRcdGlmIChyb3V0ZS5pcyh0YXJnZXQucGF0aCkpIHtcblx0XHRcdFx0Zm91bmQucHVzaChyb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0byA9IHtcblx0XHRcdGNvbnRleHQ6IHJvdXRlQ29udGV4dCxcblx0XHRcdGlkLFxuXHRcdFx0Zm91bmQsXG5cdFx0XHRpc0FjdGl2ZTogKCkgPT4gYWN0aXZlLFxuXHRcdFx0Y2FuY2VsOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCFgLFxuXHRcdFx0XHRcdFx0b1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihcblx0XHRcdFx0XHRcdGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY2FuY2VsIGNhbGxlZCB3aGVuIGluYWN0aXZlLmAsXG5cdFx0XHRcdFx0XHRvXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0XHRkaXNwYXRjaDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBzdGFydCAtPmAsIG8pO1xuXG5cdFx0XHRcdFx0bGV0IGogPSAtMTtcblx0XHRcdFx0XHRhY3RpdmUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0d2hpbGUgKGFjdGl2ZSAmJiArK2ogPCBmb3VuZC5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdHJvdXRlQ29udGV4dC5hY3Rpb25SdW5uZXIoZm91bmRbal0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGlzIGJ1c3khYCwgbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbztcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIERPTSBldmVudHMgaGFuZGxlci5cblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IHRydWU7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLmFkZEV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdGxpbmtDbGlja0V2ZW50LFxuXHRcdFx0XHR0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lcixcblx0XHRcdFx0ZmFsc2Vcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVW5yZWdpc3RlciBhbGwgRE9NIGV2ZW50cyBoYW5kbGVyLlxuXHQgKi9cblx0cHJpdmF0ZSB1bnJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IGZhbHNlO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG5cdFx0XHRcdCdwb3BzdGF0ZScsXG5cdFx0XHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdFx0d0RvYy5yZW1vdmVFdmVudExpc3RlbmVyKFxuXHRcdFx0XHRsaW5rQ2xpY2tFdmVudCxcblx0XHRcdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZSBjbGljayBldmVudFxuXHQgKlxuXHQgKiBvbmNsaWNrIGZyb20gcGFnZS5qcyBsaWJyYXJ5OiBnaXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcblx0ICpcblx0ICogQHBhcmFtIGUgdGhlIGVudmVudCBvYmplY3Rcblx0ICovXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmUudGFyZ2V0LFxuXHRcdFx0ZXZlbnRQYXRoID1cblx0XHRcdFx0KGUgYXMgYW55KS5wYXRoIHx8XG5cdFx0XHRcdCgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoW2ldLm5vZGVOYW1lKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKGV2ZW50UGF0aFtpXS5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpICE9PSAnQScpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSA8YW55PmVsLnBhcmVudE5vZGU7XG5cdFx0aWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGlmIGxpbmsgaXMgaW5zaWRlIGFuIHN2Z1xuXHRcdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdFx0bGV0IHN2ZyA9XG5cdFx0XHR0eXBlb2YgKGVsIGFzIGFueSkuaHJlZiA9PT0gJ29iamVjdCcgJiZcblx0XHRcdChlbCBhcyBhbnkpLmhyZWYuY29uc3RydWN0b3IubmFtZSA9PT0gJ1NWR0FuaW1hdGVkU3RyaW5nJztcblxuXHRcdC8vIElnbm9yZSBpZiB0YWcgaGFzXG5cdFx0Ly8gMS4gXCJkb3dubG9hZFwiIGF0dHJpYnV0ZVxuXHRcdC8vIDIuIHJlbD1cImV4dGVybmFsXCIgYXR0cmlidXRlXG5cdFx0aWYgKFxuXHRcdFx0ZWwuaGFzQXR0cmlidXRlKCdkb3dubG9hZCcpIHx8XG5cdFx0XHRlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnXG5cdFx0KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG5cdFx0bGV0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcblx0XHRpZiAoXG5cdFx0XHQhdGhpcy5faGFzaE1vZGUgJiZcblx0XHRcdHNhbWVQYXRoKGVsIGFzIGFueSkgJiZcblx0XHRcdCgoZWwgYXMgYW55KS5oYXNoIHx8ICcjJyA9PT0gbGluaylcblx0XHQpXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHQgbGV0IGhhc1Byb2Nlc3MgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCc7XG5cdFx0IGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdCB0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5yZXBsYWNlKC9eXFwvW2EtekEtWl06XFwvLywgXCIvXCIpO1xuXHRcdCB9XG5cdFx0ICovXG5cblx0XHRsZXQgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSByZXR1cm47XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHQnW09XZWJSb3V0ZXJdW2NsaWNrXSAtPicsXG5cdFx0XHRlbCxcblx0XHRcdG9yaWcsXG5cdFx0XHR0YXJnZXRIcmVmLFxuXHRcdFx0d0hpc3Rvcnkuc3RhdGVcblx0XHQpO1xuXHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdH1cbn1cbiJdfQ==