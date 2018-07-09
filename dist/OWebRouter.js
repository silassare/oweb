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
}, token_reg = /:([a-z][a-z0-9_]*)/i, wLoc = window.location;
let escapeString = function (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/])/g, "\\$1");
};
let stringReg = function (str) {
    return new RegExp(escapeString(str));
};
let getPathname = (url, hash = true) => {
    return hash ? url.hash.replace(/^#/, "") : url.pathname;
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
export class Route {
    constructor(path, rules, action) {
        if (path instanceof RegExp) {
            this.path = path.source;
            this.reg = path;
            this.tokens = Utils.isArray(rules) ? rules : [];
        }
        else if (Utils.isString(path) && path.length) {
            let result = parseDynamicPath(path, rules);
            this.path = path;
            this.reg = result.reg;
            this.tokens = result.tokens;
        }
        else {
            throw new TypeError("Invalid route path, string or RegExp required.");
        }
        if ("function" !== typeof action) {
            throw new TypeError("Invalid action type, got '" + typeof action + "' instead of 'function'.");
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
export class RouteContext {
    constructor(route, url, hashMode = true) {
        this.tokens = {};
        this.params = {};
        this._stop = false;
        this.tokens = route.parse(getPathname(url, hashMode));
        this.params = Utils.parseQueryString(url.search.replace(/^\?/, ""));
        this.url = url;
    }
    getToken(token) {
        return this.tokens[token];
    }
    getParam(key) {
        return this.params[key];
    }
    stop() {
        this._stop = true;
        return this;
    }
    stopped() {
        return this._stop;
    }
}
export default class OWebRouter {
    constructor(hashMode = true) {
        this.hashMode = hashMode;
        this._currentPath = "";
        this._routes = [];
        this._initialized = false;
    }
    start() {
        let s = this;
        if (s._initialized) {
            return this;
        }
        s._initialized = true;
        let onPopState = function (ev) {
            console.log("popstate", arguments);
        };
        let onHashChange = function (ev) {
            console.log("hashchange", arguments);
        };
        if (s.hashMode) {
            window.onhashchange = onHashChange;
        }
        else {
            window.onpopstate = onPopState;
        }
        return this;
    }
    on(path, rules, action) {
        this._routes.push(new Route(path, rules, action));
        return this;
    }
    dispatch(force, cancelable = false) {
        let s = this, path = getPathname(wLoc, this.hashMode);
        if (this._currentPath !== path || force) {
            this._currentPath = path;
            let url = new URL(wLoc.href), len = this._routes.length, i = 0;
            while (i < len) {
                let route = this._routes[i];
                // check if the location change during
                if (this._currentPath !== path) {
                    console.warn(`OWebRouter: location change while dispatching: ${path} -> ${this._currentPath}`);
                    break;
                }
                if (route.is(path)) {
                    let fn = route.getAction(), rCtx = new RouteContext(route, url, s.hashMode);
                    Utils.callback(fn, [rCtx]);
                    if (rCtx.stopped() && cancelable) {
                        console.warn(`OWebRouter: dispatch canceled for ${path}`);
                        break;
                    }
                }
            }
        }
        return this;
    }
}
OWebRouter.SELF = "OWebRouter";
//# sourceMappingURL=OWebRouter.js.map