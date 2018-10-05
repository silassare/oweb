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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLGVBQWUsQ0FBQztBQXVCbEMsTUFBTSxnQkFBZ0IsR0FBRztJQUNyQixLQUFLLEVBQVUsS0FBSyxDQUFDLE1BQU07SUFDM0IsT0FBTyxFQUFRLFdBQVcsQ0FBQyxNQUFNO0lBQ2pDLFNBQVMsRUFBTSxRQUFRLENBQUMsTUFBTTtJQUM5QixTQUFTLEVBQU0sUUFBUSxDQUFDLE1BQU07SUFDOUIsV0FBVyxFQUFJLGNBQWMsQ0FBQyxNQUFNO0lBQ3BDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTTtJQUNqQyxhQUFhLEVBQUUsV0FBVyxDQUFDLE1BQU07SUFDakMsS0FBSyxFQUFVLE9BQU8sQ0FBQyxNQUFNO0NBQzdCLEVBQ0QsU0FBUyxHQUFVLHFCQUFxQixFQUN4QyxJQUFJLEdBQWUsTUFBTSxDQUFDLFFBQVEsRUFDbEMsSUFBSSxHQUFlLE1BQU0sQ0FBQyxRQUFRLEVBQ2xDLFFBQVEsR0FBVyxNQUFNLENBQUMsT0FBTyxFQUNqQyxjQUFjLEdBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzdELFVBQVUsR0FBUyxJQUFJLENBQUM7QUFFM0IsTUFBTSxLQUFLLEdBQVUsVUFBVSxDQUFNO0lBQ2pDLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUN0QixPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdDLENBQUMsRUFDRCxRQUFRLEdBQU8sVUFBVSxHQUFRO0lBQ2hDLE9BQU8sR0FBRyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUTtRQUNwQyxHQUFH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bUZBQW1GO1FBQ25GLHdGQUF3RjtRQUN4RixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7WUFBRSxPQUFPO1FBRWxELGVBQWU7UUFDZiw2RUFBNkU7UUFDN0UsNEVBQTRFO1FBQzVFLElBQUksVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUUsRUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFFLEVBQVUsQ0FBQyxJQUFJLENBQUM7UUFFbkUsdURBQXVEO1FBQ3ZEOzs7OztVQUtFO1FBRUYsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBRXRCLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzVDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckQ7UUFFRCxJQUFJLElBQUksS0FBSyxVQUFVO1lBQUUsT0FBTztRQUVoQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0NBRUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVXRpbHMgZnJvbSBcIi4vdXRpbHMvVXRpbHNcIjtcblxuZXhwb3J0IHR5cGUgdFJvdXRlUGF0aCA9IHN0cmluZyB8IFJlZ0V4cDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVBhdGhPcHRpb25zID0geyBba2V5OiBzdHJpbmddOiBSZWdFeHAgfCBrZXlvZiB0eXBlb2YgdG9rZW5UeXBlc1JlZ01hcCB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlVG9rZW5zTWFwID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZUFjdGlvbiA9IChjdHg6IE9XZWJSb3V0ZUNvbnRleHQpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSB0Um91dGVJbmZvID0geyByZWc6IFJlZ0V4cCB8IG51bGwsIHRva2VuczogQXJyYXk8c3RyaW5nPiB9O1xuZXhwb3J0IHR5cGUgdFJvdXRlU3RhdGVJdGVtID0gc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCB8IERhdGUgfCB0Um91dGVTdGF0ZU9iamVjdDtcbmV4cG9ydCB0eXBlIHRSb3V0ZVN0YXRlT2JqZWN0ID0geyBba2V5OiBzdHJpbmddOiB0Um91dGVTdGF0ZUl0ZW0gfTtcbmV4cG9ydCB0eXBlIHRSb3V0ZVRhcmdldCA9IHsgcGFyc2VkOiBzdHJpbmcsIGhyZWY6IHN0cmluZywgcGF0aDogc3RyaW5nLCBmdWxsUGF0aDogc3RyaW5nIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgaVJvdXRlRGlzcGF0Y2hlciB7XG5cdHJlYWRvbmx5IGlkOiBudW1iZXIsXG5cdHJlYWRvbmx5IGNvbnRleHQ6IE9XZWJSb3V0ZUNvbnRleHQsXG5cdHJlYWRvbmx5IGZvdW5kOiBPV2ViUm91dGVbXVxuXG5cdGlzQWN0aXZlKCk6IGJvb2xlYW4sXG5cblx0ZGlzcGF0Y2goKTogdGhpcyxcblxuXHRjYW5jZWwoKTogdGhpcyxcbn1cblxuY29uc3QgdG9rZW5UeXBlc1JlZ01hcCA9IHtcblx0XHQgIFwibnVtXCIgICAgICAgIDogL1xcZCsvLnNvdXJjZSxcblx0XHQgIFwiYWxwaGFcIiAgICAgIDogL1thLXpBLVpdKy8uc291cmNlLFxuXHRcdCAgXCJhbHBoYS11XCIgICAgOiAvW2Etel0rLy5zb3VyY2UsXG5cdFx0ICBcImFscGhhLWxcIiAgICA6IC9bQS1aXSsvLnNvdXJjZSxcblx0XHQgIFwiYWxwaGEtbnVtXCIgIDogL1thLXpBLVowLTldKy8uc291cmNlLFxuXHRcdCAgXCJhbHBoYS1udW0tbFwiOiAvW2EtejAtOV0rLy5zb3VyY2UsXG5cdFx0ICBcImFscGhhLW51bS11XCI6IC9bQS1aMC05XSsvLnNvdXJjZSxcblx0XHQgIFwiYW55XCIgICAgICAgIDogL1teL10rLy5zb3VyY2Vcblx0ICB9LFxuXHQgIHRva2VuX3JlZyAgICAgICAgPSAvOihbYS16XVthLXowLTlfXSopL2ksXG5cdCAgd0xvYyAgICAgICAgICAgICA9IHdpbmRvdy5sb2NhdGlvbixcblx0ICB3RG9jICAgICAgICAgICAgID0gd2luZG93LmRvY3VtZW50LFxuXHQgIHdIaXN0b3J5ICAgICAgICAgPSB3aW5kb3cuaGlzdG9yeSxcblx0ICBsaW5rQ2xpY2tFdmVudCAgID0gd0RvYy5vbnRvdWNoc3RhcnQgPyBcInRvdWNoc3RhcnRcIiA6IFwiY2xpY2tcIixcblx0ICBoYXNoVGFnU3RyICAgICAgID0gXCIjIVwiO1xuXG5jb25zdCB3aGljaCAgICAgICAgPSBmdW5jdGlvbiAoZTogYW55KSB7XG5cdFx0ICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG5cdFx0ICByZXR1cm4gbnVsbCA9PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuXHQgIH0sXG5cdCAgc2FtZVBhdGggICAgID0gZnVuY3Rpb24gKHVybDogVVJMKSB7XG5cdFx0ICByZXR1cm4gdXJsLnBhdGhuYW1lID09PSB3TG9jLnBhdGhuYW1lICYmXG5cdFx0XHQgIHVybC5zZWFyY2ggPT09IHdMb2Muc2VhcmNoO1xuXHQgIH0sXG5cdCAgc2FtZU9yaWdpbiAgID0gZnVuY3Rpb24gKGhyZWY6IHN0cmluZykge1xuXHRcdCAgaWYgKCFocmVmKSByZXR1cm4gZmFsc2U7XG5cdFx0ICBsZXQgdXJsID0gbmV3IFVSTChocmVmLnRvU3RyaW5nKCksIHdMb2MudG9TdHJpbmcoKSk7XG5cblx0XHQgIHJldHVybiB3TG9jLnByb3RvY29sID09PSB1cmwucHJvdG9jb2wgJiZcblx0XHRcdCAgd0xvYy5ob3N0bmFtZSA9PT0gdXJsLmhvc3RuYW1lICYmXG5cdFx0XHQgIHdMb2MucG9ydCA9PT0gdXJsLnBvcnQ7XG5cdCAgfSxcblx0ICBlc2NhcGVTdHJpbmcgPSBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpIHtcblx0XHQgIHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCBcIlxcXFwkMVwiKTtcblx0ICB9LFxuXHQgIHN0cmluZ1JlZyAgICA9IGZ1bmN0aW9uIChzdHI6IHN0cmluZykge1xuXHRcdCAgcmV0dXJuIG5ldyBSZWdFeHAoZXNjYXBlU3RyaW5nKHN0cikpO1xuXHQgIH0sXG5cdCAgbGVhZGluZ1NsYXNoID0gKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0ICBpZiAoIXBhdGgubGVuZ3RoIHx8IHBhdGggPT0gXCIvXCIpIHtcblx0XHRcdCAgcmV0dXJuIFwiL1wiO1xuXHRcdCAgfVxuXG5cdFx0ICByZXR1cm4gcGF0aFswXSAhPSBcIi9cIiA/IFwiL1wiICsgcGF0aCA6IHBhdGg7XG5cdCAgfTtcblxuLypcbiB0ID0gXCJwYXRoL3RvLzppZC9maWxlLzppbmRleC9uYW1lLjpmb3JtYXRcIjtcbiBwID0ge2lkOlwibnVtXCIsaW5kZXg6XCJhbHBoYVwiLGZvcm1hdDpcImFscGhhLW51bVwifTtcbiBwYXJzZUR5bmFtaWNQYXRoKHQscCk7XG4qL1xuY29uc3Qgd3JhcFJlZyAgICAgICAgICA9IChzdHI6IHN0cmluZywgY2FwdHVyZTogYm9vbGVhbiA9IGZhbHNlKSA9PiBjYXB0dXJlID8gXCIoXCIgKyBzdHIgKyBcIilcIiA6IFwiKD86XCIgKyBzdHIgKyBcIilcIixcblx0ICBwYXJzZUR5bmFtaWNQYXRoID0gZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgb3B0aW9uczogdFJvdXRlUGF0aE9wdGlvbnMpOiB0Um91dGVJbmZvIHtcblxuXHRcdCAgbGV0IHRva2VuczogQXJyYXk8c3RyaW5nPiA9IFtdLFxuXHRcdFx0ICByZWc6IHN0cmluZyAgICAgICAgICAgPSBcIlwiLFxuXHRcdFx0ICBfcGF0aDogc3RyaW5nICAgICAgICAgPSBwYXRoLFxuXHRcdFx0ICBtYXRjaDogUmVnRXhwRXhlY0FycmF5IHwgbnVsbDtcblxuXHRcdCAgd2hpbGUgKChtYXRjaCA9IHRva2VuX3JlZy5leGVjKF9wYXRoKSkgIT0gbnVsbCkge1xuXHRcdFx0ICBsZXQgZm91bmQ6IGFueSAgID0gbWF0Y2hbMF0sXG5cdFx0XHRcdCAgdG9rZW46IGFueSAgID0gbWF0Y2hbMV0sXG5cdFx0XHRcdCAgcnVsZTogYW55ICAgID0gb3B0aW9uc1t0b2tlbl0gfHwgXCJhbnlcIixcblx0XHRcdFx0ICBoZWFkOiBzdHJpbmcgPSBfcGF0aC5zbGljZSgwLCBtYXRjaC5pbmRleCk7XG5cblx0XHRcdCAgaWYgKGhlYWQubGVuZ3RoKSB7XG5cdFx0XHRcdCAgcmVnICs9IHdyYXBSZWcoc3RyaW5nUmVnKGhlYWQpLnNvdXJjZSk7XG5cdFx0XHQgIH1cblxuXHRcdFx0ICBpZiAodHlwZW9mIHJ1bGUgPT09IFwic3RyaW5nXCIgJiYgcnVsZSBpbiB0b2tlblR5cGVzUmVnTWFwKSB7XG5cdFx0XHRcdCAgcmVnICs9IHdyYXBSZWcoKHRva2VuVHlwZXNSZWdNYXAgYXMgYW55KVtydWxlXSwgdHJ1ZSk7XG5cdFx0XHQgIH0gZWxzZSBpZiAocnVsZSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0XHQgIHJlZyArPSB3cmFwUmVnKHJ1bGUuc291cmNlLCB0cnVlKTtcblx0XHRcdCAgfSBlbHNlIHtcblx0XHRcdFx0ICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJ1bGUgZm9yIHRva2VuICc6XCIgKyB0b2tlbiArIFwiJyBpbiBwYXRoICdcIiArIHBhdGggKyBcIidcIik7XG5cdFx0XHQgIH1cblxuXHRcdFx0ICB0b2tlbnMucHVzaCh0b2tlbik7XG5cblx0XHRcdCAgX3BhdGggPSBfcGF0aC5zbGljZShtYXRjaC5pbmRleCArIGZvdW5kLmxlbmd0aCk7XG5cdFx0ICB9XG5cblx0XHQgIGlmICghcmVnLmxlbmd0aCkge1xuXHRcdFx0ICByZXR1cm4ge1xuXHRcdFx0XHQgIHJlZyAgIDogbnVsbCxcblx0XHRcdFx0ICB0b2tlbnM6IHRva2Vuc1xuXHRcdFx0ICB9O1xuXHRcdCAgfVxuXG5cdFx0ICBpZiAoX3BhdGgubGVuZ3RoKSB7XG5cdFx0XHQgIHJlZyArPSB3cmFwUmVnKHN0cmluZ1JlZyhfcGF0aCkuc291cmNlKTtcblx0XHQgIH1cblxuXHRcdCAgcmV0dXJuIHtcblx0XHRcdCAgcmVnICAgOiBuZXcgUmVnRXhwKFwiXlwiICsgcmVnICsgXCIkXCIpLFxuXHRcdFx0ICB0b2tlbnM6IHRva2Vuc1xuXHRcdCAgfTtcblx0ICB9O1xuXG5leHBvcnQgY2xhc3MgT1dlYlJvdXRlIHtcblx0cHJpdmF0ZSByZWFkb25seSBwYXRoOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgcmVnOiBSZWdFeHAgfCBudWxsO1xuXHRwcml2YXRlIHRva2VuczogQXJyYXk8c3RyaW5nPjtcblx0cHJpdmF0ZSByZWFkb25seSBhY3Rpb246IHRSb3V0ZUFjdGlvbjtcblxuXHRjb25zdHJ1Y3RvcihwYXRoOiBzdHJpbmcgfCBSZWdFeHAsIHJ1bGVzOiB0Um91dGVQYXRoT3B0aW9ucyB8IEFycmF5PHN0cmluZz4sIGFjdGlvbjogdFJvdXRlQWN0aW9uKSB7XG5cblx0XHRpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0dGhpcy5wYXRoICAgPSBwYXRoLnRvU3RyaW5nKCk7XG5cdFx0XHR0aGlzLnJlZyAgICA9IHBhdGg7XG5cdFx0XHR0aGlzLnRva2VucyA9IFV0aWxzLmlzQXJyYXkocnVsZXMpID8gcnVsZXMgOiBbXTtcblx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzU3RyaW5nKHBhdGgpICYmIHBhdGgubGVuZ3RoKSB7XG5cdFx0XHRydWxlcyAgICAgICA9IDx0Um91dGVQYXRoT3B0aW9ucz4gKFV0aWxzLmlzUGxhaW5PYmplY3QocnVsZXMpID8gcnVsZXMgOiB7fSk7XG5cdFx0XHRsZXQgcCAgICAgICA9IHBhcnNlRHluYW1pY1BhdGgocGF0aCwgcnVsZXMpO1xuXHRcdFx0dGhpcy5wYXRoICAgPSBwYXRoO1xuXHRcdFx0dGhpcy5yZWcgICAgPSBwLnJlZztcblx0XHRcdHRoaXMudG9rZW5zID0gcC50b2tlbnM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXCJbT1dlYlJvdXRlXSBpbnZhbGlkIHJvdXRlIHBhdGgsIHN0cmluZyBvciBSZWdFeHAgcmVxdWlyZWQuXCIpO1xuXHRcdH1cblxuXHRcdGlmIChcImZ1bmN0aW9uXCIgIT09IHR5cGVvZiBhY3Rpb24pIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYFtPV2ViUm91dGVdIGludmFsaWQgYWN0aW9uIHR5cGUsIGdvdCBcIiR7IHR5cGVvZiBhY3Rpb259XCIgaW5zdGVhZCBvZiBcImZ1bmN0aW9uXCIuYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5hY3Rpb24gPSBhY3Rpb247XG5cdH1cblxuXHRpc0R5bmFtaWMoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVnICE9IG51bGw7XG5cdH1cblxuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMucGF0aDtcblx0fVxuXG5cdGdldEFjdGlvbigpOiB0Um91dGVBY3Rpb24ge1xuXHRcdHJldHVybiB0aGlzLmFjdGlvbjtcblx0fVxuXG5cdGlzKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAodGhpcy5yZWcpID8gdGhpcy5yZWcudGVzdChwYXRoKSA6IHRoaXMucGF0aCA9PT0gcGF0aDtcblx0fVxuXG5cdHBhcnNlKHBhdGg6IHN0cmluZyk6IHRSb3V0ZVRva2Vuc01hcCB7XG5cblx0XHRpZiAodGhpcy5pc0R5bmFtaWMoKSkge1xuXHRcdFx0bGV0IGZvdW5kczogYW55O1xuXG5cdFx0XHRpZiAoZm91bmRzID0gU3RyaW5nKHBhdGgpLm1hdGNoKHRoaXMucmVnIGFzIFJlZ0V4cCkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMudG9rZW5zLnJlZHVjZSgoYWNjOiBhbnksIGtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0YWNjW2tleV0gPSBmb3VuZHNbaW5kZXggKyAxXTtcblx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHR9LCB7fSk7XG5cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge307XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE9XZWJSb3V0ZUNvbnRleHQge1xuXHRwcml2YXRlIF90b2tlbnM6IHRSb3V0ZVRva2Vuc01hcDtcblx0cHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHJlYWRvbmx5IF90YXJnZXQ6IHRSb3V0ZVRhcmdldDtcblx0cHJpdmF0ZSByZWFkb25seSBfc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0O1xuXHRwcml2YXRlIHJlYWRvbmx5IF9yb3V0ZXI6IE9XZWJSb3V0ZXI7XG5cblx0Y29uc3RydWN0b3Iocm91dGVyOiBPV2ViUm91dGVyLCB0YXJnZXQ6IHRSb3V0ZVRhcmdldCwgc3RhdGU6IHRSb3V0ZVN0YXRlT2JqZWN0KSB7XG5cdFx0dGhpcy5fdGFyZ2V0ID0gdGFyZ2V0O1xuXHRcdHRoaXMuX3Rva2VucyA9IHt9O1xuXHRcdHRoaXMuX3N0YXRlICA9IHN0YXRlIHx8IHt9O1xuXHRcdHRoaXMuX3JvdXRlciA9IHJvdXRlcjtcblx0fVxuXG5cdGdldFRva2VuKHRva2VuOiBzdHJpbmcpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzLl90b2tlbnNbdG9rZW5dO1xuXHR9XG5cblx0Z2V0VG9rZW5zKCkge1xuXHRcdHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMuX3Rva2Vucyk7XG5cdH1cblxuXHRnZXRQYXRoKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldC5wYXRoO1xuXHR9XG5cblx0Z2V0U3RhdGVJdGVtKGtleTogc3RyaW5nKTogdFJvdXRlU3RhdGVJdGVtIHtcblx0XHRyZXR1cm4gdGhpcy5fc3RhdGVba2V5XTtcblx0fVxuXG5cdGdldFNlYXJjaFBhcmFtKHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gbmV3IFVSTCh3TG9jLmhyZWYpLnNlYXJjaFBhcmFtcy5nZXQocGFyYW0pO1xuXHR9XG5cblx0c2V0U3RhdGVJdGVtKGtleTogc3RyaW5nLCB2YWx1ZTogdFJvdXRlU3RhdGVJdGVtKTogdGhpcyB7XG5cdFx0dGhpcy5fc3RhdGVba2V5XSA9IHZhbHVlO1xuXHRcdHJldHVybiB0aGlzLnNhdmUoKTtcblx0fVxuXG5cdHN0b3BwZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX3N0b3BwZWQ7XG5cdH1cblxuXHRzdG9wKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fc3RvcHBlZCkge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2lsbCBzdG9wLlwiKTtcblx0XHRcdHRoaXMuc2F2ZSgpOy8vIHNhdmUgYmVmb3JlIHN0b3Bcblx0XHRcdHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy5fcm91dGVyLmdldEN1cnJlbnREaXNwYXRjaGVyKCkhLmNhbmNlbCgpO1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIHJvdXRlIGNvbnRleHQgd2FzIHN0b3BwZWQhXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gcm91dGUgY29udGV4dCBhbHJlYWR5IHN0b3BwZWQhXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHNhdmUoKTogdGhpcyB7XG5cdFx0aWYgKCF0aGlzLnN0b3BwZWQoKSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0gc2F2aW5nIHN0YXRlLi4uXCIpO1xuXHRcdFx0dGhpcy5fcm91dGVyLnJlcGxhY2VIaXN0b3J5KHRoaXMuX3RhcmdldC5ocmVmLCB0aGlzLl9zdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJbT1dlYkRpc3BhdGNoQ29udGV4dF0geW91IHNob3VsZG4ndCB0cnkgdG8gc2F2ZSB3aGVuIHN0b3BwZWQuXCIpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0YWN0aW9uUnVubmVyKHJvdXRlOiBPV2ViUm91dGUpOiB0aGlzIHtcblx0XHR0aGlzLl90b2tlbnMgPSByb3V0ZS5wYXJzZSh0aGlzLl90YXJnZXQucGF0aCk7XG5cblx0XHRyb3V0ZS5nZXRBY3Rpb24oKSh0aGlzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9XZWJSb3V0ZXIge1xuXHRwcml2YXRlIHJlYWRvbmx5IF9iYXNlVXJsOiBzdHJpbmc7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2hhc2hNb2RlOiBib29sZWFuO1xuXHRwcml2YXRlIF9jdXJyZW50X3RhcmdldDogdFJvdXRlVGFyZ2V0ICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7XG5cdFx0cGFyc2VkICA6IFwiXCIsXG5cdFx0aHJlZiAgICA6IFwiXCIsXG5cdFx0cGF0aCAgICA6IFwiXCIsXG5cdFx0ZnVsbFBhdGg6IFwiXCJcblx0fTtcblx0cHJpdmF0ZSBfcm91dGVzOiBPV2ViUm91dGVbXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gW107XG5cdHByaXZhdGUgX2luaXRpYWxpemVkOiBib29sZWFuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IGZhbHNlO1xuXHRwcml2YXRlIF9saXN0ZW5pbmc6IGJvb2xlYW4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBmYWxzZTtcblx0cHJpdmF0ZSBfbm90Rm91bmQ6IHVuZGVmaW5lZCB8ICgodGFyZ2V0OiB0Um91dGVUYXJnZXQpID0+IHZvaWQpID0gdW5kZWZpbmVkO1xuXHRwcml2YXRlIHJlYWRvbmx5IF9wb3BTdGF0ZUxpc3RlbmVyOiAoZTogUG9wU3RhdGVFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSByZWFkb25seSBfbGlua0NsaWNrTGlzdGVuZXI6IChlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBfZGlzcGF0Y2hfaWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMDtcblx0cHJpdmF0ZSBfY3VycmVudF9kaXNwYXRjaGVyPzogaVJvdXRlRGlzcGF0Y2hlcjtcblx0cHJpdmF0ZSBfZm9yY2VfcmVwbGFjZTogYm9vbGVhbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gZmFsc2U7XG5cblx0Y29uc3RydWN0b3IoYmFzZVVybDogc3RyaW5nLCBoYXNoTW9kZTogYm9vbGVhbiA9IHRydWUpIHtcblx0XHRsZXQgciAgICAgICAgICAgICAgICAgID0gdGhpcztcblx0XHR0aGlzLl9iYXNlVXJsICAgICAgICAgID0gYmFzZVVybDtcblx0XHR0aGlzLl9oYXNoTW9kZSAgICAgICAgID0gaGFzaE1vZGU7XG5cdFx0dGhpcy5fcG9wU3RhdGVMaXN0ZW5lciA9IChlOiBQb3BTdGF0ZUV2ZW50KSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBwb3BzdGF0ZSAtPlwiLCBhcmd1bWVudHMpO1xuXG5cdFx0XHRpZiAoZS5zdGF0ZSkge1xuXHRcdFx0XHRyLmJyb3dzZVRvKGUuc3RhdGUudXJsLCBlLnN0YXRlLmRhdGEsIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHIuYnJvd3NlVG8od0xvYy5ocmVmLCB1bmRlZmluZWQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dGhpcy5fbGlua0NsaWNrTGlzdGVuZXIgPSAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpID0+IHtcblx0XHRcdHIuX29uQ2xpY2soZSk7XG5cdFx0fTtcblxuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIHJlYWR5IVwiKTtcblx0fVxuXG5cdHN0YXJ0KGZpcnN0UnVuOiBib29sZWFuID0gdHJ1ZSwgdGFyZ2V0OiBzdHJpbmcgPSB3TG9jLmhyZWYsIHN0YXRlPzogdFJvdXRlU3RhdGVPYmplY3QpOiB0aGlzIHtcblx0XHRpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKCk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBzdGFydCByb3V0aW5nIVwiKTtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIHdhdGNoaW5nIHJvdXRlcyAtPlwiLCB0aGlzLl9yb3V0ZXMpO1xuXHRcdFx0Zmlyc3RSdW4gJiYgdGhpcy5icm93c2VUbyh0YXJnZXQsIHN0YXRlLCBmYWxzZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihcIltPV2ViUm91dGVyXSByb3V0ZXIgYWxyZWFkeSBzdGFydGVkIVwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHN0b3BSb3V0aW5nKCk6IHRoaXMge1xuXHRcdGlmICh0aGlzLl9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudW5yZWdpc3RlcigpO1xuXHRcdFx0Y29uc29sZS5sb2coXCJbT1dlYlJvdXRlcl0gc3RvcCByb3V0aW5nIVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJSb3V0ZXJdIHlvdSBzaG91bGQgc3RhcnQgcm91dGluZyBmaXJzdCFcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRmb3JjZU5leHRSZXBsYWNlKCk6IHRoaXMge1xuXHRcdHRoaXMuX2ZvcmNlX3JlcGxhY2UgPSB0cnVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0Q3VycmVudFRhcmdldCgpOiB0Um91dGVUYXJnZXQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50X3RhcmdldDtcblx0fVxuXG5cdGdldEN1cnJlbnREaXNwYXRjaGVyKCk6IGlSb3V0ZURpc3BhdGNoZXIgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXI7XG5cdH1cblxuXHRnZXRSb3V0ZUNvbnRleHQoKTogT1dlYlJvdXRlQ29udGV4dCB7XG5cdFx0aWYgKCF0aGlzLl9jdXJyZW50X2Rpc3BhdGNoZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIltPV2ViUm91dGVyXSBubyByb3V0ZSBjb250ZXh0LlwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudF9kaXNwYXRjaGVyLmNvbnRleHQ7XG5cdH1cblxuXHRwYXJzZVVSTCh1cmw6IHN0cmluZyB8IFVSTCk6IHRSb3V0ZVRhcmdldCB7XG5cdFx0bGV0IGIgPSBuZXcgVVJMKHRoaXMuX2Jhc2VVcmwpLFxuXHRcdFx0dSA9IG5ldyBVUkwodXJsLnRvU3RyaW5nKCksIGIpLFxuXHRcdFx0XzogdFJvdXRlVGFyZ2V0O1xuXG5cdFx0aWYgKHRoaXMuX2hhc2hNb2RlKSB7XG5cdFx0XHRfID0ge1xuXHRcdFx0XHRwYXJzZWQgIDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWYgICAgOiB1LmhyZWYsXG5cdFx0XHRcdHBhdGggICAgOiB1Lmhhc2gucmVwbGFjZShoYXNoVGFnU3RyLCBcIlwiKSxcblx0XHRcdFx0ZnVsbFBhdGg6IHUuaGFzaFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRsZXQgcGF0aG5hbWUgPSB1LnBhdGhuYW1lO1xuXHRcdFx0Ly8gd2hlbiB1c2luZyBwYXRobmFtZSBtYWtlIHN1cmUgdG8gcmVtb3ZlXG5cdFx0XHQvLyBiYXNlIHVyaSBwYXRobmFtZSBmb3IgYXBwIGluIHN1YmRpcmVjdG9yeVxuXHRcdFx0aWYgKHBhdGhuYW1lLmluZGV4T2YoYi5wYXRobmFtZSkgPT09IDApIHtcblx0XHRcdFx0cGF0aG5hbWUgPSBwYXRobmFtZS5zdWJzdHIoYi5wYXRobmFtZS5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRfID0ge1xuXHRcdFx0XHRwYXJzZWQgIDogdXJsLnRvU3RyaW5nKCksXG5cdFx0XHRcdGhyZWYgICAgOiB1LmhyZWYsXG5cdFx0XHRcdHBhdGggICAgOiBsZWFkaW5nU2xhc2gocGF0aG5hbWUpLFxuXHRcdFx0XHRmdWxsUGF0aDogbGVhZGluZ1NsYXNoKHBhdGhuYW1lICsgdS5zZWFyY2ggKyAodS5oYXNoIHx8IFwiXCIpKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBwYXJzZWQgdXJsIC0+XCIsIF8pO1xuXG5cdFx0cmV0dXJuIF87XG5cdH1cblxuXHRwYXRoVG9VUkwocGF0aDogc3RyaW5nLCBiYXNlPzogc3RyaW5nKTogVVJMIHtcblxuXHRcdGJhc2UgPSBiYXNlICYmIGJhc2UubGVuZ3RoID8gYmFzZSA6IHRoaXMuX2Jhc2VVcmw7XG5cblx0XHRpZiAocGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoL15odHRwcz86XFwvXFwvLy50ZXN0KHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFVSTChwYXRoKTtcblx0XHR9XG5cblx0XHRwYXRoID0gdGhpcy5faGFzaE1vZGUgPyBoYXNoVGFnU3RyICsgbGVhZGluZ1NsYXNoKHBhdGgpIDogcGF0aDtcblxuXHRcdHJldHVybiBuZXcgVVJMKHBhdGgsIGJhc2UpO1xuXHR9XG5cblx0b24ocGF0aDogdFJvdXRlUGF0aCwgcnVsZXM6IHRSb3V0ZVBhdGhPcHRpb25zID0ge30sIGFjdGlvbjogdFJvdXRlQWN0aW9uKTogdGhpcyB7XG5cdFx0dGhpcy5fcm91dGVzLnB1c2gobmV3IE9XZWJSb3V0ZShwYXRoLCBydWxlcywgYWN0aW9uKSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRub3RGb3VuZChjYWxsYmFjazogKHRhcmdldDogdFJvdXRlVGFyZ2V0KSA9PiB2b2lkKTogdGhpcyB7XG5cdFx0dGhpcy5fbm90Rm91bmQgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdvQmFjayhkaXN0YW5jZTogbnVtYmVyID0gMSk6IHRoaXMge1xuXHRcdGlmIChkaXN0YW5jZSA+IDApIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIGdvaW5nIGJhY2sgLT4gXCIsIGRpc3RhbmNlKTtcblx0XHRcdGxldCBoTGVuID0gd0hpc3RvcnkubGVuZ3RoO1xuXHRcdFx0aWYgKGhMZW4gPiAxKSB7XG5cdFx0XHRcdGlmIChoTGVuID49IGRpc3RhbmNlKSB7XG5cdFx0XHRcdFx0d0hpc3RvcnkuZ28oLWRpc3RhbmNlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3SGlzdG9yeS5nbygtaExlbik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGNvcmRvdmFcblx0XHRcdFx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IgJiYgKHdpbmRvdy5uYXZpZ2F0b3IgYXMgYW55KS5hcHApIHtcblx0XHRcdFx0XHQod2luZG93Lm5hdmlnYXRvciBhcyBhbnkpLmFwcC5leGl0QXBwKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGJyb3dzZVRvKHVybDogc3RyaW5nLCBzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QgPSB7fSwgcHVzaDogYm9vbGVhbiA9IHRydWUsIGlnbm9yZVNhbWVMb2NhdGlvbjogYm9vbGVhbiA9IGZhbHNlKTogdGhpcyB7XG5cdFx0bGV0IHRhcmdldFVybCA9IHRoaXMucGF0aFRvVVJMKHVybCksXG5cdFx0XHR0YXJnZXQgICAgPSB0aGlzLnBhcnNlVVJMKHRhcmdldFVybC5ocmVmKSxcblx0XHRcdF9jZCAgICAgICA9IHRoaXMuX2N1cnJlbnRfZGlzcGF0Y2hlcixcblx0XHRcdGNkOiBpUm91dGVEaXNwYXRjaGVyO1xuXG5cdFx0aWYgKCFzYW1lT3JpZ2luKHRhcmdldC5ocmVmKSkge1xuXHRcdFx0d2luZG93Lm9wZW4odXJsKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIGJyb3dzaW5nIHRvIC0+IFwiLCB0YXJnZXQucGF0aCwge3N0YXRlLCBwdXNoLCB0YXJnZXR9KTtcblxuXHRcdGlmIChpZ25vcmVTYW1lTG9jYXRpb24gJiYgdGhpcy5fY3VycmVudF90YXJnZXQuaHJlZiA9PT0gdGFyZ2V0LmhyZWYpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiW09XZWJSb3V0ZXJdIGlnbm9yZSBzYW1lIGxvY2F0aW9uIC0+IFwiLCB0YXJnZXQucGF0aCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoX2NkICYmIF9jZC5pc0FjdGl2ZSgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJbT1dlYlJvdXRlcl0gYnJvd3NlVG8gY2FsbGVkIHdoaWxlIGRpc3BhdGNoaW5nIC0+IFwiLCBfY2QpO1xuXHRcdFx0X2NkLmNhbmNlbCgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRfdGFyZ2V0ID0gdGFyZ2V0O1xuXG5cdFx0aWYgKCF0aGlzLl9mb3JjZV9yZXBsYWNlKSB7XG5cdFx0XHRwdXNoICYmIHRoaXMuYWRkSGlzdG9yeSh0YXJnZXRVcmwuaHJlZiwgc3RhdGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9mb3JjZV9yZXBsYWNlID0gZmFsc2U7XG5cdFx0XHR0aGlzLnJlcGxhY2VIaXN0b3J5KHRhcmdldFVybC5ocmVmLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3VycmVudF9kaXNwYXRjaGVyID0gY2QgPSB0aGlzLmNyZWF0ZURpc3BhdGNoZXIodGFyZ2V0LCBzdGF0ZSwgKyt0aGlzLl9kaXNwYXRjaF9pZCk7XG5cblx0XHRpZiAoIWNkLmZvdW5kLmxlbmd0aCkge1xuXHRcdFx0Y29uc29sZS53YXJuKFwiW09XZWJSb3V0ZXJdIG5vIHJvdXRlIGZvdW5kIGZvciBwYXRoIC0+XCIsIHRhcmdldC5wYXRoKTtcblx0XHRcdGlmICh0aGlzLl9ub3RGb3VuZCkge1xuXHRcdFx0XHR0aGlzLl9ub3RGb3VuZCh0YXJnZXQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiW09XZWJSb3V0ZXJdIG5vdEZvdW5kIGFjdGlvbiBpcyBub3QgZGVmaW5lZCFcIik7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNkLmRpc3BhdGNoKCk7XG5cblx0XHRpZiAoY2QuaWQgPT09IHRoaXMuX2Rpc3BhdGNoX2lkICYmICFjZC5jb250ZXh0LnN0b3BwZWQoKSkge1xuXHRcdFx0Y2QuY29udGV4dC5zYXZlKCk7XG5cdFx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXSBzdWNjZXNzIC0+XCIsIHRhcmdldC5wYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGFkZEhpc3RvcnkodXJsOiBzdHJpbmcsIHN0YXRlOiB0Um91dGVTdGF0ZU9iamVjdCwgdGl0bGU6IHN0cmluZyA9IFwiXCIpOiB0aGlzIHtcblx0XHR0aXRsZSA9IHRpdGxlICYmIHRpdGxlLmxlbmd0aCA/IHRpdGxlIDogd0RvYy50aXRsZTtcblxuXHRcdHdIaXN0b3J5LnB1c2hTdGF0ZSh7dXJsLCBkYXRhOiBzdGF0ZX0sIHRpdGxlLCB1cmwpO1xuXG5cdFx0Y29uc29sZS53YXJuKFwiW09XZWJEaXNwYXRjaENvbnRleHRdIGhpc3RvcnkgYWRkZWRcIiwgc3RhdGUsIHVybCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHJlcGxhY2VIaXN0b3J5KHVybDogc3RyaW5nLCBzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsIHRpdGxlOiBzdHJpbmcgPSBcIlwiKTogdGhpcyB7XG5cdFx0dGl0bGUgPSB0aXRsZSAmJiB0aXRsZS5sZW5ndGggPyB0aXRsZSA6IHdEb2MudGl0bGU7XG5cblx0XHR3SGlzdG9yeS5yZXBsYWNlU3RhdGUoe3VybCwgZGF0YTogc3RhdGV9LCB0aXRsZSwgdXJsKTtcblxuXHRcdGNvbnNvbGUud2FybihcIltPV2ViRGlzcGF0Y2hDb250ZXh0XSBoaXN0b3J5IHJlcGxhY2VkIC0+IFwiLCB3SGlzdG9yeS5zdGF0ZSwgdXJsKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVEaXNwYXRjaGVyKHRhcmdldDogdFJvdXRlVGFyZ2V0LCBzdGF0ZTogdFJvdXRlU3RhdGVPYmplY3QsIGlkOiBudW1iZXIpOiBpUm91dGVEaXNwYXRjaGVyIHtcblxuXHRcdGNvbnNvbGUubG9nKGBbT1dlYlJvdXRlcl1bZGlzcGF0Y2hlci0ke2lkfV0gY3JlYXRpb24uYCk7XG5cblx0XHRsZXQgY3R4ICAgICAgICAgICAgICAgID0gdGhpcyxcblx0XHRcdGZvdW5kOiBPV2ViUm91dGVbXSA9IFtdLFxuXHRcdFx0YWN0aXZlICAgICAgICAgICAgID0gZmFsc2UsXG5cdFx0XHRyb3V0ZUNvbnRleHQgICAgICAgPSBuZXcgT1dlYlJvdXRlQ29udGV4dCh0aGlzLCB0YXJnZXQsIHN0YXRlKSxcblx0XHRcdG86IGlSb3V0ZURpc3BhdGNoZXI7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGN0eC5fcm91dGVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgcm91dGUgPSBjdHguX3JvdXRlc1tpXTtcblxuXHRcdFx0aWYgKHJvdXRlLmlzKHRhcmdldC5wYXRoKSkge1xuXHRcdFx0XHRmb3VuZC5wdXNoKHJvdXRlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvID0ge1xuXHRcdFx0Y29udGV4dCA6IHJvdXRlQ29udGV4dCxcblx0XHRcdGlkLFxuXHRcdFx0Zm91bmQsXG5cdFx0XHRpc0FjdGl2ZTogKCkgPT4gYWN0aXZlLFxuXHRcdFx0Y2FuY2VsICA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0aWYgKGFjdGl2ZSkge1xuXHRcdFx0XHRcdGFjdGl2ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQhYCwgbyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcihgW09XZWJSb3V0ZXJdW2Rpc3BhdGNoZXItJHtpZH1dIGNhbmNlbCBjYWxsZWQgd2hlbiBpbmFjdGl2ZS5gLCBvKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb1xuXHRcdFx0fSxcblx0XHRcdGRpc3BhdGNoOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmICghYWN0aXZlKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBzdGFydCAtPmAsIG8pO1xuXG5cdFx0XHRcdFx0bGV0IGogID0gLTE7XG5cdFx0XHRcdFx0YWN0aXZlID0gdHJ1ZTtcblxuXHRcdFx0XHRcdHdoaWxlIChhY3RpdmUgJiYgKytqIDwgZm91bmQubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRyb3V0ZUNvbnRleHQuYWN0aW9uUnVubmVyKGZvdW5kW2pdKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhY3RpdmUgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLndhcm4oYFtPV2ViUm91dGVyXVtkaXNwYXRjaGVyLSR7aWR9XSBpcyBidXN5IWAsIG8pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG9cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIG87XG5cdH1cblxuXHRwcml2YXRlIHJlZ2lzdGVyKCk6IHRoaXMge1xuXHRcdGlmICghdGhpcy5fbGlzdGVuaW5nKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5pbmcgPSB0cnVlO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVyLCBmYWxzZSk7XG5cdFx0XHR3RG9jLmFkZEV2ZW50TGlzdGVuZXIobGlua0NsaWNrRXZlbnQsIHRoaXMuX2xpbmtDbGlja0xpc3RlbmVyLCBmYWxzZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRwcml2YXRlIHVucmVnaXN0ZXIoKTogdGhpcyB7XG5cdFx0aWYgKHRoaXMuX2xpc3RlbmluZykge1xuXHRcdFx0dGhpcy5fbGlzdGVuaW5nID0gZmFsc2U7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX3BvcFN0YXRlTGlzdGVuZXIsIGZhbHNlKTtcblx0XHRcdHdEb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaW5rQ2xpY2tFdmVudCwgdGhpcy5fbGlua0NsaWNrTGlzdGVuZXIsIGZhbHNlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIG9uY2xpY2sgZnJvbSBwYWdlLmpzIGxpYnJhcnk6IGdpdGh1Yi5jb20vdmlzaW9ubWVkaWEvcGFnZS5qc1xuXHRwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XG5cblx0XHRpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuXHRcdGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcblx0XHRpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0XHQvLyBlbnN1cmUgbGlua1xuXHRcdC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlIGlmIG5vdCwgZmFsbCBiYWNrIHRvIGNvbXBvc2VkUGF0aCgpIGZvciBicm93c2VycyB0aGF0IG9ubHkgaGF2ZSBzaGFkeVxuXHRcdGxldCBlbDogSFRNTEVsZW1lbnQgfCBudWxsID0gPEhUTUxFbGVtZW50PmUudGFyZ2V0LFxuXHRcdFx0ZXZlbnRQYXRoICAgICAgICAgICAgICA9IChlIGFzIGFueSkucGF0aCB8fCAoKGUgYXMgYW55KS5jb21wb3NlZFBhdGggPyAoZSBhcyBhbnkpLmNvbXBvc2VkUGF0aCgpIDogbnVsbCk7XG5cblx0XHRpZiAoZXZlbnRQYXRoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGV2ZW50UGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ub2RlTmFtZSkgY29udGludWU7XG5cdFx0XHRcdGlmIChldmVudFBhdGhbaV0ubm9kZU5hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJBXCIpIGNvbnRpbnVlO1xuXHRcdFx0XHRpZiAoIWV2ZW50UGF0aFtpXS5ocmVmKSBjb250aW51ZTtcblxuXHRcdFx0XHRlbCA9IGV2ZW50UGF0aFtpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGNvbnRpbnVlIGVuc3VyZSBsaW5rXG5cdFx0Ly8gZWwubm9kZU5hbWUgZm9yIHN2ZyBsaW5rcyBhcmUgJ2EnIGluc3RlYWQgb2YgJ0EnXG5cdFx0d2hpbGUgKGVsICYmIFwiQVwiICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSBlbCA9IDxhbnk+ZWwucGFyZW50Tm9kZTtcblx0XHRpZiAoIWVsIHx8IFwiQVwiICE9PSBlbC5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpKSByZXR1cm47XG5cblx0XHQvLyBjaGVjayBpZiBsaW5rIGlzIGluc2lkZSBhbiBzdmdcblx0XHQvLyBpbiB0aGlzIGNhc2UsIGJvdGggaHJlZiBhbmQgdGFyZ2V0IGFyZSBhbHdheXMgaW5zaWRlIGFuIG9iamVjdFxuXHRcdGxldCBzdmcgPSAodHlwZW9mIChlbCBhcyBhbnkpLmhyZWYgPT09IFwib2JqZWN0XCIpICYmIChlbCBhcyBhbnkpLmhyZWYuY29uc3RydWN0b3IubmFtZSA9PT0gXCJTVkdBbmltYXRlZFN0cmluZ1wiO1xuXG5cdFx0Ly8gSWdub3JlIGlmIHRhZyBoYXNcblx0XHQvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG5cdFx0Ly8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcblx0XHRpZiAoZWwuaGFzQXR0cmlidXRlKFwiZG93bmxvYWRcIikgfHwgZWwuZ2V0QXR0cmlidXRlKFwicmVsXCIpID09PSBcImV4dGVybmFsXCIpIHJldHVybjtcblxuXHRcdC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuXHRcdGxldCBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcblx0XHRpZiAoIXRoaXMuX2hhc2hNb2RlICYmIHNhbWVQYXRoKGVsIGFzIGFueSkgJiYgKChlbCBhcyBhbnkpLmhhc2ggfHwgXCIjXCIgPT09IGxpbmspKSByZXR1cm47XG5cblx0XHQvLyBDaGVjayBmb3IgbWFpbHRvOiBpbiB0aGUgaHJlZlxuXHRcdGlmIChsaW5rICYmIGxpbmsuaW5kZXhPZihcIm1haWx0bzpcIikgPiAtMSkgcmV0dXJuO1xuXG5cdFx0Ly8gY2hlY2sgdGFyZ2V0XG5cdFx0Ly8gc3ZnIHRhcmdldCBpcyBhbiBvYmplY3QgYW5kIGl0cyBkZXNpcmVkIHZhbHVlIGlzIGluIC5iYXNlVmFsIHByb3BlcnR5XG5cdFx0aWYgKHN2ZyA/IChlbCBhcyBhbnkpLnRhcmdldC5iYXNlVmFsIDogKGVsIGFzIGFueSkudGFyZ2V0KSByZXR1cm47XG5cblx0XHQvLyB4LW9yaWdpblxuXHRcdC8vIG5vdGU6IHN2ZyBsaW5rcyB0aGF0IGFyZSBub3QgcmVsYXRpdmUgZG9uJ3QgY2FsbCBjbGljayBldmVudHMgKGFuZCBza2lwIHBhZ2UuanMpXG5cdFx0Ly8gY29uc2VxdWVudGx5LCBhbGwgc3ZnIGxpbmtzIHRlc3RlZCBpbnNpZGUgcGFnZS5qcyBhcmUgcmVsYXRpdmUgYW5kIGluIHRoZSBzYW1lIG9yaWdpblxuXHRcdGlmICghc3ZnICYmICFzYW1lT3JpZ2luKChlbCBhcyBhbnkpLmhyZWYpKSByZXR1cm47XG5cblx0XHQvLyByZWJ1aWxkIHBhdGhcblx0XHQvLyBUaGVyZSBhcmVuJ3QgLnBhdGhuYW1lIGFuZCAuc2VhcmNoIHByb3BlcnRpZXMgaW4gc3ZnIGxpbmtzLCBzbyB3ZSB1c2UgaHJlZlxuXHRcdC8vIEFsc28sIHN2ZyBocmVmIGlzIGFuIG9iamVjdCBhbmQgaXRzIGRlc2lyZWQgdmFsdWUgaXMgaW4gLmJhc2VWYWwgcHJvcGVydHlcblx0XHRsZXQgdGFyZ2V0SHJlZiA9IHN2ZyA/IChlbCBhcyBhbnkpLmhyZWYuYmFzZVZhbCA6IChlbCBhcyBhbnkpLmhyZWY7XG5cblx0XHQvLyBzdHJpcCBsZWFkaW5nIFwiL1tkcml2ZSBsZXR0ZXJdOlwiIG9uIE5XLmpzIG9uIFdpbmRvd3Ncblx0XHQvKlxuXHRcdGxldCBoYXNQcm9jZXNzID0gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnO1xuXHRcdGlmIChoYXNQcm9jZXNzICYmIHRhcmdldEhyZWYubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuXHRcdFx0dGFyZ2V0SHJlZiA9IHRhcmdldEhyZWYucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sIFwiL1wiKTtcblx0XHR9XG5cdFx0Ki9cblxuXHRcdGxldCBvcmlnID0gdGFyZ2V0SHJlZjtcblxuXHRcdGlmICh0YXJnZXRIcmVmLmluZGV4T2YodGhpcy5fYmFzZVVybCkgPT09IDApIHtcblx0XHRcdHRhcmdldEhyZWYgPSB0YXJnZXRIcmVmLnN1YnN0cih0aGlzLl9iYXNlVXJsLmxlbmd0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9yaWcgPT09IHRhcmdldEhyZWYpIHJldHVybjtcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRjb25zb2xlLmxvZyhcIltPV2ViUm91dGVyXVtjbGlja10gLT5cIiwgZWwsIG9yaWcsIHRhcmdldEhyZWYsIHdIaXN0b3J5LnN0YXRlKTtcblx0XHR0aGlzLmJyb3dzZVRvKG9yaWcpO1xuXHR9XG5cbn1cbiJdfQ==