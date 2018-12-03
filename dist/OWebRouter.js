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
};
/*
 t = "path/to/:id/file/:index/name.:format";
 p = {id:"num",index:"alpha",format:"alpha-num"};
 parseDynamicPath(t,p);
*/
const wrapReg = (str, capture = false) => capture ? "(" + str + ")" : "(?:" + str + ")", parseDynamicPath = function (path, options) {
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
};
export class OWebRoute {
    constructor(path, rules, action) {
        if (path instanceof RegExp) {
            this.path = path.toString();
            this.reg = path;
            this.tokens = Utils.isArray(rules) ? rules : [];
        }
        else if (Utils.isString(path) && path.length) {
            rules = (Utils.isPlainObject(rules) ? rules : {});
            let p = parseDynamicPath(path, rules);
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
    isDynamic() {
        return this.reg != null;
    }
    getPath() {
        return this.path;
    }
    getAction() {
        return this.action;
    }
    is(path) {
        return (this.reg) ? this.reg.test(path) : this.path === path;
    }
    parse(path) {
        if (this.isDynamic()) {
            let founds;
            if (founds = String(path).match(this.reg)) {
                return this.tokens.reduce((acc, key, index) => {
                    acc[key] = founds[index + 1];
                    return acc;
                }, {});
            }
        }
        return {};
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
        return new URL(wLoc.href).searchParams.get(param);
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
        if (!this._force_replace) {
            push && this.addHistory(targetUrl.href, state);
        }
        else {
            this._force_replace = false;
            this.replaceHistory(targetUrl.href, state);
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
        // check if link is inside an svg
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
        // Check for mailto: in the href
        if (link && link.indexOf("mailto:") > -1)
            return;
        // check target
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXdCbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUNyQixLQUFLLEVBQVUsS0FBSyxDQUFDLE1BQU07SUFDM0IsT0FBTyxFQUFRLFdBQVcsQ0FBQyxNQUFNO0lBQ2pDLFNBQVMsRUFBTSxRQUFRLENBQUMsTUFBTTtJQUM5QixTQUFTLEVBQU0sUUFBUSxDQUFDLE1BQU07SUFDOUIsV0FBVyxFQUFJLGNBQWMsQ0FBQyxNQUFNO0lBQ3BDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsS0FBSyxFQUFVLE9BQU8sQ0FBQyxNQUFNO0NBQzdCLEVBQ0QsU0FBUyxHQUFVLHFCQUFxQixFQUN4QyxJQUFJLEdBQWUsTUFBTSxDQUFDLFFBQVEsRUFDbEMsSUFBSSxHQUFlLE1BQU0sQ0FBQyxRQUFRLEVBQ2xDLFFBQVEsR0FBVyxNQUFNLENBQUMsT0FBTyxFQUNqQyxjQUFjLEdBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzdELFVBQVUsR0FBUyxJQUFJLENBQUM7QUFFM0IsTUFBTSxLQUFLLEdBQVUsVUFBVSxDQUFNO0lBQ2pDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQU8sVUFBVSxHQUFRO0lBQ2hDLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUTtRQUNwQyxHQUFH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bUZBQW1GO1FBQ25GLHdGQUF3RjtRQUN4RixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBRWxELGVBQWU7UUFDZiw2RUFBNkU7UUFDN0UsNEVBQTRFO1FBQzVFLElBQUksVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7UUFFbkUsdURBQXVEO1FBQ3ZEOzs7OztVQUtFO1FBRUYsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBRXRCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTztRQUVoQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aCA9IHN0cmluZyB8IFJlZ0V4cDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGhPcHRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZWdFeHAgfCBrZXlvZiB0eXBlb2YgdG9rZW5UeXBlc1JlZ01hcCB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlVG9rZW5zTWFwID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZUFjdGlvbiA9IChjdHg6IE9XZWJSb3V0ZUNvbnRleHQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0Um91dGVJbmZvID0geyByZWc6IFJlZ0V4cCB8IG51bGwsIHRva2VuczogQXJyYXk8c3RyaW5nPiB9O1xudHlwZSBfdFJvdXRlU3RhdGVJdGVtID0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGwgfCB1bmRlZmluZWQgfCBEYXRlIHwgdFJvdXRlU3RhdGVPYmplY3Q7XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZUl0ZW0gPSBfdFJvdXRlU3RhdGVJdGVtIHwgQXJyYXk8X3RSb3V0ZVN0YXRlSXRlbT47XG5leHBvcnQgdHlwZSB0Um91dGVTdGF0ZU9iamVjdCA9IHsgW2tleTogc3RyaW5nXTogdFJvdXRlU3RhdGVJdGVtIH07XG5leHBvcnQgdHlwZSB0Um91dGVUYXJnZXQgPSB7IHBhcnNlZDogc3RyaW5nLCBocmVmOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZnVsbFBhdGg6IHN0cmluZyB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIGlSb3V0ZURpc3BhdGNoZXIge1xuXHRyZWFkb25seSBpZDogbnVtYmVyLFxuXHRyZWFkb25seSBjb250ZXh0OiBPV2ViUm91dGVDb250ZXh0LFxuXHRyZWFkb25seSBmb3VuZDogT1dlYlJvdXRlW11cblxuXHRpc0FjdGl2ZSgpOiBib29sZWFuLFxuXG5cdGRpc3BhdGNoKCk6IHRoaXMsXG5cblx0Y2FuY2VsKCk6IHRoaXMsXG59XG5cbmNvbnN0IHRva2VuVHlwZXNSZWdNYXAgPSB7XG5cdFx0ICBcIm51bVwiICAgICAgICA6IC9cXGQrLy5zb3VyY2UsXG5cdFx0ICBcImFscGhhXCIgICAgICA6IC9bYS16QS1aXSsvLnNvdXJjZSxcblx0XHQgIFwiYWxwaGEtdVwiICAgIDogL1thLXpdKy8uc291cmNlLFxuXHRcdCAgXCJhbHBoYS1sXCIgICAgOiAvW0EtWl0rLy5zb3VyY2UsXG5cdFx0ICBcImFscGhhLW51bVwiICA6IC9bYS16QS1aMC05XSsvLnNvdXJjZSxcblx0XHQgIFwiYWxwaGEtbnVtLWxcIjogL1thLXowLTldKy8uc291cmNlLFxuXHRcdCAgXCJhbHBoYS1udW0tdVwiOiAvW0EtWjAtOV0rLy5zb3VyY2UsXG5cdFx0ICBcImFueVwiICAgICAgICA6IC9bXi9dKy8uc291cmNlXG5cdCAgfSxcblx0ICB0b2tlbl9yZWcgICAgICAgID0gLzooW2Etel1bYS16MC05X10qKS9pLFxuXHQgIHdMb2MgICAgICAgICAgICAgPSB3aW5kb3cubG9jYXRpb24sXG5cdCAgd0RvYyAgICAgICAgICAgICA9IHdpbmRvdy5kb2N1bWVudCxcblx0ICB3SGlzdG9yeSAgICAgICAgID0gd2luZG93Lmhpc3RvcnksXG5cdCAgbGlua0NsaWNrRXZlbnQgICA9IHdEb2Mub250b3VjaHN0YXJ0ID8gXCJ0b3VjaHN0YXJ0XCIgOiBcImNsaWNrXCIsXG5cdCAgaGFzaFRhZ1N0ciAgICAgICA9IFwiIyFcIjtcblxuY29uc3Qgd2hpY2ggICAgICAgID0gZnVuY3Rpb24gKGU6IGFueSkge1xuXHRcdCAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuXHRcdCAgcmV0dXJuIG51bGwgPT0gZS53aGljaCA/IGUuYnV0dG9uIDogZS53aGljaDtcblx0ICB9LFxuXHQgIHNhbWVQYXRoICAgICA9IGZ1bmN0aW9uICh1cmw6IFVSTCkge1xuXHRcdCAgcmV0dXJuIHVybC5wYXRobmFtZSA9PT0gd0xvYy5wYXRobmFtZSAmJlxuXHRcdFx0ICB1cmwuc2VhcmNoID09PSB3TG9jLnNlYXJjaDtcblx0ICB9LFxuXHQgIHNhbWVPcmlnaW4gICA9IGZ1bmN0aW9uIChocmVmOiBzdHJpbmcpIHtcblx0XHQgIGlmICghaHJlZikgcmV0dXJuIGZhbHNlO1xuXHRcdCAgbGV0IHVybCA9IG5ldyBVUkwoaHJlZi50b1N0cmluZygpLCB3TG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0ICByZXR1cm4gd0xvYy5wcm90b2NvbCA9PT0gdXJsLnByb3RvY29sICYmXG5cdFx0XHQgIHdMb2MuaG9zdG5hbWUgPT09IHVybC5ob3N0bmFtZSAmJlxuXHRcdFx0ICB3TG9jLnBvcnQgPT09IHVybC5wb3J0O1xuXHQgIH0sXG5cdCAgZXNjYXBlU3RyaW5nID0gZnVuY3Rpb24gKHN0cjogc3RyaW5nKSB7XG5cdFx0ICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgXCJcXFxcJDFcIik7XG5cdCAgfSxcblx0ICBzdHJpbmdSZWcgICAgPSBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpIHtcblx0XHQgIHJldHVybiBuZXcgUmVnRXhwKGVzY2FwZVN0cmluZyhzdHIpKTtcblx0ICB9LFxuXHQgIGxlYWRpbmdTbGFzaCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRcdCAgaWYgKCFwYXRoLmxlbmd0aCB8fCBwYXRoID09IFwiL1wiKSB7XG5cdFx0XHQgIHJldHVybiBcIi9cIjtcblx0XHQgIH1cblxuXHRcdCAgcmV0dXJuIHBhdGhbMF0gIT0gXCIvXCIgPyBcIi9cIiArIHBhdGggOiBwYXRoO1xuXHQgIH07XG5cbi8qXG4gdCA9IFwicGF0aC90by86aWQvZmlsZS86aW5kZXgvbmFtZS46Zm9ybWF0XCI7XG4gcCA9IHtpZDpcIm51bVwiLGluZGV4OlwiYWxwaGFcIixmb3JtYXQ6XCJhbHBoYS1udW1cIn07XG4gcGFyc2VEeW5hbWljUGF0aCh0LHApO1xuKi9cbmNvbnN0IHdyYXBSZWcgICAgICAgICAgPSAoc3RyOiBzdHJpbmcsIGNhcHR1cmU6IGJvb2xlYW4gPSBmYWxzZSkgPT4gY2FwdHVyZSA/IFwiKFwiICsgc3RyICsgXCIpXCIgOiBcIig/OlwiICsgc3RyICsgXCIpXCIsXG5cdCAgcGFyc2VEeW5hbWljUGF0aCA9IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcsIG9wdGlvbnM6IHRSb3V0ZVBhdGhPcHRpb25zKTogdFJvdXRlSW5mbyB7XG5cblx0XHQgIGxldCB0b2tlbnM6IEFycmF5PHN0cmluZz4gPSBbXSxcblx0XHRcdCAgcmVnOiBzdHJpbmcgICAgICAgICAgID0gXCJcIixcblx0XHRcdCAgX3BhdGg6IHN0cmluZyAgICAgICAgID0gcGF0aCxcblx0XHRcdCAgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG5cblx0XHQgIHdoaWxlICgobWF0Y2ggPSB0b2tlbl9yZWcuZXhlYyhfcGF0aCkpICE9IG51bGwpIHtcblx0XHRcdCAgbGV0IGZvdW5kOiBhbnkgICA9IG1hdGNoWzBdLFxuXHRcdFx0XHQgIHRva2VuOiBhbnkgICA9IG1hdGNoWzFdLFxuXHRcdFx0XHQgIHJ1bGU6IGFueSAgICA9IG9wdGlvbnNbdG9rZW5dIHx8IFwiYW55XCIsXG5cdFx0XHRcdCAgaGVhZDogc3RyaW5nID0gX3BhdGguc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuXG5cdFx0XHQgIGlmIChoZWFkLmxlbmd0aCkge1xuXHRcdFx0XHQgIHJlZyArPSB3cmFwUmVnKHN0cmluZ1JlZyhoZWFkKS5zb3VyY2UpO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgaWYgKHR5cGVvZiBydWxlID09PSBcInN0cmluZ1wiICYmIHJ1bGUgaW4gdG9rZW5UeXBlc1JlZ01hcCkge1xuXHRcdFx0XHQgIHJlZyArPSB3cmFwUmVnKCh0b2tlblR5cGVzUmVnTWFwIGFzIGFueSlbcnVsZV0sIHRydWUpO1xuXHRcdFx0ICB9IGVsc2UgaWYgKHJ1bGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdFx0ICByZWcgKz0gd3JhcFJlZyhydWxlLnNvdXJjZSwgdHJ1ZSk7XG5cdFx0XHQgIH0gZWxzZSB7XG5cdFx0XHRcdCAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBydWxlIGZvciB0b2tlbiAnOlwiICsgdG9rZW4gKyBcIicgaW4gcGF0aCAnXCIgKyBwYXRoICsgXCInXCIpO1xuXHRcdFx0ICB9XG5cblx0XHRcdCAgdG9rZW5zLnB1c2godG9rZW4pO1xuXG5cdFx0XHQgIF9wYXRoID0gX3BhdGguc2xpY2UobWF0Y2guaW5kZXggKyBmb3VuZC5sZW5ndGgpO1xuXHRcdCAgfVxuXG5cdFx0ICBpZiAoIXJlZy5sZW5ndGgpIHtcblx0XHRcdCAgcmV0dXJuIHtcblx0XHRcdFx0ICByZWcgICA6IG51bGwsXG5cdFx0XHRcdCAgdG9rZW5zOiB0b2tlbnNcblx0XHRcdCAgfTtcblx0XHQgIH1cblxuXHRcdCAgaWYgKF9wYXRoLmxlbmd0aCkge1xuXHRcdFx0ICByZWcgKz0gd3JhcFJlZyhzdHJpbmdSZWcoX3BhdGgpLnNvdXJjZSk7XG5cdFx0ICB9XG5cblx0XHQgIHJldHVybiB7XG5cdFx0XHQgIHJlZyAgIDogbmV3IFJlZ0V4cChcIl5cIiArIHJlZyArIFwiJFwiKSxcblx0XHRcdCAgdG9rZW5zOiB0b2tlbnNcblx0XHQgIH07XG5cdCAgfTtcblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgcGF0aDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IHJlZzogUmVnRXhwIHwgbnVsbDtcblx0cHJpdmF0ZSB0b2tlbnM6IEFycmF5PHN0cmluZz47XG5cdHByaXZhdGUgcmVhZG9ubHkgYWN0aW9uOiB0Um91dGVBY3Rpb247XG5cblx0Y29uc3RydWN0b3IocGF0aDogc3RyaW5nIHwgUmVnRXhwLCBydWxlczogdFJvdXRlUGF0aE9wdGlvbnMgfCBBcnJheTxzdHJpbmc+LCBhY3Rpb246IHRSb3V0ZUFjdGlvbikge1xuXG5cdFx0aWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdHRoaXMucGF0aCAgID0gcGF0aC50b1N0cmluZygpO1xuXHRcdFx0dGhpcy5yZWcgICAgPSBwYXRoO1xuXHRcdFx0dGhpcy50b2tlbnMgPSBVdGlscy5pc0FycmF5KHJ1bGVzKSA/IHJ1bGVzIDogW107XG5cdFx0fSBlbHNlIGlmIChVdGlscy5pc1N0cmluZyhwYXRoKSAmJiBwYXRoLmxlbmd0aCkge1xuXHRcdFx0cnVsZXMgICAgICAgPSA8dFJvdXRlUGF0aE9wdGlvbnM+IChVdGlscy5pc1BsYWluT2JqZWN0KHJ1bGVzKSA/IHJ1bGVzIDoge30pO1xuXHRcdFx0bGV0IHAgICAgICAgPSBwYXJzZUR5bmFtaWNQYXRoKHBhdGgsIHJ1bGVzKTtcblx0XHRcdHRoaXMucGF0aCAgID0gcGF0aDtcblx0XHRcdHRoaXMucmVnICAgID0gcC5yZWc7XG5cdFx0XHR0aGlzLnRva2VucyA9IHAudG9rZW5zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiW09XZWJSb3V0ZV0gaW52YWxpZCByb3V0ZSBwYXRoLCBzdHJpbmcgb3IgUmVnRXhwIHJlcXVpcmVkLlwiKTtcblx0XHR9XG5cblx0XHRpZiAoXCJmdW5jdGlvblwiICE9PSB0eXBlb2YgYWN0aW9uKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBbT1dlYlJvdXRlXSBpbnZhbGlkIGFjdGlvbiB0eXBlLCBnb3QgXCIkeyB0eXBlb2YgYWN0aW9ufVwiIGluc3RlYWQgb2YgXCJmdW5jdGlvblwiLmApO1xuXHRcdH1cblxuXHRcdHRoaXMuYWN0aW9uID0gYWN0aW9uO1xuXHR9XG5cblx0aXNEeW5hbWljKCkge1xuXHRcdHJldHVybiB0aGlzLnJlZyAhPSBudWxsO1xuXHR9XG5cblx0Z2V0UGF0aCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnBhdGg7XG5cdH1cblxuXHRnZXRBY3Rpb24oKTogdFJvdXRlQWN0aW9uIHtcblx0XHRyZXR1cm4gdGhpcy5hY3Rpb247XG5cdH1cblxuXHRpcyhwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKHRoaXMucmVnKSA/IHRoaXMucmVnLnRlc3QocGF0aCkgOiB0aGlzLnBhdGggPT09IHBhdGg7XG5cdH1cblxuXHRwYXJzZShwYXRoOiBzdHJpbmcpOiB0Um91dGVUb2tlbnNNYXAge1xuXG5cdFx0aWYgKHRoaXMuaXNEeW5hbWljKCkpIHtcblx0XHRcdGxldCBmb3VuZHM6IGFueTtcblxuXHRcdFx0aWYgKGZvdW5kcyA9IFN0cmluZyhwYXRoKS5tYXRjaCh0aGlzLnJlZyBhcyBSZWdFeHApKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnRva2Vucy5yZWR1Y2UoKGFjYzogYW55LCBrZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikgPT4ge1xuXHRcdFx0XHRcdGFjY1trZXldID0gZm91bmRzW2luZGV4ICsgMV07XG5cdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0fSwge30pO1xuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHt9O1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBPV2ViUm91dGVDb250ZXh0IHtcblx0cHJpdmF0ZSBfdG9rZW5zOiB0Um91dGVUb2tlbnNNYXA7XG5cdHByaXZhdGUgX3N0b3BwZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSByZWFkb25seSBfdGFyZ2V0OiB0Um91dGVUYXJnZXQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlOiB0Um91dGVTdGF0ZU9iamVjdDtcblx0cHJpdmF0ZSByZWFkb25seSBfcm91dGVyOiBPV2ViUm91dGVyO1xuXG5cdGNvbnN0cnVjdG9yKHJvdXRlcjogT1dlYlJvdXRlciwgdGFyZ2V0OiB0Um91dGVUYXJnZXQsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCkge1xuXHRcdHRoaXMuX3RhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLl90b2tlbnMgPSB7fTtcblx0XHR0aGlzLl9zdGF0ZSAgPSBzdGF0ZSB8fCB7fTtcblx0XHR0aGlzLl9yb3V0ZXIgPSByb3V0ZXI7XG5cdH1cblxuXHRnZXRUb2tlbih0b2tlbjogc3RyaW5nKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5fdG9rZW5zW3Rva2VuXTtcblx0fVxuXG5cdGdldFRva2VucygpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLl90b2tlbnMpO1xuXHR9XG5cblx0Z2V0UGF0aCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl90YXJnZXQucGF0aDtcblx0fVxuXG5cdGdldFN0YXRlSXRlbShrZXk6IHN0cmluZyk6IHRSb3V0ZVN0YXRlSXRlbSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0YXRlW2tleV07XG5cdH1cblxuXHRnZXRTZWFyY2hQYXJhbShwYXJhbTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIG5ldyBVUkwod0xvYy5ocmVmKS5zZWFyY2hQYXJhbXMuZ2V0KHBhcmFtKTtcblx0fVxuXG5cdHNldFN0YXRlSXRlbShrZXk6IHN0cmluZywgdmFsdWU6IHRSb3V0ZVN0YXRlSXRlbSk6IHRoaXMge1xuXHRcdHRoaXMuX3N0YXRlW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gdGhpcy5zYXZlKCk7XG5cdH1cblxuXHRzdG9wcGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9zdG9wcGVkO1xuXHR9XG5cblx0c3RvcCgpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX3N0b3BwZWQpIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdpbGwgc3RvcC5cIik7XG5cdFx0XHR0aGlzLnNhdmUoKTsvLyBzYXZlIGJlZm9yZSBzdG9wXG5cdFx0XHR0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3JvdXRlci5nZXRDdXJyZW50RGlzcGF0Y2hlcigpIS5jYW5jZWwoKTtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSByb3V0ZSBjb250ZXh0IHdhcyBzdG9wcGVkIVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgYWxyZWFkeSBzdG9wcGVkIVwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzYXZlKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5zdG9wcGVkKCkpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHNhdmluZyBzdGF0ZS4uLlwiKTtcblx0XHRcdHRoaXMuX3JvdXRlci5yZXBsYWNlSGlzdG9yeSh0aGlzLl90YXJnZXQuaHJlZiwgdGhpcy5fc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHlvdSBzaG91bGRuJ3QgdHJ5IHRvIHNhdmUgd2hlbiBzdG9wcGVkLlwiKVxuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGFjdGlvblJ1bm5lcihyb3V0ZTogT1dlYlJvdXRlKTogdGhpcyB7XG5cdFx0dGhpcy5fdG9rZW5zID0gcm91dGUucGFyc2UodGhpcy5fdGFyZ2V0LnBhdGgpO1xuXG5cdFx0cm91dGUuZ2V0QWN0aW9uKCkodGhpcyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPV2ViUm91dGVyIHtcblx0cHJpdmF0ZSByZWFkb25seSBfYmFzZVVybDogc3RyaW5nO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9oYXNoTW9kZTogYm9vbGVhbjtcblx0cHJpdmF0ZSBfY3VycmVudF90YXJnZXQ6IHRSb3V0ZVRhcmdldCAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge1xuXHRcdHBhcnNlZCAgOiBcIlwiLFxuXHRcdGhyZWYgICAgOiBcIlwiLFxuXHRcdHBhdGggICAgOiBcIlwiLFxuXHRcdGZ1bGxQYXRoOiBcIlwiXG5cdH07XG5cdHByaXZhdGUgX3JvdXRlczogT1dlYlJvdXRlW10gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFtdO1xuXHRwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGlzdGVuaW5nOiBib29sZWFuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZmFsc2U7XG5cdHByaXZhdGUgX25vdEZvdW5kOiB1bmRlZmluZWQgfCAoKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKSA9IHVuZGVmaW5lZDtcblx0cHJpdmF0ZSByZWFkb25seSBfcG9wU3RhdGVMaXN0ZW5lcjogKGU6IFBvcFN0YXRlRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2xpbmtDbGlja0xpc3RlbmVyOiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgX2Rpc3BhdGNoX2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnRfZGlzcGF0Y2hlcj86IGlSb3V0ZURpc3BhdGNoZXI7XG5cdHByaXZhdGUgX2ZvcmNlX3JlcGxhY2U6IGJvb2xlYW4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXG5cdGNvbnN0cnVjdG9yKGJhc2VVcmw6IHN0cmluZywgaGFzaE1vZGU6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0bGV0IHIgICAgICAgICAgICAgICAgICA9IHRoaXM7XG5cdFx0dGhpcy5fYmFzZVVybCAgICAgICAgICA9IGJhc2VVcmw7XG5cdFx0dGhpcy5faGFzaE1vZGUgICAgICAgICA9IGhhc2hNb2RlO1xuXHRcdHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIgPSAoZTogUG9wU3RhdGVFdmVudCkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gcG9wc3RhdGUgLT5cIiwgYXJndW1lbnRzKTtcblxuXHRcdFx0aWYgKGUuc3RhdGUpIHtcblx0XHRcdFx0ci5icm93c2VUbyhlLnN0YXRlLnVybCwgZS5zdGF0ZS5kYXRhLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyLmJyb3dzZVRvKHdMb2MuaHJlZiwgdW5kZWZpbmVkLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyID0gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XG5cdFx0XHRyLl9vbkNsaWNrKGUpO1xuXHRcdH07XG5cblx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSByZWFkeSFcIik7XG5cdH1cblxuXHRzdGFydChmaXJzdFJ1bjogYm9vbGVhbiA9IHRydWUsIHRhcmdldDogc3RyaW5nID0gd0xvYy5ocmVmLCBzdGF0ZT86IHRSb3V0ZVN0YXRlT2JqZWN0KTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gc3RhcnQgcm91dGluZyFcIik7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSB3YXRjaGluZyByb3V0ZXMgLT5cIiwgdGhpcy5fcm91dGVzKTtcblx0XHRcdGZpcnN0UnVuICYmIHRoaXMuYnJvd3NlVG8odGFyZ2V0LCBzdGF0ZSwgZmFsc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYlJvdXRlcl0gcm91dGVyIGFscmVhZHkgc3RhcnRlZCFcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzdG9wUm91dGluZygpOiB0aGlzIHtcblx0XHRpZiAodGhpcy5faW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVucmVnaXN0ZXIoKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIHN0b3Agcm91dGluZyFcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViUm91dGVyXSB5b3Ugc2hvdWxkIHN0YXJ0IHJvdXRpbmcgZmlyc3QhXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Zm9yY2VOZXh0UmVwbGFjZSgpOiB0aGlzIHtcblx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdldEN1cnJlbnRUYXJnZXQoKTogdFJvdXRlVGFyZ2V0IHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF90YXJnZXQ7XG5cdH1cblxuXHRnZXRDdXJyZW50RGlzcGF0Y2hlcigpOiBpUm91dGVEaXNwYXRjaGVyIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyO1xuXHR9XG5cblx0Z2V0Um91dGVDb250ZXh0KCk6IE9XZWJSb3V0ZUNvbnRleHQge1xuXHRcdGlmICghdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJbT1dlYlJvdXRlcl0gbm8gcm91dGUgY29udGV4dC5cIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlci5jb250ZXh0O1xuXHR9XG5cblx0cGFyc2VVUkwodXJsOiBzdHJpbmcgfCBVUkwpOiB0Um91dGVUYXJnZXQge1xuXHRcdGxldCBiID0gbmV3IFVSTCh0aGlzLl9iYXNlVXJsKSxcblx0XHRcdHUgPSBuZXcgVVJMKHVybC50b1N0cmluZygpLCBiKSxcblx0XHRcdF86IHRSb3V0ZVRhcmdldDtcblxuXHRcdGlmICh0aGlzLl9oYXNoTW9kZSkge1xuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkICA6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmICAgIDogdS5ocmVmLFxuXHRcdFx0XHRwYXRoICAgIDogdS5oYXNoLnJlcGxhY2UoaGFzaFRhZ1N0ciwgXCJcIiksXG5cdFx0XHRcdGZ1bGxQYXRoOiB1Lmhhc2hcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0bGV0IHBhdGhuYW1lID0gdS5wYXRobmFtZTtcblx0XHRcdC8vIHdoZW4gdXNpbmcgcGF0aG5hbWUgbWFrZSBzdXJlIHRvIHJlbW92ZVxuXHRcdFx0Ly8gYmFzZSB1cmkgcGF0aG5hbWUgZm9yIGFwcCBpbiBzdWJkaXJlY3Rvcnlcblx0XHRcdGlmIChwYXRobmFtZS5pbmRleE9mKGIucGF0aG5hbWUpID09PSAwKSB7XG5cdFx0XHRcdHBhdGhuYW1lID0gcGF0aG5hbWUuc3Vic3RyKGIucGF0aG5hbWUubGVuZ3RoKTtcblx0XHRcdH1cblxuXHRcdFx0XyA9IHtcblx0XHRcdFx0cGFyc2VkICA6IHVybC50b1N0cmluZygpLFxuXHRcdFx0XHRocmVmICAgIDogdS5ocmVmLFxuXHRcdFx0XHRwYXRoICAgIDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lKSxcblx0XHRcdFx0ZnVsbFBhdGg6IGxlYWRpbmdTbGFzaChwYXRobmFtZSArIHUuc2VhcmNoICsgKHUuaGFzaCB8fCBcIlwiKSlcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gcGFyc2VkIHVybCAtPlwiLCBfKTtcblxuXHRcdHJldHVybiBfO1xuXHR9XG5cblx0cGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZT86IHN0cmluZyk6IFVSTCB7XG5cblx0XHRiYXNlID0gYmFzZSAmJiBiYXNlLmxlbmd0aCA/IGJhc2UgOiB0aGlzLl9iYXNlVXJsO1xuXG5cdFx0aWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKC9eaHR0cHM/OlxcL1xcLy8udGVzdChwYXRoKSkge1xuXHRcdFx0cmV0dXJuIG5ldyBVUkwocGF0aCk7XG5cdFx0fVxuXG5cdFx0cGF0aCA9IHRoaXMuX2hhc2hNb2RlID8gaGFzaFRhZ1N0ciArIGxlYWRpbmdTbGFzaChwYXRoKSA6IHBhdGg7XG5cblx0XHRyZXR1cm4gbmV3IFVSTChwYXRoLCBiYXNlKTtcblx0fVxuXG5cdG9uKHBhdGg6IHRSb3V0ZVBhdGgsIHJ1bGVzOiB0Um91dGVQYXRoT3B0aW9ucyA9IHt9LCBhY3Rpb246IHRSb3V0ZUFjdGlvbik6IHRoaXMge1xuXHRcdHRoaXMuX3JvdXRlcy5wdXNoKG5ldyBPV2ViUm91dGUocGF0aCwgcnVsZXMsIGFjdGlvbikpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bm90Rm91bmQoY2FsbGJhY2s6ICh0YXJnZXQ6IHRSb3V0ZVRhcmdldCkgPT4gdm9pZCk6IHRoaXMge1xuXHRcdHRoaXMuX25vdEZvdW5kID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRnb0JhY2soZGlzdGFuY2U6IG51bWJlciA9IDEpOiB0aGlzIHtcblx0XHRpZiAoZGlzdGFuY2UgPiAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBnb2luZyBiYWNrIC0+IFwiLCBkaXN0YW5jZSk7XG5cdFx0XHRsZXQgaExlbiA9IHdIaXN0b3J5Lmxlbmd0aDtcblx0XHRcdGlmIChoTGVuID4gMSkge1xuXHRcdFx0XHRpZiAoaExlbiA+PSBkaXN0YW5jZSkge1xuXHRcdFx0XHRcdHdIaXN0b3J5LmdvKC1kaXN0YW5jZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWhMZW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBjb3Jkb3ZhXG5cdFx0XHRcdGlmICh3aW5kb3cubmF2aWdhdG9yICYmICh3aW5kb3cubmF2aWdhdG9yIGFzIGFueSkuYXBwKSB7XG5cdFx0XHRcdFx0KHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHAuZXhpdEFwcCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHdpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRicm93c2VUbyh1cmw6IHN0cmluZywgc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0ID0ge30sIHB1c2g6IGJvb2xlYW4gPSB0cnVlLCBpZ25vcmVTYW1lTG9jYXRpb246IGJvb2xlYW4gPSBmYWxzZSk6IHRoaXMge1xuXHRcdGxldCB0YXJnZXRVcmwgPSB0aGlzLnBhdGhUb1VSTCh1cmwpLFxuXHRcdFx0dGFyZ2V0ICAgID0gdGhpcy5wYXJzZVVSTCh0YXJnZXRVcmwuaHJlZiksXG5cdFx0XHRfY2QgICAgICAgPSB0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIsXG5cdFx0XHRjZDogaVJvdXRlRGlzcGF0Y2hlcjtcblxuXHRcdGlmICghc2FtZU9yaWdpbih0YXJnZXQuaHJlZikpIHtcblx0XHRcdHdpbmRvdy5vcGVuKHVybCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBicm93c2luZyB0byAtPiBcIiwgdGFyZ2V0LnBhdGgsIHtzdGF0ZSwgcHVzaCwgdGFyZ2V0fSk7XG5cblx0XHRpZiAoaWdub3JlU2FtZUxvY2F0aW9uICYmIHRoaXMuX2N1cnJlbnRfdGFyZ2V0LmhyZWYgPT09IHRhcmdldC5ocmVmKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBpZ25vcmUgc2FtZSBsb2NhdGlvbiAtPiBcIiwgdGFyZ2V0LnBhdGgpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKF9jZCAmJiBfY2QuaXNBY3RpdmUoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJSb3V0ZXJdIGJyb3dzZVRvIGNhbGxlZCB3aGlsZSBkaXNwYXRjaGluZyAtPiBcIiwgX2NkKTtcblx0XHRcdF9jZC5jYW5jZWwoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jdXJyZW50X3RhcmdldCA9IHRhcmdldDtcblxuXHRcdGlmICghdGhpcy5fZm9yY2VfcmVwbGFjZSkge1xuXHRcdFx0cHVzaCAmJiB0aGlzLmFkZEhpc3RvcnkodGFyZ2V0VXJsLmhyZWYsIHN0YXRlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fZm9yY2VfcmVwbGFjZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5yZXBsYWNlSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlciA9IGNkID0gdGhpcy5jcmVhdGVEaXNwYXRjaGVyKHRhcmdldCwgc3RhdGUsICsrdGhpcy5fZGlzcGF0Y2hfaWQpO1xuXG5cdFx0aWYgKCFjZC5mb3VuZC5sZW5ndGgpIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViUm91dGVyXSBubyByb3V0ZSBmb3VuZCBmb3IgcGF0aCAtPlwiLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRpZiAodGhpcy5fbm90Rm91bmQpIHtcblx0XHRcdFx0dGhpcy5fbm90Rm91bmQodGFyZ2V0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIltPV2ViUm91dGVyXSBub3RGb3VuZCBhY3Rpb24gaXMgbm90IGRlZmluZWQhXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjZC5kaXNwYXRjaCgpO1xuXG5cdFx0aWYgKGNkLmlkID09PSB0aGlzLl9kaXNwYXRjaF9pZCAmJiAhY2QuY29udGV4dC5zdG9wcGVkKCkpIHtcblx0XHRcdGNkLmNvbnRleHQuc2F2ZSgpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gc3VjY2VzcyAtPlwiLCB0YXJnZXQucGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRhZGRIaXN0b3J5KHVybDogc3RyaW5nLCBzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsIHRpdGxlOiBzdHJpbmcgPSBcIlwiKTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5wdXNoU3RhdGUoe3VybCwgZGF0YTogc3RhdGV9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGNvbnNvbGUud2FybihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IGFkZGVkXCIsIHN0YXRlLCB1cmwpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRyZXBsYWNlSGlzdG9yeSh1cmw6IHN0cmluZywgc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LCB0aXRsZTogc3RyaW5nID0gXCJcIik6IHRoaXMge1xuXHRcdHRpdGxlID0gdGl0bGUgJiYgdGl0bGUubGVuZ3RoID8gdGl0bGUgOiB3RG9jLnRpdGxlO1xuXG5cdFx0d0hpc3RvcnkucmVwbGFjZVN0YXRlKHt1cmwsIGRhdGE6IHN0YXRlfSwgdGl0bGUsIHVybCk7XG5cblx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gaGlzdG9yeSByZXBsYWNlZCAtPiBcIiwgd0hpc3Rvcnkuc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlRGlzcGF0Y2hlcih0YXJnZXQ6IHRSb3V0ZVRhcmdldCwgc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0LCBpZDogbnVtYmVyKTogaVJvdXRlRGlzcGF0Y2hlciB7XG5cblx0XHRjb25zb2xlLmxvZyhgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNyZWF0aW9uLmApO1xuXG5cdFx0bGV0IGN0eCAgICAgICAgICAgICAgICA9IHRoaXMsXG5cdFx0XHRmb3VuZDogT1dlYlJvdXRlW10gPSBbXSxcblx0XHRcdGFjdGl2ZSAgICAgICAgICAgICA9IGZhbHNlLFxuXHRcdFx0cm91dGVDb250ZXh0ICAgICAgID0gbmV3IE9XZWJSb3V0ZUNvbnRleHQodGhpcywgdGFyZ2V0LCBzdGF0ZSksXG5cdFx0XHRvOiBpUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjdHguX3JvdXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IHJvdXRlID0gY3R4Ll9yb3V0ZXNbaV07XG5cblx0XHRcdGlmIChyb3V0ZS5pcyh0YXJnZXQucGF0aCkpIHtcblx0XHRcdFx0Zm91bmQucHVzaChyb3V0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0byA9IHtcblx0XHRcdGNvbnRleHQgOiByb3V0ZUNvbnRleHQsXG5cdFx0XHRpZCxcblx0XHRcdGZvdW5kLFxuXHRcdFx0aXNBY3RpdmU6ICgpID0+IGFjdGl2ZSxcblx0XHRcdGNhbmNlbCAgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChhY3RpdmUpIHtcblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIWAsIG8pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBjYW5jZWwgY2FsbGVkIHdoZW4gaW5hY3RpdmUuYCwgbyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG9cblx0XHRcdH0sXG5cdFx0XHRkaXNwYXRjaDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAoIWFjdGl2ZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gc3RhcnQgLT5gLCBvKTtcblxuXHRcdFx0XHRcdGxldCBqICA9IC0xO1xuXHRcdFx0XHRcdGFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHR3aGlsZSAoYWN0aXZlICYmICsraiA8IGZvdW5kLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0cm91dGVDb250ZXh0LmFjdGlvblJ1bm5lcihmb3VuZFtqXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS53YXJuKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gaXMgYnVzeSFgLCBvKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBvXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0cHJpdmF0ZSByZWdpc3RlcigpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gdHJ1ZTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgdGhpcy5fcG9wU3RhdGVMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdFx0d0RvYy5hZGRFdmVudExpc3RlbmVyKGxpbmtDbGlja0V2ZW50LCB0aGlzLl9saW5rQ2xpY2tMaXN0ZW5lciwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHJpdmF0ZSB1bnJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9saXN0ZW5pbmcpIHtcblx0XHRcdHRoaXMuX2xpc3RlbmluZyA9IGZhbHNlO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIobGlua0NsaWNrRXZlbnQsIHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyLCBmYWxzZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvLyBvbmNsaWNrIGZyb20gcGFnZS5qcyBsaWJyYXJ5OiBnaXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanNcblx0cHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkge1xuXG5cdFx0aWYgKDEgIT09IHdoaWNoKGUpKSByZXR1cm47XG5cblx0XHRpZiAoZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5KSByZXR1cm47XG5cdFx0aWYgKGUuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG5cdFx0Ly8gZW5zdXJlIGxpbmtcblx0XHQvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZSBpZiBub3QsIGZhbGwgYmFjayB0byBjb21wb3NlZFBhdGgoKSBmb3IgYnJvd3NlcnMgdGhhdCBvbmx5IGhhdmUgc2hhZHlcblx0XHRsZXQgZWw6IEhUTUxFbGVtZW50IHwgbnVsbCA9IDxIVE1MRWxlbWVudD5lLnRhcmdldCxcblx0XHRcdGV2ZW50UGF0aCAgICAgICAgICAgICAgPSAoZSBhcyBhbnkpLnBhdGggfHwgKChlIGFzIGFueSkuY29tcG9zZWRQYXRoID8gKGUgYXMgYW55KS5jb21wb3NlZFBhdGgoKSA6IG51bGwpO1xuXG5cdFx0aWYgKGV2ZW50UGF0aCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudFBhdGgubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0ubm9kZU5hbWUpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoZXZlbnRQYXRoW2ldLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiQVwiKSBjb250aW51ZTtcblx0XHRcdFx0aWYgKCFldmVudFBhdGhbaV0uaHJlZikgY29udGludWU7XG5cblx0XHRcdFx0ZWwgPSBldmVudFBhdGhbaV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBjb250aW51ZSBlbnN1cmUgbGlua1xuXHRcdC8vIGVsLm5vZGVOYW1lIGZvciBzdmcgbGlua3MgYXJlICdhJyBpbnN0ZWFkIG9mICdBJ1xuXHRcdHdoaWxlIChlbCAmJiBcIkFcIiAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgZWwgPSA8YW55PmVsLnBhcmVudE5vZGU7XG5cdFx0aWYgKCFlbCB8fCBcIkFcIiAhPT0gZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSkgcmV0dXJuO1xuXG5cdFx0Ly8gY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdFx0Ly8gaW4gdGhpcyBjYXNlLCBib3RoIGhyZWYgYW5kIHRhcmdldCBhcmUgYWx3YXlzIGluc2lkZSBhbiBvYmplY3Rcblx0XHRsZXQgc3ZnID0gKHR5cGVvZiAoZWwgYXMgYW55KS5ocmVmID09PSBcIm9iamVjdFwiKSAmJiAoZWwgYXMgYW55KS5ocmVmLmNvbnN0cnVjdG9yLm5hbWUgPT09IFwiU1ZHQW5pbWF0ZWRTdHJpbmdcIjtcblxuXHRcdC8vIElnbm9yZSBpZiB0YWcgaGFzXG5cdFx0Ly8gMS4gXCJkb3dubG9hZFwiIGF0dHJpYnV0ZVxuXHRcdC8vIDIuIHJlbD1cImV4dGVybmFsXCIgYXR0cmlidXRlXG5cdFx0aWYgKGVsLmhhc0F0dHJpYnV0ZShcImRvd25sb2FkXCIpIHx8IGVsLmdldEF0dHJpYnV0ZShcInJlbFwiKSA9PT0gXCJleHRlcm5hbFwiKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbm9uLWhhc2ggZm9yIHRoZSBzYW1lIHBhdGhcblx0XHRsZXQgbGluayA9IGVsLmdldEF0dHJpYnV0ZShcImhyZWZcIik7XG5cdFx0aWYgKCF0aGlzLl9oYXNoTW9kZSAmJiBzYW1lUGF0aChlbCBhcyBhbnkpICYmICgoZWwgYXMgYW55KS5oYXNoIHx8IFwiI1wiID09PSBsaW5rKSkgcmV0dXJuO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcblx0XHRpZiAobGluayAmJiBsaW5rLmluZGV4T2YoXCJtYWlsdG86XCIpID4gLTEpIHJldHVybjtcblxuXHRcdC8vIGNoZWNrIHRhcmdldFxuXHRcdC8vIHN2ZyB0YXJnZXQgaXMgYW4gb2JqZWN0IGFuZCBpdHMgZGVzaXJlZCB2YWx1ZSBpcyBpbiAuYmFzZVZhbCBwcm9wZXJ0eVxuXHRcdGlmIChzdmcgPyAoZWwgYXMgYW55KS50YXJnZXQuYmFzZVZhbCA6IChlbCBhcyBhbnkpLnRhcmdldCkgcmV0dXJuO1xuXG5cdFx0Ly8geC1vcmlnaW5cblx0XHQvLyBub3RlOiBzdmcgbGlua3MgdGhhdCBhcmUgbm90IHJlbGF0aXZlIGRvbid0IGNhbGwgY2xpY2sgZXZlbnRzIChhbmQgc2tpcCBwYWdlLmpzKVxuXHRcdC8vIGNvbnNlcXVlbnRseSwgYWxsIHN2ZyBsaW5rcyB0ZXN0ZWQgaW5zaWRlIHBhZ2UuanMgYXJlIHJlbGF0aXZlIGFuZCBpbiB0aGUgc2FtZSBvcmlnaW5cblx0XHRpZiAoIXN2ZyAmJiAhc2FtZU9yaWdpbigoZWwgYXMgYW55KS5ocmVmKSkgcmV0dXJuO1xuXG5cdFx0Ly8gcmVidWlsZCBwYXRoXG5cdFx0Ly8gVGhlcmUgYXJlbid0IC5wYXRobmFtZSBhbmQgLnNlYXJjaCBwcm9wZXJ0aWVzIGluIHN2ZyBsaW5rcywgc28gd2UgdXNlIGhyZWZcblx0XHQvLyBBbHNvLCBzdmcgaHJlZiBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0bGV0IHRhcmdldEhyZWYgPSBzdmcgPyAoZWwgYXMgYW55KS5ocmVmLmJhc2VWYWwgOiAoZWwgYXMgYW55KS5ocmVmO1xuXG5cdFx0Ly8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG5cdFx0Lypcblx0XHRsZXQgaGFzUHJvY2VzcyA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJztcblx0XHRpZiAoaGFzUHJvY2VzcyAmJiB0YXJnZXRIcmVmLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnJlcGxhY2UoL15cXC9bYS16QS1aXTpcXC8vLCBcIi9cIik7XG5cdFx0fVxuXHRcdCovXG5cblx0XHRsZXQgb3JpZyA9IHRhcmdldEhyZWY7XG5cblx0XHRpZiAodGFyZ2V0SHJlZi5pbmRleE9mKHRoaXMuX2Jhc2VVcmwpID09PSAwKSB7XG5cdFx0XHR0YXJnZXRIcmVmID0gdGFyZ2V0SHJlZi5zdWJzdHIodGhpcy5fYmFzZVVybC5sZW5ndGgpO1xuXHRcdH1cblxuXHRcdGlmIChvcmlnID09PSB0YXJnZXRIcmVmKSByZXR1cm47XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl1bY2xpY2tdIC0+XCIsIGVsLCBvcmlnLCB0YXJnZXRIcmVmLCB3SGlzdG9yeS5zdGF0ZSk7XG5cdFx0dGhpcy5icm93c2VUbyhvcmlnKTtcblx0fVxuXG59XG4iXX0=