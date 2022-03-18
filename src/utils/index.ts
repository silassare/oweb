export const id = (function id() {
	const counters = Object.create({});
	counters['id'] = 0;

	return (prefix = 'id'): string => {
		if (!(prefix in counters)) {
			counters[prefix] = 0;
		}

		return prefix + '-' + counters[prefix]++;
	};
})();

export const noop = (): undefined => void 0;

// ==========TYPE CHECKERS====================================
export const isArray = Array.isArray;
export const isPlainObject = (a: unknown): a is Record<string, unknown> =>
	Object.prototype.toString.call(a) === '[object Object]';
export const isString = (a: unknown): a is string => typeof a === 'string';
export const isFunction = (a: unknown): a is (...args: any[]) => any =>
	typeof a === 'function';

export function isEmpty(a: unknown): boolean {
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
}

export const isNotEmpty = (a: unknown): boolean => !isEmpty(a);
export const toArray = <X>(a: Iterable<X>): X[] => [...a];
export const escapeRegExp = (str: string): string =>
	str.replace(/([.+*?=^!:${}()[\]|\\/])/g, '\\$1');

// ==========HELPERS====================================
export function callback(fn: unknown, args?: any[], ctx?: unknown): any {
	if (typeof fn === 'function') {
		return fn.apply(ctx, args);
	}

	return null;
}

export function unique<X>(arr: X[]): X[] {
	return Array.from(new Set(arr));
}

export function forEach<T>(
	obj: { [key: string]: T } | T[],
	fn: (value: T, key: any) => void
): void {
	Object.keys(obj).forEach((key: string) => {
		const value: T = (obj as any)[key];
		fn(value, key);
	});
}

