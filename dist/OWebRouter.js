import Utils from "./utils/Utils";
const tokenTypesRegMap = {
    "num": /\d+/.source,
    "alpha": /[a-zA-Z]+/.source,
    "alpha-u": /[a-z]+/.source,
    "alpha-l": /[A-Z]+/.source,
    "alpha-num": /[a-zA-Z0-9]+/.source,
    "alpha-num-l": /[a-z0-9]+/.source,
    "alpha-num-u": /[A-Z0-9]+/.source,
    "any": /[^/]+/.source
}, token_reg = /:([a-z][a-z0-9_]*)/i, wLoc = window.location, wDoc = window.document, wHistory = window.history, linkClickEvent = wDoc.ontouchstart ? "touchstart" : "click", hashTagStr = "#!";
const which = function (e) {
    e = e || window.event;
    return null == e.which ? e.button : e.which;
}, samePath = function (url) {
    return url.pathname === wLoc.pathname &&
        url.search === wLoc.search;
}, sameOrigin = function (href) {
    if (!href)
        return false;
    let url = new URL(href.toString(), wLoc.toString());
    return wLoc.protocol === url.protocol &&
        wLoc.hostname === url.hostname &&
        wLoc.port === url.port;
}, escapeString = function (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
}, stringReg = function (str) {
    return new RegExp(escapeString(str));
}, leadingSlash = (path) => {
    if (!path.length || path == "/") {
        return "/";
    }
    return path[0] != "/" ? "/" + path : path;
}, wrapReg = (str, capture = false) => capture ? "(" + str + ")" : "(?:" + str + ")";
export class OWebRoute {
    /**
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
            options = (Utils.isPlainObject(options) ? options : {});
            let p = OWebRoute.parseDynamicPath(path, options);
            this.path = path;
            this.reg = p.reg;
            this.tokens = p.tokens;
        }
        else {
            throw new TypeError("[OWebRoute] invalid route path, string or RegExp required.");
        }
        if ("function" !== typeof action) {
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
        let tokens = [], reg = "", _path = path, match;
        while ((match = token_reg.exec(_path)) != null) {
            let found = match[0], token = match[1], rule = options[token] || "any", head = _path.slice(0, match.index);
            if (head.length) {
                reg += wrapReg(stringReg(head).source);
            }
            if (typeof rule === "string" && rule in tokenTypesRegMap) {
                reg += wrapReg(tokenTypesRegMap[rule], true);
            }
            else if (rule instanceof RegExp) {
                reg += wrapReg(rule.source, true);
            }
            else {
                throw new Error("Invalid rule for token ':" + token + "' in path '" + path + "'");
            }
            tokens.push(token);
            _path = _path.slice(match.index + found.length);
        }
        if (!reg.length) {
            return {
                reg: null,
                tokens: tokens
            };
        }
        if (_path.length) {
            reg += wrapReg(stringReg(_path).source);
        }
        return {
            reg: new RegExp("^" + reg + "$"),
            tokens: tokens
        };
    }
}
export class OWebRouteContext {
    constructor(router, target, state) {
        this._stopped = false;
        this._target = target;
        this._tokens = {};
        this._state = state || {};
        this._router = router;
    }
    getToken(token) {
        return this._tokens[token];
    }
    getTokens() {
        return Object.create(this._tokens);
    }
    getPath() {
        return this._target.path;
    }
    getStateItem(key) {
        return this._state[key];
    }
    getSearchParam(param) {
        return new URL(this._target.href).searchParams.get(param);
    }
    setStateItem(key, value) {
        this._state[key] = value;
        return this.save();
    }
    stopped() {
        return this._stopped;
    }
    stop() {
        if (!this._stopped) {
            console.warn("[OWebDispatchContext] route context will stop.");
            this.save(); // save before stop
            this._stopped = true;
            this._router.getCurrentDispatcher().cancel();
            console.warn("[OWebDispatchContext] route context was stopped!");
        }
        else {
            console.warn("[OWebDispatchContext] route context already stopped!");
        }
        return this;
    }
    save() {
        if (!this.stopped()) {
            console.log("[OWebDispatchContext] saving state...");
            this._router.replaceHistory(this._target.href, this._state);
        }
        else {
            console.error("[OWebDispatchContext] you shouldn't try to save when stopped.");
        }
        return this;
    }
    actionRunner(route) {
        this._tokens = route.parse(this._target.path);
        route.getAction()(this);
        return this;
    }
}
export default class OWebRouter {
    constructor(baseUrl, hashMode = true) {
        this._current_target = {
            parsed: "",
            href: "",
            path: "",
            fullPath: ""
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
            console.log("[OWebRouter] popstate ->", arguments);
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
        console.log("[OWebRouter] ready!");
    }
    start(firstRun = true, target = wLoc.href, state) {
        if (!this._initialized) {
            this._initialized = true;
            this.register();
            console.log("[OWebRouter] start routing!");
            console.log("[OWebRouter] watching routes ->", this._routes);
            firstRun && this.browseTo(target, state, false);
        }
        else {
            console.warn("[OWebRouter] router already started!");
        }
        return this;
    }
    stopRouting() {
        if (this._initialized) {
            this._initialized = false;
            this.unregister();
            console.log("[OWebRouter] stop routing!");
        }
        else {
            console.warn("[OWebRouter] you should start routing first!");
        }
        return this;
    }
    forceNextReplace() {
        this._force_replace = true;
        return this;
    }
    getCurrentTarget() {
        return this._current_target;
    }
    getCurrentDispatcher() {
        return this._current_dispatcher;
    }
    getRouteContext() {
        if (!this._current_dispatcher) {
            throw new Error("[OWebRouter] no route context.");
        }
        return this._current_dispatcher.context;
    }
    parseURL(url) {
        let b = new URL(this._baseUrl), u = new URL(url.toString(), b), _;
        if (this._hashMode) {
            _ = {
                parsed: url.toString(),
                href: u.href,
                path: u.hash.replace(hashTagStr, ""),
                fullPath: u.hash
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
                fullPath: leadingSlash(pathname + u.search + (u.hash || ""))
            };
        }
        console.log("[OWebRouter] parsed url ->", _);
        return _;
    }
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
    on(path, rules = {}, action) {
        this._routes.push(new OWebRoute(path, rules, action));
        return this;
    }
    notFound(callback) {
        this._notFound = callback;
        return this;
    }
    goBack(distance = 1) {
        if (distance > 0) {
            console.log("[OWebRouter] going back -> ", distance);
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
    browseTo(url, state = {}, push = true, ignoreSameLocation = false) {
        let targetUrl = this.pathToURL(url), target = this.parseURL(targetUrl.href), _cd = this._current_dispatcher, cd;
        if (!sameOrigin(target.href)) {
            window.open(url);
            return this;
        }
        console.log("[OWebRouter] browsing to -> ", target.path, { state, push, target });
        if (ignoreSameLocation && this._current_target.href === target.href) {
            console.log("[OWebRouter] ignore same location -> ", target.path);
            return this;
        }
        if (_cd && _cd.isActive()) {
            console.warn("[OWebRouter] browseTo called while dispatching -> ", _cd);
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
            console.warn("[OWebRouter] no route found for path ->", target.path);
            if (this._notFound) {
                this._notFound(target);
            }
            else {
                throw new Error("[OWebRouter] notFound action is not defined!");
            }
            return this;
        }
        cd.dispatch();
        if (cd.id === this._dispatch_id && !cd.context.stopped()) {
            cd.context.save();
            console.log("[OWebRouter] success ->", target.path);
        }
        return this;
    }
    addHistory(url, state, title = "") {
        title = title && title.length ? title : wDoc.title;
        wHistory.pushState({ url, data: state }, title, url);
        console.warn("[OWebDispatchContext] history added", state, url);
        return this;
    }
    replaceHistory(url, state, title = "") {
        title = title && title.length ? title : wDoc.title;
        wHistory.replaceState({ url, data: state }, title, url);
        console.warn("[OWebDispatchContext] history replaced -> ", wHistory.state, url);
        return this;
    }
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
            }
        };
        return o;
    }
    register() {
        if (!this._listening) {
            this._listening = true;
            window.addEventListener("popstate", this._popStateListener, false);
            wDoc.addEventListener(linkClickEvent, this._linkClickListener, false);
        }
        return this;
    }
    unregister() {
        if (this._listening) {
            this._listening = false;
            window.removeEventListener("popstate", this._popStateListener, false);
            wDoc.removeEventListener(linkClickEvent, this._linkClickListener, false);
        }
        return this;
    }
    // onclick from page.js library: github.com/visionmedia/page.js
    _onClick(e) {
        if (1 !== which(e))
            return;
        if (e.metaKey || e.ctrlKey || e.shiftKey)
            return;
        if (e.defaultPrevented)
            return;
        // ensure link
        // use shadow dom when available if not, fall back to composedPath() for browsers that only have shady
        let el = e.target, eventPath = e.path || (e.composedPath ? e.composedPath() : null);
        if (eventPath) {
            for (let i = 0; i < eventPath.length; i++) {
                if (!eventPath[i].nodeName)
                    continue;
                if (eventPath[i].nodeName.toUpperCase() !== "A")
                    continue;
                if (!eventPath[i].href)
                    continue;
                el = eventPath[i];
                break;
            }
        }
        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && "A" !== el.nodeName.toUpperCase())
            el = el.parentNode;
        if (!el || "A" !== el.nodeName.toUpperCase())
            return;
        // we check if link is inside an svg
        // in this case, both href and target are always inside an object
        let svg = (typeof el.href === "object") && el.href.constructor.name === "SVGAnimatedString";
        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute("download") || el.getAttribute("rel") === "external")
            return;
        // ensure non-hash for the same path
        let link = el.getAttribute("href");
        if (!this._hashMode && samePath(el) && (el.hash || "#" === link))
            return;
        // we check for mailto: in the href
        if (link && link.indexOf("mailto:") > -1)
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
        console.log("[OWebRouter][click] ->", el, orig, targetHref, wHistory.state);
        this.browseTo(orig);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXdCbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUN4QixLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07SUFDbkIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxNQUFNO0lBQzNCLFNBQVMsRUFBRSxRQUFRLENBQUMsTUFBTTtJQUMxQixTQUFTLEVBQUUsUUFBUSxDQUFDLE1BQU07SUFDMUIsV0FBVyxFQUFFLGNBQWMsQ0FBQyxNQUFNO0lBQ2xDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNO0NBQ3JCLEVBQ0EsU0FBUyxHQUFHLHFCQUFxQixFQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFDdEIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQ3RCLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUN6QixjQUFjLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzNELFVBQVUsR0FBRyxJQUFJLENBQUM7QUFFbkIsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFNO0lBQzdCLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDQSxRQUFRLEdBQUcsVUFBVSxHQUFRO0lBQzVCLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUTtRQUNwQyxHQUFH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WUFBRSxPQUFPO1FBRWxFLFdBQVc7UUFDWCxtRkFBbUY7UUFDbkYsd0ZBQXdGO1FBQ3hGLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUUsRUFBVSxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU87UUFFbEQsZUFBZTtRQUNmLDZFQUE2RTtRQUM3RSw0RUFBNEU7UUFDNUUsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBRSxFQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLElBQUksQ0FBQztRQUVuRSx1REFBdUQ7UUFDdkQ7Ozs7O1dBS0c7UUFFSCxJQUFJLElBQUksR0FBRyxVQUFVLENBQUM7UUFFdEIsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyRDtRQUVELElBQUksSUFBSSxLQUFLLFVBQVU7WUFBRSxPQUFPO1FBRWhDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JCLENBQUM7Q0FFRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBVdGlscyBmcm9tIFwiLi91dGlscy9VdGlsc1wiO1xuXG5leHBvcnQgdHlwZSB0Um91dGVQYXRoID0gc3RyaW5nIHwgUmVnRXhwO1xuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aE9wdGlvbnMgPSB7IFsga2V5OiBzdHJpbmcgXTogUmVnRXhwIHwga2V5b2YgdHlwZW9mIHRva2VuVHlwZXNSZWdNYXAgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRva2Vuc01hcCA9IHsgWyBrZXk6IHN0cmluZyBdOiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZUFjdGlvbiA9IChjdHg6IE9XZWJSb3V0ZUNvbnRleHQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0Um91dGVJbmZvID0geyByZWc6IFJlZ0V4cCB8IG51bGwsIHRva2VuczogQXJyYXk8c3RyaW5nPiB9O1xudHlwZSBfdFJvdXRlU3RhdGVJdGVtID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgfCBEYXRlIHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgQXJyYXk8X3RSb3V0ZVN0YXRlSXRlbT47XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZU9iamVjdCA9IHsgWyBrZXk6IHN0cmluZyBdOiB0Um91dGVTdGF0ZUl0ZW0gfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHsgcGFyc2VkOiBzdHJpbmcsIGhyZWY6IHN0cmluZywgcGF0aDogc3RyaW5nLCBmdWxsUGF0aDogc3RyaW5nIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVJvdXRlRGlzcGF0Y2hlciB7XG5cdHJlYWRvbmx5IGlkOiBudW1iZXIsXG5cdHJlYWRvbmx5IGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsXG5cdHJlYWRvbmx5IGZvdW5kOiBPV2ViUm91dGVbXVxuXG5cdGlzQWN0aXZlKCk6IGJvb2xlYW4sXG5cblx0ZGlzcGF0Y2goKTogdGhpcyxcblxuXHRjYW5jZWwoKTogdGhpcyxcbn1cblxuY29uc3QgdG9rZW5UeXBlc1JlZ01hcCA9IHtcblx0XCJudW1cIjogL1xcZCsvLnNvdXJjZSxcblx0XCJhbHBoYVwiOiAvW2EtekEtWl0rLy5zb3VyY2UsXG5cdFwiYWxwaGEtdVwiOiAvW2Etel0rLy5zb3VyY2UsXG5cdFwiYWxwaGEtbFwiOiAvW0EtWl0rLy5zb3VyY2UsXG5cdFwiYWxwaGEtbnVtXCI6IC9bYS16QS1aMC05XSsvLnNvdXJjZSxcblx0XCJhbHBoYS1udW0tbFwiOiAvW2EtejAtOV0rLy5zb3VyY2UsXG5cdFwiYWxwaGEtbnVtLXVcIjogL1tBLVowLTldKy8uc291cmNlLFxuXHRcImFueVwiOiAvW14vXSsvLnNvdXJjZVxufSxcblx0dG9rZW5fcmVnID0gLzooW2Etel1bYS16MC05X10qKS9pLFxuXHR3TG9jID0gd2luZG93LmxvY2F0aW9uLFxuXHR3RG9jID0gd2luZG93LmRvY3VtZW50LFxuXHR3SGlzdG9yeSA9IHdpbmRvdy5oaXN0b3J5LFxuXHRsaW5rQ2xpY2tFdmVudCA9IHdEb2Mub250b3VjaHN0YXJ0ID8gXCJ0b3VjaHN0YXJ0XCIgOiBcImNsaWNrXCIsXG5cdGhhc2hUYWdTdHIgPSBcIiMhXCI7XG5cbmNvbnN0IHdoaWNoID0gZnVuY3Rpb24gKGU6IGFueSkge1xuXHRlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdHJldHVybiBudWxsID09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG59LFxuXHRzYW1lUGF0aCA9IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuXHRcdHJldHVybiB1cmwucGF0aG5hbWUgPT09IHdMb2MucGF0aG5hbWUgJiZcblx0XHRcdHVybC5zZWFyY2ggPT09IHdMb2Muc2VhcmNoO1xuXHR9LFxuXHRzYW1lT3JpZ2luID0gZnVuY3Rpb24gKGhyZWY6IHN0cmluZykge1xuXHRcdGlmICghaHJlZikgcmV0dXJuIGZhbHNlO1xuXHRcdGxldCB1cmwgPSBuZXcgVVJMKGhyZWYudG9TdHJpbmcoKSwgd0xvYy50b1N0cmluZygpKTtcblxuXHRcdHJldHVybiB3TG9jLnByb3RvY29sID09PSB1cmwucHJvdG9jb2wgJiZcblx0XHRcdHdMb2MuaG9zdG5hbWUgPT09IHVybC5ob3N0bmFtZSAmJlxuXHRcdFx0d0xvYy5wb3J0ID09PSB1cmwucG9ydDtcblx0fSxcblx0ZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24gKHN0cjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcL10pL2csIFwiXFxcXCQxXCIpO1xuXHR9LFxuXHRzdHJpbmdSZWcgPSBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gbmV3IFJlZ0V4cChlc2NhcGVTdHJpbmcoc3RyKSk7XG5cdH0sXG5cdGxlYWRpbmdTbGFzaCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRcdGlmICghcGF0aC5sZW5ndGggfHwgcGF0aCA9PSBcIi9cIikge1xuXHRcdFx0cmV0dXJuIFwiL1wiO1xuXHRcdH1cblxuXHRcdHJldHVybiBwYXRoWyAwIF0gIT0gXCIvXCIgPyBcIi9cIiArIHBhdGggOiBwYXRoO1xuXHR9LFxuXHR3cmFwUmVnID0gKHN0cjogc3RyaW5nLCBjYXB0dXJlOiBib29sZWFuID0gZmFsc2UpID0+IGNhcHR1cmUgPyBcIihcIiArIHN0ciArIFwiKVwiIDogXCIoPzpcIiArIHN0ciArIFwiKVwiO1xuXG5leHBvcnQgY2xhc3MgT1dlYlJvdXRlIHtcblx0cHJpdmF0ZSByZWFkb25seSBwYXRoOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgcmVnOiBSZWdFeHAgfCBudWxsO1xuXHRwcml2YXRlIHRva2VuczogQXJyYXk8c3RyaW5nPjtcblx0cHJpdmF0ZSByZWFkb25seSBhY3Rpb246IHRSb3V0ZUFjdGlvbjtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHBhdGggVGhlIHJvdXRlIHBhdGggc3RyaW5nIG9yIHJlZ2V4cC5cblx0ICogQHBhcmFtIG9wdGlvbnMgVGhlIHJvdXRlIG9wdGlvbnMuXG5cdCAqIEBwYXJhbSBhY3Rpb24gVGhlIHJvdXRlIGFjdGlvbiBmdW5jdGlvbi5cblx0ICovXG5cdGNvbnN0cnVjdG9yKHBhdGg6IHN0cmluZyB8IFJlZ0V4cCwgb3B0aW9uczogdFJvdXRlUGF0aE9wdGlvbnMgfCBBcnJheTxzdHJpbmc+LCBhY3Rpb246IHRSb3V0ZUFjdGlvbikge1xuXG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCA9IHBhdGgudG9TdHJpbmcoKTtcblx0XHRcdHRoaXMucmVnID0gcGF0aDtcblx0XHRcdHRoaXMudG9rZW5zID0gVXRpbHMuaXNBcnJheShvcHRpb25zKSA/IG9wdGlvbnMgOiBbXTtcblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKHBhdGgpICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRvcHRpb25zID0gPHRSb3V0ZVBhdGhPcHRpb25zPihVdGlscy5pc1BsYWluT2JqZWN0KG9wdGlvbnMpID8gb3B0aW9ucyA6IHt9KTtcblx0XHRcdGxldCBwID0gT1dlYlJvdXRlLnBhcnNlRHluYW1pY1BhdGgocGF0aCwgb3B0aW9ucyk7XG5cdFx0XHR0aGlzLnBhdGggPSBwYXRoO1xuXHRcdFx0dGhpcy5yZWcgPSBwLnJlZztcblx0XHRcdHRoaXMudG9rZW5zID0gcC50b2tlbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYlJvdXRlXSBpbnZhbGlkIHJvdXRlIHBhdGgsIHN0cmluZyBvciBSZWdFeHAgcmVxdWlyZWQuXCIpO1xuXHRcdH1cblxuXHRcdGlmIChcImZ1bmN0aW9uXCIgIT09IHR5cGVvZiBhY3Rpb24pIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYFtPV2ViUm91dGVdIGludmFsaWQgYWN0aW9uIHR5cGUsIGdvdCBcIiR7IHR5cGVvZiBhY3Rpb24gfVwiIGluc3RlYWQgb2YgXCJmdW5jdGlvblwiLmApO1xuXHRcdH1cblxuXHRcdHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHJvdXRlIGlzIGR5bmFtaWMgZmFsc2Ugb3RoZXJ3aXNlLlxuXHQgKi9cblx0aXNEeW5hbWljKCkge1xuXHRcdHJldHVybiB0aGlzLnJlZyAhPSBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgcm91dGUgYWN0aW9uLlxuXHQgKi9cblx0Z2V0QWN0aW9uKCk6IHRSb3V0ZUFjdGlvbiB7XG5cdFx0cmV0dXJuIHRoaXMuYWN0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIGdpdmVuIHBhdGhuYW1lIG1hdGNoIHRoaXMgcm91dGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXRobmFtZVxuXHQgKi9cblx0aXMocGF0aG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnJlZyA/IHRoaXMucmVnLnRlc3QocGF0aG5hbWUpIDogdGhpcy5wYXRoID09PSBwYXRobmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIGdpdmVuIHBhdGhuYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aG5hbWVcblx0ICovXG5cdHBhcnNlKHBhdGhuYW1lOiBzdHJpbmcpOiB0Um91dGVUb2tlbnNNYXAge1xuXG5cdFx0aWYgKHRoaXMuaXNEeW5hbWljKCkpIHtcblx0XHRcdGxldCBmb3VuZHM6IGFueSA9IFN0cmluZyhwYXRobmFtZSkubWF0Y2godGhpcy5yZWcgYXMgUmVnRXhwKTtcblxuXHRcdFx0aWYgKGZvdW5kcykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy50b2tlbnMucmVkdWNlKChhY2M6IGFueSwga2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpID0+IHtcblx0XHRcdFx0XHRhY2NbIGtleSBdID0gZm91bmRzWyBpbmRleCArIDEgXTtcblx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgZHluYW1pYyBwYXRoIGFuZCByZXR1cm5zIGFwcHJvcHJpYXRlIHJlZ2V4cCBhbmQgdG9rZW5zIGxpc3QuXG5cdCAqXG5cdCAqIGBgYGpzXG5cdCAqIGxldCBmb3JtYXQgPSBcInBhdGgvdG8vOmlkL2ZpbGUvOmluZGV4L25hbWUuOmZvcm1hdFwiO1xuXHQgKiBsZXQgb3B0aW9ucyA9IHtcblx0ICogXHRcdGlkOiBcIm51bVwiLFxuXHQgKiBcdFx0aW5kZXg6IFwiYWxwaGFcIixcblx0ICogXHRcdGZvcm1hdDpcdFwiYWxwaGEtbnVtXCJcblx0ICogfTtcblx0ICogbGV0IGluZm8gPSBwYXJzZUR5bmFtaWNQYXRoKGZvcm1hdCxvcHRpb25zKTtcblx0ICpcblx0ICogaW5mbyA9PT0ge1xuXHQgKiAgICAgcmVnOiBSZWdFeHAsXG5cdCAqICAgICB0b2tlbnM6IFtcImlkXCIsXCJpbmRleFwiLFwiZm9ybWF0XCJdXG5cdCAqIH07XG5cdCAqIGBgYFxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBmb3JtYXQgc3RyaW5nLlxuXHQgKiBAcGFyYW0gb3B0aW9ucyBUaGUgcGF0aCBvcHRpb25zLlxuXHQgKi9cblx0c3RhdGljIHBhcnNlRHluYW1pY1BhdGgocGF0aDogc3RyaW5nLCBvcHRpb25zOiB0Um91dGVQYXRoT3B0aW9ucyk6IHRSb3V0ZUluZm8ge1xuXG5cdFx0bGV0IHRva2VuczogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdFx0cmVnOiBzdHJpbmcgPSBcIlwiLFxuXHRcdFx0X3BhdGg6IHN0cmluZyA9IHBhdGgsXG5cdFx0XHRtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuXHRcdHdoaWxlICgobWF0Y2ggPSB0b2tlbl9yZWcuZXhlYyhfcGF0aCkpICE9IG51bGwpIHtcblx0XHRcdGxldCBmb3VuZDogYW55ID0gbWF0Y2hbIDAgXSxcblx0XHRcdFx0dG9rZW46IGFueSA9IG1hdGNoWyAxIF0sXG5cdFx0XHRcdHJ1bGU6IGFueSA9IG9wdGlvbnNbIHRva2VuIF0gfHwgXCJhbnlcIixcblx0XHRcdFx0aGVhZDogc3RyaW5nID0gX3BhdGguc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG5cdFx0XHRpZiAoaGVhZC5sZW5ndGgpIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKGhlYWQpLnNvdXJjZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgcnVsZSA9PT0gXCJzdHJpbmdcIiAmJiBydWxlIGluIHRva2VuVHlwZXNSZWdNYXApIHtcblx0XHRcdFx0cmVnICs9IHdyYXBSZWcoKHRva2VuVHlwZXNSZWdNYXAgYXMgYW55KVsgcnVsZSBdLCB0cnVlKTtcblx0XHRcdH0gZWxzZSBpZiAocnVsZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0XHRyZWcgKz0gd3JhcFJlZyhydWxlLnNvdXJjZSwgdHJ1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJ1bGUgZm9yIHRva2VuICc6XCIgKyB0b2tlbiArIFwiJyBpbiBwYXRoICdcIiArIHBhdGggKyBcIidcIik7XG5cdFx0XHR9XG5cblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblxuXHRcdFx0X3BhdGggPSBfcGF0aC5zbGljZShtYXRjaC5pbmRleCArIGZvdW5kLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFyZWcubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZWc6IG51bGwsXG5cdFx0XHRcdHRva2VuczogdG9rZW5zXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChfcGF0aC5sZW5ndGgpIHtcblx0XHRcdHJlZyArPSB3cmFwUmVnKHN0cmluZ1JlZyhfcGF0aCkuc291cmNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVnOiBuZXcgUmVnRXhwKFwiXlwiICsgcmVnICsgXCIkXCIpLFxuXHRcdFx0dG9rZW5zOiB0b2tlbnNcblx0XHR9O1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBPV2ViUm91dGVDb250ZXh0IHtcblx0cHJpdmF0ZSBfdG9rZW5zOiB0Um91dGVUb2tlbnNNYXA7XG5cdHByaXZhdGUgX3N0b3BwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSByZWFkb25seSBfdGFyZ2V0OiB0Um91dGVUYXJnZXQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlOiB0Um91dGVTdGF0ZU9iamVjdDtcblx0cHJpdmF0ZSByZWFkb25seSBfcm91dGVyOiBPV2ViUm91dGVyO1xuXG5cdGNvbnN0cnVjdG9yKHJvdXRlcjogT1dlYlJvdXRlciwgdGFyZ2V0OiB0Um91dGVUYXJnZXQsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCkge1xuXHRcdHRoaXMuX3RhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl90b2tlbnMgPSB7fTtcblx0XHR0aGlzLl9zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcblx0fVxuXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbIHRva2VuIF07XG5cdH1cblxuXHRnZXRUb2tlbnMoKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5jcmVhdGUodGhpcy5fdG9rZW5zKTtcblx0fVxuXG5cdGdldFBhdGgoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fdGFyZ2V0LnBhdGg7XG5cdH1cblxuXHRnZXRTdGF0ZUl0ZW0oa2V5OiBzdHJpbmcpOiB0Um91dGVTdGF0ZUl0ZW0ge1xuXHRcdHJldHVybiB0aGlzLl9zdGF0ZVsga2V5IF07XG5cdH1cblxuXHRnZXRTZWFyY2hQYXJhbShwYXJhbTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIG5ldyBVUkwodGhpcy5fdGFyZ2V0LmhyZWYpLnNlYXJjaFBhcmFtcy5nZXQocGFyYW0pO1xuXHR9XG5cblx0c2V0U3RhdGVJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogdFJvdXRlU3RhdGVJdGVtKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RhdGVbIGtleSBdID0gdmFsdWU7XG5cdFx0cmV0dXJuIHRoaXMuc2F2ZSgpO1xuXHR9XG5cblx0c3RvcHBlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RvcHBlZDtcblx0fVxuXG5cdHN0b3AoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9zdG9wcGVkKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3aWxsIHN0b3AuXCIpO1xuXHRcdFx0dGhpcy5zYXZlKCk7Ly8gc2F2ZSBiZWZvcmUgc3RvcFxuXHRcdFx0dGhpcy5fc3RvcHBlZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9yb3V0ZXIuZ2V0Q3VycmVudERpc3BhdGNoZXIoKSEuY2FuY2VsKCk7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCB3YXMgc3RvcHBlZCFcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IGFscmVhZHkgc3RvcHBlZCFcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c2F2ZSgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuc3RvcHBlZCgpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSBzYXZpbmcgc3RhdGUuLi5cIik7XG5cdFx0XHR0aGlzLl9yb3V0ZXIucmVwbGFjZUhpc3RvcnkodGhpcy5fdGFyZ2V0LmhyZWYsIHRoaXMuX3N0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSB5b3Ugc2hvdWxkbid0IHRyeSB0byBzYXZlIHdoZW4gc3RvcHBlZC5cIilcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRhY3Rpb25SdW5uZXIocm91dGU6IE9XZWJSb3V0ZSk6IHRoaXMge1xuXHRcdHRoaXMuX3Rva2VucyA9IHJvdXRlLnBhcnNlKHRoaXMuX3RhcmdldC5wYXRoKTtcblxuXHRcdHJvdXRlLmdldEFjdGlvbigpKHRoaXMpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT1dlYlJvdXRlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2Jhc2VVcmw6IHN0cmluZztcblx0cHJpdmF0ZSByZWFkb25seSBfaGFzaE1vZGU6IGJvb2xlYW47XG5cdHByaXZhdGUgX2N1cnJlbnRfdGFyZ2V0OiB0Um91dGVUYXJnZXQgPSB7XG5cdFx0cGFyc2VkOiBcIlwiLFxuXHRcdGhyZWY6IFwiXCIsXG5cdFx0cGF0aDogXCJcIixcblx0XHRmdWxsUGF0aDogXCJcIlxuXHR9O1xuXHRwcml2YXRlIF9yb3V0ZXM6IE9XZWJSb3V0ZVtdID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2xpc3RlbmluZzogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9ub3RGb3VuZDogdW5kZWZpbmVkIHwgKCh0YXJnZXQ6IHRSb3V0ZVRhcmdldCkgPT4gdm9pZCkgPSB1bmRlZmluZWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3BvcFN0YXRlTGlzdGVuZXI6IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9saW5rQ2xpY2tMaXN0ZW5lcjogKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIF9kaXNwYXRjaF9pZCA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnRfZGlzcGF0Y2hlcj86IGlSb3V0ZURpc3BhdGNoZXI7XG5cdHByaXZhdGUgX2ZvcmNlX3JlcGxhY2U6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3RvcihiYXNlVXJsOiBzdHJpbmcsIGhhc2hNb2RlOiBib29sZWFuID0gdHJ1ZSkge1xuXHRcdGxldCByID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gcG9wc3RhdGUgLT5cIiwgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSByZWFkeSFcIik7XG5cdH1cblxuXHRzdGFydChmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsIHRhcmdldDogc3RyaW5nID0gd0xvYy5ocmVmLCBzdGF0ZT86IHRSb3V0ZVN0YXRlT2JqZWN0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyFcIik7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSB3YXRjaGluZyByb3V0ZXMgLT5cIiwgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYlJvdXRlcl0gcm91dGVyIGFscmVhZHkgc3RhcnRlZCFcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyFcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Zm9yY2VOZXh0UmVwbGFjZSgpOiB0aGlzIHtcblx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF90YXJnZXQ7XG5cdH1cblxuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBpUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyO1xuXHR9XG5cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbT1dlYlJvdXRlcl0gbm8gcm91dGUgY29udGV4dC5cIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiB0Um91dGVUYXJnZXQge1xuXHRcdGxldCBiID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdHUgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiKSxcblx0XHRcdF86IHRSb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkOiB1cmwudG9TdHJpbmcoKSxcblx0XHRcdFx0aHJlZjogdS5ocmVmLFxuXHRcdFx0XHRwYXRoOiB1Lmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCBcIlwiKSxcblx0XHRcdFx0ZnVsbFBhdGg6IHUuaGFzaFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRsZXQgcGF0aG5hbWUgPSB1LnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYi5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYi5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRfID0ge1xuXHRcdFx0XHRwYXJzZWQ6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmOiB1LmhyZWYsXG5cdFx0XHRcdHBhdGg6IGxlYWRpbmdTbGFzaChwYXRobmFtZSksXG5cdFx0XHRcdGZ1bGxQYXRoOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUgKyB1LnNlYXJjaCArICh1Lmhhc2ggfHwgXCJcIikpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIHBhcnNlZCB1cmwgLT5cIiwgXyk7XG5cblx0XHRyZXR1cm4gXztcblx0fVxuXG5cdHBhdGhUb1VSTChwYXRoOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBVUkwge1xuXG5cdFx0YmFzZSA9IGJhc2UgJiYgYmFzZS5sZW5ndGggPyBiYXNlIDogdGhpcy5fYmFzZVVybDtcblxuXHRcdGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICgvXmh0dHBzPzpcXC9cXC8vLnRlc3QocGF0aCkpIHtcblx0XHRcdHJldHVybiBuZXcgVVJMKHBhdGgpO1xuXHRcdH1cblxuXHRcdHBhdGggPSB0aGlzLl9oYXNoTW9kZSA/IGhhc2hUYWdTdHIgKyBsZWFkaW5nU2xhc2gocGF0aCkgOiBwYXRoO1xuXG5cdFx0cmV0dXJuIG5ldyBVUkwocGF0aCwgYmFzZSk7XG5cdH1cblxuXHRvbihwYXRoOiB0Um91dGVQYXRoLCBydWxlczogdFJvdXRlUGF0aE9wdGlvbnMgPSB7fSwgYWN0aW9uOiB0Um91dGVBY3Rpb24pOiB0aGlzIHtcblx0XHR0aGlzLl9yb3V0ZXMucHVzaChuZXcgT1dlYlJvdXRlKHBhdGgsIHJ1bGVzLCBhY3Rpb24pKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG5vdEZvdW5kKGNhbGxiYWNrOiAodGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWQpOiB0aGlzIHtcblx0XHR0aGlzLl9ub3RGb3VuZCA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z29CYWNrKGRpc3RhbmNlOiBudW1iZXIgPSAxKTogdGhpcyB7XG5cdFx0aWYgKGRpc3RhbmNlID4gMCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gZ29pbmcgYmFjayAtPiBcIiwgZGlzdGFuY2UpO1xuXHRcdFx0bGV0IGhMZW4gPSB3SGlzdG9yeS5sZW5ndGg7XG5cdFx0XHRpZiAoaExlbiA+IDEpIHtcblx0XHRcdFx0aWYgKGhMZW4gPj0gZGlzdGFuY2UpIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtZGlzdGFuY2UpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1oTGVuKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gY29yZG92YVxuXHRcdFx0XHRpZiAod2luZG93Lm5hdmlnYXRvciAmJiAod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcCkge1xuXHRcdFx0XHRcdCh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwLmV4aXRBcHAoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0YnJvd3NlVG8odXJsOiBzdHJpbmcsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCA9IHt9LCBwdXNoOiBib29sZWFuID0gdHJ1ZSwgaWdub3JlU2FtZUxvY2F0aW9uOiBib29sZWFuID0gZmFsc2UpOiB0aGlzIHtcblx0XHRsZXQgdGFyZ2V0VXJsID0gdGhpcy5wYXRoVG9VUkwodXJsKSxcblx0XHRcdHRhcmdldCA9IHRoaXMucGFyc2VVUkwodGFyZ2V0VXJsLmhyZWYpLFxuXHRcdFx0X2NkID0gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyLFxuXHRcdFx0Y2Q6IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRpZiAoIXNhbWVPcmlnaW4odGFyZ2V0LmhyZWYpKSB7XG5cdFx0XHR3aW5kb3cub3Blbih1cmwpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gYnJvd3NpbmcgdG8gLT4gXCIsIHRhcmdldC5wYXRoLCB7IHN0YXRlLCBwdXNoLCB0YXJnZXQgfSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRfdGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbiAtPiBcIiwgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiBfY2QuaXNBY3RpdmUoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZyAtPiBcIiwgX2NkKTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50X3RhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9mb3JjZV9yZXBsYWNlKSB7XG5cdFx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHB1c2ggJiYgdGhpcy5hZGRIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudF9kaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIodGFyZ2V0LCBzdGF0ZSwgKyt0aGlzLl9kaXNwYXRjaF9pZCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoIC0+XCIsIHRhcmdldC5wYXRoKTtcblx0XHRcdGlmICh0aGlzLl9ub3RGb3VuZCkge1xuXHRcdFx0XHR0aGlzLl9ub3RGb3VuZCh0YXJnZXQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiW09XZWJSb3V0ZXJdIG5vdEZvdW5kIGFjdGlvbiBpcyBub3QgZGVmaW5lZCFcIik7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoX2lkICYmICFjZC5jb250ZXh0LnN0b3BwZWQoKSkge1xuXHRcdFx0Y2QuY29udGV4dC5zYXZlKCk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBzdWNjZXNzIC0+XCIsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGFkZEhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCwgdGl0bGU6IHN0cmluZyA9IFwiXCIpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnB1c2hTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSBhZGRlZFwiLCBzdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cmVwbGFjZUhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCwgdGl0bGU6IHN0cmluZyA9IFwiXCIpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnJlcGxhY2VTdGF0ZSh7IHVybCwgZGF0YTogc3RhdGUgfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCAtPiBcIiwgd0hpc3Rvcnkuc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlRGlzcGF0Y2hlcih0YXJnZXQ6IHRSb3V0ZVRhcmdldCwgc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LCBpZDogbnVtYmVyKTogaVJvdXRlRGlzcGF0Y2hlciB7XG5cblx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHsgaWQgfV0gY3JlYXRpb24uYCk7XG5cblx0XHRsZXQgY3R4ID0gdGhpcyxcblx0XHRcdGZvdW5kOiBPV2ViUm91dGVbXSA9IFtdLFxuXHRcdFx0YWN0aXZlID0gZmFsc2UsXG5cdFx0XHRyb3V0ZUNvbnRleHQgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKSxcblx0XHRcdG86IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcm91dGUgPSBjdHguX3JvdXRlc1sgaSBdO1xuXG5cdFx0XHRpZiAocm91dGUuaXModGFyZ2V0LnBhdGgpKSB7XG5cdFx0XHRcdGZvdW5kLnB1c2gocm91dGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG8gPSB7XG5cdFx0XHRjb250ZXh0OiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAoYWN0aXZlKSB7XG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0keyBpZCB9XSBjYW5jZWwgY2FsbGVkIWAsIG8pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7IGlkIH1dIGNhbmNlbCBjYWxsZWQgd2hlbiBpbmFjdGl2ZS5gLCBvKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7IGlkIH1dIHN0YXJ0IC0+YCwgbyk7XG5cblx0XHRcdFx0XHRsZXQgaiA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFsgaiBdKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7IGlkIH1dIGlzIGJ1c3khYCwgbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gb1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRyZXR1cm4gbztcblx0fVxuXG5cdHByaXZhdGUgcmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IHRydWU7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MuYWRkRXZlbnRMaXN0ZW5lcihsaW5rQ2xpY2tFdmVudCwgdGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByaXZhdGUgdW5yZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSBmYWxzZTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5yZW1vdmVFdmVudExpc3RlbmVyKGxpbmtDbGlja0V2ZW50LCB0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Ly8gb25jbGljayBmcm9tIHBhZ2UuanMgbGlicmFyeTogZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcblxuXHRcdGlmICgxICE9PSB3aGljaChlKSkgcmV0dXJuO1xuXG5cdFx0aWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuXHRcdGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBsaW5rXG5cdFx0Ly8gdXNlIHNoYWRvdyBkb20gd2hlbiBhdmFpbGFibGUgaWYgbm90LCBmYWxsIGJhY2sgdG8gY29tcG9zZWRQYXRoKCkgZm9yIGJyb3dzZXJzIHRoYXQgb25seSBoYXZlIHNoYWR5XG5cdFx0bGV0IGVsOiBIVE1MRWxlbWVudCB8IG51bGwgPSA8SFRNTEVsZW1lbnQ+IGUudGFyZ2V0LFxuXHRcdFx0ZXZlbnRQYXRoID0gKGUgYXMgYW55KS5wYXRoIHx8ICgoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCA/IChlIGFzIGFueSkuY29tcG9zZWRQYXRoKCkgOiBudWxsKTtcblxuXHRcdGlmIChldmVudFBhdGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZXZlbnRQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmICghZXZlbnRQYXRoWyBpIF0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoWyBpIF0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJBXCIpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFsgaSBdLmhyZWYpIGNvbnRpbnVlO1xuXG5cdFx0XHRcdGVsID0gZXZlbnRQYXRoWyBpIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBjb250aW51ZSBlbnN1cmUgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiBcIkFcIiAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSA8YW55PiBlbC5wYXJlbnROb2RlO1xuXHRcdGlmICghZWwgfHwgXCJBXCIgIT09IGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGlmIGxpbmsgaXMgaW5zaWRlIGFuIHN2Z1xuXHRcdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdFx0bGV0IHN2ZyA9ICh0eXBlb2YgKGVsIGFzIGFueSkuaHJlZiA9PT0gXCJvYmplY3RcIikgJiYgKGVsIGFzIGFueSkuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSBcIlNWR0FuaW1hdGVkU3RyaW5nXCI7XG5cblx0XHQvLyBJZ25vcmUgaWYgdGFnIGhhc1xuXHRcdC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcblx0XHQvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuXHRcdGlmIChlbC5oYXNBdHRyaWJ1dGUoXCJkb3dubG9hZFwiKSB8fCBlbC5nZXRBdHRyaWJ1dGUoXCJyZWxcIikgPT09IFwiZXh0ZXJuYWxcIikgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG5cdFx0bGV0IGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuXHRcdGlmICghdGhpcy5faGFzaE1vZGUgJiYgc2FtZVBhdGgoZWwgYXMgYW55KSAmJiAoKGVsIGFzIGFueSkuaGFzaCB8fCBcIiNcIiA9PT0gbGluaykpIHJldHVybjtcblxuXHRcdC8vIHdlIGNoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG5cdFx0aWYgKGxpbmsgJiYgbGluay5pbmRleE9mKFwibWFpbHRvOlwiKSA+IC0xKSByZXR1cm47XG5cblx0XHQvLyB3ZSBjaGVjayB0YXJnZXRcblx0XHQvLyBzdmcgdGFyZ2V0IGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRpZiAoc3ZnID8gKGVsIGFzIGFueSkudGFyZ2V0LmJhc2VWYWwgOiAoZWwgYXMgYW55KS50YXJnZXQpIHJldHVybjtcblxuXHRcdC8vIHgtb3JpZ2luXG5cdFx0Ly8gbm90ZTogc3ZnIGxpbmtzIHRoYXQgYXJlIG5vdCByZWxhdGl2ZSBkb24ndCBjYWxsIGNsaWNrIGV2ZW50cyAoYW5kIHNraXAgcGFnZS5qcylcblx0XHQvLyBjb25zZXF1ZW50bHksIGFsbCBzdmcgbGlua3MgdGVzdGVkIGluc2lkZSBwYWdlLmpzIGFyZSByZWxhdGl2ZSBhbmQgaW4gdGhlIHNhbWUgb3JpZ2luXG5cdFx0aWYgKCFzdmcgJiYgIXNhbWVPcmlnaW4oKGVsIGFzIGFueSkuaHJlZikpIHJldHVybjtcblxuXHRcdC8vIHJlYnVpbGQgcGF0aFxuXHRcdC8vIFRoZXJlIGFyZW4ndCAucGF0aG5hbWUgYW5kIC5zZWFyY2ggcHJvcGVydGllcyBpbiBzdmcgbGlua3MsIHNvIHdlIHVzZSBocmVmXG5cdFx0Ly8gQWxzbywgc3ZnIGhyZWYgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGxldCB0YXJnZXRIcmVmID0gc3ZnID8gKGVsIGFzIGFueSkuaHJlZi5iYXNlVmFsIDogKGVsIGFzIGFueSkuaHJlZjtcblxuXHRcdC8vIHN0cmlwIGxlYWRpbmcgXCIvW2RyaXZlIGxldHRlcl06XCIgb24gTlcuanMgb24gV2luZG93c1xuXHRcdC8qXG5cdFx0IGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdCBpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHQgdGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHQgfVxuXHRcdCAqL1xuXG5cdFx0bGV0IG9yaWcgPSB0YXJnZXRIcmVmO1xuXG5cdFx0aWYgKHRhcmdldEhyZWYuaW5kZXhPZih0aGlzLl9iYXNlVXJsKSA9PT0gMCkge1xuXHRcdFx0dGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYuc3Vic3RyKHRoaXMuX2Jhc2VVcmwubGVuZ3RoKTtcblx0XHR9XG5cblx0XHRpZiAob3JpZyA9PT0gdGFyZ2V0SHJlZikgcmV0dXJuO1xuXG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdW2NsaWNrXSAtPlwiLCBlbCwgb3JpZywgdGFyZ2V0SHJlZiwgd0hpc3Rvcnkuc3RhdGUpO1xuXHRcdHRoaXMuYnJvd3NlVG8ob3JpZyk7XG5cdH1cblxufVxuIl19