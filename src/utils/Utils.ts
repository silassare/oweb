// ==========TYPE CHECKERS====================================

let isArray       = Array.isArray;
let isPlainObject = (a: any): boolean => Object.prototype.toString.call(a) === "[object Object]";
let isString      = (a: any): a is string => typeof a === "string";
let isFunction    = (a: any): a is Function => typeof a === "function";
let isEmpty       = function (a: any): boolean {

	if (isArray(a)) {
		return !a.length;
	}
	if (isPlainObject(a)) {
		return !Object.keys(a).length;
	}

	return !a;
};

let isNotEmpty = (a: any): boolean => !isEmpty(a);
let toArray    = (a: any): Array<any> => [].concat.apply([], a);

// ==========HELPERS====================================
let callback = function (fn: any, args?: Array<any>, ctx?: any): any {
	if (typeof fn === "function") {
		return fn.apply(ctx, args);
	}

	return null;
};

let iterate = (obj: {} | Array<any>, fn: (key: any, value: any) => void) => {
	Object.keys(obj).forEach((t) => {
		callback(fn, [t, (obj as any)[t]]);
	});
};

let assign = (Object as any).assign || function (target: object, source: object) {

	let to = target, from, symbols;

	for (let s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (let key in from) {
			if (from.hasOwnProperty(key)) {
				(to as any)[key] = from[key];
			}
		}

		if ("getOwnPropertySymbols" in Object) {
			symbols = (Object as any).getOwnPropertySymbols(from);
			for (let i = 0; i < symbols.length; i++) {
				if (from.propertyIsEnumerable(symbols[i])) {
					(to as any)[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

let stringKeyReplace = function (str: string, data: object): string {
	if (isString(str) && str.length && isPlainObject(data)) {
		let keys = Object.keys(data).sort().reverse(),
			reg;

		if (keys.length) {
			let m = keys.join("|");
			reg   = new RegExp(":(" + m + ")", "g");

			return str.replace(reg, function () {
				let replacement = (data as any)[arguments[1]];

				if (replacement === undefined) {
					return arguments[0];
				}

				return replacement;
			});
		}
	}

	return str;
};

let textToLineString = (text: string): string => {
	let reg                = /["'\\\n\r\t\u2028\u2029]/g,
		to_escapes: object = {
			"\"": "\"",
			"'": "'",
			"\\": "\\",
			"\n": "n",
			"\r": "r",
			"\t": "t",
			"\u2028": "2028",
			"\u2029": "2029"
		};

	return text.replace(reg,
		(match) => "\\" + (to_escapes as any)[match]);
};

let expose = function (items: Array<string>, ctx: any): object {
	let out: object = {};
	items.forEach(function (key) {
		let item = ctx[key];
		// methods and properties
		if (isFunction(item)) {
			(out as any)[key] = function () {
				let res = item.apply(ctx, arguments);

				return (res === ctx) ? out : res;
			};
		} else {
			(out as any)[key] = item;
		}
	});

	return out;
};

let getFrom = function (from: object, key: string): any {
	let {[key]: value}: any = from || {};

	return value;
};

// ==========DATE====================================

let date: {[key:string]:Function} = {
	fromString: function (dateStr: string): object | boolean {
		let val        = dateStr.replace(/ /g, ""),
			date_reg_a = /^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/, //standard
			date_reg_b = /^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/;//when browser threat date field as text field (in firefox)

		if (date_reg_a.test(val)) {
			return {
				year: parseInt(RegExp.$1),
				month: parseInt(RegExp.$2),
				day: parseInt(RegExp.$3)
			};
		}
		if (date_reg_b.test(val)) {
			return {
				year: parseInt(RegExp.$3),
				month: parseInt(RegExp.$2),
				day: parseInt(RegExp.$1)
			};
		}
		return false;
	},

	getDesc: function (timestamp: number): object {
		/**
		 * D The day of the week in three letters
		 * l (L lowercase) The entire day of the week 0 to 6
		 * ll (LL lowercase) The entire day of the week 1 to 7
		 * d The day of the month
		 * M The name of the month in three or four letters
		 * F The full name of the month
		 * m The number of the month 0 to 11
		 * mm The number of the month 01 to 12
		 * Y The year in four digits
		 * y The year in two digits
		 * h Time from 0 to 12
		 * H Time from 0 to 23
		 * i The minutes
		 * s The seconds
		 * a am / pm Display
		 * A AM / PM display
		 */

		let d   = new Date(timestamp),
			obj = {
				Y: d.getFullYear(),
				m: d.getMonth(),
				d: d.getDate(),
				l: d.getDay(),
				H: d.getHours(),
				i: d.getMinutes(),
				s: d.getSeconds(),
				ms: d.getMilliseconds(),
				mm: 0,
				h: 0,
				a: "",
				A: ""
			},
			h   = obj.H % 12;

		obj.mm = obj.m + 1;
		// english format

		obj.h = (!h) ? 12 : h;
		obj.a = (obj.H < 12) ? "am" : "pm";
		obj.A = obj.a.toUpperCase();

		return obj;
	},
	getGMT: function (): number {
		let d    = new Date,
			time = d.getTime(); // ms
		return Math.floor(time / 1000) + ((new Date).getTimezoneOffset() * 60);
	},
	toGMT: function (time: number): number {
		return time + ((new Date).getTimezoneOffset() * 60);
	},
	toLocal: function (time: number): number {
		return time - ((new Date).getTimezoneOffset() * 60);
	},
	compare: function (A: number, B: number): object {
		let date_a      = new Date(A * 1000),
			year_a      = date_a.getFullYear(),
			month_a     = date_a.getMonth(),
			day_a       = date_a.getDate(),
			date_b      = new Date(B * 1000),
			year_b      = date_b.getFullYear(),
			month_b     = date_b.getMonth(),
			day_b       = date_b.getDate(),

			isSameYear  = (year_a === year_b),
			isSameMonth = (isSameYear && month_a === month_b),
			isSameDay   = (isSameMonth && day_a === day_b);

		let isYesterday = ((isSameMonth && Math.abs(day_a - day_b) === 1) ||
			(!isSameMonth && Math.abs(A - B) < 24 * 60 * 60));

		return {
			isSameYear, isSameMonth, isSameDay, isYesterday, min: Math.min(A, B)
		};
	},
	valid: function (day: number, month: number, year: number, minAge: number, maxAge: number): boolean {
		// depending on the year, calculate the number of days in the month
		let daysInMonth,
			februaryDays = (year % 4 === 0) ? 29 : 28;

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
			// get current year
			let currentYear = (new Date).getFullYear(),
				age         = currentYear - year;

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
};

// ==========MATH====================================

let _setDigitsSep = function (x: number, sep: string): string {
	let s     = String(x),
		count = 0,
		ans   = [],
		j     = s.indexOf("."),
		start = (j !== -1) ? j : s.length,
		end   = (j !== -1) ? s.slice(start + 1) : [],
		i     = start;

	for (; i >= 0; i--) {
		if (count === 3) {
			count  = 0;
			ans[i] = (i !== 0) ? sep + s[i] : s[i];
		} else {
			ans[i] = s[i];
		}
		count++;
	}

	return ans.concat(end).join("");
};

let math = {
	numberFormat: function (x: number | string, dec: number = 2, decimalSep: string = ".", digitsSep: string = " "): string {

		if (!x) {
			return "";
		}

		let ans = parseFloat(String(x)), decimalPos;

		if (dec >= 0) {
			let decimalPow = Math.pow(10, dec);
			ans            = Math.floor(ans * decimalPow) / decimalPow;
		}

		let n = _setDigitsSep(ans, digitsSep);
		let a = n.split("");

		decimalPos = a.lastIndexOf(".");
		if (decimalPos >= 0 && decimalSep !== ".") {
			a[decimalPos] = decimalSep;
		}

		return a.join("");
	}
};

let isInDOM = function (element: any, inBody: boolean = false): boolean {
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

let buildQueryString = function (object: object, prefix: string): string {
	let duplicates = {},
		str        = [];

	for (let prop in object) {
		if (!Object.prototype.hasOwnProperty.call(object, prop)) {
			continue;
		}

		let key   = prefix ? prefix + "[" + prop + "]" : prop,
			value = (object as any)[prop],
			pair;
		if (value !== undefined) {
			if (value === null) {
				pair = encodeURIComponent(key);
			} else if (Utils.isPlainObject(value)) {
				pair = buildQueryString(value, key);
			} else if (Utils.isArray(value)) {
				pair = value.reduce(function (memo, item) {
					if (!(duplicates as any)[key]) (duplicates as any)[key] = {};
					if (!(duplicates as any)[key][item]) {
						(duplicates as any)[key][item] = true;
						return memo.concat(encodeURIComponent(key) + "=" + encodeURIComponent(item))
					}
					return memo;
				}, []).join("&");
			} else {
				pair = encodeURIComponent(key) + "=" + encodeURIComponent(value);
			}

			str.push(pair);
		}
	}

	return str.join("&")
};

let shuffle = (a: Array<any>): Array<any> => {
	let j, x, i;

	for (i = a.length - 1; i > 0; i--) {
		j    = Math.floor(Math.random() * (i + 1));
		x    = a[i];
		a[i] = a[j];
		a[j] = x;
	}

	return a;
};

let parseQueryString = function (str: string) {
	if (str.charAt(0) === "?") str = str.substring(1);

	let pairs = str.split("&"), params = {};
	for (let i = 0, len = pairs.length; i < len; i++) {
		let pair  = pairs[i].split("="),
			key   = decodeURIComponent(pair[0]),
			value = pair.length == 2 ? decodeURIComponent(pair[1]) : null;
		if ((params as any)[key] != null) {
			if (!Utils.isArray((params as any)[key])) {
				(params as any)[key] = [(params as any)[key]];
			}
			(params as any)[key].push(value)
		}
		else (params as any)[key] = value
	}
	return params
};

let eventCancel = function (e: Event) {

	if (!e) {
		if (window.event) e = window.event;
		else return;
	}

	if (e.cancelBubble != null) e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	if (e.preventDefault) e.preventDefault();
	if (window.event) e.returnValue = false;
	// if (e.cancel != null) e.cancel = true;
};

let Utils = {
	isPlainObject, isString, isArray,
	isFunction, isEmpty, isNotEmpty,
	toArray, isInDOM, shuffle,
// ============
	callback, assign, expose, getFrom,
	stringKeyReplace, textToLineString,
	iterate,
// ============
	date, math,
// ============
	buildQueryString, parseQueryString,
// ============
	eventCancel
};

export default Utils;
