// ==========TYPE CHECKERS====================================
let _naturalId = 0;
let isArray = Array.isArray;
let naturalId = () => 'id_' + _naturalId++;
let isPlainObject = (a) => Object.prototype.toString.call(a) === '[object Object]';
let isString = (a) => typeof a === 'string';
let isFunction = (a) => typeof a === 'function';
let isEmpty = function (a) {
    if (isArray(a)) {
        return !a.length;
    }
    if (isPlainObject(a)) {
        return !Object.keys(a).length;
    }
    if (typeof a === 'string') {
        return a.trim().length === 0;
    }
    if (typeof a === 'number') {
        return isNaN(a);
    }
    return !a;
};
let isNotEmpty = (a) => !isEmpty(a);
let toArray = (a) => [].concat.apply([], a);
// ==========HELPERS====================================
let callback = function (fn, args, ctx) {
    if (typeof fn === 'function') {
        return fn.apply(ctx, args);
    }
    return null;
};
let forEach = function (obj, fn) {
    Object.keys(obj).forEach((key) => {
        let value = obj[key];
        fn(value, key);
    });
};
let assign = Object.assign ||
    function (target, source) {
        let to = target, from, symbols;
        for (let s = 1; s < arguments.length; s++) {
            from = Object(arguments[s]);
            for (let key in from) {
                if (from.hasOwnProperty(key)) {
                    to[key] = from[key];
                }
            }
            if ('getOwnPropertySymbols' in Object) {
                symbols = Object.getOwnPropertySymbols(from);
                for (let i = 0; i < symbols.length; i++) {
                    if (from.propertyIsEnumerable(symbols[i])) {
                        to[symbols[i]] = from[symbols[i]];
                    }
                }
            }
        }
        return to;
    };
