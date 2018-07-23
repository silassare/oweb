"use strict";
/*
 t = "path/to/:id/file/:index/name.:format";
 p = {id:"num",index:"alpha",format:"alpha-num"};
 parseDynamicPath(t,p);
*/
import Utils from "./utils/Utils";
const token_type_reg_map = {
    "num": (/(\d+)/).source,
    "alpha": (/([a-zA-Z]+)/).source,
    "alpha-u": (/([a-z]+)/).source,
    "alpha-l": (/([A-Z]+)/).source,
    "alpha-num": (/([a-zA-Z0-9]+)/).source,
    "alpha-num-l": (/([a-z0-9]+)/).source,
    "alpha-num-u": (/([A-Z0-9]+)/).source,
    "any": /([^/]+)/.source
}, token_reg = /:([a-z][a-z0-9_]*)/i, wLoc = window.location, wDoc = window.document, wHistory = window.history;
let escapeString = function (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
};
let stringReg = function (str) {
    return new RegExp(escapeString(str));
};
let fixPath = (path) => {
    if (!path.length || path == "/") {
        return "/";
    }
    path = path.replace(/^#/, "");
    if (path[0] != "/") {
        path = "/" + path;
    }
    return path;
};
let parseDynamicPath = function (path, options) {
    let tokens = [], reg = "", _path = path, match;
    while ((match = token_reg.exec(_path)) != null) {
        let found = match[0], token = match[1], rule = options[token] || "any", head = _path.slice(0, match.index);
        if (head.length) {
            reg += stringReg(head).source;
        }
        if (typeof rule === "string" && rule in token_type_reg_map) {
            reg += token_type_reg_map[rule];
        }
        else if (rule instanceof RegExp) {
            reg += rule.source;
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
        reg += stringReg(_path).source;
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
            rules = Utils.isPlainObject(rules) ? rules : {};
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
    constructor(path, url) {
        this._stopped = false;
        this._saved = false;
        this._url = url;
        this._path = path;
        this._tokens = {};
        this._params = Utils.parseQueryString(this._url.search.replace(/^\?/, ""));
        let hState = history.state || {};
        this._state = hState.data || {};
        if (hState.path && hState.path !== path) { // should never be true
            console.warn("[OWebRouteContext] using another path state, %s != %s", hState.path, path);
        }
    }
    getToken(key) {
        return this._tokens[key];
    }
    getTokens() {
        return Object.create(this._tokens);
    }
    getParam(key) {
        return this._params[key];
    }
    getParams() {
        return Object.create(this._params);
    }
    getPath() {
        return this._path;
    }
    stop() {
        this._stopped = true;
        return this;
    }
    stopped() {
        return this._stopped;
    }
    saved() {
        return this._saved;
    }
    setTitle(title) {
        if (title.length) {
            wDoc.title = title;
        }
        return this;
    }
    pushState() {
        if (!this._saved) {
            this._saved = true;
            let state = {
                "path": this._path,
                "data": this._state
            };
            wHistory.pushState(state, wDoc.title, this._url.href);
            console.log("[OWebRouteContext] state pushed", history.state, this._url.href);
        }
        else {
            // just update history state
            console.log("[OWebRouteContext] state push ignored -> will replace");
            this.replaceState();
        }
        return this;
    }
    replaceState() {
        this._saved = true;
        let state = {
            "path": this._path,
            "data": this._state
        };
        wHistory.replaceState(state, wDoc.title, this._url.href);
        console.log("[OWebRouteContext] state replaced", history.state, this._url.href);
        return this;
    }
    runAction(route) {
        let fn = route.getAction();
        this._tokens = route.parse(this._path);
        Utils.callback(fn, [this]);
        return this;
    }
}
export default class OWebRouter {
    constructor(baseUrl, hashMode = true) {
        this._currentPath = "";
        this._routes = [];
        this._initialized = false;
        this._listening = false;
        this._historyCount = 0;
        this._notFound = undefined;
        let r = this;
        this._baseUrl = baseUrl;
        this._hashMode = hashMode;
        this._popStateListener = (e) => {
            r.onPopState(e);
        };
        console.log("[OWebRouter] ready!");
    }
    start(runBrowse = true, path = wLoc[this._hashMode ? "hash" : "pathname"]) {
        if (!this._initialized) {
            this._initialized = true;
            this.register();
            console.log("[OWebRouter] start routing!");
            runBrowse && this.browseTo(path);
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
    register() {
        if (!this._listening) {
            this._listening = true;
            window.addEventListener("popstate", this._popStateListener, false);
        }
        return this;
    }
    unregister() {
        if (this._listening) {
            this._listening = false;
            window.removeEventListener("popstate", this._popStateListener, false);
        }
        return this;
    }
    onPopState(e) {
        console.log("[OWebRouter] popstate ->", e);
        if (e.state) {
            this.browseTo(e.state.path, e.state.data, true);
        }
        else {
            this.browseTo(wLoc[this._hashMode ? "hash" : "pathname"]);
        }
    }
    on(path, rules = {}, action) {
        console.log("[OWebRouter] watching path ->", path, { rules, action });
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
            if (this._historyCount > 0) {
                if (this._historyCount >= distance) {
                    this._historyCount -= distance;
                    wHistory.go(-distance);
                }
                else {
                    let c = this._historyCount;
                    this._historyCount = 0;
                    wHistory.go(-c);
                }
            }
            else {
                this._historyCount = 0;
                this.browseTo(this._baseUrl);
            }
        }
        return this;
    }
    browseTo(path, state = {}, replace = false) {
        console.log("[OWebRouter] browsing to -> ", path, state, replace);
        path = fixPath(path);
        if (this._currentPath !== path) {
            this._currentPath = path;
            this._historyCount++;
            let url = new URL(path, this._baseUrl), rCtx = new OWebRouteContext(path, url), found;
            if (replace) {
                rCtx.pushState();
            }
            found = this.dispatch(rCtx, true);
            if (!found.length) {
                console.log("[OWebRouter] no route found for path ->", path);
                if (this._notFound) {
                    this._notFound(path);
                }
                else {
                    console.warn("[OWebRouter] notFound action is not defined!");
                    this.stopRouting();
                }
            }
            else if (!replace && !rCtx.saved()) {
                rCtx.pushState();
            }
        }
        return this;
    }
    dispatch(rCtx, cancelable = true) {
        console.log("[OWebRouter] dispatch start -> ", rCtx, cancelable);
        let path = rCtx.getPath(), len = this._routes.length, i = -1, found = [];
        while (++i < len) {
            let route = this._routes[i];
            // check if the location change during
            if (this._currentPath !== path) {
                console.warn(`[OWebRouter] location change while dispatching: ${path} -> ${this._currentPath}`);
                break;
            }
            if (route.is(path)) {
                found.push(route);
                rCtx.runAction(route);
                if (rCtx.stopped() && cancelable) {
                    console.warn(`[OWebRouter] dispatch canceled for "${path}" by route action ->`, route.getAction());
                    break;
                }
            }
        }
        console.log("[OWebRouter] dispatch end, routes ->", found);
        return found;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT1dlYlJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9PV2ViUm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViOzs7O0VBSUU7QUFDRixPQUFPLEtBQUssTUFBTSxlQUFlLENBQUM7QUFPbEMsTUFBTSxrQkFBa0IsR0FBRztJQUN2QixLQUFLLEVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNO0lBQy9CLE9BQU8sRUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU07SUFDckMsU0FBUyxFQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTtJQUNsQyxTQUFTLEVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNO0lBQ2xDLFdBQVcsRUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBTTtJQUN4QyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNO0lBQ3JDLGFBQWEsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU07SUFDckMsS0FBSyxFQUFVLFNBQVMsQ0FBQyxNQUFNO0NBQy9CLEVBQ0QsU0FBUyxHQUFZLHFCQUFxQixFQUMxQyxJQUFJLEdBQWlCLE1BQU0sQ0FBQyxRQUFRLEVBQ3BDLElBQUksR0FBaUIsTUFBTSxDQUFDLFFBQVEsRUFDcEMsUUFBUSxHQUFhLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFFdkMsSUFBSSxZQUFZLEdBQUcsVUFBVSxHQUFXO0lBQ3ZDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4RCxDQUFDLENBQUM7QUFFRixJQUFJLFNBQVMsR0FBRyxVQUFVLEdBQVc7SUFDcEMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUM7QUFFRixJQUFJLE9BQU8sR0FBRyxDQUFDLElBQVksRUFBVSxFQUFFO0lBQ3RDLElBQUksQ0FB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