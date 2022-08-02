export const id = (function id() {
    const counters = Object.create({});
    counters['id'] = 0;
    return (prefix = 'id') => {
        if (!(prefix in counters)) {
            counters[prefix] = 0;
        }
        return prefix + '-' + counters[prefix]++;
    };
})();
export const noop = () => void 0;
// ==========TYPE CHECKERS====================================
export const isInteger = Number.isInteger ||
    function isInteger(value) {
        return (typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value);
    };
export const isArray = Array.isArray ||
    function isArray(value) {
        return toString.call(value) === '[object Array]';
    };
export const isPlainObject = (a) => Object.prototype.toString.call(a) === '[object Object]';
export const isString = (a) => typeof a === 'string';
export const isFunction = (a) => typeof a === 'function';
/**
 * Checks if value is null or undefined.
 */
export const isNil = (a) => {
    return a === undefined || a === null;
};
export const isEmpty = (a) => {
    if (a === undefined || a === null) {
        return true;
    }
    if (typeof a === 'string') {
        return a.trim().length === 0;
    }
    if (typeof a === 'number') {
        return isNaN(a);
    }
    if (typeof a === 'boolean') {
        return false;
    }
    if (isArray(a)) {
        return !a.length;
    }
    if (isPlainObject(a)) {
        for (const key in a) {
            if (Object.prototype.hasOwnProperty.call(a, key)) {
                return false;
            }
        }
        return true;
    }
    const tag = Object.prototype.toString.call(a);
    if (tag === '[object Set]' || tag === '[object Map]') {
        return !a.size;
    }
    return false;
};
export const isNotEmpty = (a) => !isEmpty(a);
export const toArray = (a) => [...a];
export const escapeRegExp = (str) => str.replace(/([.+*?=^!:${}()[\]|\\/])/g, '\\$1');
// ==========HELPERS====================================
export function callback(fn, args, ctx) {
    if (typeof fn === 'function') {
        return fn.apply(ctx, args);
    }
    return null;
}
export function unique(arr) {
    return Array.from(new Set(arr));
}
export function each(obj, fn) {
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        fn(value, key);
    });
}
export const forEach = function _forEach(collection, iteratee) {
    if (isPlainObject(collection)) {
        for (const k in collection) {
            Object.prototype.hasOwnProperty.call(collection, k) &&
                iteratee(collection[k], k, collection);
        }
    }
    else {
        for (const k in collection) {
            iteratee(collection[k], k, collection);
        }
    }
};
export const assign = Object.assign ||
    function _assign(...args) {
        const to = args[0];
        let from, symbols;
        for (let s = 1; s < args.length; s++) {
            from = Object(args[s]);
            for (const key in from) {
                if (Object.prototype.hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                }
            }
            if ('getOwnPropertySymbols' in Object) {
                symbols = Object.getOwnPropertySymbols(from);
                for (let i = 0; i < symbols.length; i++) {
                    if (Object.prototype.propertyIsEnumerable.call(from, symbols[i])) {
                        to[symbols[i]] = from[symbols[i]];
                    }
                }
            }
        }
        return to;
    };
export function clone(a) {
    return JSON.parse(JSON.stringify(a));
}
export function stringPlaceholderReplace(str, data) {
    if (isString(str) && str.length && isPlainObject(data)) {
        const keys = Object.keys(data).sort().reverse();
        let reg;
        if (keys.length) {
            const m = keys.join('|');
            reg = new RegExp(':(' + m + ')', 'g');
            return str.replace(reg, function stringChunkReplacer(...args) {
                const replacement = data[args[1]];
                if (replacement === undefined) {
                    return args[0];
                }
                return replacement;
            });
        }
    }
    return str;
}
export function textToLineString(text) {
    const reg = /["'\\\n\r\t\u2028\u2029]/g, singleQuote = String.fromCharCode(39), toEscapes = {
        '"': '"',
        [singleQuote]: singleQuote,
        '\\': '\\',
        '\n': 'n',
        '\r': 'r',
        '\t': 't',
        '\u2028': '2028',
        '\u2029': '2029',
    };
    return text.replace(reg, (match) => '\\' + toEscapes[match]);
}
// ==========MATH====================================
const _setDigitsSep = (x, sep) => {
    const s = String(x), ans = [], j = s.indexOf('.'), start = j !== -1 ? j : s.length, end = j !== -1 ? s.slice(start + 1) : [];
    let count = 0, i = start;
    for (; i >= 0; i--) {
        if (count === 3) {
            count = 0;
            ans[i] = i !== 0 ? sep + s[i] : s[i];
        }
        else {
            ans[i] = s[i];
        }
        count++;
    }
    return ans.concat(end).join('');
};
export function numberFormat(x, dec = 2, decimalSep = '.', digitsSep = ' ') {
    if (!x) {
        return '';
    }
    let ans = parseFloat(String(x));
    if (dec >= 0) {
        const decimalPow = Math.pow(10, dec);
        ans = Math.floor(ans * decimalPow) / decimalPow;
    }
    const n = _setDigitsSep(ans, digitsSep);
    const a = n.split('');
    const decimalPos = a.lastIndexOf('.');
    if (decimalPos >= 0 && decimalSep !== '.') {
        a[decimalPos] = decimalSep;
    }
    return a.join('');
}
export function gt(x, y, eq = false) {
    return eq ? x >= y : x > y;
}
export function lt(x, y, eq = false) {
    return eq ? x <= y : x < y;
}
export function between(x, a, b, eq = false) {
    return eq ? x >= a && x <= b : x > a && x < b;
}
export function isRange(a, b) {
    return typeof a === 'number' && typeof b === 'number' && a < b;
}
export function isInDOM(element, inBody = false) {
    let _ = element, last = null;
    while (_) {
        last = _;
        if (inBody && last === document.body) {
            break;
        }
        _ = _.parentNode;
    }
    return inBody ? last === document.body : last === document;
}
export function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
export function parseQueryString(str) {
    if (str.charAt(0) === '?')
        str = str.substring(1);
    if (!str.length)
        return {};
    const pairs = str.split('&'), params = {};
    for (let i = 0, len = pairs.length; i < len; i++) {
        const pair = pairs[i].split('='), key = decodeURIComponent(pair[0]), value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
        if (params[key] != null) {
            if (!isArray(params[key])) {
                params[key] = [params[key]];
            }
            params[key].push(value);
        }
        else
            params[key] = value;
    }
    return params;
}
export function preventDefault(e) {
    if (!e) {
        if (window.event)
            e = window.event;
        else
            return;
    }
    if (e.preventDefault)
        e.preventDefault();
    if (e.cancelBubble != null)
        e.cancelBubble = true;
    if (e.stopPropagation)
        e.stopPropagation();
    if (window.event)
        e.returnValue = false;
    // if (e.cancel != null) e.cancel = true;
}
export function isValidAge(day, month, year, minAge, maxAge) {
    // depending on the year, calculate the number of days in the month
    const februaryDays = year % 4 === 0 ? 29 : 28, daysInMonth = [31, februaryDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // first, check the incoming month and year are valid.
    if (!month || !day || !year) {
        return false;
    }
    if (1 > month || month > 12) {
        return false;
    }
    if (year < 0) {
        return false;
    }
    if (1 > day || day > daysInMonth[month - 1]) {
        return false;
    }
    // if required, verify the current date is LATER than the incoming date.
    if (minAge !== undefined || maxAge !== undefined) {
        // we get current year
        const currentYear = new Date().getFullYear(), age = currentYear - year;
        if (age < 0) {
            return false;
        }
        if (age < minAge) {
            return false;
        }
        if (age > maxAge) {
            return false;
        }
    }
    return true;
}
export function fileSizeFormat(size /* in bytes */, decimalPoint = '.', thousandsSep = ' ') {
    const units = ['byte', 'Kb', 'Mb', 'Gb', 'Tb'], iMax = units.length;
    let i = 0, result = 0;
    size = parseFloat(String(size));
    while (size >= 1 && i < iMax) {
        result = size;
        size /= 1000; // not 1024
        i++;
    }
    const parts = String(result).split('.'), head = parseInt(parts[0]) === result
        ? result
        : numberFormat(result, 2, decimalPoint, thousandsSep);
    return head + ' ' + units[i === 0 ? 0 : i - 1];
}
/**
 * Opens the provided url by injecting a hidden iframe that calls
 * window.open(), then removes the iframe from the DOM.
 *
 * Prevent reverse tabnabbing phishing attacks caused by _blank
 *
 * https://mathiasbynens.github.io/rel-noopener/
 *
 * https://github.com/danielstjules/blankshield/blob/6e208bf25a44bf50d1a5e85ae96fee0c015d05bc/blankshield.js#L166
 *
 * @param url
 * @param strWindowName
 * @param strWindowFeatures
 */
export function safeOpen(url = '', strWindowName = '', strWindowFeatures = '') {
    if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
        // IE before 11
        const child = open.apply(window, [url, strWindowName, strWindowFeatures]);
        if (child) {
            child.opener = null;
        }
        return child;
    }
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = (iframe.contentDocument ||
        iframe.contentWindow.document);
    let openArgs = '"' + url + '"';
    if (strWindowName) {
        openArgs += ', "' + strWindowName + '"';
    }
    if (strWindowFeatures) {
        openArgs += ', "' + strWindowFeatures + '"';
    }
    const script = iframeDoc.createElement('script');
    script.type = 'text/javascript';
    script.text =
        'window.parent = null; window.top = null;' +
            'window.frameElement = null; var child = window.open(' +
            openArgs +
            ');' +
            'if (child) { child.opener = null }';
    iframeDoc.body.appendChild(script);
    const newWin = iframe.contentWindow.child;
    document.body.removeChild(iframe);
    return newWin;
}
export const logger = (function _logger() {
    let _showLog = true;
    const _fn = function (type) {
        return _showLog ? console[type] : noop;
    };
    return {
        off() {
            _showLog = false;
        },
        on() {
            _showLog = true;
        },
        get memory() {
            return _fn('memory');
        },
        get assert() {
            return _fn('assert');
        },
        get clear() {
            return _fn('clear');
        },
        get count() {
            return _fn('count');
        },
        get countReset() {
            return _fn('countReset');
        },
        get debug() {
            return _fn('debug');
        },
        get dir() {
            return _fn('dir');
        },
        get dirxml() {
            return _fn('dirxml');
        },
        get error() {
            return _fn('error');
        },
        get exception() {
            return _fn('exception');
        },
        get group() {
            return _fn('group');
        },
        get groupCollapsed() {
            return _fn('groupCollapsed');
        },
        get groupEnd() {
            return _fn('groupEnd');
        },
        get info() {
            return _fn('info');
        },
        get log() {
            return _fn('log');
        },
        get table() {
            return _fn('table');
        },
        get time() {
            return _fn('time');
        },
        get timeEnd() {
            return _fn('timeEnd');
        },
        get timeLog() {
            return _fn('timeLog');
        },
        get timeStamp() {
            return _fn('timeStamp');
        },
        get trace() {
            return _fn('trace');
        },
        get warn() {
            return _fn('warn');
        },
    };
})();
export function encode(val) {
    return encodeURIComponent(val)
        .replace(/%24/g, '$')
        .replace(/%20/g, '+')
        .replace(/%3A/gi, ':')
        .replace(/%2C/gi, ',')
        .replace(/%5B/gi, '[')
        .replace(/%5D/gi, ']');
}
/**
 * Build query string from object. Recursively!
 * @param params
 * @param prefix
 */