let stringKeyReplace = function (str, data) {
    if (isString(str) && str.length && isPlainObject(data)) {
        let keys = Object.keys(data)
            .sort()
            .reverse(), reg;
        if (keys.length) {
            let m = keys.join('|');
            reg = new RegExp(':(' + m + ')', 'g');
            return str.replace(reg, function () {
                let replacement = data[arguments[1]];
                if (replacement === undefined) {
                    return arguments[0];
                }
                return replacement;
            });
        }
    }
    return str;
};
let textToLineString = (text) => {
    let reg = /["'\\\n\r\t\u2028\u2029]/g, to_escapes = {
        '"': '"',
        "'": "'",
        '\\': '\\',
        '\n': 'n',
        '\r': 'r',
        '\t': 't',
        '\u2028': '2028',
        '\u2029': '2029',
    };
    return text.replace(reg, match => '\\' + to_escapes[match]);
};
let expose = function (items, ctx) {
    let out = {};
    items.forEach(function (key) {
        let item = ctx[key];
        // methods and properties
        if (isFunction(item)) {
            out[key] = function () {
                let res = item.apply(ctx, arguments);
                return res === ctx ? out : res;
            };
        }
        else {
            out[key] = item;
        }
    });
    return out;
};
let getFrom = function (from, key) {
    let { [key]: value } = from || {};
    return value;
};
// ==========MATH====================================
let _setDigitsSep = function (x, sep) {
    let s = String(x), count = 0, ans = [], j = s.indexOf('.'), start = j !== -1 ? j : s.length, end = j !== -1 ? s.slice(start + 1) : [], i = start;
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
let math = {
    numberFormat: function (x, dec = 2, decimalSep = '.', digitsSep = ' ') {
        if (!x) {
            return '';
        }
        let ans = parseFloat(String(x)), decimalPos;
        if (dec >= 0) {
            let decimalPow = Math.pow(10, dec);
            ans = Math.floor(ans * decimalPow) / decimalPow;
        }
        let n = _setDigitsSep(ans, digitsSep);
        let a = n.split('');
        decimalPos = a.lastIndexOf('.');
        if (decimalPos >= 0 && decimalSep !== '.') {
            a[decimalPos] = decimalSep;
        }
        return a.join('');
    },
    gt: function (x, y, eq = false) {
        return eq ? x >= y : x > y;
    },
    lt: function (x, y, eq = false) {
        return eq ? x <= y : x < y;
    },
    between: function (x, a, b, eq = false) {
        return eq ? x >= a && x <= b : x > a && x < b;
    },
    isRange: function (a, b) {
        return typeof a === 'number' && typeof b === 'number' && a < b;
    },
};
let isInDOM = function (element, inBody = false) {
    let _ = element, last;
    while (_) {
        last = _;
        if (inBody && last === document.body) {
            break;
        }
        _ = _.parentNode;
    }
    return inBody ? last === document.body : last === document;
};
let buildQueryString = function (object, prefix) {
    let duplicates = {}, str = [];
    for (let prop in object) {
        if (!Object.prototype.hasOwnProperty.call(object, prop)) {
            continue;
        }
        let key = prefix ? prefix + '[' + prop + ']' : prop, value = object[prop], pair;
        if (value !== undefined) {
            if (value === null) {
                pair = encodeURIComponent(key);
            }
            else if (Utils.isPlainObject(value)) {
                pair = buildQueryString(value, key);
            }
            else if (Utils.isArray(value)) {
                pair = value
                    .reduce(function (memo, item) {
                    if (!duplicates[key])
                        duplicates[key] = {};
                    if (!duplicates[key][item]) {
                        duplicates[key][item] = true;
                        return memo.concat(encodeURIComponent(key) +
                            '=' +
                            encodeURIComponent(item));
                    }
                    return memo;
                }, [])
                    .join('&');
            }
            else {
                pair =
                    encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
            str.push(pair);
        }
    }
    return str.join('&');
};
let shuffle = (a) => {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
};
let parseQueryString = function (str) {
    if (str.charAt(0) === '?')
        str = str.substring(1);
    if (!str.length)
        return {};
    let pairs = str.split('&'), params = {};
    for (let i = 0, len = pairs.length; i < len; i++) {
        let pair = pairs[i].split('='), key = decodeURIComponent(pair[0]), value = pair.length == 2 ? decodeURIComponent(pair[1]) : null;
        if (params[key] != null) {
            if (!Utils.isArray(params[key])) {
                params[key] = [params[key]];
            }
            params[key].push(value);
        }
        else
            params[key] = value;
    }
    return params;
};
let eventCancel = function (e) {
    if (!e) {
        if (window.event)
            e = window.event;
        else
            return;
    }
    if (e.cancelBubble != null)
        e.cancelBubble = true;
    if (e.stopPropagation)
        e.stopPropagation();
    if (e.preventDefault)
        e.preventDefault();
    if (window.event)
        e.returnValue = false;
    // if (e.cancel != null) e.cancel = true;
};
let isValidAge = (day, month, year, minAge, maxAge) => {
    // depending on the year, calculate the number of days in the month
    let daysInMonth, februaryDays = year % 4 === 0 ? 29 : 28;
    daysInMonth = [31, februaryDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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
        let currentYear = new Date().getFullYear(), age = currentYear - year;
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
};
let fileSizeFormat = function (size /* in bytes */, decimalPoint = '.', thousandsSep = ' ') {
    let units = ['byte', 'Kb', 'Mb', 'Gb', 'Tb'], i_max = units.length, i = 0, result = 0;
    size = parseFloat(String(size));
    while (size >= 1 && i < i_max) {
        result = size;
        size /= 1000; // not 1024
        i++;
    }
    let parts = String(result).split('.'), head = parseInt(parts[0]) === result
        ? result
        : Utils.math.numberFormat(result, 2, decimalPoint, thousandsSep);
    return head + ' ' + units[i == 0 ? 0 : i - 1];
};
let Utils = {
    isPlainObject,
    isString,
    isArray,
    isFunction,
    isEmpty,
    isNotEmpty,
    toArray,
    isInDOM,
    shuffle,
    id: naturalId,
    // ============
    callback,
    assign,
    expose,
    getFrom,
    stringKeyReplace,
    textToLineString,
    forEach,
    // ============
    math,
    isValidAge,
    // ============
    buildQueryString,
    parseQueryString,
    // ============
    eventCancel,
    // ============
    fileSizeFormat,
};
export default Utils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOERBQThEO0FBQzlELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNuQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQzVCLElBQUksU0FBUyxHQUFHLEdBQVcsRUFBRSxDQUFDLEtBQUssR0FBRyxVQUFVLEVBQUUsQ0FBQztBQUNuRCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQU0sRUFBVyxFQUFFLENBQ3ZDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsQ0FBQztBQUN6RCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQU0sRUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDO0FBQzlELElBQUksVUFBVSxHQUFHLENBQUMsQ0FBTSxFQUFpQixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxDQUFDO0FBQ3BFLElBQUksT0FBTyxHQUFHLFVBQVMsQ0FBTTtJQUM1QixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNmLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQ2pCO0lBQ0QsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQzlCO0lBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUU7UUFDMUIsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztLQUM3QjtJQUVELElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQzFCLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0lBRUQs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QWUsS0FBSyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gPT09PT09PT09PVRZUEUgQ0hFQ0tFUlM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmxldCBfbmF0dXJhbElkID0gMDtcbmxldCBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmxldCBuYXR1cmFsSWQgPSAoKTogc3RyaW5nID0+ICdpZF8nICsgX25hdHVyYWxJZCsrO1xubGV0IGlzUGxhaW5PYmplY3QgPSAoYTogYW55KTogYm9vbGVhbiA9PlxuXHRPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xubGV0IGlzU3RyaW5nID0gKGE6IGFueSk6IGEgaXMgc3RyaW5nID0+IHR5cGVvZiBhID09PSAnc3RyaW5nJztcbmxldCBpc0Z1bmN0aW9uID0gKGE6IGFueSk6IGEgaXMgRnVuY3Rpb24gPT4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbic7XG5sZXQgaXNFbXB0eSA9IGZ1bmN0aW9uKGE6IGFueSk6IGJvb2xlYW4ge1xuXHRpZiAoaXNBcnJheShhKSkge1xuXHRcdHJldHVybiAhYS5sZW5ndGg7XG5cdH1cblx0aWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcblx0XHRyZXR1cm4gIU9iamVjdC5rZXlzKGEpLmxlbmd0aDtcblx0fVxuXG5cdGlmICh0eXBlb2YgYSA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gYS50cmltKCkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBhID09PSAnbnVtYmVyJykge1xuXHRcdHJldHVybiBpc05hTihhKTtcblx0fVxuXG5cdHJldHVybiAhYTtcbn07XG5cbmxldCBpc05vdEVtcHR5ID0gKGE6IGFueSk6IGJvb2xlYW4gPT4gIWlzRW1wdHkoYSk7XG5sZXQgdG9BcnJheSA9IChhOiBhbnkpOiBBcnJheTxhbnk+ID0+IFtdLmNvbmNhdC5hcHBseShbXSwgYSk7XG5cbi8vID09PT09PT09PT1IRUxQRVJTPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5sZXQgY2FsbGJhY2sgPSBmdW5jdGlvbihmbjogYW55LCBhcmdzPzogQXJyYXk8YW55PiwgY3R4PzogYW55KTogYW55IHtcblx0aWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBmbi5hcHBseShjdHgsIGFyZ3MpO1xuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59O1xuXG5sZXQgZm9yRWFjaCA9IGZ1bmN0aW9uPFQ+KFxuXHRvYmo6IHsgW2tleTogc3RyaW5nXTogVCB9IHwgQXJyYXk8VD4sXG5cdGZuOiAodmFsdWU6IFQsIGtleTogYW55KSA9PiB2b2lkXG4pIHtcblx0T2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChrZXk6IHN0cmluZykgPT4ge1xuXHRcdGxldCB2YWx1ZTogVCA9IChvYmogYXMgYW55KVtrZXldO1xuXHRcdGZuKHZhbHVlLCBrZXkpO1xuXHR9KTtcbn07XG5cbmxldCBhc3NpZ24gPVxuXHQoT2JqZWN0IGFzIGFueSkuYXNzaWduIHx8XG5cdGZ1bmN0aW9uKHRhcmdldDogb2JqZWN0LCBzb3VyY2U6IG9iamVjdCkge1xuXHRcdGxldCB0byA9IHRhcmdldCxcblx0XHRcdGZyb20sXG5cdFx0XHRzeW1ib2xzO1xuXG5cdFx0Zm9yIChsZXQgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRcdGZyb20gPSBPYmplY3QoYXJndW1lbnRzW3NdKTtcblxuXHRcdFx0Zm9yIChsZXQga2V5IGluIGZyb20pIHtcblx0XHRcdFx0aWYgKGZyb20uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0XHRcdCh0byBhcyBhbnkpW2tleV0gPSBmcm9tW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCdnZXRPd25Qcm9wZXJ0eVN5bWJvbHMnIGluIE9iamVjdCkge1xuXHRcdFx0XHRzeW1ib2xzID0gKE9iamVjdCBhcyBhbnkpLmdldE93blByb3BlcnR5U3ltYm9scyhmcm9tKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKGZyb20ucHJvcGVydHlJc0VudW1lcmFibGUoc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHRcdCh0byBhcyBhbnkpW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdG87XG5cdH07XG5cbmxldCBzdHJpbmdLZXlSZXBsYWNlID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcsIGRhdGE6IG9iamVjdCk6IHN0cmluZyB7XG5cdGlmIChpc1N0cmluZyhzdHIpICYmIHN0ci5sZW5ndGggJiYgaXNQbGFpbk9iamVjdChkYXRhKSkge1xuXHRcdGxldCBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSlcblx0XHRcdFx0LnNvcnQoKVxuXHRcdFx0XHQucmV2ZXJzZSgpLFxuXHRcdFx0cmVnO1xuXG5cdFx0aWYgKGtleXMubGVuZ3RoKSB7XG5cdFx0XHRsZXQgbSA9IGtleXMuam9pbignfCcpO1xuXHRcdFx0cmVnID0gbmV3IFJlZ0V4cCgnOignICsgbSArICcpJywgJ2cnKTtcblxuXHRcdFx0cmV0dXJuIHN0ci5yZXBsYWNlKHJlZywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGxldCByZXBsYWNlbWVudCA9IChkYXRhIGFzIGFueSlbYXJndW1lbnRzWzFdXTtcblxuXHRcdFx0XHRpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBhcmd1bWVudHNbMF07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVwbGFjZW1lbnQ7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3RyO1xufTtcblxubGV0IHRleHRUb0xpbmVTdHJpbmcgPSAodGV4dDogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0bGV0IHJlZyA9IC9bXCInXFxcXFxcblxcclxcdFxcdTIwMjhcXHUyMDI5XS9nLFxuXHRcdHRvX2VzY2FwZXM6IG9iamVjdCA9IHtcblx0XHRcdCdcIic6ICdcIicsXG5cdFx0XHRcIidcIjogXCInXCIsXG5cdFx0XHQnXFxcXCc6ICdcXFxcJyxcblx0XHRcdCdcXG4nOiAnbicsXG5cdFx0XHQnXFxyJzogJ3InLFxuXHRcdFx0J1xcdCc6ICd0Jyxcblx0XHRcdCdcXHUyMDI4JzogJzIwMjgnLFxuXHRcdFx0J1xcdTIwMjknOiAnMjAyOScsXG5cdFx0fTtcblxuXHRyZXR1cm4gdGV4dC5yZXBsYWNlKHJlZywgbWF0Y2ggPT4gJ1xcXFwnICsgKHRvX2VzY2FwZXMgYXMgYW55KVttYXRjaF0pO1xufTtcblxubGV0IGV4cG9zZSA9IGZ1bmN0aW9uKGl0ZW1zOiBBcnJheTxzdHJpbmc+LCBjdHg6IGFueSk6IG9iamVjdCB7XG5cdGxldCBvdXQ6IG9iamVjdCA9IHt9O1xuXHRpdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuXHRcdGxldCBpdGVtID0gY3R4W2tleV07XG5cdFx0Ly8gbWV0aG9kcyBhbmQgcHJvcGVydGllc1xuXHRcdGlmIChpc0Z1bmN0aW9uKGl0ZW0pKSB7XG5cdFx0XHQob3V0IGFzIGFueSlba2V5XSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRsZXQgcmVzID0gaXRlbS5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG5cblx0XHRcdFx0cmV0dXJuIHJlcyA9PT0gY3R4ID8gb3V0IDogcmVzO1xuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0KG91dCBhcyBhbnkpW2tleV0gPSBpdGVtO1xuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIG91dDtcbn07XG5cbmxldCBnZXRGcm9tID0gZnVuY3Rpb24oZnJvbTogb2JqZWN0LCBrZXk6IHN0cmluZyk6IGFueSB7XG5cdGxldCB7IFtrZXldOiB2YWx1ZSB9OiBhbnkgPSBmcm9tIHx8IHt9O1xuXG5cdHJldHVybiB2YWx1ZTtcbn07XG5cbi8vID09PT09PT09PT1NQVRIPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmxldCBfc2V0RGlnaXRzU2VwID0gZnVuY3Rpb24oeDogbnVtYmVyLCBzZXA6IHN0cmluZyk6IHN0cmluZyB7XG5cdGxldCBzID0gU3RyaW5nKHgpLFxuXHRcdGNvdW50ID0gMCxcblx0XHRhbnMgPSBbXSxcblx0XHRqID0gcy5pbmRleE9mKCcuJyksXG5cdFx0c3RhcnQgPSBqICE9PSAtMSA/IGogOiBzLmxlbmd0aCxcblx0XHRlbmQgPSBqICE9PSAtMSA/IHMuc2xpY2Uoc3RhcnQgKyAxKSA6IFtdLFxuXHRcdGkgPSBzdGFydDtcblxuXHRmb3IgKDsgaSA+PSAwOyBpLS0pIHtcblx0XHRpZiAoY291bnQgPT09IDMpIHtcblx0XHRcdGNvdW50ID0gMDtcblx0XHRcdGFuc1tpXSA9IGkgIT09IDAgPyBzZXAgKyBzW2ldIDogc1tpXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5zW2ldID0gc1tpXTtcblx0XHR9XG5cdFx0Y291bnQrKztcblx0fVxuXG5cdHJldHVybiBhbnMuY29uY2F0KGVuZCkuam9pbignJyk7XG59O1xuXG5sZXQgbWF0aCA9IHtcblx0bnVtYmVyRm9ybWF0OiBmdW5jdGlvbihcblx0XHR4OiBudW1iZXIgfCBzdHJpbmcsXG5cdFx0ZGVjOiBudW1iZXIgPSAyLFxuXHRcdGRlY2ltYWxTZXA6IHN0cmluZyA9ICcuJyxcblx0XHRkaWdpdHNTZXA6IHN0cmluZyA9ICcgJ1xuXHQpOiBzdHJpbmcge1xuXHRcdGlmICgheCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGxldCBhbnMgPSBwYXJzZUZsb2F0KFN0cmluZyh4KSksXG5cdFx0XHRkZWNpbWFsUG9zO1xuXG5cdFx0aWYgKGRlYyA+PSAwKSB7XG5cdFx0XHRsZXQgZGVjaW1hbFBvdyA9IE1hdGgucG93KDEwLCBkZWMpO1xuXHRcdFx0YW5zID0gTWF0aC5mbG9vcihhbnMgKiBkZWNpbWFsUG93KSAvIGRlY2ltYWxQb3c7XG5cdFx0fVxuXG5cdFx0bGV0IG4gPSBfc2V0RGlnaXRzU2VwKGFucywgZGlnaXRzU2VwKTtcblx0XHRsZXQgYSA9IG4uc3BsaXQoJycpO1xuXG5cdFx0ZGVjaW1hbFBvcyA9IGEubGFzdEluZGV4T2YoJy4nKTtcblx0XHRpZiAoZGVjaW1hbFBvcyA+PSAwICYmIGRlY2ltYWxTZXAgIT09ICcuJykge1xuXHRcdFx0YVtkZWNpbWFsUG9zXSA9IGRlY2ltYWxTZXA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGEuam9pbignJyk7XG5cdH0sXG5cdGd0OiBmdW5jdGlvbih4OiBudW1iZXIsIHk6IG51bWJlciwgZXE6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBlcSA/IHggPj0geSA6IHggPiB5O1xuXHR9LFxuXHRsdDogZnVuY3Rpb24oeDogbnVtYmVyLCB5OiBudW1iZXIsIGVxOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gZXEgPyB4IDw9IHkgOiB4IDwgeTtcblx0fSxcblx0YmV0d2VlbjogZnVuY3Rpb24oXG5cdFx0eDogbnVtYmVyLFxuXHRcdGE6IG51bWJlcixcblx0XHRiOiBudW1iZXIsXG5cdFx0ZXE6IGJvb2xlYW4gPSBmYWxzZVxuXHQpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gZXEgPyB4ID49IGEgJiYgeCA8PSBiIDogeCA+IGEgJiYgeCA8IGI7XG5cdH0sXG5cdGlzUmFuZ2U6IGZ1bmN0aW9uKGE6IG51bWJlciwgYjogbnVtYmVyKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHR5cGVvZiBhID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYiA9PT0gJ251bWJlcicgJiYgYSA8IGI7XG5cdH0sXG59O1xuXG5sZXQgaXNJbkRPTSA9IGZ1bmN0aW9uKGVsZW1lbnQ6IGFueSwgaW5Cb2R5OiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcblx0bGV0IF8gPSBlbGVtZW50LFxuXHRcdGxhc3Q7XG5cblx0d2hpbGUgKF8pIHtcblx0XHRsYXN0ID0gXztcblx0XHRpZiAoaW5Cb2R5ICYmIGxhc3QgPT09IGRvY3VtZW50LmJvZHkpIHtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRfID0gXy5wYXJlbnROb2RlO1xuXHR9XG5cblx0cmV0dXJuIGluQm9keSA/IGxhc3QgPT09IGRvY3VtZW50LmJvZHkgOiBsYXN0ID09PSBkb2N1bWVudDtcbn07XG5cbmxldCBidWlsZFF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24ob2JqZWN0OiBvYmplY3QsIHByZWZpeDogc3RyaW5nKTogc3RyaW5nIHtcblx0bGV0IGR1cGxpY2F0ZXMgPSB7fSxcblx0XHRzdHIgPSBbXTtcblxuXHRmb3IgKGxldCBwcm9wIGluIG9iamVjdCkge1xuXHRcdGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcCkpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGxldCBrZXkgPSBwcmVmaXggPyBwcmVmaXggKyAnWycgKyBwcm9wICsgJ10nIDogcHJvcCxcblx0XHRcdHZhbHVlID0gKG9iamVjdCBhcyBhbnkpW3Byb3BdLFxuXHRcdFx0cGFpcjtcblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdHBhaXIgPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KTtcblx0XHRcdH0gZWxzZSBpZiAoVXRpbHMuaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcblx0XHRcdFx0cGFpciA9IGJ1aWxkUXVlcnlTdHJpbmcodmFsdWUsIGtleSk7XG5cdFx0XHR9IGVsc2UgaWYgKFV0aWxzLmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRcdHBhaXIgPSB2YWx1ZVxuXHRcdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24obWVtbywgaXRlbSkge1xuXHRcdFx0XHRcdFx0aWYgKCEoZHVwbGljYXRlcyBhcyBhbnkpW2tleV0pXG5cdFx0XHRcdFx0XHRcdChkdXBsaWNhdGVzIGFzIGFueSlba2V5XSA9IHt9O1xuXHRcdFx0XHRcdFx0aWYgKCEoZHVwbGljYXRlcyBhcyBhbnkpW2tleV1baXRlbV0pIHtcblx0XHRcdFx0XHRcdFx0KGR1cGxpY2F0ZXMgYXMgYW55KVtrZXldW2l0ZW1dID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1lbW8uY29uY2F0KFxuXHRcdFx0XHRcdFx0XHRcdGVuY29kZVVSSUNvbXBvbmVudChrZXkpICtcblx0XHRcdFx0XHRcdFx0XHRcdCc9JyArXG5cdFx0XHRcdFx0XHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoaXRlbSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBtZW1vO1xuXHRcdFx0XHRcdH0sIFtdKVxuXHRcdFx0XHRcdC5qb2luKCcmJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwYWlyID1cblx0XHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHN0ci5wdXNoKHBhaXIpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdHIuam9pbignJicpO1xufTtcblxubGV0IHNodWZmbGUgPSAoYTogQXJyYXk8YW55Pik6IEFycmF5PGFueT4gPT4ge1xuXHRsZXQgaiwgeCwgaTtcblxuXHRmb3IgKGkgPSBhLmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcblx0XHRqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG5cdFx0eCA9IGFbaV07XG5cdFx0YVtpXSA9IGFbal07XG5cdFx0YVtqXSA9IHg7XG5cdH1cblxuXHRyZXR1cm4gYTtcbn07XG5cbmxldCBwYXJzZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24oc3RyOiBzdHJpbmcpIHtcblx0aWYgKHN0ci5jaGFyQXQoMCkgPT09ICc/Jykgc3RyID0gc3RyLnN1YnN0cmluZygxKTtcblx0aWYgKCFzdHIubGVuZ3RoKSByZXR1cm4ge307XG5cblx0bGV0IHBhaXJzID0gc3RyLnNwbGl0KCcmJyksXG5cdFx0cGFyYW1zID0ge307XG5cdGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdGxldCBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKSxcblx0XHRcdGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKSxcblx0XHRcdHZhbHVlID0gcGFpci5sZW5ndGggPT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChwYWlyWzFdKSA6IG51bGw7XG5cdFx0aWYgKChwYXJhbXMgYXMgYW55KVtrZXldICE9IG51bGwpIHtcblx0XHRcdGlmICghVXRpbHMuaXNBcnJheSgocGFyYW1zIGFzIGFueSlba2V5XSkpIHtcblx0XHRcdFx0KHBhcmFtcyBhcyBhbnkpW2tleV0gPSBbKHBhcmFtcyBhcyBhbnkpW2tleV1dO1xuXHRcdFx0fVxuXHRcdFx0KHBhcmFtcyBhcyBhbnkpW2tleV0ucHVzaCh2YWx1ZSk7XG5cdFx0fSBlbHNlIChwYXJhbXMgYXMgYW55KVtrZXldID0gdmFsdWU7XG5cdH1cblx0cmV0dXJuIHBhcmFtcztcbn07XG5cbmxldCBldmVudENhbmNlbCA9IGZ1bmN0aW9uKGU6IEV2ZW50KSB7XG5cdGlmICghZSkge1xuXHRcdGlmICh3aW5kb3cuZXZlbnQpIGUgPSB3aW5kb3cuZXZlbnQ7XG5cdFx0ZWxzZSByZXR1cm47XG5cdH1cblxuXHRpZiAoZS5jYW5jZWxCdWJibGUgIT0gbnVsbCkgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xuXHRpZiAoZS5zdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG5cdGlmICh3aW5kb3cuZXZlbnQpIGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcblx0Ly8gaWYgKGUuY2FuY2VsICE9IG51bGwpIGUuY2FuY2VsID0gdHJ1ZTtcbn07XG5cbmxldCBpc1ZhbGlkQWdlID0gKFxuXHRkYXk6IG51bWJlcixcblx0bW9udGg6IG51bWJlcixcblx0eWVhcjogbnVtYmVyLFxuXHRtaW5BZ2U6IG51bWJlcixcblx0bWF4QWdlOiBudW1iZXJcbik6IGJvb2xlYW4gPT4ge1xuXHQvLyBkZXBlbmRpbmcgb24gdGhlIHllYXIsIGNhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIGRheXMgaW4gdGhlIG1vbnRoXG5cdGxldCBkYXlzSW5Nb250aCxcblx0XHRmZWJydWFyeURheXMgPSB5ZWFyICUgNCA9PT0gMCA/IDI5IDogMjg7XG5cblx0ZGF5c0luTW9udGggPSBbMzEsIGZlYnJ1YXJ5RGF5cywgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdO1xuXG5cdC8vIGZpcnN0LCBjaGVjayB0aGUgaW5jb21pbmcgbW9udGggYW5kIHllYXIgYXJlIHZhbGlkLlxuXHRpZiAoIW1vbnRoIHx8ICFkYXkgfHwgIXllYXIpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0aWYgKDEgPiBtb250aCB8fCBtb250aCA+IDEyKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmICh5ZWFyIDwgMCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoMSA+IGRheSB8fCBkYXkgPiBkYXlzSW5Nb250aFttb250aCAtIDFdKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gaWYgcmVxdWlyZWQsIHZlcmlmeSB0aGUgY3VycmVudCBkYXRlIGlzIExBVEVSIHRoYW4gdGhlIGluY29taW5nIGRhdGUuXG5cdGlmIChtaW5BZ2UgIT09IHVuZGVmaW5lZCB8fCBtYXhBZ2UgIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIHdlIGdldCBjdXJyZW50IHllYXJcblx0XHRsZXQgY3VycmVudFllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCksXG5cdFx0XHRhZ2UgPSBjdXJyZW50WWVhciAtIHllYXI7XG5cblx0XHRpZiAoYWdlIDwgMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoYWdlIDwgbWluQWdlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChhZ2UgPiBtYXhBZ2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbmxldCBmaWxlU2l6ZUZvcm1hdCA9IGZ1bmN0aW9uKFxuXHRzaXplOiBudW1iZXIgLyogaW4gYnl0ZXMgKi8sXG5cdGRlY2ltYWxQb2ludDogc3RyaW5nID0gJy4nLFxuXHR0aG91c2FuZHNTZXA6IHN0cmluZyA9ICcgJ1xuKSB7XG5cdGxldCB1bml0cyA9IFsnYnl0ZScsICdLYicsICdNYicsICdHYicsICdUYiddLFxuXHRcdGlfbWF4ID0gdW5pdHMubGVuZ3RoLFxuXHRcdGkgPSAwLFxuXHRcdHJlc3VsdCA9IDA7XG5cblx0c2l6ZSA9IHBhcnNlRmxvYXQoU3RyaW5nKHNpemUpKTtcblxuXHR3aGlsZSAoc2l6ZSA+PSAxICYmIGkgPCBpX21heCkge1xuXHRcdHJlc3VsdCA9IHNpemU7XG5cdFx0c2l6ZSAvPSAxMDAwOyAvLyBub3QgMTAyNFxuXHRcdGkrKztcblx0fVxuXG5cdGxldCBwYXJ0cyA9IFN0cmluZyhyZXN1bHQpLnNwbGl0KCcuJyksXG5cdFx0aGVhZCA9XG5cdFx0XHRwYXJzZUludChwYXJ0c1swXSkgPT09IHJlc3VsdFxuXHRcdFx0XHQ/IHJlc3VsdFxuXHRcdFx0XHQ6IFV0aWxzLm1hdGgubnVtYmVyRm9ybWF0KFxuXHRcdFx0XHRcdFx0cmVzdWx0LFxuXHRcdFx0XHRcdFx0Mixcblx0XHRcdFx0XHRcdGRlY2ltYWxQb2ludCxcblx0XHRcdFx0XHRcdHRob3VzYW5kc1NlcFxuXHRcdFx0XHQgICk7XG5cblx0cmV0dXJuIGhlYWQgKyAnICcgKyB1bml0c1tpID09IDAgPyAwIDogaSAtIDFdO1xufTtcblxubGV0IFV0aWxzID0ge1xuXHRpc1BsYWluT2JqZWN0LFxuXHRpc1N0cmluZyxcblx0aXNBcnJheSxcblx0aXNGdW5jdGlvbixcblx0aXNFbXB0eSxcblx0aXNOb3RFbXB0eSxcblx0dG9BcnJheSxcblx0aXNJbkRPTSxcblx0c2h1ZmZsZSxcblx0aWQ6IG5hdHVyYWxJZCxcblx0Ly8gPT09PT09PT09PT09XG5cdGNhbGxiYWNrLFxuXHRhc3NpZ24sXG5cdGV4cG9zZSxcblx0Z2V0RnJvbSxcblx0c3RyaW5nS2V5UmVwbGFjZSxcblx0dGV4dFRvTGluZVN0cmluZyxcblx0Zm9yRWFjaCxcblx0Ly8gPT09PT09PT09PT09XG5cdG1hdGgsXG5cdGlzVmFsaWRBZ2UsXG5cdC8vID09PT09PT09PT09PVxuXHRidWlsZFF1ZXJ5U3RyaW5nLFxuXHRwYXJzZVF1ZXJ5U3RyaW5nLFxuXHQvLyA9PT09PT09PT09PT1cblx0ZXZlbnRDYW5jZWwsXG5cdC8vID09PT09PT09PT09PVxuXHRmaWxlU2l6ZUZvcm1hdCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWxzO1xuIl19