export const assign =
	(Object as any).assign ||
	function _assign(...args: Record<string, unknown>[]) {
		const to = args[0];
		let from, symbols;

		for (let s = 1; s < args.length; s++) {
			from = Object(args[s]);

			for (const key in from) {
				if (Object.prototype.hasOwnProperty.call(from, key)) {
					(to as any)[key] = from[key];
				}
			}

			if ('getOwnPropertySymbols' in Object) {
				symbols = (Object as any).getOwnPropertySymbols(from);
				for (let i = 0; i < symbols.length; i++) {
					if (Object.prototype.propertyIsEnumerable.call(from, symbols[i])) {
						(to as any)[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};

export function clone<T>(a: T): T {
	return JSON.parse(JSON.stringify(a));
}

export function stringPlaceholderReplace(
	str: string,
	data: Record<string, unknown>
): string {
	if (isString(str) && str.length && isPlainObject(data)) {
		const keys = Object.keys(data).sort().reverse();
		let reg;

		if (keys.length) {
			const m = keys.join('|');
			reg = new RegExp(':(' + m + ')', 'g');

			return str.replace(reg, function stringChunkReplacer(...args) {
				const replacement = (data as any)[args[1]];

				if (replacement === undefined) {
					return args[0];
				}

				return replacement;
			});
		}
	}

	return str;
}

export function textToLineString(text: string): string {
	const reg = /["'\\\n\r\t\u2028\u2029]/g,
		toEscapes: Record<string, unknown> = {
			'"': '"',
			'\'': '\'',
			'\\': '\\',
			'\n': 'n',
			'\r': 'r',
			'\t': 't',
			'\u2028': '2028',
			'\u2029': '2029',
		};

	return text.replace(reg, (match) => '\\' + (toEscapes as any)[match]);
}

// ==========MATH====================================

export function _setDigitsSep(x: number, sep: string): string {
	const s = String(x),
		ans = [],
		j = s.indexOf('.'),
		start = j !== -1 ? j : s.length,
		end = j !== -1 ? s.slice(start + 1) : [];
	let count = 0,
		i = start;

	for (; i >= 0; i--) {
		if (count === 3) {
			count = 0;
			ans[i] = i !== 0 ? sep + s[i] : s[i];
		} else {
			ans[i] = s[i];
		}
		count++;
	}

	return ans.concat(end).join('');
}

export function numberFormat(
	x: number | string,
	dec = 2,
	decimalSep = '.',
	digitsSep = ' '
): string {
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

export function gt(x: number, y: number, eq = false): boolean {
	return eq ? x >= y : x > y;
}

export function lt(x: number, y: number, eq = false): boolean {
	return eq ? x <= y : x < y;
}

export function between(x: number, a: number, b: number, eq = false): boolean {
	return eq ? x >= a && x <= b : x > a && x < b;
}

export function isRange(a: unknown, b: unknown): boolean {
	return typeof a === 'number' && typeof b === 'number' && a < b;
}

export function isInDOM(element: Node, inBody = false): boolean {
	let _: Node | null = element,
		last: Node | null = null;

	while (_) {
		last = _;
		if (inBody && last === document.body) {
			break;
		}
		_ = _.parentNode;
	}

	return inBody ? last === document.body : last === document;
}

export function shuffle<X>(a: X[]): X[] {
	let j, x, i;

	for (i = a.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}

	return a;
}

export function parseQueryString(str: string): Record<string, string> {
	if (str.charAt(0) === '?') str = str.substring(1);
	if (!str.length) return {};

	const pairs = str.split('&'),
		params = {};
	for (let i = 0, len = pairs.length; i < len; i++) {
		const pair = pairs[i].split('='),
			key = decodeURIComponent(pair[0]),
			value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
		if ((params as any)[key] != null) {
			if (!isArray((params as any)[key])) {
				(params as any)[key] = [(params as any)[key]];
			}
			(params as any)[key].push(value);
		} else (params as any)[key] = value;
	}
	return params;
}

export function preventDefault(e: Event): void {
	if (!e) {
		if (window.event) e = window.event;
		else return;
	}

	if (e.preventDefault) e.preventDefault();
	if (e.cancelBubble != null) e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	if (window.event) e.returnValue = false;
	// if (e.cancel != null) e.cancel = true;
}

export function isValidAge(
	day: number,
	month: number,
	year: number,
	minAge: number,
	maxAge: number
): boolean {
	// depending on the year, calculate the number of days in the month
	const februaryDays = year % 4 === 0 ? 29 : 28,
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
		const currentYear = new Date().getFullYear(),
			age = currentYear - year;

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

export function fileSizeFormat(
	size: number /* in bytes */,
	decimalPoint = '.',
	thousandsSep = ' '
): string {
	const units = ['byte', 'Kb', 'Mb', 'Gb', 'Tb'],
		iMax = units.length;
	let i = 0,
		result = 0;

	size = parseFloat(String(size));

	while (size >= 1 && i < iMax) {
		result = size;
		size /= 1000; // not 1024
		i++;
	}

	const parts = String(result).split('.'),
		head =
			parseInt(parts[0]) === result
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
export function safeOpen(
	url = '',
	strWindowName = '',
	strWindowFeatures = ''
): Window | null {
	if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
		// IE before 11
		const child = open.apply(window, [url, strWindowName, strWindowFeatures]);
		if (child) {
			child.opener = null;
		}
		return child;
	}

	const iframe = document.createElement('iframe') as HTMLIFrameElement;
	iframe.style.display = 'none';
	document.body.appendChild(iframe);
	const iframeDoc = (iframe.contentDocument ||
		(iframe.contentWindow as any).document) as Document;

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
	const newWin = (iframe.contentWindow as any).child as Window;

	document.body.removeChild(iframe);
	return newWin;
}

type Console = typeof console;

export const logger: Console & {
	on: () => void;
	off: () => void;
} = (function _logger() {
	let _showLog = true;
	const _fn = function (type: keyof Console) {
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
			return _fn('memory' as any);
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
			return _fn('exception' as any);
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
	} as any;
})();

export function encode(val: string): string {
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
export function buildQueryString(
	params: Record<string, unknown> | URLSearchParams,
	prefix?: string
): string {
	if (params instanceof URLSearchParams) {
		return params.toString();
	}

	const duplicates = {},
		str = [];

	for (const prop in params) {
		if (!Object.prototype.hasOwnProperty.call(params, prop)) {
			continue;
		}

		const key = prefix ? prefix + '[' + prop + ']' : prop,
			value = (params as any)[prop];
		let pair;
		if (value !== undefined) {
			if (value === null) {
				pair = encode(key);
			} else if (isPlainObject(value)) {
				pair = buildQueryString(value, key);
			} else if (isArray(value)) {
				pair = value
					.reduce(function arrayValuesReducer(acc, item, index) {
						if (!(duplicates as any)[key]) {
							(duplicates as any)[key] = {};
						}
						if (!(duplicates as any)[key][item]) {
							(duplicates as any)[key][item] = true;
							return acc.concat(
								buildQueryString({
									[key + '[' + index + ']']: item,
								})
							);
						}
						return acc;
					}, [])
					.join('&');
			} else {
				// scalar type
				pair = encode(key) + '=' + encode(value);
			}

			str.push(pair || key);
		}
	}

	return str.join('&');
}

export function searchParam(
	name: string,
	url?: string | URL | Location
): string | null {
	let query = '';
	url = url || window.location;
	const loc_str = url.toString();
	const _u = new URL(loc_str);

	if (_u.searchParams) {
		return _u.searchParams.get(name);
	}

	if (typeof url !== 'string' && url.search) {
		query = url.search;
	} else {
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
export function buildURL(
	url: string,
	params: Record<string, unknown> | URLSearchParams
): string {
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

export function extractFieldLabelText(
	form: HTMLFormElement,
	fieldName: string
): string {
	const field = form.querySelector(`[name='${fieldName}']`);
	let labelText: any = fieldName;

	if (field) {
		const id = field.getAttribute('id');
		let label, placeholder, title;
		if (id && (label = form.querySelector(`label[for='${id}']`))) {
			labelText = label.textContent;
		} else if (
			(placeholder = field.getAttribute('placeholder')) &&
			placeholder.trim().length
		) {
			labelText = placeholder;
		} else if ((title = field.getAttribute('title')) && title.trim().length) {
			labelText = title;
		}
	}

	return labelText;
}

/**
 * Generate uuid.
 */
export function uuid(): string {
	return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) => {
		return (
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16);
	});
}

export * from './scriptLoader';

export { default as PathResolver } from './PathResolver';
