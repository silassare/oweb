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
 *
 * @param a
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
export * from './scriptLoader';
export { default as PathResolver } from './PathResolver';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFO0lBQzdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVuQixPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksRUFBVSxFQUFFO1FBQ2hDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsRUFBRTtZQUMxQixRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzFDLENBQUMsQ0FBQztBQUNILENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsR0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFNUMsOERBQThEO0FBRTlELE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FDckIsTUFBTSxDQUFDLFNBQVM7SUFDaEIsU0FBUyxTQUFTLENBQUMsS0FBYztRQUNoQyxPQUFPLENBQ04sT0FBTyxLQUFLLEtBQUssUUFBUTtZQUN6QixRQUFRLENBQUMsS0FBSyxDQUFDO1lBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQzNCLENBQUM7SUFDSCxDQUFDLENBQUM7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQ25CLEtBQUssQ0FBQyxPQUFPO0lBQ2IsU0FBUyxPQUFPLENBQUMsS0FBYztRQUM5QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssZ0JBQWdCLENBQUM7SUFDbEQs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UyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7U0FDOUI7YUFBTSxJQUNOLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakQsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFDeEI7WUFDRCxTQUFTLEdBQUcsV0FBVyxDQUFDO1NBQ3hCO2FBQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTtZQUN4RSxTQUFTLEdBQUcsS0FBSyxDQUFDO1NBQ2xCO0tBQ0Q7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNsQixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQVUsSUFBSTtJQUNuQixPQUFPLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFNLEVBQUUsRUFBRTtRQUMzRSxPQUFPLENBQ04sQ0FBQztZQUNELENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDaEUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsY0FBYyxnQkFBZ0IsQ0FBQztBQUUvQixPQUFPLEVBQUUsT0FBTyxJQUFJLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGlkID0gKGZ1bmN0aW9uIGlkKCkge1xuXHRjb25zdCBjb3VudGVycyA9IE9iamVjdC5jcmVhdGUoe30pO1xuXHRjb3VudGVyc1snaWQnXSA9IDA7XG5cblx0cmV0dXJuIChwcmVmaXggPSAnaWQnKTogc3RyaW5nID0+IHtcblx0XHRpZiAoIShwcmVmaXggaW4gY291bnRlcnMpKSB7XG5cdFx0XHRjb3VudGVyc1twcmVmaXhdID0gMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJlZml4ICsgJy0nICsgY291bnRlcnNbcHJlZml4XSsrO1xuXHR9O1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IG5vb3AgPSAoKTogdW5kZWZpbmVkID0+IHZvaWQgMDtcblxuLy8gPT09PT09PT09PVRZUEUgQ0hFQ0tFUlM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuZXhwb3J0IGNvbnN0IGlzSW50ZWdlciA9XG5cdE51bWJlci5pc0ludGVnZXIgfHxcblx0ZnVuY3Rpb24gaXNJbnRlZ2VyKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgbnVtYmVyIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0dHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJlxuXHRcdFx0aXNGaW5pdGUodmFsdWUpICYmXG5cdFx0XHRNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWVcblx0XHQpO1xuXHR9O1xuZXhwb3J0IGNvbnN0IGlzQXJyYXkgPVxuXHRBcnJheS5pc0FycmF5IHx8XG5cdGZ1bmN0aW9uIGlzQXJyYXkodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBhbnlbXSB7XG5cdFx0cmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nO1xuXHR9O1xuZXhwb3J0IGNvbnN0IGlzUGxhaW5PYmplY3QgPSA8VCA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+Pihcblx0YTogdW5rbm93blxuKTogYSBpcyBUID0+IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG5leHBvcnQgY29uc3QgaXNTdHJpbmcgPSAoYTogdW5rbm93bik6IGEgaXMgc3RyaW5nID0+IHR5cGVvZiBhID09PSAnc3RyaW5nJztcbmV4cG9ydCBjb25zdCBpc0Z1bmN0aW9uID0gKGE6IHVua25vd24pOiBhIGlzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55ID0+XG5cdHR5cGVvZiBhID09PSAnZnVuY3Rpb24nO1xuXG4vKipcbiAqIENoZWNrcyBpZiB2YWx1ZSBpcyBudWxsIG9yIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gYVxuICovXG5leHBvcnQgY29uc3QgaXNOaWwgPSAoYTogdW5rbm93bik6IGEgaXMgbnVsbCB8IHVuZGVmaW5lZCA9PiB7XG5cdHJldHVybiBhID09PSB1bmRlZmluZWQgfHwgYSA9PT0gbnVsbDtcbn07XG5leHBvcnQgY29uc3QgaXNFbXB0eSA9IChhOiB1bmtub3duKTogYm9vbGVhbiA9PiB7XG5cdGlmIChhID09PSB1bmRlZmluZWQgfHwgYSA9PT0gbnVsbCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBhLnRyaW0oKS5sZW5ndGggPT09IDA7XG5cdH1cblxuXHRpZiAodHlwZW9mIGEgPT09ICdudW1iZXInKSB7XG5cdFx0cmV0dXJuIGlzTmFOKGEpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBhID09PSAnYm9vbGVhbicpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoaXNBcnJheShhKSkge1xuXHRcdHJldHVybiAhYS5sZW5ndGg7XG5cdH1cblxuXHRpZiAoaXNQbGFpbk9iamVjdChhKSkge1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGEpIHtcblx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYSwga2V5KSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRjb25zdCB0YWcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSk7XG5cblx0aWYgKHRhZyA9PT0gJ1tvYmplY3QgU2V0XScgfHwgdGFnID09PSAnW29iamVjdCBNYXBdJykge1xuXHRcdHJldHVybiAhKGEgYXMgU2V0PGFueT4gfCBNYXA8YW55LCBhbnk+KS5zaXplO1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufTtcbmV4cG9ydCBjb25zdCBpc05vdEVtcHR5ID0gKGE6IHVua25vd24pOiBib29sZWFuID0+ICFpc0VtcHR5KGEpO1xuZXhwb3J0IGNvbnN0IHRvQXJyYXkgPSA8WD4oYTogSXRlcmFibGU8WD4pOiBYW10gPT4gWy4uLmFdO1xuZXhwb3J0IGNvbnN0IGVzY2FwZVJlZ0V4cCA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuXHRzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXFxcL10pL2csICdcXFxcJDEnKTtcblxuLy8gPT09PT09PT09PUhFTFBFUlM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmV4cG9ydCBmdW5jdGlvbiBjYWxsYmFjayhmbjogdW5rbm93biwgYXJncz86IGFueVtdLCBjdHg/OiB1bmtub3duKTogYW55IHtcblx0aWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBmbi5hcHBseShjdHgsIGFyZ3MpO1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmlxdWU8WD4oYXJyOiBYW10pOiBYW10ge1xuXHRyZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZWFjaDxUPihcblx0b2JqOiB7IFtrZXk6IHN0cmluZ106IFQgfSB8IFRbXSxcblx0Zm46ICh2YWx1ZTogVCwga2V5OiBhbnkpID0+IHZvaWRcbik6IHZvaWQge1xuXHRPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleTogc3RyaW5nKSA9PiB7XG5cdFx0Y29uc3QgdmFsdWU6IFQgPSAob2JqIGFzIGFueSlba2V5XTtcblx0XHRmbih2YWx1ZSwga2V5KTtcblx0fSk7XG59XG5cbmludGVyZmFjZSBMaXN0PFQ+IHtcblx0W2luZGV4OiBudW1iZXJdOiBUO1xuXHRsZW5ndGg6IG51bWJlcjtcbn1cblxudHlwZSBMaXN0Rm9yRWFjaFR5cGUgPSA8VSBleHRlbmRzIExpc3Q8dW5rbm93bj4+KFxuXHRjb2xsZWN0aW9uOiBVLFxuXHRpdGVyYXRlZTogKFxuXHRcdHZhbHVlOiBVW0V4dHJhY3Q8a2V5b2YgVSwgbnVtYmVyPl0sXG5cdFx0a2V5OiBFeHRyYWN0PGtleW9mIFUsIG51bWJlcj4sXG5cdFx0Y29sbGVjdGlvbjogVVxuXHQpID0+IHZvaWRcbikgPT4gdm9pZDtcbnR5cGUgRGljdEZvckVhY2hUeXBlID0gPFUgZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oXG5cdGNvbGxlY3Rpb246IFUsXG5cdGl0ZXJhdGVlOiAoXG5cdFx0dmFsdWU6IFVbRXh0cmFjdDxrZXlvZiBVLCBzdHJpbmc+XSxcblx0XHRrZXk6IEV4dHJhY3Q8a2V5b2YgVSwgc3RyaW5nPixcblx0XHRjb2xsZWN0aW9uOiBVXG5cdCkgPT4gdm9pZFxuKSA9PiB2b2lkO1xuXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IGZ1bmN0aW9uIF9mb3JFYWNoPFxuXHRVIGV4dGVuZHMgTGlzdDx1bmtub3duPiB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4+KFxuXHRjb2xsZWN0aW9uOiBVLFxuXHRpdGVyYXRlZTogKHZhbHVlOiB1bmtub3duLCBrZXk6IHN0cmluZyB8IG51bWJlciwgY29sbGVjdGlvbjogVSkgPT4gdm9pZFxuKSB7XG5cdGlmIChpc1BsYWluT2JqZWN0KGNvbGxlY3Rpb24pKSB7XG5cdFx0Zm9yIChjb25zdCBrIGluIGNvbGxlY3Rpb24pIHtcblx0XHRcdE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb2xsZWN0aW9uLCBrKSAmJlxuXHRcdFx0XHRpdGVyYXRlZShjb2xsZWN0aW9uW2tdLCBrLCBjb2xsZWN0aW9uKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChjb25zdCBrIGluIGNvbGxlY3Rpb24pIHtcblx0XHRcdGl0ZXJhdGVlKGNvbGxlY3Rpb25ba10sIGssIGNvbGxlY3Rpb24pO1xuXHRcdH1cblx0fVxufSBhcyBMaXN0Rm9yRWFjaFR5cGUgJiBEaWN0Rm9yRWFjaFR5cGU7XG5cbmV4cG9ydCBjb25zdCBhc3NpZ24gPVxuXHRPYmplY3QuYXNzaWduIHx8XG5cdGZ1bmN0aW9uIF9hc3NpZ24oLi4uYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj5bXSkge1xuXHRcdGNvbnN0IHRvID0gYXJnc1swXTtcblx0XHRsZXQgZnJvbSwgc3ltYm9scztcblxuXHRcdGZvciAobGV0IHMgPSAxOyBzIDwgYXJncy5sZW5ndGg7IHMrKykge1xuXHRcdFx0ZnJvbSA9IE9iamVjdChhcmdzW3NdKTtcblxuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gZnJvbSkge1xuXHRcdFx0XHRpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0XHQodG8gYXMgYW55KVtrZXldID0gZnJvbVtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICgnZ2V0T3duUHJvcGVydHlTeW1ib2xzJyBpbiBPYmplY3QpIHtcblx0XHRcdFx0c3ltYm9scyA9IChPYmplY3QgYXMgYW55KS5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3ltYm9scy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHRcdCh0byBhcyBhbnkpW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdG87XG5cdH07XG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZTxUPihhOiBUKTogVCB7XG5cdHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGEpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ1BsYWNlaG9sZGVyUmVwbGFjZShcblx0c3RyOiBzdHJpbmcsXG5cdGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4pOiBzdHJpbmcge1xuXHRpZiAoaXNTdHJpbmcoc3RyKSAmJiBzdHIubGVuZ3RoICYmIGlzUGxhaW5PYmplY3QoZGF0YSkpIHtcblx0XHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSkuc29ydCgpLnJldmVyc2UoKTtcblx0XHRsZXQgcmVnO1xuXG5cdFx0aWYgKGtleXMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBtID0ga2V5cy5qb2luKCd8Jyk7XG5cdFx0XHRyZWcgPSBuZXcgUmVnRXhwKCc6KCcgKyBtICsgJyknLCAnZycpO1xuXG5cdFx0XHRyZXR1cm4gc3RyLnJlcGxhY2UocmVnLCBmdW5jdGlvbiBzdHJpbmdDaHVua1JlcGxhY2VyKC4uLmFyZ3MpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZW1lbnQgPSAoZGF0YSBhcyBhbnkpW2FyZ3NbMV1dO1xuXG5cdFx0XHRcdGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFyZ3NbMF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVwbGFjZW1lbnQ7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdGV4dFRvTGluZVN0cmluZyh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCByZWcgPSAvW1wiJ1xcXFxcXG5cXHJcXHRcXHUyMDI4XFx1MjAyOV0vZyxcblx0XHRzaW5nbGVRdW90ZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMzkpLFxuXHRcdHRvRXNjYXBlczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG5cdFx0XHQnXCInOiAnXCInLFxuXHRcdFx0W3NpbmdsZVF1b3RlXTogc2luZ2xlUXVvdGUsXG5cdFx0XHQnXFxcXCc6ICdcXFxcJyxcblx0XHRcdCdcXG4nOiAnbicsXG5cdFx0XHQnXFxyJzogJ3InLFxuXHRcdFx0J1xcdCc6ICd0Jyxcblx0XHRcdCdcXHUyMDI4JzogJzIwMjgnLFxuXHRcdFx0J1xcdTIwMjknOiAnMjAyOScsXG5cdFx0fTtcblxuXHRyZXR1cm4gdGV4dC5yZXBsYWNlKHJlZywgKG1hdGNoKSA9PiAnXFxcXCcgKyAodG9Fc2NhcGVzIGFzIGFueSlbbWF0Y2hdKTtcbn1cblxuLy8gPT09PT09PT09PU1BVEg9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuY29uc3QgX3NldERpZ2l0c1NlcCA9ICh4OiBudW1iZXIsIHNlcDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0Y29uc3QgcyA9IFN0cmluZyh4KSxcblx0XHRhbnMgPSBbXSxcblx0XHRqID0gcy5pbmRleE9mKCcuJyksXG5cdFx0c3RhcnQgPSBqICE9PSAtMSA/IGogOiBzLmxlbmd0aCxcblx0XHRlbmQgPSBqICE9PSAtMSA/IHMuc2xpY2Uoc3RhcnQgKyAxKSA6IFtdO1xuXHRsZXQgY291bnQgPSAwLFxuXHRcdGkgPSBzdGFydDtcblxuXHRmb3IgKDsgaSA+PSAwOyBpLS0pIHtcblx0XHRpZiAoY291bnQgPT09IDMpIHtcblx0XHRcdGNvdW50ID0gMDtcblx0XHRcdGFuc1tpXSA9IGkgIT09IDAgPyBzZXAgKyBzW2ldIDogc1tpXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5zW2ldID0gc1tpXTtcblx0XHR9XG5cdFx0Y291bnQrKztcblx0fVxuXG5cdHJldHVybiBhbnMuY29uY2F0KGVuZCkuam9pbignJyk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyRm9ybWF0KFxuXHR4OiBudW1iZXIgfCBzdHJpbmcsXG5cdGRlYyA9IDIsXG5cdGRlY2ltYWxTZXAgPSAnLicsXG5cdGRpZ2l0c1NlcCA9ICcgJ1xuKTogc3RyaW5nIHtcblx0aWYgKCF4KSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0bGV0IGFucyA9IHBhcnNlRmxvYXQoU3RyaW5nKHgpKTtcblxuXHRpZiAoZGVjID49IDApIHtcblx0XHRjb25zdCBkZWNpbWFsUG93ID0gTWF0aC5wb3coMTAsIGRlYyk7XG5cdFx0YW5zID0gTWF0aC5mbG9vcihhbnMgKiBkZWNpbWFsUG93KSAvIGRlY2ltYWxQb3c7XG5cdH1cblxuXHRjb25zdCBuID0gX3NldERpZ2l0c1NlcChhbnMsIGRpZ2l0c1NlcCk7XG5cdGNvbnN0IGEgPSBuLnNwbGl0KCcnKTtcblxuXHRjb25zdCBkZWNpbWFsUG9zID0gYS5sYXN0SW5kZXhPZignLicpO1xuXHRpZiAoZGVjaW1hbFBvcyA+PSAwICYmIGRlY2ltYWxTZXAgIT09ICcuJykge1xuXHRcdGFbZGVjaW1hbFBvc10gPSBkZWNpbWFsU2VwO1xuXHR9XG5cblx0cmV0dXJuIGEuam9pbignJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBndCh4OiBudW1iZXIsIHk6IG51bWJlciwgZXEgPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gZXEgPyB4ID49IHkgOiB4ID4geTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGx0KHg6IG51bWJlciwgeTogbnVtYmVyLCBlcSA9IGZhbHNlKTogYm9vbGVhbiB7XG5cdHJldHVybiBlcSA/IHggPD0geSA6IHggPCB5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2Vlbih4OiBudW1iZXIsIGE6IG51bWJlciwgYjogbnVtYmVyLCBlcSA9IGZhbHNlKTogYm9vbGVhbiB7XG5cdHJldHVybiBlcSA/IHggPj0gYSAmJiB4IDw9IGIgOiB4ID4gYSAmJiB4IDwgYjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmFuZ2UoYTogdW5rbm93biwgYjogdW5rbm93bik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gdHlwZW9mIGEgPT09ICdudW1iZXInICYmIHR5cGVvZiBiID09PSAnbnVtYmVyJyAmJiBhIDwgYjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5ET00oZWxlbWVudDogTm9kZSwgaW5Cb2R5ID0gZmFsc2UpOiBib29sZWFuIHtcblx0bGV0IF86IE5vZGUgfCBudWxsID0gZWxlbWVudCxcblx0XHRsYXN0OiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cblx0d2hpbGUgKF8pIHtcblx0XHRsYXN0ID0gXztcblx0XHRpZiAoaW5Cb2R5ICYmIGxhc3QgPT09IGRvY3VtZW50LmJvZHkpIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRfID0gXy5wYXJlbnROb2RlO1xuXHR9XG5cblx0cmV0dXJuIGluQm9keSA/IGxhc3QgPT09IGRvY3VtZW50LmJvZHkgOiBsYXN0ID09PSBkb2N1bWVudDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNodWZmbGU8WD4oYTogWFtdKTogWFtdIHtcblx0bGV0IGosIHgsIGk7XG5cblx0Zm9yIChpID0gYS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG5cdFx0aiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuXHRcdHggPSBhW2ldO1xuXHRcdGFbaV0gPSBhW2pdO1xuXHRcdGFbal0gPSB4O1xuXHR9XG5cblx0cmV0dXJuIGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVF1ZXJ5U3RyaW5nKHN0cjogc3RyaW5nKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG5cdGlmIChzdHIuY2hhckF0KDApID09PSAnPycpIHN0ciA9IHN0ci5zdWJzdHJpbmcoMSk7XG5cdGlmICghc3RyLmxlbmd0aCkgcmV0dXJuIHt9O1xuXG5cdGNvbnN0IHBhaXJzID0gc3RyLnNwbGl0KCcmJyksXG5cdFx0cGFyYW1zID0ge307XG5cdGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdGNvbnN0IHBhaXIgPSBwYWlyc1tpXS5zcGxpdCgnPScpLFxuXHRcdFx0a2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMF0pLFxuXHRcdFx0dmFsdWUgPSBwYWlyLmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKSA6IG51bGw7XG5cdFx0aWYgKChwYXJhbXMgYXMgYW55KVtrZXldICE9IG51bGwpIHtcblx0XHRcdGlmICghaXNBcnJheSgocGFyYW1zIGFzIGFueSlba2V5XSkpIHtcblx0XHRcdFx0KHBhcmFtcyBhcyBhbnkpW2tleV0gPSBbKHBhcmFtcyBhcyBhbnkpW2tleV1dO1xuXHRcdFx0fVxuXHRcdFx0KHBhcmFtcyBhcyBhbnkpW2tleV0ucHVzaCh2YWx1ZSk7XG5cdFx0fSBlbHNlIChwYXJhbXMgYXMgYW55KVtrZXldID0gdmFsdWU7XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGU6IEV2ZW50KTogdm9pZCB7XG5cdGlmICghZSkge1xuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XG5cdFx0ZWxzZSByZXR1cm47XG5cdH1cblxuXHRpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRpZiAoZS5jYW5jZWxCdWJibGUgIT0gbnVsbCkgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRpZiAoZS5zdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdGlmICh3aW5kb3cuZXZlbnQpIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0Ly8gaWYgKGUuY2FuY2VsICE9IG51bGwpIGUuY2FuY2VsID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRBZ2UoXG5cdGRheTogbnVtYmVyLFxuXHRtb250aDogbnVtYmVyLFxuXHR5ZWFyOiBudW1iZXIsXG5cdG1pbkFnZTogbnVtYmVyLFxuXHRtYXhBZ2U6IG51bWJlclxuKTogYm9vbGVhbiB7XG5cdC8vIGRlcGVuZGluZyBvbiB0aGUgeWVhciwgY2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgbW9udGhcblx0Y29uc3QgZmVicnVhcnlEYXlzID0geWVhciAlIDQgPT09IDAgPyAyOSA6IDI4LFxuXHRcdGRheXNJbk1vbnRoID0gWzMxLCBmZWJydWFyeURheXMsIDMxLCAzMCwgMzEsIDMwLCAzMSwgMzEsIDMwLCAzMSwgMzAsIDMxXTtcblxuXHQvLyBmaXJzdCwgY2hlY2sgdGhlIGluY29taW5nIG1vbnRoIGFuZCB5ZWFyIGFyZSB2YWxpZC5cblx0aWYgKCFtb250aCB8fCAhZGF5IHx8ICF5ZWFyKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmICgxID4gbW9udGggfHwgbW9udGggPiAxMikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoeWVhciA8IDApIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKDEgPiBkYXkgfHwgZGF5ID4gZGF5c0luTW9udGhbbW9udGggLSAxXSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIGlmIHJlcXVpcmVkLCB2ZXJpZnkgdGhlIGN1cnJlbnQgZGF0ZSBpcyBMQVRFUiB0aGFuIHRoZSBpbmNvbWluZyBkYXRlLlxuXHRpZiAobWluQWdlICE9PSB1bmRlZmluZWQgfHwgbWF4QWdlICE9PSB1bmRlZmluZWQpIHtcblx0XHQvLyB3ZSBnZXQgY3VycmVudCB5ZWFyXG5cdFx0Y29uc3QgY3VycmVudFllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksXG5cdFx0XHRhZ2UgPSBjdXJyZW50WWVhciAtIHllYXI7XG5cblx0XHRpZiAoYWdlIDwgMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoYWdlIDwgbWluQWdlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChhZ2UgPiBtYXhBZ2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGVTaXplRm9ybWF0KFxuXHRzaXplOiBudW1iZXIgLyogaW4gYnl0ZXMgKi8sXG5cdGRlY2ltYWxQb2ludCA9ICcuJyxcblx0dGhvdXNhbmRzU2VwID0gJyAnXG4pOiBzdHJpbmcge1xuXHRjb25zdCB1bml0cyA9IFsnYnl0ZScsICdLYicsICdNYicsICdHYicsICdUYiddLFxuXHRcdGlNYXggPSB1bml0cy5sZW5ndGg7XG5cdGxldCBpID0gMCxcblx0XHRyZXN1bHQgPSAwO1xuXG5cdHNpemUgPSBwYXJzZUZsb2F0KFN0cmluZyhzaXplKSk7XG5cblx0d2hpbGUgKHNpemUgPj0gMSAmJiBpIDwgaU1heCkge1xuXHRcdHJlc3VsdCA9IHNpemU7XG5cdFx0c2l6ZSAvPSAxMDAwOyAvLyBub3QgMTAyNFxuXHRcdGkrKztcblx0fVxuXG5cdGNvbnN0IHBhcnRzID0gU3RyaW5nKHJlc3VsdCkuc3BsaXQoJy4nKSxcblx0XHRoZWFkID1cblx0XHRcdHBhcnNlSW50KHBhcnRzWzBdKSA9PT0gcmVzdWx0XG5cdFx0XHRcdD8gcmVzdWx0XG5cdFx0XHRcdDogbnVtYmVyRm9ybWF0KHJlc3VsdCwgMiwgZGVjaW1hbFBvaW50LCB0aG91c2FuZHNTZXApO1xuXG5cdHJldHVybiBoZWFkICsgJyAnICsgdW5pdHNbaSA9PT0gMCA/IDAgOiBpIC0gMV07XG59XG5cbi8qKlxuICogT3BlbnMgdGhlIHByb3ZpZGVkIHVybCBieSBpbmplY3RpbmcgYSBoaWRkZW4gaWZyYW1lIHRoYXQgY2FsbHNcbiAqIHdpbmRvdy5vcGVuKCksIHRoZW4gcmVtb3ZlcyB0aGUgaWZyYW1lIGZyb20gdGhlIERPTS5cbiAqXG4gKiBQcmV2ZW50IHJldmVyc2UgdGFibmFiYmluZyBwaGlzaGluZyBhdHRhY2tzIGNhdXNlZCBieSBfYmxhbmtcbiAqXG4gKiBodHRwczovL21hdGhpYXNieW5lbnMuZ2l0aHViLmlvL3JlbC1ub29wZW5lci9cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZGFuaWVsc3RqdWxlcy9ibGFua3NoaWVsZC9ibG9iLzZlMjA4YmYyNWE0NGJmNTBkMWE1ZTg1YWU5NmZlZTBjMDE1ZDA1YmMvYmxhbmtzaGllbGQuanMjTDE2NlxuICpcbiAqIEBwYXJhbSB1cmxcbiAqIEBwYXJhbSBzdHJXaW5kb3dOYW1lXG4gKiBAcGFyYW0gc3RyV2luZG93RmVhdHVyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhZmVPcGVuKFxuXHR1cmwgPSAnJyxcblx0c3RyV2luZG93TmFtZSA9ICcnLFxuXHRzdHJXaW5kb3dGZWF0dXJlcyA9ICcnXG4pOiBXaW5kb3cgfCBudWxsIHtcblx0aWYgKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSAhPT0gLTEpIHtcblx0XHQvLyBJRSBiZWZvcmUgMTFcblx0XHRjb25zdCBjaGlsZCA9IG9wZW4uYXBwbHkod2luZG93LCBbdXJsLCBzdHJXaW5kb3dOYW1lLCBzdHJXaW5kb3dGZWF0dXJlc10pO1xuXHRcdGlmIChjaGlsZCkge1xuXHRcdFx0Y2hpbGQub3BlbmVyID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIGNoaWxkO1xuXHR9XG5cblx0Y29uc3QgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJykgYXMgSFRNTElGcmFtZUVsZW1lbnQ7XG5cdGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7XG5cdGNvbnN0IGlmcmFtZURvYyA9IChpZnJhbWUuY29udGVudERvY3VtZW50IHx8XG5cdFx0KGlmcmFtZS5jb250ZW50V2luZG93IGFzIGFueSkuZG9jdW1lbnQpIGFzIERvY3VtZW50O1xuXG5cdGxldCBvcGVuQXJncyA9ICdcIicgKyB1cmwgKyAnXCInO1xuXHRpZiAoc3RyV2luZG93TmFtZSkge1xuXHRcdG9wZW5BcmdzICs9ICcsIFwiJyArIHN0cldpbmRvd05hbWUgKyAnXCInO1xuXHR9XG5cdGlmIChzdHJXaW5kb3dGZWF0dXJlcykge1xuXHRcdG9wZW5BcmdzICs9ICcsIFwiJyArIHN0cldpbmRvd0ZlYXR1cmVzICsgJ1wiJztcblx0fVxuXG5cdGNvbnN0IHNjcmlwdCA9IGlmcmFtZURvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0c2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0Jztcblx0c2NyaXB0LnRleHQgPVxuXHRcdCd3aW5kb3cucGFyZW50ID0gbnVsbDsgd2luZG93LnRvcCA9IG51bGw7JyArXG5cdFx0J3dpbmRvdy5mcmFtZUVsZW1lbnQgPSBudWxsOyB2YXIgY2hpbGQgPSB3aW5kb3cub3BlbignICtcblx0XHRvcGVuQXJncyArXG5cdFx0Jyk7JyArXG5cdFx0J2lmIChjaGlsZCkgeyBjaGlsZC5vcGVuZXIgPSBudWxsIH0nO1xuXHRpZnJhbWVEb2MuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuXHRjb25zdCBuZXdXaW4gPSAoaWZyYW1lLmNvbnRlbnRXaW5kb3cgYXMgYW55KS5jaGlsZCBhcyBXaW5kb3c7XG5cblx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpZnJhbWUpO1xuXHRyZXR1cm4gbmV3V2luO1xufVxuXG50eXBlIENvbnNvbGUgPSB0eXBlb2YgY29uc29sZTtcblxuZXhwb3J0IGNvbnN0IGxvZ2dlcjogQ29uc29sZSAmIHtcblx0b246ICgpID0+IHZvaWQ7XG5cdG9mZjogKCkgPT4gdm9pZDtcbn0gPSAoZnVuY3Rpb24gX2xvZ2dlcigpIHtcblx0bGV0IF9zaG93TG9nID0gdHJ1ZTtcblx0Y29uc3QgX2ZuID0gZnVuY3Rpb24gKHR5cGU6IGtleW9mIENvbnNvbGUpIHtcblx0XHRyZXR1cm4gX3Nob3dMb2cgPyBjb25zb2xlW3R5cGVdIDogbm9vcDtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdG9mZigpIHtcblx0XHRcdF9zaG93TG9nID0gZmFsc2U7XG5cdFx0fSxcblx0XHRvbigpIHtcblx0XHRcdF9zaG93TG9nID0gdHJ1ZTtcblx0XHR9LFxuXG5cdFx0Z2V0IG1lbW9yeSgpIHtcblx0XHRcdHJldHVybiBfZm4oJ21lbW9yeScgYXMgYW55KTtcblx0XHR9LFxuXHRcdGdldCBhc3NlcnQoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdhc3NlcnQnKTtcblx0XHR9LFxuXHRcdGdldCBjbGVhcigpIHtcblx0XHRcdHJldHVybiBfZm4oJ2NsZWFyJyk7XG5cdFx0fSxcblx0XHRnZXQgY291bnQoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdjb3VudCcpO1xuXHRcdH0sXG5cdFx0Z2V0IGNvdW50UmVzZXQoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdjb3VudFJlc2V0Jyk7XG5cdFx0fSxcblx0XHRnZXQgZGVidWcoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdkZWJ1ZycpO1xuXHRcdH0sXG5cdFx0Z2V0IGRpcigpIHtcblx0XHRcdHJldHVybiBfZm4oJ2RpcicpO1xuXHRcdH0sXG5cdFx0Z2V0IGRpcnhtbCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2RpcnhtbCcpO1xuXHRcdH0sXG5cdFx0Z2V0IGVycm9yKCkge1xuXHRcdFx0cmV0dXJuIF9mbignZXJyb3InKTtcblx0XHR9LFxuXHRcdGdldCBleGNlcHRpb24oKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdleGNlcHRpb24nIGFzIGFueSk7XG5cdFx0fSxcblx0XHRnZXQgZ3JvdXAoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdncm91cCcpO1xuXHRcdH0sXG5cdFx0Z2V0IGdyb3VwQ29sbGFwc2VkKCkge1xuXHRcdFx0cmV0dXJuIF9mbignZ3JvdXBDb2xsYXBzZWQnKTtcblx0XHR9LFxuXHRcdGdldCBncm91cEVuZCgpIHtcblx0XHRcdHJldHVybiBfZm4oJ2dyb3VwRW5kJyk7XG5cdFx0fSxcblx0XHRnZXQgaW5mbygpIHtcblx0XHRcdHJldHVybiBfZm4oJ2luZm8nKTtcblx0XHR9LFxuXHRcdGdldCBsb2coKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCdsb2cnKTtcblx0XHR9LFxuXHRcdGdldCB0YWJsZSgpIHtcblx0XHRcdHJldHVybiBfZm4oJ3RhYmxlJyk7XG5cdFx0fSxcblx0XHRnZXQgdGltZSgpIHtcblx0XHRcdHJldHVybiBfZm4oJ3RpbWUnKTtcblx0XHR9LFxuXHRcdGdldCB0aW1lRW5kKCkge1xuXHRcdFx0cmV0dXJuIF9mbigndGltZUVuZCcpO1xuXHRcdH0sXG5cdFx0Z2V0IHRpbWVMb2coKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCd0aW1lTG9nJyk7XG5cdFx0fSxcblx0XHRnZXQgdGltZVN0YW1wKCkge1xuXHRcdFx0cmV0dXJuIF9mbigndGltZVN0YW1wJyk7XG5cdFx0fSxcblx0XHRnZXQgdHJhY2UoKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCd0cmFjZScpO1xuXHRcdH0sXG5cdFx0Z2V0IHdhcm4oKSB7XG5cdFx0XHRyZXR1cm4gX2ZuKCd3YXJuJyk7XG5cdFx0fSxcblx0fSBhcyBhbnk7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHZhbDogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpXG5cdFx0LnJlcGxhY2UoLyUyNC9nLCAnJCcpXG5cdFx0LnJlcGxhY2UoLyUyMC9nLCAnKycpXG5cdFx0LnJlcGxhY2UoLyUzQS9naSwgJzonKVxuXHRcdC5yZXBsYWNlKC8lMkMvZ2ksICcsJylcblx0XHQucmVwbGFjZSgvJTVCL2dpLCAnWycpXG5cdFx0LnJlcGxhY2UoLyU1RC9naSwgJ10nKTtcbn1cblxuLyoqXG4gKiBCdWlsZCBxdWVyeSBzdHJpbmcgZnJvbSBvYmplY3QuIFJlY3Vyc2l2ZWx5IVxuICogQHBhcmFtIHBhcmFtc1xuICogQHBhcmFtIHByZWZpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRRdWVyeVN0cmluZyhcblx0cGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IFVSTFNlYXJjaFBhcmFtcyxcblx0cHJlZml4Pzogc3RyaW5nXG4pOiBzdHJpbmcge1xuXHRpZiAocGFyYW1zIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zKSB7XG5cdFx0cmV0dXJuIHBhcmFtcy50b1N0cmluZygpO1xuXHR9XG5cblx0Y29uc3QgZHVwbGljYXRlcyA9IHt9LFxuXHRcdHN0ciA9IFtdO1xuXG5cdGZvciAoY29uc3QgcHJvcCBpbiBwYXJhbXMpIHtcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIHByb3ApKSB7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRjb25zdCBrZXkgPSBwcmVmaXggPyBwcmVmaXggKyAnWycgKyBwcm9wICsgJ10nIDogcHJvcCxcblx0XHRcdHZhbHVlID0gKHBhcmFtcyBhcyBhbnkpW3Byb3BdO1xuXHRcdGxldCBwYWlyO1xuXHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0cGFpciA9IGVuY29kZShrZXkpO1xuXHRcdFx0fSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbHVlKSkge1xuXHRcdFx0XHRwYWlyID0gYnVpbGRRdWVyeVN0cmluZyh2YWx1ZSwga2V5KTtcblx0XHRcdH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0cGFpciA9IHZhbHVlXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiBhcnJheVZhbHVlc1JlZHVjZXIoYWNjLCBpdGVtLCBpbmRleCkge1xuXHRcdFx0XHRcdFx0aWYgKCEoZHVwbGljYXRlcyBhcyBhbnkpW2tleV0pIHtcblx0XHRcdFx0XHRcdFx0KGR1cGxpY2F0ZXMgYXMgYW55KVtrZXldID0ge307XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIShkdXBsaWNhdGVzIGFzIGFueSlba2V5XVtpdGVtXSkge1xuXHRcdFx0XHRcdFx0XHQoZHVwbGljYXRlcyBhcyBhbnkpW2tleV1baXRlbV0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYWNjLmNvbmNhdChcblx0XHRcdFx0XHRcdFx0XHRidWlsZFF1ZXJ5U3RyaW5nKHtcblx0XHRcdFx0XHRcdFx0XHRcdFtrZXkgKyAnWycgKyBpbmRleCArICddJ106IGl0ZW0sXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdFx0fSwgW10pXG5cdFx0XHRcdFx0LmpvaW4oJyYnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHNjYWxhciB0eXBlXG5cdFx0XHRcdHBhaXIgPSBlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0ci5wdXNoKHBhaXIgfHwga2V5KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RyLmpvaW4oJyYnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaFBhcmFtKFxuXHRuYW1lOiBzdHJpbmcsXG5cdHVybD86IHN0cmluZyB8IFVSTCB8IExvY2F0aW9uXG4pOiBzdHJpbmcgfCBudWxsIHtcblx0bGV0IHF1ZXJ5ID0gJyc7XG5cdHVybCA9IHVybCB8fCB3aW5kb3cubG9jYXRpb247XG5cdGNvbnN0IGxvY19zdHIgPSB1cmwudG9TdHJpbmcoKTtcblx0Y29uc3QgX3UgPSBuZXcgVVJMKGxvY19zdHIpO1xuXG5cdGlmIChfdS5zZWFyY2hQYXJhbXMpIHtcblx0XHRyZXR1cm4gX3Uuc2VhcmNoUGFyYW1zLmdldChuYW1lKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgdXJsICE9PSAnc3RyaW5nJyAmJiB1cmwuc2VhcmNoKSB7XG5cdFx0cXVlcnkgPSB1cmwuc2VhcmNoO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGsgPSBsb2Nfc3RyLmluZGV4T2YoJz8nKTtcblxuXHRcdGlmIChrID49IDApIHtcblx0XHRcdHF1ZXJ5ID0gbG9jX3N0ci5zbGljZShrKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBwYWlycyA9IHF1ZXJ5LnJlcGxhY2UoL15cXD8vLCAnJykuc3BsaXQoJyYnKTtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3QgcGFydHMgPSBwYWlyc1tpXS5zcGxpdCgnPScpO1xuXHRcdGNvbnN0IGtleSA9IHBhcnRzWzBdIHx8ICcnO1xuXHRcdGlmIChrZXkudG9Mb3dlckNhc2UoKSA9PT0gbmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBCdWlsZCBhIFVSTCB3aXRoIGEgZ2l2ZW4gcGFyYW1zXG4gKlxuICogQHBhcmFtIHVybFxuICogQHBhcmFtIHBhcmFtc1xuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRVUkwoXG5cdHVybDogc3RyaW5nLFxuXHRwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgVVJMU2VhcmNoUGFyYW1zXG4pOiBzdHJpbmcge1xuXHRpZiAoIXBhcmFtcykge1xuXHRcdHJldHVybiB1cmw7XG5cdH1cblxuXHRjb25zdCBzZXJpYWxpemVkUGFyYW1zID0gYnVpbGRRdWVyeVN0cmluZyhwYXJhbXMpO1xuXG5cdGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG5cdFx0Y29uc3QgaGFzaEluZGV4ID0gdXJsLmluZGV4T2YoJyMnKTtcblx0XHRpZiAoaGFzaEluZGV4ICE9PSAtMSkge1xuXHRcdFx0dXJsID0gdXJsLnNsaWNlKDAsIGhhc2hJbmRleCk7XG5cdFx0fVxuXG5cdFx0dXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuXHR9XG5cblx0cmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RGaWVsZExhYmVsVGV4dChcblx0Zm9ybTogSFRNTEZvcm1FbGVtZW50LFxuXHRmaWVsZE5hbWU6IHN0cmluZ1xuKTogc3RyaW5nIHtcblx0Y29uc3QgZmllbGQgPSBmb3JtLnF1ZXJ5U2VsZWN0b3IoYFtuYW1lPScke2ZpZWxkTmFtZX0nXWApO1xuXHRsZXQgbGFiZWxUZXh0OiBhbnkgPSBmaWVsZE5hbWU7XG5cblx0aWYgKGZpZWxkKSB7XG5cdFx0Y29uc3QgaWQgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG5cdFx0bGV0IGxhYmVsLCBwbGFjZWhvbGRlciwgdGl0bGU7XG5cdFx0aWYgKGlkICYmIChsYWJlbCA9IGZvcm0ucXVlcnlTZWxlY3RvcihgbGFiZWxbZm9yPScke2lkfSddYCkpKSB7XG5cdFx0XHRsYWJlbFRleHQgPSBsYWJlbC50ZXh0Q29udGVudDtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0KHBsYWNlaG9sZGVyID0gZmllbGQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSAmJlxuXHRcdFx0cGxhY2Vob2xkZXIudHJpbSgpLmxlbmd0aFxuXHRcdCkge1xuXHRcdFx0bGFiZWxUZXh0ID0gcGxhY2Vob2xkZXI7XG5cdFx0fSBlbHNlIGlmICgodGl0bGUgPSBmaWVsZC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykpICYmIHRpdGxlLnRyaW0oKS5sZW5ndGgpIHtcblx0XHRcdGxhYmVsVGV4dCA9IHRpdGxlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBsYWJlbFRleHQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgdXVpZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQoKTogc3RyaW5nIHtcblx0cmV0dXJuICgnJyArIDFlNyArIC0xZTMgKyAtNGUzICsgLThlMyArIC0xZTExKS5yZXBsYWNlKC9bMDE4XS9nLCAoYzogYW55KSA9PiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGMgXlxuXHRcdFx0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMSkpWzBdICYgKDE1ID4+IChjIC8gNCkpKVxuXHRcdCkudG9TdHJpbmcoMTYpO1xuXHR9KTtcbn1cblxuZXhwb3J0ICogZnJvbSAnLi9zY3JpcHRMb2FkZXInO1xuXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBhdGhSZXNvbHZlciB9IGZyb20gJy4vUGF0aFJlc29sdmVyJztcbiJdfQ==