export function buildQueryString(params, prefix) {
    if (params instanceof URLSearchParams) {
        return params.toString();
    }
    const duplicates = {}, str = [];
    for (const prop in params) {
        if (!Object.prototype.hasOwnProperty.call(params, prop)) {
            continue;
        }
        const key = prefix ? prefix + '[' + prop + ']' : prop, value = params[prop];
        let pair;
        if (value !== undefined) {
            if (value === null) {
                pair = encode(key);
            }
            else if (isPlainObject(value)) {
                pair = buildQueryString(value, key);
            }
            else if (isArray(value)) {
                pair = value
                    .reduce(function arrayValuesReducer(acc, item, index) {
                    if (!duplicates[key]) {
                        duplicates[key] = {};
                    }
                    if (!duplicates[key][item]) {
                        duplicates[key][item] = true;
                        return acc.concat(buildQueryString({
                            [key + '[' + index + ']']: item,
                        }));
                    }
                    return acc;
                }, [])
                    .join('&');
            }
            else {
                // scalar type
                pair = encode(key) + '=' + encode(value);
            }
            str.push(pair || key);
        }
    }
    return str.join('&');
}
export function searchParam(name, url) {
    let query = '';
    url = url || window.location;
    const loc_str = url.toString();
    const _u = new URL(loc_str);
    if (_u.searchParams) {
        return _u.searchParams.get(name);
    }
    if (typeof url !== 'string' && url.search) {
        query = url.search;
    }
    else {
        const k = loc_str.indexOf('?');
        if (k >= 0) {
            query = loc_str.slice(k);
        }
    }
    const pairs = query.replace(/^\?/, '').split('&');
    for (let i = 0; i < pairs.length; i++) {
        const parts = pairs[i].split('=');
        const key = parts[0] || '';
        if (key.toLowerCase() === name.toLowerCase()) {
            return decodeURIComponent(parts[1]);
        }
    }
    return null;
}
/**
 * Build a URL with a given params
 *
 * @param url
 * @param params
 */
