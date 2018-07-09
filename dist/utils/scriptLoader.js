"use strict";
import Utils from "./Utils";
let document = window.document;
let isOldIE = /MSIE\s([5-9]\.0)/.test(navigator.userAgent);
if (typeof document !== "object" || typeof document.createElement !== "function") {
    throw "scriptLoader is for web use only";
}
let batchLoad = function (list, then, disable_cache = false) {
    let total = list.length;
    let failed = [];
    let done = [];
    let counter = 0;
    let updateCount = (success, src) => {
        counter++;
        (success ? done : failed).push(src);
        if (counter === total) {
            Utils.callback(then, [!failed.length, done, failed]);
        }
    };
    for (let i = 0; i < total; i++) {
        let src = list[i][0];
        let fn = list[i][1];
        if (typeof fn === "function" && !fn()) {
            continue;
        }
        tryLoad(src, (src) => {
            updateCount(true, src);
        }, (src) => {
            updateCount(false, src);
        }, disable_cache);
    }
};
let noCache = function (url) {
    let _random = function () {
        return String(Math.random()).substring(2);
    };
    try {
        let u = new URL(url, window.location.href);
        u.searchParams.set("nocache", _random());
        url = u.href;
    }
    catch (e) {
        console.error("unable to disable caching on file", url, e);
    }
    return url;
};
let tryLoad = function (src, then, fail, disable_cache = false) {
    if (!document.querySelector("script[load-path='" + src + "']")) {
        if (disable_cache) {
            src = noCache(src);
        }
        let script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.type = "text/javascript";
        script.onload = function () {
            Utils.callback(then, [src]);
        };
        script.onerror = function () {
            script.parentNode.removeChild(script);
            Utils.callback(fail, [src]);
        };
        script.setAttribute("load-path", src);
        document.body.appendChild(script);
        //ie9 hack: to force script execution in order
        //since ie9 does not suport script.async  = false;
        //https://github.com/h5bp/lazyweb-requests/issues/42#issue-1382146
        if (isOldIE) {
            document.body.appendChild(document.createElement("script"));
        }
    }
    else {
        Utils.callback(then, [src]);
    }
};
export default {
    noCache,
    tryLoad,
    batchLoad
};
//# sourceMappingURL=scriptLoader.js.map