"use strict";
import Utils from "./utils/Utils";
import scriptLoader from "./utils/scriptLoader";
const LANG_PORTION_COPY_REG = /{{\s*([A-Z][A-Z0-9_]+)\s*}}/g, // for {{LANG_KEY}}
LANG_REPLACE_REG = /{\s*(?:([a-zA-Z_]+):)?([a-zA-Z0-9_]+)\s*}/g, // for {variable} and {fn:variable}
LANG_VALUE_TAG_REG = /(INPUT|TEXTAREA)/i;
let LANG_OBJECT = {}, LANG_DEFAULT, LANG_DIRECTORIES = {}, LANG_PLUGINS = {}, LANG_FORMATS_FN_LIST = {
    "file_size": function (size, langCode) {
        let units = OWebLang.getLangText("FILE_SIZE_UNITS", langCode) || ["Kb"], decimal_point = OWebLang.getLangText("NUMBER_DECIMAL_SYMBOL", langCode) || ".", // ',' for french
        sep = OWebLang.getLangText("NUMBER_DIGIT_SEP", langCode) || " ", i_max = units.length, i = 0, ko = 1024, result = 0;
        size = parseFloat(size);
        while (size >= 1 && i < i_max) {
            result = size;
            size /= ko;
            i++;
        }
        if (!i) {
            i = 1;
        }
        let parts = String(result).split(".");
        let head = (parseInt(parts[0]) === result) ? result : Utils.math.numberFormat(result, 2, decimal_point, sep);
        return head + " " + units[i - 1];
    }
};
let runPlugins = (plugins, data, langCode) => {
    let len = plugins.length;
    for (let i = 0; i < len; i++) {
        let plugin = plugins[i], fn = LANG_PLUGINS[plugin];
        if (fn) {
            data = fn(data, langCode);
        }
        else {
            console.error("OWebLang: undefined plugins \"%s\".", plugin);
        }
    }
    return data;
};
let runReplace = (text, data, langCode) => {
    let fnExec = function (name, value, langCode) {
        let fn = LANG_FORMATS_FN_LIST[name];
        if (typeof fn === "function") {
            return fn(value, langCode);
        }
        return value;
    };
    text = text.replace(LANG_REPLACE_REG, (text, fn, variable) => {
        let value = (data || {})[variable];
        if (fn) {
            value = fnExec(fn, value, langCode);
        }
        return value;
    });
    return text;
};
let translate = function (langKey, langData, langCode) {
    let data = langData || {};
    let text = OWebLang.getLangText(langKey, langCode);
    if (data["olangPlugins"]) {
        let plugins = data["olangPlugins"].split("|");
        data = runPlugins(plugins, data, langCode);
    }
    if (text !== undefined) {
        if (LANG_REPLACE_REG.test(text)) {
            text = runReplace(text, data, langCode);
        }
        return text;
    }
    return langKey;
};
let portionReplacer = function (text, langCode) {
    if (LANG_PORTION_COPY_REG.test(text)) {
        text = text.replace(LANG_PORTION_COPY_REG, function (text, p) {
            return OWebLang.getLangText(p, langCode);
        });
    }
    return text;
};
let loadLangFiles = function () {
    let lang_codes = Object.keys(LANG_OBJECT);
    let sources = Object.keys(LANG_DIRECTORIES);
    let sources_bundle = [];
    lang_codes.forEach(function (langCode) {
        sources.forEach(function (path) {
            sources_bundle.push([path + langCode + ".js"]);
        });
    });
    if (sources_bundle.length) {
        scriptLoader.batchLoad(sources_bundle, (success, done, failed) => {
            // at least one should be loaded
            if (done.length) {
                OWebLang.updateAll();
            }
            if (failed.length) {
                console.warn("OWebLang: fail to load lang files ->", failed);
            }
        });
    }
};
export class OTranslator {
    constructor(element) {
        this.ele = element;
    }
    update(handler, context) {
        let $ele = $(this.ele), translatedText = null, langKey = $ele.data("olang"), langCode = $ele.data("olangCode") || LANG_DEFAULT, titleKey = $ele.data("olangTitle"), placeholderKey = $ele.data("olangPlaceholder"), langData = $ele.data("olangData") || $ele.data();
        if (LANG_OBJECT[langCode]) {
            if (langKey !== undefined) {
                translatedText = translate(langKey, langData, langCode);
                if (Utils.isFunction(handler)) {
                    handler.call(context, translatedText);
                }
                else {
                    let tag = this.ele.nodeName;
                    if (!LANG_VALUE_TAG_REG.test(tag)) {
                        this.ele.innerHTML = translatedText;
                    }
                    else {
                        this.ele.setAttribute("value", translatedText);
                    }
                }
            }
            if (titleKey !== undefined) {
                this.ele.setAttribute("title", translate(titleKey, langData, langCode));
            }
            if (placeholderKey !== undefined) {
                this.ele.setAttribute("placeholder", translate(placeholderKey, langData, langCode));
            }
        }
        else {
            console.warn("OTranslator: please wait while the lang '%s' is loaded...", langCode);
        }
    }
}
export default class OWebLang {
    static getTranslator(ele) {
        return new OTranslator(ele);
    }
    static setLangData(langCode, data) {
        if (!Utils.isString(langCode)) {
            throw new TypeError("OWebLang: your lang name should be a valid string");
        }
        if (!Utils.isPlainObject(data)) {
            throw new TypeError("OWebLang: your lang data should be a valid plain object");
        }
        LANG_OBJECT[langCode] = Utils.assign(LANG_OBJECT[langCode] || {}, data);
        return this;
    }
    static getLangText(textKey, langCode) {
        if (LANG_OBJECT[langCode]) {
            return portionReplacer(LANG_OBJECT[langCode][textKey], langCode);
        }
        else {
            return undefined;
        }
    }
    static setDefaultLang(langCode) {
        if (LANG_DEFAULT !== langCode) {
            LANG_DEFAULT = langCode;
            if (!LANG_OBJECT[langCode]) {
                LANG_OBJECT[langCode] = {};
            }
            loadLangFiles();
        }
        return this;
    }
    static addLangDirectories(path) {
        let list = Utils.isArray(path) ? path : [path];
        for (let i = 0; i < list.length; i++) {
            if (LANG_DIRECTORIES[list[i]] === undefined) {
                LANG_DIRECTORIES[list[i]] = true;
            }
        }
        loadLangFiles();
        return this;
    }
    static updateAll() {
        $(document.body).oLangUpdateTree();
        return this;
    }
    static addPlugin(name, fn) {
        if (LANG_PLUGINS[name]) {
            throw new Error(`OWebLang: plugin '${name}' already defined.`);
        }
        LANG_PLUGINS[name] = fn;
        return this;
    }
    static toHuman(langKey, langData = {}, langCode = LANG_DEFAULT) {
        return translate(langKey, langData, langCode);
    }
}
$.extend($.fn, {
    oLangAble: function () {
        return $(this).data("olang") !== undefined
            || $(this).data("olangTitle") !== undefined
            || $(this).data("olangPlaceholder") !== undefined
            || $(this).data("olangHidden") !== undefined;
    },
    oLangDataObject: function () {
        let $ele = $(this);
        if (!$ele.oLangAble()) {
            throw new Error("There is no olang data object.");
        }
        return {
            "olang": $ele.data("olang") || $ele.data("olangTitle") || $ele.data("olangPlaceholder") || $ele.data("olangHidden"),
            "olangData": $ele.data("olangData") || $ele.data()
        };
    }, oLang: function () {
        return $(this).each(function () {
            OWebLang.getTranslator(this.get(0)).update();
        });
    }, oLangUpdateTree: function () {
        return $(this).find("*").each(function () {
            let $ele = $(this);
            if ($ele.oLangAble()) {
                $ele.oLang();
            }
        });
    }
});
//# sourceMappingURL=OWebLang.js.map