export function buildURL(url, params) {
    if (!params) {
        return url;
    }
    const serializedParams = buildQueryString(params);
    if (serializedParams) {
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
            url = url.slice(0, hashIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }
    return url;
}
export function extractFieldLabelText(form, fieldName) {
    const field = form.querySelector(`[name='${fieldName}']`);
    let labelText = fieldName;
    if (field) {
        const id = field.getAttribute('id');
        let label, placeholder, title;
        if (id && (label = form.querySelector(`label[for='${id}']`))) {
            labelText = label.textContent;
        }
        else if ((placeholder = field.getAttribute('placeholder')) &&
            placeholder.trim().length) {
            labelText = placeholder;
        }
        else if ((title = field.getAttribute('title')) && title.trim().length) {
            labelText = title;
        }
    }
    return labelText;
}
/**
 * Generate uuid.
 */
export function uuid() {
    return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) => {
        return (c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFO0lBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVuQixPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksRUFBVSxFQUFFO1FBQ2hDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsRUFBRTtZQUMxQixRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzFDLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsR0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFNUMsOERBQThEO0FBRTlELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FDckIsTUFBTSxDQUFDLFNBQVM7SUFDaEIsU0FBUyxTQUFTLENBQUMsS0FBYztRQUNoQyxPQUFPLENBQ04sT0FBTyxLQUFLLEtBQUssUUFBUTtZQUN6QixRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQzNCLENBQUM7SUFDSCxDQUFDLENBQUM7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQ25CLEtBQUssQ0FBQyxPQUFPO0lBQ2IsU0FBUyxPQUFPLENBQUMsS0FBYztRQUM5QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssZ0JBQWdCLENBQUM7SUFDbEQsQ0FBQyxDQUFDO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQzVCLENBQVUsRUFDRCxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLGlCQUFpQixDQUFDO0FBQ3JFLE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQVUsRUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQzNFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQVUsRUFBZ0MsRUFBRSxDQUN0RSxPQUFPLENBQUMsS0FBSyxVQUFVLENBQUM7QUFFekI7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFVLEVBQXlCLEVBQUU7SUFDMUQsT0FBTyxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDdEMsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBVSxFQUFXLEVBQUU7SUFDOUMsSUFBSSxDQUFDLEtBQUssU0FBUyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDbEMsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUVELElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7S0FDN0I7SUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUMxQixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoQjtJQUVELElBQUksT0FBTyxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQzNCLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNmLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQ2pCO0lBRUQsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDckIsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUU7WUFDcEIsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNqRCxPQUFPLEtBQUssQ0FBQzthQUNiO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztLQUNaO0lBRUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTlDLElBQUksR0FBRyxLQUFLLGNBQWMsSUFBSSxHQUFHLEtBQUssY0FBYyxFQUFFO1FBQ3JELE9BQU8sQ0FBRSxDQUE4QixDQUFDLElBQUksQ0FBQztLQUM3QztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQyxDQUFDO0FBQ0YsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBVSxFQUFXLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBSSxDQUFjLEVBQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxHQUFXLEVBQVUsRUFBRSxDQUNuRCxHQUFHLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRWxELHdEQUF3RDtBQUN4RCxNQUFNLFVBQVUsUUFBUSxDQUFDLEVBQVcsRUFBRSxJQUFZLEVBQUUsR0FBYTtJQUNoRSxJQUFJLE9BQU8sRUFBRSxLQUFLLFVBQVUsRUFBRTtRQUM3QixPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzNCO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FBSSxHQUFRO0lBQ2pDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxNQUFNLFVBQVUsSUFBSSxDQUNuQixHQUErQixFQUMvQixFQUFnQztJQUVoQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFO1FBQ3hDLE1BQU0sS0FBSyxHQUFPLEdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQXdCRCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsU0FBUyxRQUFRLENBR3ZDLFVBQWEsRUFDYixRQUF1RTtJQUV2RSxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLFVBQVUsRUFBRTtZQUMzQixNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFDbEQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDeEM7S0FDRDtTQUFNO1FBQ04sS0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLEVBQUU7WUFDM0IsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDdkM7S0FDRDtBQUNGLENBQXNDLENBQUM7QUFFdkMsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUNsQixNQUFNLENBQUMsTUFBTTtJQUNiLFNBQVMsT0FBTyxDQUFDLEdBQUcsSUFBK0I7UUFDbEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25CLElBQUksSUFBSSxFQUFFLE9BQU8sQ0FBQztRQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXZCLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ25ELEVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQzdCO2FBQ0Q7WUFFRCxJQUFJLHVCQUF1QixJQUFJLE1BQU0sRUFBRTtnQkFDdEMsT0FBTyxHQUFJLE1BQWMsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUNoRSxFQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMzQztpQkFDRDthQUNEO1NBQ0Q7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUMsQ0FBQztBQUVILE1BQU0sVUFBVSxLQUFLLENBQUksQ0FBSTtJQUM1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRCxNQUFNLFVBQVUsd0JBQXdCLENBQ3ZDLEdBQVcsRUFDWCxJQUE2QjtJQUU3QixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN2RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hELElBQUksR0FBRyxDQUFDO1FBRVIsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXRDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsU0FBUyxtQkFBbUIsQ0FBQyxHQUFHLElBQUk7Z0JBQzNELE1BQU0sV0FBVyxHQUFJLElBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0MsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO29CQUM5QixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDZjtnQkFFRCxPQUFPLFdBQVcsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FBQztTQUNIO0tBQ0Q7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsSUFBWTtJQUM1QyxNQUFNLEdBQUcsR0FBRywyQkFBMkIsRUFDdEMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ3JDLFNBQVMsR0FBNEI7UUFDcEMsR0FBRyxFQUFFLEdBQUc7UUFDUixDQUFDLFdBQVcsQ0FBQyxFQUFFLFdBQVc7UUFDMUIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxHQUFHO1FBQ1QsSUFBSSxFQUFFLEdBQUc7UUFDVCxRQUFRLEVBQUUsTUFBTTtRQUNoQixRQUFRLEVBQUUsTUFBTTtLQUNoQixDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFJLFNBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN2RSxDQUFDO0FBRUQscURBQXFEO0FBRXJELE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBUyxFQUFFLEdBQVcsRUFBVSxFQUFFO0lBQ3hELE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFDbEIsR0FBRyxHQUFHLEVBQUUsRUFDUixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFDbEIsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUMvQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFDWixDQUFDLEdBQUcsS0FBSyxDQUFDO0lBRVgsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25CLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtZQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyQzthQUFNO1lBQ04sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNkO1FBQ0QsS0FBSyxFQUFFLENBQUM7S0FDUjtJQUVELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxVQUFVLFlBQVksQ0FDM0IsQ0FBa0IsRUFDbEIsR0FBRyxHQUFHLENBQUMsRUFDUCxVQUFVLEdBQUcsR0FBRyxFQUNoQixTQUFTLEdBQUcsR0FBRztJQUVmLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDUCxPQUFPLEVBQUUsQ0FBQztLQUNWO0lBRUQsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRWhDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRTtRQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxVQUFVLENBQUM7S0FDaEQ7SUFFRCxNQUFNLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFdEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN0QyxJQUFJLFVBQVUsSUFBSSxDQUFDLElBQUksVUFBVSxLQUFLLEdBQUcsRUFBRTtRQUMxQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDO0tBQzNCO0lBRUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25CLENBQUM7QUFFRCxNQUFNLFVBQVUsRUFBRSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsRUFBRSxHQUFHLEtBQUs7SUFDbEQsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVELE1BQU0sVUFBVSxFQUFFLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxFQUFFLEdBQUcsS0FBSztJQUNsRCxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQsTUFBTSxVQUFVLE9BQU8sQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxFQUFFLEdBQUcsS0FBSztJQUNsRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBVSxFQUFFLENBQVU7SUFDN0MsT0FBTyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPLENBQUMsT0FBYSxFQUFFLE1BQU0sR0FBRyxLQUFLO0lBQ3BELElBQUksQ0FBQyxHQUFnQixPQUFPLEVBQzNCLElBQUksR0FBZ0IsSUFBSSxDQUFDO0lBRTFCLE9BQU8sQ0FBQyxFQUFFO1FBQ1QsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNULElBQUksTUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3JDLE1BQU07U0FDTjtRQUNELENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDO0tBQ2pCO0lBRUQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO0FBQzVELENBQUM7QUFFRCxNQUFNLFVBQVUsT0FBTyxDQUFJLENBQU07SUFDaEMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVaLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1Q7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsR0FBVztJQUMzQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRztRQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTTtRQUFFLE9BQU8sRUFBRSxDQUFDO0lBRTNCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQzNCLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQy9CLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDakMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2hFLElBQUssTUFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFFLE1BQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2dCQUNsQyxNQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxNQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUM5QztZQUNBLE1BQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7O1lBQU8sTUFBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNwQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsQ0FBUTtJQUN0QyxJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsSUFBSSxNQUFNLENBQUMsS0FBSztZQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDOztZQUM5QixPQUFPO0tBQ1o7SUFFRCxJQUFJLENBQUMsQ0FBQyxjQUFjO1FBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3pDLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxJQUFJO1FBQUUsQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDbEQsSUFBSSxDQUFDLENBQUMsZUFBZTtRQUFFLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUMzQyxJQUFJLE1BQU0sQ0FBQyxLQUFLO1FBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFDeEMseUNBQXlDO0FBQzFDLENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUN6QixHQUFXLEVBQ1gsS0FBYSxFQUNiLElBQVksRUFDWixNQUFjLEVBQ2QsTUFBYztJQUVkLG1FQUFtRTtJQUNuRSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQzVDLFdBQVcsR0FBRyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFMUUsc0RBQXNEO0lBQ3RELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDNUIsT0FBTyxLQUFLLENBQUM7S0FDYjtJQUNELElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsRUFBRSxFQUFFO1FBQzVCLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFDRCxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7UUFDYixPQUFPLEtBQUssQ0FBQztLQUNiO0lBQ0QsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzVDLE9BQU8sS0FBSyxDQUFDO0tBQ2I7SUFFRCx3RUFBd0U7SUFDeEUsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDakQsc0JBQXNCO1FBQ3RCLE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQzNDLEdBQUcsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRTFCLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNaLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxJQUFJLEdBQUcsR0FBRyxNQUFNLEVBQUU7WUFDakIsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELElBQUksR0FBRyxHQUFHLE1BQU0sRUFBRTtZQUNqQixPQUFPLEtBQUssQ0FBQztTQUNiO0tBQ0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUM3QixJQUFZLENBQUMsY0FBYyxFQUMzQixZQUFZLEdBQUcsR0FBRyxFQUNsQixZQUFZLEdBQUcsR0FBRztJQUVsQixNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFDN0MsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNSLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFFWixJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRWhDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFFO1FBQzdCLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsV0FBVztRQUN6QixDQUFDLEVBQUUsQ0FBQztLQUNKO0lBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDdEMsSUFBSSxHQUNILFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNO1FBQzVCLENBQUMsQ0FBQyxNQUFNO1FBQ1IsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztJQUV6RCxPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FDdkIsR0FBRyxHQUFHLEVBQUUsRUFDUixhQUFhLEdBQUcsRUFBRSxFQUNsQixpQkFBaUIsR0FBRyxFQUFFO0lBRXRCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3RELGVBQWU7UUFDZixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksS0FBSyxFQUFFO1lBQ1YsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDcEI7UUFDRCxPQUFPLEtBQUssQ0FBQztLQUNiO0lBRUQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQXNCLENBQUM7SUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sU0FBUyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWU7UUFDdkMsTUFBTSxDQUFDLGFBQXFCLENBQUMsUUFBUSxDQUFhLENBQUM7SUFFckQsSUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDL0IsSUFBSSxhQUFhLEVBQUU7UUFDbEIsUUFBUSxJQUFJLEtBQUssR0FBRyxhQUFhLEdBQUcsR0FBRyxDQUFDO0tBQ3hDO0lBQ0QsSUFBSSxpQkFBaUIsRUFBRTtRQUN0QixRQUFRLElBQUksS0FBSyxHQUFHLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztLQUM1QztJQUVELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsTUFBTSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUNoQyxNQUFNLENBQUMsSUFBSTtRQUNWLDBDQUEwQztZQUMxQyxzREFBc0Q7WUFDdEQsUUFBUTtZQUNSLElBQUk7WUFDSixvQ0FBb0MsQ0FBQztJQUN0QyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxNQUFNLE1BQU0sR0FBSSxNQUFNLENBQUMsYUFBcUIsQ0FBQyxLQUFlLENBQUM7SUFFN0QsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEMsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBSUQsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUdmLENBQUMsU0FBUyxPQUFPO0lBQ3BCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixNQUFNLEdBQUcsR0FBRyxVQUFVLElBQW1CO1FBQ3hDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUN4QyxDQUFDLENBQUM7SUFFRixPQUFPO1FBQ04sR0FBRztZQUNGLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDbEIsQ0FBQztRQUNELEVBQUU7WUFDRCxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLENBQUM7UUFFRCxJQUFJLE1BQU07WUFDVCxPQUFPLEdBQUcsQ0FBQyxRQUFlLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQ0QsSUFBSSxNQUFNO1lBQ1QsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELElBQUksS0FBSztZQUNSLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLEtBQUs7WUFDUixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBQ0QsSUFBSSxVQUFVO1lBQ2IsT0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksS0FBSztZQUNSLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLEdBQUc7WUFDTixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsSUFBSSxNQUFNO1lBQ1QsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsQ0FBQztRQUNELElBQUksS0FBSztZQUNSLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLFNBQVM7WUFDWixPQUFPLEdBQUcsQ0FBQyxXQUFrQixDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUNELElBQUksS0FBSztZQUNSLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLGNBQWM7WUFDakIsT0FBTyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQ0QsSUFBSSxRQUFRO1lBQ1gsT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUNELElBQUksSUFBSTtZQUNQLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDRCxJQUFJLEdBQUc7WUFDTixPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixDQUFDO1FBQ0QsSUFBSSxLQUFLO1lBQ1IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNELElBQUksSUFBSTtZQUNQLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDRCxJQUFJLE9BQU87WUFDVixPQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxPQUFPO1lBQ1YsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksU0FBUztZQUNaLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLEtBQUs7WUFDUixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQixDQUFDO1FBQ0QsSUFBSSxJQUFJO1lBQ1AsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsQ0FBQztLQUNNLENBQUM7QUFDVixDQUFDLENBQUMsRUFBRSxDQUFDO0FBRUwsTUFBTSxVQUFVLE1BQU0sQ0FBQyxHQUFXO0lBQ2pDLE9BQU8sa0JBQWtCLENBQUMsR0FBRyxDQUFDO1NBQzVCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1NBQ3BCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO1NBQ3JCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsZ0JBQWdCLENBQy9CLE1BQWlELEVBQ2pELE1BQWU7SUFFZixJQUFJLE1BQU0sWUFBWSxlQUFlLEVBQUU7UUFDdEMsT0FBTyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDekI7SUFFRCxNQUFNLFVBQVUsR0FBRyxFQUFFLEVBQ3BCLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFFVixLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN4RCxTQUFTO1NBQ1Q7UUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNwRCxLQUFLLEdBQUksTUFBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLElBQUksSUFBSSxDQUFDO1FBQ1QsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1lBQ3hCLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtnQkFDbkIsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNuQjtpQkFBTSxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxHQUFHLGdCQUFnQixDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNwQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxHQUFHLEtBQUs7cUJBQ1YsTUFBTSxDQUFDLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLO29CQUNuRCxJQUFJLENBQUUsVUFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDN0IsVUFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQzlCO29CQUNELElBQUksQ0FBRSxVQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNuQyxVQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDdEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUNoQixnQkFBZ0IsQ0FBQzs0QkFDaEIsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJO3lCQUMvQixDQUFDLENBQ0YsQ0FBQztxQkFDRjtvQkFDRCxPQUFPLEdBQUcsQ0FBQztnQkFDWixDQUFDLEVBQUUsRUFBRSxDQUFDO3FCQUNMLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNaO2lCQUFNO2dCQUNOLGNBQWM7Z0JBQ2QsSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3pDO1lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7U0FDdEI7S0FDRDtJQUVELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QixDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FDMUIsSUFBWSxFQUNaLEdBQTZCO0lBRTdCLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUM3QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFNUIsSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFO1FBQ3BCLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakM7SUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQzFDLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0tBQ25CO1NBQU07UUFDTixNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNYLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pCO0tBQ0Q7SUFFRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM3QyxPQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO0tBQ0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxRQUFRLENBQ3ZCLEdBQVcsRUFDWCxNQUFpRDtJQUVqRCxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTyxHQUFHLENBQUM7S0FDWDtJQUVELE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbEQsSUFBSSxnQkFBZ0IsRUFBRTtRQUNyQixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3JCLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUM5QjtRQUVELEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUM7S0FDaEU7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUFFRCxNQUFNLFVBQVUscUJBQXFCLENBQ3BDLElBQXFCLEVBQ3JCLFNBQWlCO0lBRWpCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxTQUFTLElBQUksQ0FBQyxDQUFDO0lBQzFELElBQUksU0FBUyxHQUFRLFNBQVMsQ0FBQztJQUUvQixJQUFJLEtBQUssRUFBRTtRQUNWLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQztRQUM5QixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO1lBQzdELFNBQVMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO1NBQzlCO2FBQU0sSUFDTixDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQ3hCO1lBQ0QsU0FBUyxHQUFHLFdBQVcsQ0FBQztTQUN4QjthQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDeEUsU0FBUyxHQUFHLEtBQUssQ0FBQztTQUNsQjtLQUNEO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLElBQUk7SUFDbkIsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBTSxFQUFFLEVBQUU7UUFDM0UsT0FBTyxDQUNOLENBQUM7WUFDRCxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2hFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBpZCA9IChmdW5jdGlvbiBpZCgpIHtcblx0Y29uc3QgY291bnRlcnMgPSBPYmplY3QuY3JlYXRlKHt9KTtcblx0Y291bnRlcnNbJ2lkJ10gPSAwO1xuXG5cdHJldHVybiAocHJlZml4ID0gJ2lkJyk6IHN0cmluZyA9PiB7XG5cdFx0aWYgKCEocHJlZml4IGluIGNvdW50ZXJzKSkge1xuXHRcdFx0Y291bnRlcnNbcHJlZml4XSA9IDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByZWZpeCArICctJyArIGNvdW50ZXJzW3ByZWZpeF0rKztcblx0fTtcbn0pKCk7XG5cbmV4cG9ydCBjb25zdCBub29wID0gKCk6IHVuZGVmaW5lZCA9PiB2b2lkIDA7XG5cbi8vID09PT09PT09PT1UWVBFIENIRUNLRVJTPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmV4cG9ydCBjb25zdCBpc0ludGVnZXIgPVxuXHROdW1iZXIuaXNJbnRlZ2VyIHx8XG5cdGZ1bmN0aW9uIGlzSW50ZWdlcih2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIG51bWJlciB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiZcblx0XHRcdGlzRmluaXRlKHZhbHVlKSAmJlxuXHRcdFx0TWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlXG5cdFx0KTtcblx0fTtcbmV4cG9ydCBjb25zdCBpc0FycmF5ID1cblx0QXJyYXkuaXNBcnJheSB8fFxuXHRmdW5jdGlvbiBpc0FycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgYW55W10ge1xuXHRcdHJldHVybiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0fTtcbmV4cG9ydCBjb25zdCBpc1BsYWluT2JqZWN0ID0gPFQgPSBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oXG5cdGE6IHVua25vd25cbik6IGEgaXMgVCA9PiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuZXhwb3J0IGNvbnN0IGlzU3RyaW5nID0gKGE6IHVua25vd24pOiBhIGlzIHN0cmluZyA9PiB0eXBlb2YgYSA9PT0gJ3N0cmluZyc7XG5leHBvcnQgY29uc3QgaXNGdW5jdGlvbiA9IChhOiB1bmtub3duKTogYSBpcyAoLi4uYXJnczogYW55W10pID0+IGFueSA9PlxuXHR0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJztcblxuLyoqXG4gKiBDaGVja3MgaWYgdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBpc05pbCA9IChhOiB1bmtub3duKTogYSBpcyBudWxsIHwgdW5kZWZpbmVkID0+IHtcblx0cmV0dXJuIGEgPT09IHVuZGVmaW5lZCB8fCBhID09PSBudWxsO1xufTtcbmV4cG9ydCBjb25zdCBpc0VtcHR5ID0gKGE6IHVua25vd24pOiBib29sZWFuID0+IHtcblx0aWYgKGEgPT09IHVuZGVmaW5lZCB8fCBhID09PSBudWxsKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAodHlwZW9mIGEgPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIGEudHJpbSgpLmxlbmd0aCA9PT0gMDtcblx0fVxuXG5cdGlmICh0eXBlb2YgYSA9PT0gJ251bWJlcicpIHtcblx0XHRyZXR1cm4gaXNOYU4oYSk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGEgPT09ICdib29sZWFuJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmIChpc0FycmF5KGEpKSB7XG5cdFx0cmV0dXJuICFhLmxlbmd0aDtcblx0fVxuXG5cdGlmIChpc1BsYWluT2JqZWN0KGEpKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYSkge1xuXHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhLCBrZXkpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGNvbnN0IHRhZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKTtcblxuXHRpZiAodGFnID09PSAnW29iamVjdCBTZXRdJyB8fCB0YWcgPT09ICdbb2JqZWN0IE1hcF0nKSB7XG5cdFx0cmV0dXJuICEoYSBhcyBTZXQ8YW55PiB8IE1hcDxhbnksIGFueT4pLnNpemU7XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59O1xuZXhwb3J0IGNvbnN0IGlzTm90RW1wdHkgPSAoYTogdW5rbm93bik6IGJvb2xlYW4gPT4gIWlzRW1wdHkoYSk7XG5leHBvcnQgY29uc3QgdG9BcnJheSA9IDxYPihhOiBJdGVyYWJsZTxYPik6IFhbXSA9PiBbLi4uYV07XG5leHBvcnQgY29uc3QgZXNjYXBlUmVnRXhwID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG5cdHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcXFwvXSkvZywgJ1xcXFwkMScpO1xuXG4vLyA9PT09PT09PT09SEVMUEVSUz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxiYWNrKGZuOiB1bmtub3duLCBhcmdzPzogYW55W10sIGN0eD86IHVua25vd24pOiBhbnkge1xuXHRpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIGZuLmFwcGx5KGN0eCwgYXJncyk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZTxYPihhcnI6IFhbXSk6IFhbXSB7XG5cdHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlYWNoPFQ+KFxuXHRvYmo6IHsgW2tleTogc3RyaW5nXTogVCB9IHwgVFtdLFxuXHRmbjogKHZhbHVlOiBULCBrZXk6IGFueSkgPT4gdm9pZFxuKTogdm9pZCB7XG5cdE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaCgoa2V5OiBzdHJpbmcpID0+IHtcblx0XHRjb25zdCB2YWx1ZTogVCA9IChvYmogYXMgYW55KVtrZXldO1xuXHRcdGZuKHZhbHVlLCBrZXkpO1xuXHR9KTtcbn1cblxuaW50ZXJmYWNlIExpc3Q8VD4ge1xuXHRbaW5kZXg6IG51bWJlcl06IFQ7XG5cdGxlbmd0aDogbnVtYmVyO1xufVxuXG50eXBlIExpc3RGb3JFYWNoVHlwZSA9IDxVIGV4dGVuZHMgTGlzdDx1bmtub3duPj4oXG5cdGNvbGxlY3Rpb246IFUsXG5cdGl0ZXJhdGVlOiAoXG5cdFx0dmFsdWU6IFVbRXh0cmFjdDxrZXlvZiBVLCBudW1iZXI+XSxcblx0XHRrZXk6IEV4dHJhY3Q8a2V5b2YgVSwgbnVtYmVyPixcblx0XHRjb2xsZWN0aW9uOiBVXG5cdCkgPT4gdm9pZFxuKSA9PiB2b2lkO1xudHlwZSBEaWN0Rm9yRWFjaFR5cGUgPSA8VSBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+Pihcblx0Y29sbGVjdGlvbjogVSxcblx0aXRlcmF0ZWU6IChcblx0XHR2YWx1ZTogVVtFeHRyYWN0PGtleW9mIFUsIHN0cmluZz5dLFxuXHRcdGtleTogRXh0cmFjdDxrZXlvZiBVLCBzdHJpbmc+LFxuXHRcdGNvbGxlY3Rpb246IFVcblx0KSA9PiB2b2lkXG4pID0+IHZvaWQ7XG5cbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gZnVuY3Rpb24gX2ZvckVhY2g8XG5cdFUgZXh0ZW5kcyBMaXN0PHVua25vd24+IHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbj4oXG5cdGNvbGxlY3Rpb246IFUsXG5cdGl0ZXJhdGVlOiAodmFsdWU6IHVua25vd24sIGtleTogc3RyaW5nIHwgbnVtYmVyLCBjb2xsZWN0aW9uOiBVKSA9PiB2b2lkXG4pIHtcblx0aWYgKGlzUGxhaW5PYmplY3QoY29sbGVjdGlvbikpIHtcblx0XHRmb3IgKGNvbnN0IGsgaW4gY29sbGVjdGlvbikge1xuXHRcdFx0T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbGxlY3Rpb24sIGspICYmXG5cdFx0XHRcdGl0ZXJhdGVlKGNvbGxlY3Rpb25ba10sIGssIGNvbGxlY3Rpb24pO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IgKGNvbnN0IGsgaW4gY29sbGVjdGlvbikge1xuXHRcdFx0aXRlcmF0ZWUoY29sbGVjdGlvbltrXSwgaywgY29sbGVjdGlvbik7XG5cdFx0fVxuXHR9XG59IGFzIExpc3RGb3JFYWNoVHlwZSAmIERpY3RGb3JFYWNoVHlwZTtcblxuZXhwb3J0IGNvbnN0IGFzc2lnbiA9XG5cdE9iamVjdC5hc3NpZ24gfHxcblx0ZnVuY3Rpb24gX2Fzc2lnbiguLi5hcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPltdKSB7XG5cdFx0Y29uc3QgdG8gPSBhcmdzWzBdO1xuXHRcdGxldCBmcm9tLCBzeW1ib2xzO1xuXG5cdFx0Zm9yIChsZXQgcyA9IDE7IHMgPCBhcmdzLmxlbmd0aDsgcysrKSB7XG5cdFx0XHRmcm9tID0gT2JqZWN0KGFyZ3Nbc10pO1xuXG5cdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBmcm9tKSB7XG5cdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHRcdCh0byBhcyBhbnkpW2tleV0gPSBmcm9tW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCdnZXRPd25Qcm9wZXJ0eVN5bWJvbHMnIGluIE9iamVjdCkge1xuXHRcdFx0XHRzeW1ib2xzID0gKE9iamVjdCBhcyBhbnkpLmdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdFx0KHRvIGFzIGFueSlbc3ltYm9sc1tpXV0gPSBmcm9tW3N5bWJvbHNbaV1dO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0bztcblx0fTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lPFQ+KGE6IFQpOiBUIHtcblx0cmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nUGxhY2Vob2xkZXJSZXBsYWNlKFxuXHRzdHI6IHN0cmluZyxcblx0ZGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbik6IHN0cmluZyB7XG5cdGlmIChpc1N0cmluZyhzdHIpICYmIHN0ci5sZW5ndGggJiYgaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKS5zb3J0KCkucmV2ZXJzZSgpO1xuXHRcdGxldCByZWc7XG5cblx0XHRpZiAoa2V5cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IG0gPSBrZXlzLmpvaW4oJ3wnKTtcblx0XHRcdHJlZyA9IG5ldyBSZWdFeHAoJzooJyArIG0gKyAnKScsICdnJyk7XG5cblx0XHRcdHJldHVybiBzdHIucmVwbGFjZShyZWcsIGZ1bmN0aW9uIHN0cmluZ0NodW5rUmVwbGFjZXIoLi4uYXJncykge1xuXHRcdFx0XHRjb25zdCByZXBsYWNlbWVudCA9IChkYXRhIGFzIGFueSlbYXJnc1sxXV07XG5cblx0XHRcdFx0aWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gYXJnc1swXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXBsYWNlbWVudDtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0VG9MaW5lU3RyaW5nKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHJlZyA9IC9bXCInXFxcXFxcblxcclxcdFxcdTIwMjhcXHUyMDI5XS9nLFxuXHRcdHNpbmdsZVF1b3RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSgzOSksXG5cdFx0dG9Fc2NhcGVzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHtcblx0XHRcdCdcIic6ICdcIicsXG5cdFx0XHRbc2luZ2xlUXVvdGVdOiBzaW5nbGVRdW90ZSxcblx0XHRcdCdcXFxcJzogJ1xcXFwnLFxuXHRcdFx0J1xcbic6ICduJyxcblx0XHRcdCdcXHInOiAncicsXG5cdFx0XHQnXFx0JzogJ3QnLFxuXHRcdFx0J1xcdTIwMjgnOiAnMjAyOCcsXG5cdFx0XHQnXFx1MjAyOSc6ICcyMDI5Jyxcblx0XHR9O1xuXG5cdHJldHVybiB0ZXh0LnJlcGxhY2UocmVnLCAobWF0Y2gpID0+ICdcXFxcJyArICh0b0VzY2FwZXMgYXMgYW55KVttYXRjaF0pO1xufVxuXG4vLyA9PT09PT09PT09TUFUSD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCBfc2V0RGlnaXRzU2VwID0gKHg6IG51bWJlciwgc2VwOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRjb25zdCBzID0gU3RyaW5nKHgpLFxuXHRcdGFucyA9IFtdLFxuXHRcdGogPSBzLmluZGV4T2YoJy4nKSxcblx0XHRzdGFydCA9IGogIT09IC0xID8gaiA6IHMubGVuZ3RoLFxuXHRcdGVuZCA9IGogIT09IC0xID8gcy5zbGljZShzdGFydCArIDEpIDogW107XG5cdGxldCBjb3VudCA9IDAsXG5cdFx0aSA9IHN0YXJ0O1xuXG5cdGZvciAoOyBpID49IDA7IGktLSkge1xuXHRcdGlmIChjb3VudCA9PT0gMykge1xuXHRcdFx0Y291bnQgPSAwO1xuXHRcdFx0YW5zW2ldID0gaSAhPT0gMCA/IHNlcCArIHNbaV0gOiBzW2ldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhbnNbaV0gPSBzW2ldO1xuXHRcdH1cblx0XHRjb3VudCsrO1xuXHR9XG5cblx0cmV0dXJuIGFucy5jb25jYXQoZW5kKS5qb2luKCcnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBudW1iZXJGb3JtYXQoXG5cdHg6IG51bWJlciB8IHN0cmluZyxcblx0ZGVjID0gMixcblx0ZGVjaW1hbFNlcCA9ICcuJyxcblx0ZGlnaXRzU2VwID0gJyAnXG4pOiBzdHJpbmcge1xuXHRpZiAoIXgpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRsZXQgYW5zID0gcGFyc2VGbG9hdChTdHJpbmcoeCkpO1xuXG5cdGlmIChkZWMgPj0gMCkge1xuXHRcdGNvbnN0IGRlY2ltYWxQb3cgPSBNYXRoLnBvdygxMCwgZGVjKTtcblx0XHRhbnMgPSBNYXRoLmZsb29yKGFucyAqIGRlY2ltYWxQb3cpIC8gZGVjaW1hbFBvdztcblx0fVxuXG5cdGNvbnN0IG4gPSBfc2V0RGlnaXRzU2VwKGFucywgZGlnaXRzU2VwKTtcblx0Y29uc3QgYSA9IG4uc3BsaXQoJycpO1xuXG5cdGNvbnN0IGRlY2ltYWxQb3MgPSBhLmxhc3RJbmRleE9mKCcuJyk7XG5cdGlmIChkZWNpbWFsUG9zID49IDAgJiYgZGVjaW1hbFNlcCAhPT0gJy4nKSB7XG5cdFx0YVtkZWNpbWFsUG9zXSA9IGRlY2ltYWxTZXA7XG5cdH1cblxuXHRyZXR1cm4gYS5qb2luKCcnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGd0KHg6IG51bWJlciwgeTogbnVtYmVyLCBlcSA9IGZhbHNlKTogYm9vbGVhbiB7XG5cdHJldHVybiBlcSA/IHggPj0geSA6IHggPiB5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbHQoeDogbnVtYmVyLCB5OiBudW1iZXIsIGVxID0gZmFsc2UpOiBib29sZWFuIHtcblx0cmV0dXJuIGVxID8geCA8PSB5IDogeCA8IHk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiZXR3ZWVuKHg6IG51bWJlciwgYTogbnVtYmVyLCBiOiBudW1iZXIsIGVxID0gZmFsc2UpOiBib29sZWFuIHtcblx0cmV0dXJuIGVxID8geCA+PSBhICYmIHggPD0gYiA6IHggPiBhICYmIHggPCBiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSYW5nZShhOiB1bmtub3duLCBiOiB1bmtub3duKTogYm9vbGVhbiB7XG5cdHJldHVybiB0eXBlb2YgYSA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGIgPT09ICdudW1iZXInICYmIGEgPCBiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbkRPTShlbGVtZW50OiBOb2RlLCBpbkJvZHkgPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRsZXQgXzogTm9kZSB8IG51bGwgPSBlbGVtZW50LFxuXHRcdGxhc3Q6IE5vZGUgfCBudWxsID0gbnVsbDtcblxuXHR3aGlsZSAoXykge1xuXHRcdGxhc3QgPSBfO1xuXHRcdGlmIChpbkJvZHkgJiYgbGFzdCA9PT0gZG9jdW1lbnQuYm9keSkge1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdF8gPSBfLnBhcmVudE5vZGU7XG5cdH1cblxuXHRyZXR1cm4gaW5Cb2R5ID8gbGFzdCA9PT0gZG9jdW1lbnQuYm9keSA6IGxhc3QgPT09IGRvY3VtZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2h1ZmZsZTxYPihhOiBYW10pOiBYW10ge1xuXHRsZXQgaiwgeCwgaTtcblxuXHRmb3IgKGkgPSBhLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcblx0XHRqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG5cdFx0eCA9IGFbaV07XG5cdFx0YVtpXSA9IGFbal07XG5cdFx0YVtqXSA9IHg7XG5cdH1cblxuXHRyZXR1cm4gYTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUXVlcnlTdHJpbmcoc3RyOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcblx0aWYgKHN0ci5jaGFyQXQoMCkgPT09ICc/Jykgc3RyID0gc3RyLnN1YnN0cmluZygxKTtcblx0aWYgKCFzdHIubGVuZ3RoKSByZXR1cm4ge307XG5cblx0Y29uc3QgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKSxcblx0XHRwYXJhbXMgPSB7fTtcblx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0Y29uc3QgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9JyksXG5cdFx0XHRrZXkgPSBkZWNvZGVVUklDb21wb25lbnQocGFpclswXSksXG5cdFx0XHR2YWx1ZSA9IHBhaXIubGVuZ3RoID09PSAyID8gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pIDogbnVsbDtcblx0XHRpZiAoKHBhcmFtcyBhcyBhbnkpW2tleV0gIT0gbnVsbCkge1xuXHRcdFx0aWYgKCFpc0FycmF5KChwYXJhbXMgYXMgYW55KVtrZXldKSkge1xuXHRcdFx0XHQocGFyYW1zIGFzIGFueSlba2V5XSA9IFsocGFyYW1zIGFzIGFueSlba2V5XV07XG5cdFx0XHR9XG5cdFx0XHQocGFyYW1zIGFzIGFueSlba2V5XS5wdXNoKHZhbHVlKTtcblx0XHR9IGVsc2UgKHBhcmFtcyBhcyBhbnkpW2tleV0gPSB2YWx1ZTtcblx0fVxuXHRyZXR1cm4gcGFyYW1zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudERlZmF1bHQoZTogRXZlbnQpOiB2b2lkIHtcblx0aWYgKCFlKSB7XG5cdFx0aWYgKHdpbmRvdy5ldmVudCkgZSA9IHdpbmRvdy5ldmVudDtcblx0XHRlbHNlIHJldHVybjtcblx0fVxuXG5cdGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG5cdGlmIChlLmNhbmNlbEJ1YmJsZSAhPSBudWxsKSBlLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG5cdGlmIChlLnN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0aWYgKHdpbmRvdy5ldmVudCkgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXHQvLyBpZiAoZS5jYW5jZWwgIT0gbnVsbCkgZS5jYW5jZWwgPSB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEFnZShcblx0ZGF5OiBudW1iZXIsXG5cdG1vbnRoOiBudW1iZXIsXG5cdHllYXI6IG51bWJlcixcblx0bWluQWdlOiBudW1iZXIsXG5cdG1heEFnZTogbnVtYmVyXG4pOiBib29sZWFuIHtcblx0Ly8gZGVwZW5kaW5nIG9uIHRoZSB5ZWFyLCBjYWxjdWxhdGUgdGhlIG51bWJlciBvZiBkYXlzIGluIHRoZSBtb250aFxuXHRjb25zdCBmZWJydWFyeURheXMgPSB5ZWFyICUgNCA9PT0gMCA/IDI5IDogMjgsXG5cdFx0ZGF5c0luTW9udGggPSBbMzEsIGZlYnJ1YXJ5RGF5cywgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdO1xuXG5cdC8vIGZpcnN0LCBjaGVjayB0aGUgaW5jb21pbmcgbW9udGggYW5kIHllYXIgYXJlIHZhbGlkLlxuXHRpZiAoIW1vbnRoIHx8ICFkYXkgfHwgIXllYXIpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKDEgPiBtb250aCB8fCBtb250aCA+IDEyKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmICh5ZWFyIDwgMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoMSA+IGRheSB8fCBkYXkgPiBkYXlzSW5Nb250aFttb250aCAtIDFdKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gaWYgcmVxdWlyZWQsIHZlcmlmeSB0aGUgY3VycmVudCBkYXRlIGlzIExBVEVSIHRoYW4gdGhlIGluY29taW5nIGRhdGUuXG5cdGlmIChtaW5BZ2UgIT09IHVuZGVmaW5lZCB8fCBtYXhBZ2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIHdlIGdldCBjdXJyZW50IHllYXJcblx0XHRjb25zdCBjdXJyZW50WWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKSxcblx0XHRcdGFnZSA9IGN1cnJlbnRZZWFyIC0geWVhcjtcblxuXHRcdGlmIChhZ2UgPCAwKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChhZ2UgPCBtaW5BZ2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGFnZSA+IG1heEFnZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsZVNpemVGb3JtYXQoXG5cdHNpemU6IG51bWJlciAvKiBpbiBieXRlcyAqLyxcblx0ZGVjaW1hbFBvaW50ID0gJy4nLFxuXHR0aG91c2FuZHNTZXAgPSAnICdcbik6IHN0cmluZyB7XG5cdGNvbnN0IHVuaXRzID0gWydieXRlJywgJ0tiJywgJ01iJywgJ0diJywgJ1RiJ10sXG5cdFx0aU1heCA9IHVuaXRzLmxlbmd0aDtcblx0bGV0IGkgPSAwLFxuXHRcdHJlc3VsdCA9IDA7XG5cblx0c2l6ZSA9IHBhcnNlRmxvYXQoU3RyaW5nKHNpemUpKTtcblxuXHR3aGlsZSAoc2l6ZSA+PSAxICYmIGkgPCBpTWF4KSB7XG5cdFx0cmVzdWx0ID0gc2l6ZTtcblx0XHRzaXplIC89IDEwMDA7IC8vIG5vdCAxMDI0XG5cdFx0aSsrO1xuXHR9XG5cblx0Y29uc3QgcGFydHMgPSBTdHJpbmcocmVzdWx0KS5zcGxpdCgnLicpLFxuXHRcdGhlYWQgPVxuXHRcdFx0cGFyc2VJbnQocGFydHNbMF0pID09PSByZXN1bHRcblx0XHRcdFx0PyByZXN1bHRcblx0XHRcdFx0OiBudW1iZXJGb3JtYXQocmVzdWx0LCAyLCBkZWNpbWFsUG9pbnQsIHRob3VzYW5kc1NlcCk7XG5cblx0cmV0dXJuIGhlYWQgKyAnICcgKyB1bml0c1tpID09PSAwID8gMCA6IGkgLSAxXTtcbn1cblxuLyoqXG4gKiBPcGVucyB0aGUgcHJvdmlkZWQgdXJsIGJ5IGluamVjdGluZyBhIGhpZGRlbiBpZnJhbWUgdGhhdCBjYWxsc1xuICogd2luZG93Lm9wZW4oKSwgdGhlbiByZW1vdmVzIHRoZSBpZnJhbWUgZnJvbSB0aGUgRE9NLlxuICpcbiAqIFByZXZlbnQgcmV2ZXJzZSB0YWJuYWJiaW5nIHBoaXNoaW5nIGF0dGFja3MgY2F1c2VkIGJ5IF9ibGFua1xuICpcbiAqIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5naXRodWIuaW8vcmVsLW5vb3BlbmVyL1xuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5pZWxzdGp1bGVzL2JsYW5rc2hpZWxkL2Jsb2IvNmUyMDhiZjI1YTQ0YmY1MGQxYTVlODVhZTk2ZmVlMGMwMTVkMDViYy9ibGFua3NoaWVsZC5qcyNMMTY2XG4gKlxuICogQHBhcmFtIHVybFxuICogQHBhcmFtIHN0cldpbmRvd05hbWVcbiAqIEBwYXJhbSBzdHJXaW5kb3dGZWF0dXJlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gc2FmZU9wZW4oXG5cdHVybCA9ICcnLFxuXHRzdHJXaW5kb3dOYW1lID0gJycsXG5cdHN0cldpbmRvd0ZlYXR1cmVzID0gJydcbik6IFdpbmRvdyB8IG51bGwge1xuXHRpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRScpICE9PSAtMSkge1xuXHRcdC8vIElFIGJlZm9yZSAxMVxuXHRcdGNvbnN0IGNoaWxkID0gb3Blbi5hcHBseSh3aW5kb3csIFt1cmwsIHN0cldpbmRvd05hbWUsIHN0cldpbmRvd0ZlYXR1cmVzXSk7XG5cdFx0aWYgKGNoaWxkKSB7XG5cdFx0XHRjaGlsZC5vcGVuZXIgPSBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gY2hpbGQ7XG5cdH1cblxuXHRjb25zdCBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKSBhcyBIVE1MSUZyYW1lRWxlbWVudDtcblx0aWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcblx0Y29uc3QgaWZyYW1lRG9jID0gKGlmcmFtZS5jb250ZW50RG9jdW1lbnQgfHxcblx0XHQoaWZyYW1lLmNvbnRlbnRXaW5kb3cgYXMgYW55KS5kb2N1bWVudCkgYXMgRG9jdW1lbnQ7XG5cblx0bGV0IG9wZW5BcmdzID0gJ1wiJyArIHVybCArICdcIic7XG5cdGlmIChzdHJXaW5kb3dOYW1lKSB7XG5cdFx0b3BlbkFyZ3MgKz0gJywgXCInICsgc3RyV2luZG93TmFtZSArICdcIic7XG5cdH1cblx0aWYgKHN0cldpbmRvd0ZlYXR1cmVzKSB7XG5cdFx0b3BlbkFyZ3MgKz0gJywgXCInICsgc3RyV2luZG93RmVhdHVyZXMgKyAnXCInO1xuXHR9XG5cblx0Y29uc3Qgc2NyaXB0ID0gaWZyYW1lRG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXHRzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuXHRzY3JpcHQudGV4dCA9XG5cdFx0J3dpbmRvdy5wYXJlbnQgPSBudWxsOyB3aW5kb3cudG9wID0gbnVsbDsnICtcblx0XHQnd2luZG93LmZyYW1lRWxlbWVudCA9IG51bGw7IHZhciBjaGlsZCA9IHdpbmRvdy5vcGVuKCcgK1xuXHRcdG9wZW5BcmdzICtcblx0XHQnKTsnICtcblx0XHQnaWYgKGNoaWxkKSB7IGNoaWxkLm9wZW5lciA9IG51bGwgfSc7XG5cdGlmcmFtZURvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdGNvbnN0IG5ld1dpbiA9IChpZnJhbWUuY29udGVudFdpbmRvdyBhcyBhbnkpLmNoaWxkIGFzIFdpbmRvdztcblxuXHRkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGlmcmFtZSk7XG5cdHJldHVybiBuZXdXaW47XG59XG5cbnR5cGUgQ29uc29sZSA9IHR5cGVvZiBjb25zb2xlO1xuXG5leHBvcnQgY29uc3QgbG9nZ2VyOiBDb25zb2xlICYge1xuXHRvbjogKCkgPT4gdm9pZDtcblx0b2ZmOiAoKSA9PiB2b2lkO1xufSA9IChmdW5jdGlvbiBfbG9nZ2VyKCkge1xuXHRsZXQgX3Nob3dMb2cgPSB0cnVlO1xuXHRjb25zdCBfZm4gPSBmdW5jdGlvbiAodHlwZToga2V5b2YgQ29uc29sZSkge1xuXHRcdHJldHVybiBfc2hvd0xvZyA/IGNvbnNvbGVbdHlwZV0gOiBub29wO1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0b2ZmKCkge1xuXHRcdFx0X3Nob3dMb2cgPSBmYWxzZTtcblx0XHR9LFxuXHRcdG9uKCkge1xuXHRcdFx0X3Nob3dMb2cgPSB0cnVlO1xuXHRcdH0sXG5cblx0XHRnZXQgbWVtb3J5KCkge1xuXHRcdFx0cmV0dXJuIF9mbignbWVtb3J5JyBhcyBhbnkpO1xuXHRcdH0sXG5cdFx0Z2V0IGFzc2VydCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2Fzc2VydCcpO1xuXHRcdH0sXG5cdFx0Z2V0IGNsZWFyKCkge1xuXHRcdFx0cmV0dXJuIF9mbignY2xlYXInKTtcblx0XHR9LFxuXHRcdGdldCBjb3VudCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2NvdW50Jyk7XG5cdFx0fSxcblx0XHRnZXQgY291bnRSZXNldCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2NvdW50UmVzZXQnKTtcblx0XHR9LFxuXHRcdGdldCBkZWJ1ZygpIHtcblx0XHRcdHJldHVybiBfZm4oJ2RlYnVnJyk7XG5cdFx0fSxcblx0XHRnZXQgZGlyKCkge1xuXHRcdFx0cmV0dXJuIF9mbignZGlyJyk7XG5cdFx0fSxcblx0XHRnZXQgZGlyeG1sKCkge1xuXHRcdFx0cmV0dXJuIF9mbignZGlyeG1sJyk7XG5cdFx0fSxcblx0XHRnZXQgZXJyb3IoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdlcnJvcicpO1xuXHRcdH0sXG5cdFx0Z2V0IGV4Y2VwdGlvbigpIHtcblx0XHRcdHJldHVybiBfZm4oJ2V4Y2VwdGlvbicgYXMgYW55KTtcblx0XHR9LFxuXHRcdGdldCBncm91cCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2dyb3VwJyk7XG5cdFx0fSxcblx0XHRnZXQgZ3JvdXBDb2xsYXBzZWQoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdncm91cENvbGxhcHNlZCcpO1xuXHRcdH0sXG5cdFx0Z2V0IGdyb3VwRW5kKCkge1xuXHRcdFx0cmV0dXJuIF9mbignZ3JvdXBFbmQnKTtcblx0XHR9LFxuXHRcdGdldCBpbmZvKCkge1xuXHRcdFx0cmV0dXJuIF9mbignaW5mbycpO1xuXHRcdH0sXG5cdFx0Z2V0IGxvZygpIHtcblx0XHRcdHJldHVybiBfZm4oJ2xvZycpO1xuXHRcdH0sXG5cdFx0Z2V0IHRhYmxlKCkge1xuXHRcdFx0cmV0dXJuIF9mbigndGFibGUnKTtcblx0XHR9LFxuXHRcdGdldCB0aW1lKCkge1xuXHRcdFx0cmV0dXJuIF9mbigndGltZScpO1xuXHRcdH0sXG5cdFx0Z2V0IHRpbWVFbmQoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCd0aW1lRW5kJyk7XG5cdFx0fSxcblx0XHRnZXQgdGltZUxvZygpIHtcblx0XHRcdHJldHVybiBfZm4oJ3RpbWVMb2cnKTtcblx0XHR9LFxuXHRcdGdldCB0aW1lU3RhbXAoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCd0aW1lU3RhbXAnKTtcblx0XHR9LFxuXHRcdGdldCB0cmFjZSgpIHtcblx0XHRcdHJldHVybiBfZm4oJ3RyYWNlJyk7XG5cdFx0fSxcblx0XHRnZXQgd2FybigpIHtcblx0XHRcdHJldHVybiBfZm4oJ3dhcm4nKTtcblx0XHR9LFxuXHR9IGFzIGFueTtcbn0pKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGUodmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbClcblx0XHQucmVwbGFjZSgvJTI0L2csICckJylcblx0XHQucmVwbGFjZSgvJTIwL2csICcrJylcblx0XHQucmVwbGFjZSgvJTNBL2dpLCAnOicpXG5cdFx0LnJlcGxhY2UoLyUyQy9naSwgJywnKVxuXHRcdC5yZXBsYWNlKC8lNUIvZ2ksICdbJylcblx0XHQucmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIHF1ZXJ5IHN0cmluZyBmcm9tIG9iamVjdC4gUmVjdXJzaXZlbHkhXG4gKiBAcGFyYW0gcGFyYW1zXG4gKiBAcGFyYW0gcHJlZml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFF1ZXJ5U3RyaW5nKFxuXHRwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgVVJMU2VhcmNoUGFyYW1zLFxuXHRwcmVmaXg/OiBzdHJpbmdcbik6IHN0cmluZyB7XG5cdGlmIChwYXJhbXMgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcblx0XHRyZXR1cm4gcGFyYW1zLnRvU3RyaW5nKCk7XG5cdH1cblxuXHRjb25zdCBkdXBsaWNhdGVzID0ge30sXG5cdFx0c3RyID0gW107XG5cblx0Zm9yIChjb25zdCBwcm9wIGluIHBhcmFtcykge1xuXHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtcywgcHJvcCkpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGtleSA9IHByZWZpeCA/IHByZWZpeCArICdbJyArIHByb3AgKyAnXScgOiBwcm9wLFxuXHRcdFx0dmFsdWUgPSAocGFyYW1zIGFzIGFueSlbcHJvcF07XG5cdFx0bGV0IHBhaXI7XG5cdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRwYWlyID0gZW5jb2RlKGtleSk7XG5cdFx0XHR9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG5cdFx0XHRcdHBhaXIgPSBidWlsZFF1ZXJ5U3RyaW5nKHZhbHVlLCBrZXkpO1xuXHRcdFx0fSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0XHRwYWlyID0gdmFsdWVcblx0XHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIGFycmF5VmFsdWVzUmVkdWNlcihhY2MsIGl0ZW0sIGluZGV4KSB7XG5cdFx0XHRcdFx0XHRpZiAoIShkdXBsaWNhdGVzIGFzIGFueSlba2V5XSkge1xuXHRcdFx0XHRcdFx0XHQoZHVwbGljYXRlcyBhcyBhbnkpW2tleV0gPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICghKGR1cGxpY2F0ZXMgYXMgYW55KVtrZXldW2l0ZW1dKSB7XG5cdFx0XHRcdFx0XHRcdChkdXBsaWNhdGVzIGFzIGFueSlba2V5XVtpdGVtXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhY2MuY29uY2F0KFxuXHRcdFx0XHRcdFx0XHRcdGJ1aWxkUXVlcnlTdHJpbmcoe1xuXHRcdFx0XHRcdFx0XHRcdFx0W2tleSArICdbJyArIGluZGV4ICsgJ10nXTogaXRlbSxcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdFx0XHR9LCBbXSlcblx0XHRcdFx0XHQuam9pbignJicpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gc2NhbGFyIHR5cGVcblx0XHRcdFx0cGFpciA9IGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0c3RyLnB1c2gocGFpciB8fCBrZXkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdHIuam9pbignJicpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoUGFyYW0oXG5cdG5hbWU6IHN0cmluZyxcblx0dXJsPzogc3RyaW5nIHwgVVJMIHwgTG9jYXRpb25cbik6IHN0cmluZyB8IG51bGwge1xuXHRsZXQgcXVlcnkgPSAnJztcblx0dXJsID0gdXJsIHx8IHdpbmRvdy5sb2NhdGlvbjtcblx0Y29uc3QgbG9jX3N0ciA9IHVybC50b1N0cmluZygpO1xuXHRjb25zdCBfdSA9IG5ldyBVUkwobG9jX3N0cik7XG5cblx0aWYgKF91LnNlYXJjaFBhcmFtcykge1xuXHRcdHJldHVybiBfdS5zZWFyY2hQYXJhbXMuZ2V0KG5hbWUpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiB1cmwgIT09ICdzdHJpbmcnICYmIHVybC5zZWFyY2gpIHtcblx0XHRxdWVyeSA9IHVybC5zZWFyY2g7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgayA9IGxvY19zdHIuaW5kZXhPZignPycpO1xuXG5cdFx0aWYgKGsgPj0gMCkge1xuXHRcdFx0cXVlcnkgPSBsb2Nfc3RyLnNsaWNlKGspO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHBhaXJzID0gcXVlcnkucmVwbGFjZSgvXlxcPy8sICcnKS5zcGxpdCgnJicpO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBwYXJ0cyA9IHBhaXJzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0Y29uc3Qga2V5ID0gcGFydHNbMF0gfHwgJyc7XG5cdFx0aWYgKGtleS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIHdpdGggYSBnaXZlbiBwYXJhbXNcbiAqXG4gKiBAcGFyYW0gdXJsXG4gKiBAcGFyYW0gcGFyYW1zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFVSTChcblx0dXJsOiBzdHJpbmcsXG5cdHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBVUkxTZWFyY2hQYXJhbXNcbik6IHN0cmluZyB7XG5cdGlmICghcGFyYW1zKSB7XG5cdFx0cmV0dXJuIHVybDtcblx0fVxuXG5cdGNvbnN0IHNlcmlhbGl6ZWRQYXJhbXMgPSBidWlsZFF1ZXJ5U3RyaW5nKHBhcmFtcyk7XG5cblx0aWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcblx0XHRjb25zdCBoYXNoSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuXHRcdGlmIChoYXNoSW5kZXggIT09IC0xKSB7XG5cdFx0XHR1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaEluZGV4KTtcblx0XHR9XG5cblx0XHR1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHNlcmlhbGl6ZWRQYXJhbXM7XG5cdH1cblxuXHRyZXR1cm4gdXJsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEZpZWxkTGFiZWxUZXh0KFxuXHRmb3JtOiBIVE1MRm9ybUVsZW1lbnQsXG5cdGZpZWxkTmFtZTogc3RyaW5nXG4pOiBzdHJpbmcge1xuXHRjb25zdCBmaWVsZCA9IGZvcm0ucXVlcnlTZWxlY3RvcihgW25hbWU9JyR7ZmllbGROYW1lfSddYCk7XG5cdGxldCBsYWJlbFRleHQ6IGFueSA9IGZpZWxkTmFtZTtcblxuXHRpZiAoZmllbGQpIHtcblx0XHRjb25zdCBpZCA9IGZpZWxkLmdldEF0dHJpYnV0ZSgnaWQnKTtcblx0XHRsZXQgbGFiZWwsIHBsYWNlaG9sZGVyLCB0aXRsZTtcblx0XHRpZiAoaWQgJiYgKGxhYmVsID0gZm9ybS5xdWVyeVNlbGVjdG9yKGBsYWJlbFtmb3I9JyR7aWR9J11gKSkpIHtcblx0XHRcdGxhYmVsVGV4dCA9IGxhYmVsLnRleHRDb250ZW50O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHQocGxhY2Vob2xkZXIgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJykpICYmXG5cdFx0XHRwbGFjZWhvbGRlci50cmltKCkubGVuZ3RoXG5cdFx0KSB7XG5cdFx0XHRsYWJlbFRleHQgPSBwbGFjZWhvbGRlcjtcblx0XHR9IGVsc2UgaWYgKCh0aXRsZSA9IGZpZWxkLmdldEF0dHJpYnV0ZSgndGl0bGUnKSkgJiYgdGl0bGUudHJpbSgpLmxlbmd0aCkge1xuXHRcdFx0bGFiZWxUZXh0ID0gdGl0bGU7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGxhYmVsVGV4dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB1dWlkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXVpZCgpOiBzdHJpbmcge1xuXHRyZXR1cm4gKCcnICsgMWU3ICsgLTFlMyArIC00ZTMgKyAtOGUzICsgLTFlMTEpLnJlcGxhY2UoL1swMThdL2csIChjOiBhbnkpID0+IHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0YyBeXG5cdFx0XHQoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxKSlbMF0gJiAoMTUgPj4gKGMgLyA0KSkpXG5cdFx0KS50b1N0cmluZygxNik7XG5cdH0pO1xufVxuXG4iXX0=